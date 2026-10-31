import {Text} from './AppText';
import React from 'react';
import {Pressable,StyleSheet,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors,s} from './ui';
import type {OutputFile,Tool} from '../types';
const icons:Record<string,React.ComponentProps<typeof Ionicons>['name']>={
 merge:'copy-outline', split:'cut-outline', compress:'contract-outline',
 'pdf-to-jpg':'image-outline','jpg-to-pdf':'images-outline','pdf-to-png':'image-outline','png-to-pdf':'images-outline','image-to-pdf':'images-outline',
 'photo-resizer':'resize-outline','photo-compressor':'contract-outline','signature-resizer':'create-outline','thumb-impression-resizer':'finger-print-outline',
 'declaration-optimizer':'document-text-outline','photo-signature-prep':'people-outline','pdf-to-image':'images-outline',
 'word-to-pdf':'document-text-outline','pdf-to-word':'document-text-outline','excel-to-pdf':'grid-outline','pdf-to-excel':'grid-outline',
 'ppt-to-pdf':'easel-outline','pdf-to-ppt':'easel-outline',rotate:'refresh-outline','delete-pages':'trash-outline',
 'extract-pages':'exit-outline','reorder-pages':'swap-vertical-outline','page-numbers':'list-outline','crop-pdf':'crop-outline',
 'edit-pdf':'create-outline','add-text':'text-outline','add-watermark':'water-outline','protect-password':'lock-closed-outline',
 unlock:'lock-open-outline',sign:'pencil-outline',redact:'eye-off-outline','scan-to-pdf':'scan-outline',
 ocr:'scan-circle-outline','pdf-reader':'book-outline','repair-pdf':'build-outline','html-to-pdf':'code-slash-outline'
};
const unavailable=new Set(['protect-password','html-to-pdf','repair-pdf']);
export function ToolIcon({id,size=22}:{id:string;size?:number}){return <View style={styles.icon}><Ionicons name={icons[id]||'document-outline'} size={size} color={id==='merge'||id==='sign'?colors.primary:colors.blue}/></View>;}
export function Dashboard({tools,outputs,onTool,onAll,onFiles,onScan,onChoose}:{tools:Tool[];outputs:OutputFile[];onTool:(t:Tool)=>void;onAll:()=>void;onFiles:()=>void;onScan:()=>void;onChoose:()=>void}){
 const find=(id:string)=>tools.find(t=>t.id===id);return <>
 <View style={styles.hero}><Text style={styles.headline}>Your documents,{"\n"}<Text style={{color:colors.primary}}>made easy</Text></Text><Text style={s.body}>Scan or choose a file to get started.</Text><View style={styles.actions}><Pressable style={styles.primary} accessibilityRole="button" onPress={onScan}><Ionicons name="camera-outline" size={19} color="white"/><Text style={styles.primaryText}>Scan document</Text></Pressable><Pressable style={styles.outline} accessibilityRole="button" onPress={onChoose}><Ionicons name="folder-outline" size={19} color={colors.ink}/><Text style={styles.outlineText}>Choose file</Text></Pressable></View></View>
 <View style={styles.sectionHead}><Text style={s.h2}>Popular tools</Text><Pressable onPress={onAll} accessibilityRole="button"><Text style={styles.link}>See all  ›</Text></Pressable></View><View style={styles.popular}>{['merge','compress','pdf-to-word','sign'].map(id=>{const t=find(id);return t?<Pressable key={id} style={styles.popItem} onPress={()=>onTool(t)} accessibilityRole="button" accessibilityLabel={t.name}><ToolIcon id={id} size={26}/><Text style={styles.popLabel} numberOfLines={2}>{t.name}</Text></Pressable>:null;})}</View>
 <Text style={s.h2}>Made for your applications</Text><View style={styles.actions}>{[['photo-resizer','Prepare photo'],['signature-resizer','Prepare signature']].map(([id,label])=>{const t=find(id);return t?<Pressable style={styles.shortcut} key={id} onPress={()=>onTool(t)} accessibilityRole="button"><ToolIcon id={id}/><Text style={styles.shortcutTitle}>{label}</Text><Text style={styles.link}>Get started  →</Text></Pressable>:null;})}</View>
 <View style={styles.sectionHead}><Text style={s.h2}>Recent files</Text><Pressable onPress={onFiles} accessibilityRole="button"><Text style={styles.link}>See all  ›</Text></Pressable></View>{outputs.length===0?<Text style={s.body}>Your processed files will appear here.</Text>:outputs.slice(0,3).map(f=><Pressable key={f.uri} onPress={onFiles} style={styles.file} accessibilityRole="button"><ToolIcon id="document"/><View style={{flex:1}}><Text style={styles.shortcutTitle} numberOfLines={1}>{f.name}</Text><Text style={s.small}>{(f.size/1024).toFixed(0)} KB · {new Date(f.createdAt).toLocaleDateString()}</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>)}
 </>;
}
export function ToolGrid({tools,onTool}:{tools:Tool[];onTool:(t:Tool)=>void}){
 return <View style={styles.grid}>{tools.map(t=>{
  const enabled=t.available&&!unavailable.has(t.id);
  return <Pressable key={t.id} style={({pressed})=>[styles.tool,pressed&&{opacity:.72}]} onPress={()=>onTool(t)} accessibilityRole="button" accessibilityLabel={t.name} accessibilityHint={enabled?'Opens tool':'Currently unavailable'}>
   <ToolIcon id={t.id} size={24}/><Text style={styles.toolLabel}>{t.name}</Text>{!enabled&&<Text style={styles.toolStatus}>Unavailable</Text>}
  </Pressable>;
 })}</View>;
}
const styles=StyleSheet.create({hero:{backgroundColor:'#e8f2fa',borderRadius:18,padding:18,gap:12},headline:{fontSize:21,lineHeight:27,fontWeight:'800',color:colors.ink},actions:{flexDirection:'row',gap:9},primary:{flex:1,minHeight:46,borderRadius:11,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,padding:8},outline:{flex:1,minHeight:46,borderWidth:1,borderColor:colors.ink,borderRadius:11,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:5,padding:8},primaryText:{color:'white',fontWeight:'700',fontSize:12},outlineText:{color:colors.ink,fontWeight:'700',fontSize:12},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},link:{color:colors.primary,fontSize:13,fontWeight:'700'},popular:{flexDirection:'row',justifyContent:'space-between',gap:6},popItem:{flex:1,alignItems:'center',gap:6},popLabel:{color:colors.ink,fontSize:11,fontWeight:'600',textAlign:'center'},icon:{width:46,height:46,borderRadius:12,backgroundColor:'#e4eff8',alignItems:'center',justifyContent:'center'},shortcut:{flex:1,backgroundColor:'#e8f2fa',borderRadius:14,padding:12,gap:8},shortcutTitle:{fontSize:13,fontWeight:'700',color:colors.ink},file:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'white',borderRadius:12,padding:10},grid:{flexDirection:'row',flexWrap:'wrap',gap:10},tool:{width:'48%',alignItems:'flex-start',gap:10,backgroundColor:'white',padding:14,borderRadius:16,minHeight:110,borderWidth:1,borderColor:'#e4eef6'},toolLabel:{color:colors.ink,fontSize:13,fontWeight:'700',lineHeight:19},toolStatus:{color:colors.muted,fontSize:11}});
