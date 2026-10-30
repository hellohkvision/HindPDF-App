import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {colors} from './ui';
export type Tab = 'home' | 'tools' | 'scan' | 'files' | 'account';
const tabs: {id:Tab; label:string; icon:React.ComponentProps<typeof Ionicons>['name']}[]=[
 {id:'home',label:'Home',icon:'home-outline'}, {id:'tools',label:'Tools',icon:'grid-outline'},
 {id:'scan',label:'Scan',icon:'camera-outline'}, {id:'files',label:'Files',icon:'document-text-outline'},
 {id:'account',label:'Account',icon:'person-outline'}
];
export function AppNavigation({active,onSelect}:{active:Tab;onSelect:(tab:Tab)=>void}) {
 return <View style={styles.bar}>{tabs.map(tab=><Pressable accessibilityRole="tab" accessibilityLabel={tab.label} accessibilityState={{selected:active===tab.id}} key={tab.id} onPress={()=>onSelect(tab.id)} style={styles.tab}>
  <View style={tab.id==='scan'?styles.scan:undefined}><Ionicons name={tab.icon} size={24} color={tab.id==='scan'?'white':active===tab.id?colors.primary:colors.muted}/></View>
  <Text style={[styles.label,active===tab.id&&styles.active]}>{tab.label}</Text>{active===tab.id&&<View style={styles.indicator}/>}</Pressable>)}</View>;
}
const styles=StyleSheet.create({bar:{flexDirection:'row',backgroundColor:'#fff',borderTopWidth:1,borderColor:colors.line,paddingHorizontal:8,paddingTop:7,paddingBottom:5},tab:{flex:1,minHeight:55,alignItems:'center',justifyContent:'center',gap:2},scan:{width:46,height:46,borderRadius:23,backgroundColor:colors.primary,justifyContent:'center',alignItems:'center',marginTop:-14},label:{fontSize:11,color:colors.muted},active:{color:colors.primary,fontWeight:'700'},indicator:{height:3,width:22,borderRadius:3,backgroundColor:colors.primary}});
