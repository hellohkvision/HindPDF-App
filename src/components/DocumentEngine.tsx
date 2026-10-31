import React, {forwardRef,useImperativeHandle,useRef,useState} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import bundle from '../engine/bundle.json';
import {outputUri,prepareOutputDirectory} from '../services/api';
import type {InputFile,OutputFile,Tool,ToolOptions} from '../types';
export type EngineHandle={waitUntilReady:()=>Promise<void>;run:(tool:Tool,files:InputFile[],options:ToolOptions,onProgress:(n:number)=>void)=>Promise<OutputFile>};
export const DocumentEngine=forwardRef<EngineHandle>(function DocumentEngine(_,ref){
 const view=useRef<WebView>(null);const [ready,setReady]=useState(false),[generation,setGeneration]=useState(0);const readyRef=useRef(false),restarts=useRef(0),waiters=useRef(new Set<{resolve:()=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>());
 const pending=useRef<{id:string;resolve:(v:OutputFile)=>void;reject:(e:Error)=>void;progress:(n:number)=>void;tool:Tool;scanName:string;timer:ReturnType<typeof setTimeout>}|null>(null);
 const fail=(message:string)=>{if(pending.current){clearTimeout(pending.current.timer);pending.current.reject(Error(message));pending.current=null;}};
 const rejectWaiters=(message:string)=>{for(const waiter of waiters.current){clearTimeout(waiter.timer);waiter.reject(Error(message));}waiters.current.clear();};
 React.useEffect(()=>()=>{readyRef.current=false;rejectWaiters('Document engine closed.');fail('Document engine closed.');},[]);
 useImperativeHandle(ref,()=>({waitUntilReady:()=>{if(readyRef.current)return Promise.resolve();return new Promise<void>((resolve,reject)=>{const waiter={resolve,reject,timer:setTimeout(()=>{waiters.current.delete(waiter);reject(Error('Document engine is starting.'));},15000)};waiters.current.add(waiter);});},run:async(tool,files,options,onProgress)=>{
  if(!readyRef.current)throw Error('Document engine is starting. Please try again in a moment.');
  if(pending.current)throw Error('Another document is being processed.');
  let total=0;for(const file of files){const info=await FileSystem.getInfoAsync(file.uri);if(!info.exists)throw Error('Please choose the file again.');total+=info.size||file.size;}
  if(total>35*1024*1024)throw Error('For device processing, choose files totalling less than 35 MB.');
  const encoded: (InputFile & {base64: string})[]=[];for(const file of files)encoded.push({...file,base64:await FileSystem.readAsStringAsync(file.uri,{encoding:FileSystem.EncodingType.Base64})});
  const signature=options.signature?{...options.signature,base64:await FileSystem.readAsStringAsync(options.signature.uri,{encoding:FileSystem.EncodingType.Base64})}:undefined;
  const id=Crypto.randomUUID();
  return new Promise<OutputFile>((resolve,reject)=>{
   pending.current={id,resolve,reject,progress:onProgress,tool,scanName:options.scanName,timer:setTimeout(()=>{fail('This document took too long. Try fewer pages.');readyRef.current=false;view.current?.reload();setReady(false);},300000)};
   const request=JSON.stringify({id,tool,files:encoded,options:{...options,signature,ownerPassword:Crypto.randomUUID()}}).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
   view.current?.injectJavaScript(`window.hindRun(${request});true;`);
  });
 }}),[ready]);
 return <View style={{position:'absolute',width:1,height:1,left:-20,opacity:0}} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"><WebView key={generation} ref={view} source={{html:bundle.html}} originWhitelist={['about:*']} javaScriptEnabled scrollEnabled={false} mixedContentMode="never" allowFileAccess={false} allowUniversalAccessFromFileURLs={false} setSupportMultipleWindows={false} onShouldStartLoadWithRequest={r=>r.url==='about:blank'||r.url==='about:srcdoc'} onContentProcessDidTerminate={()=>{console.warn('HindPDF document engine process terminated');readyRef.current=false;setReady(false);rejectWaiters('Document engine restarted.');fail('Document engine restarted. Please try again.');if(restarts.current++<1)setGeneration(n=>n+1);}}  onRenderProcessGone={event=>{console.warn('HindPDF document engine process stopped',event.nativeEvent.didCrash?'after a crash':'under system pressure');readyRef.current=false;setReady(false);rejectWaiters('Document engine restarted.');fail('Document engine restarted. Please try again.');if(restarts.current++<1)setGeneration(n=>n+1);}}  onError={()=>{readyRef.current=false;setReady(false);rejectWaiters('Document engine could not start.');fail('Document engine could not start.');}}   onMessage={async event=>{
  let m:any;try{m=JSON.parse(event.nativeEvent.data);}catch{return;}
  if(m.type==='ready'){readyRef.current=true;setReady(true);for(const waiter of waiters.current){clearTimeout(waiter.timer);waiter.resolve();}waiters.current.clear();return;}
  const p=pending.current;if(!p||p.id!==m.id)return;
  if(m.type==='progress'){p.progress(m.value);return;}
  if(m.type==='error'){fail(m.message);return;}
  if(m.type==='result'){
   clearTimeout(p.timer);
   try{const temporary=['scan-enhance','scan-detect','scan-sign','scan-crop','pdf-search'].includes(p.tool.id);if(!temporary)await prepareOutputDirectory();const name=p.tool.id==='scan-to-pdf'?(p.scanName.trim().replace(/[^a-zA-Z0-9 _.-]/g,'_').replace(/\.pdf$/i,'').slice(0,80)||'Scanned document')+'.pdf':'HindPDF_'+p.tool.id+m.ext,uri=temporary?FileSystem.cacheDirectory+'scan-'+Crypto.randomUUID()+m.ext:outputUri(name);await FileSystem.writeAsStringAsync(uri,m.base64,{encoding:FileSystem.EncodingType.Base64});const info=await FileSystem.getInfoAsync(uri);if(pending.current!==p){if(temporary)await FileSystem.deleteAsync(uri,{idempotent:true});return;}p.resolve({uri,name,mime:m.mime,size:info.exists?info.size:0,tool:p.tool.name,createdAt:new Date().toISOString(),...(p.tool.id==='pdf-search'?{searchMatches:m.searchMatches||[],searchTotal:m.searchTotal||0}:{})});}catch(e){p.reject(e as Error);}finally{if(pending.current===p)pending.current=null;}
  }
 }}/></View>;
});
