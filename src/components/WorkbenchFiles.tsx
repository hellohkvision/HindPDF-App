import {Text} from './AppText';
import React from 'react';
import {Pressable,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors,s} from './ui';
import type {InputFile,Tool} from '../types';
export function WorkbenchFiles({tool,files,error,onChoose,onCamera,onRemove,onMove}:{tool:Tool;files:InputFile[];error:string;onChoose:()=>void;onCamera:()=>void;onRemove:(i:number)=>void;onMove:(i:number)=>void}){
 return <View style={{gap:12}}><Pressable accessibilityRole="button" accessibilityLabel={tool.multiple?'Add files':'Choose file'} onPress={onChoose} style={({pressed})=>({borderWidth:1,borderStyle:'dashed',borderColor:colors.blue,borderRadius:16,backgroundColor:pressed?'#dfedf8':'#eaf3fa',padding:20,alignItems:'center',gap:6})}><Ionicons name="cloud-upload-outline" size={26} color={colors.blue}/><Text style={s.label}>{files.length&&tool.multiple?'Add another file':'Choose file'}</Text><Text style={s.small}>{tool.multiple?'Select files in the order you want':'Choose a file from your device'}</Text></Pressable>
 {tool.id==='scan-to-pdf'&&<Pressable accessibilityRole="button" onPress={onCamera} style={{padding:12,alignItems:'center'}}><Text style={{color:colors.blue,fontWeight:'700'}}>Take another photo</Text></Pressable>}
 {files.map((f,i)=><View key={`${f.uri}-${i}`} style={{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'white',borderRadius:12,padding:10}}><Ionicons name="document-text-outline" size={24} color={colors.primary}/><View style={{flex:1}}><Text style={s.label} numberOfLines={2}>{f.name}</Text>{f.size>0&&<Text style={s.small}>{(f.size/1024).toFixed(0)} KB</Text>}</View>{i>0&&<Pressable accessibilityRole="button" accessibilityLabel={`Move ${f.name} up`} hitSlop={8} onPress={()=>onMove(i)} style={{padding:8}}><Ionicons name="arrow-up" size={20} color={colors.blue}/></Pressable>}<Pressable accessibilityRole="button" accessibilityLabel={`Remove ${f.name}`} hitSlop={8} onPress={()=>onRemove(i)} style={{padding:8}}><Ionicons name="close" size={22} color={colors.muted}/></Pressable></View>)}
 {!!error&&<Text accessibilityRole="alert" style={s.error}>{error}</Text>}</View>;
}
