import {View} from '../theme/Themed';
import React from 'react';
import {Image} from 'react-native';
import packageInfo from '../../package.json';
import {Text} from './AppText';
import {colors,s} from './ui';
export function AccountFooter(){
 const version=packageInfo.version;
 return <View style={{alignItems:'center',paddingTop:12,paddingBottom:20}}><View accessible accessibilityLabel="HindPDF" style={{flexDirection:'row',alignItems:'center',gap:7,marginBottom:6}}><Image source={require('../../assets/hindpdf-mark.png')} resizeMode="contain" accessible={false} style={{width:42,height:42}}/><Text style={{fontWeight:'900',fontSize:19,color:colors.ink}}>Hind<Text style={{color:colors.primary}}>PDF</Text></Text></View>{version&&<Text style={s.small}>Version {version}</Text>}<Text style={[s.small,{marginTop:8}]}>Made with ❤️ Odisha</Text></View>;
}
