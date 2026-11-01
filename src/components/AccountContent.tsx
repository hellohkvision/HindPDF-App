import {Pressable,Ionicons} from '../theme/Themed';
import {Text} from './AppText';
import React from 'react';


import {Card,colors,s} from './ui';
const links:[string,string,React.ComponentProps<typeof Ionicons>['name']][]=[
 ['Privacy policy','https://hindpdf.com/privacy','shield-checkmark-outline'],
 ['Terms of service','https://hindpdf.com/terms','document-text-outline'],
 ['Refund policy','https://hindpdf.com/refund-policy','refresh-circle-outline'],
 ['Help and support','https://hindpdf.com/contact','help-circle-outline'],
 ['Account and data deletion','https://hindpdf.com/contents/data-deletion','person-remove-outline']
];
export function AccountContent({onOpen}:{onOpen:(title:string,url:string)=>void}){
 return <Card><Text style={s.h2}>Information & support</Text>{links.map(([title,url,icon])=><Pressable key={url} accessibilityRole="link" accessibilityLabel={title} onPress={()=>onOpen(title,url)} style={({pressed})=>[s.row,{minHeight:48,opacity:pressed ? 0.7 : 1}]}><Ionicons name={icon} size={21} color={colors.blue}/><Text style={[s.label,{flex:1}]}>{title}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted}/></Pressable>)}</Card>;
}
