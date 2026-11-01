import {View} from '../theme/Themed';
import React from 'react';
import {Image} from 'react-native';
import packageInfo from '../../package.json';
import {Text} from './AppText';
import {s} from './ui';
export function AccountFooter(){
 const version=packageInfo.version;
 return <View style={{alignItems:'center',paddingTop:12,paddingBottom:20}}><Image source={require('../../assets/hindpdf-logo.png')} resizeMode="contain" accessibilityLabel="HindPDF logo" style={{width:140,height:100,borderRadius:12}}/>{version&&<Text style={s.small}>Version {version}</Text>}<Text style={[s.small,{marginTop:8}]}>Made with ❤️ Odisha</Text></View>;
}
