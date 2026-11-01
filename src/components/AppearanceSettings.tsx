import React from 'react';
import {Pressable,View,Ionicons} from '../theme/Themed';
import {useTheme,type ThemePreference} from '../theme/Theme';
import {Text} from './AppText';
import {Card,colors,s} from './ui';
export function AppearanceSettings(){const {preference,setPreference}=useTheme();const choices:{id:ThemePreference;name:string}[]=[{id:'system',name:'System'},{id:'light',name:'Light'},{id:'dark',name:'Dark'}];return <Card><View style={s.row}><Ionicons name="contrast-outline" size={21} color={colors.blue}/><Text style={s.label}>Appearance</Text></View><View style={{flexDirection:'row',gap:8}}>{choices.map(choice=><Pressable key={choice.id} accessibilityRole="button" accessibilityState={{selected:preference===choice.id}} onPress={()=>setPreference(choice.id)} style={{flex:1,minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:12,backgroundColor:preference===choice.id?'#fff0f2':'#f4f6f8',borderWidth:1,borderColor:preference===choice.id?colors.primary:colors.line}}><Text style={{fontSize:12,fontWeight:'600',color:preference===choice.id?colors.primary:colors.ink}}>{choice.name}</Text></Pressable>)}</View></Card>;}
