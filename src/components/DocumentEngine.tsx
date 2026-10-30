import React, {forwardRef,useImperativeHandle,useRef,useState} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import bundle from '../engine/bundle.json';
import {outputUri,prepareOutputDirectory} from '../services/api';
import type {InputFile,OutputFile,Tool,ToolOptions} from '../types';
export type EngineHandle={run:(tool:Tool,files:InputFile[],options:ToolOptions,onProgress:(n:number)=>void)=>Promise<OutputFile>};
export const DocumentEngine=forwardRef<EngineHandle>(function DocumentEngine(_,ref){
 const view=useRef<WebView>(null);const [ready,setReady]=useState(false);
 const pending=useRef<{id:string;resolve:(v:OutputFile)=>void;reject:(e:Error)=>void;progress:(n:number)=>void;tool:Tool;timer:ReturnType<typeof setTimeout>}|null>(null);
 const fail=(message:string)=>{if(pending.current){clearTimeout(pending.current.timer);pending.current.reject(Error(message));pending.current=null;}};
 React.useEffect(()=>()=>fail('Document engine closed.'),[]);
 useImperativeHandle(ref,()=>({run:async(tool,files,options,onProgress)=>{
  if(!ready)throw Error('Document engine is starting. Please try again in a moment.');
  if(pending.current)throw Error('Another document is being processed.');
  let total=0;for(const file of files){const info=await FileSystem.getInfoAsync(file.uri);if(!info.exists)throw Error('Please choose the file again.');total+=info.size||file.size;}
  if(total>35*1024*1024)throw Error('For device processing, choose files totalling less than 35 MB.');
  const encoded: (InputFile & {base64: string})[]=[];for(const file of files)encoded.push({...file,base64:await FileSystem.readAsStringAsync(file.uri,{encoding:FileSystem.EncodingType.Base64})});
  const signature=options.signature?{...options.signature,base64:await FileSystem.readAsStringAsync(options.signature.uri,{encoding:FileSystem.EncodingType.Base64})}:undefined;
  const id=Crypto.randomUUID();
  return new Promise<OutputFile>((resolve,reject)=>{
   pending.current={id,resolve,reject,progress:onProgress,tool,timer:setTimeout(()=>{fail('This document took too long. Try fewer pages.');view.current?.reload();setReady(false);},300000)};
   const request=JSON.stringify({id,tool,files:encoded,options:{...options,signature,ownerPassword:Crypto.randomUUID()}}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
   view.current?.injectJavaScript(`window.hindRun(${request});true;`);
  });
 }}),[ready]);
 return <View style={{position:'absolute',width:1,height:1,left:-20,opacity:0}} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><WebView ref={view} source={{html:bundle.html}} originWhitelist={['about:*']} javaScriptEnabled scrollEnabled={false} mixedContentMode="never" allowFileAccess={false} allowUniversalAccessFromFileURLs={false} setSupportMultipleWindows={false} onShouldStartLoadWithRequest={r=>r.url==='about:blank'||r.url==='about:srcdoc'} onContentProcessDidTerminate={()=>{setReady(false);fail('Document engine restarted. Please try again.');view.current?.reload();}} onError={()=>{setReady(false);fail('Document engine could not start.');}} onMessage={async event=>{
  let m:any;try{m=JSON.parse(event.nativeEvent.data);}catch{return;}
  if(m.type==='ready'){setReady(true);return;}
  const p=pending.current;if(!p||p.id!==m.id)return;
  if(m.type==='progress'){p.progress(m.value);return;}
  if(m.type==='error'){fail(m.message);return;}
  if(m.type==='result'){
   clearTimeout(p.timer);
   try{await prepareOutputDirectory();const name='HindPDF_'+p.tool.id+m.ext,uri=outputUri(name);await FileSystem.writeAsStringAsync(uri,m.base64,{encoding:FileSystem.EncodingType.Base64});const info=await FileSystem.getInfoAsync(uri);p.resolve({uri,name,mime:m.mime,size:info.exists?info.size:0,tool:p.tool.name,createdAt:new Date().toISOString()});}catch(e){p.reject(e as Error);}finally{pending.current=null;}
  }
 }}/></View>;
});
