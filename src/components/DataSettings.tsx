import React from 'react';
import {Switch} from 'react-native';
import {View,Ionicons} from '../theme/Themed';
import {Text} from './AppText';
import {Card,colors,s} from './ui';

export function DataSettings({allowed,onChange}:{allowed:boolean|null;onChange:(value:boolean)=>void}) {
 return <Card><View style={s.row}><Ionicons name="cellular-outline" size={21} color={colors.blue}/><View style={{flex:1}}><Text style={s.label}>Internet for tools</Text><Text style={s.small}>Ask before a tool uses internet. Turn off to block internet use by tools.</Text></View><Switch accessibilityLabel="Allow internet for tools" accessibilityState={{checked:allowed===true,disabled:allowed===null}} disabled={allowed===null} value={allowed===true} onValueChange={onChange} trackColor={{false:'#aab3bd',true:colors.primary}}/></View></Card>;
}
