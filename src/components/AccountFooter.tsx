import React from 'react';
import {Image,View} from 'react-native';
import Constants from 'expo-constants';
import packageInfo from '../../package.json';
import {Text} from './AppText';
import {s} from './ui';
export function AccountFooter(){
 const version=Constants.expoConfig?.version||packageInfo.version;
 return <View style={{alignItems:'center',paddingTop:12,paddingBottom:20}}><Image source={require('../../assets/hindpdf-logo.png')} resizeMode="contain" accessibilityLabel="HindPDF logo" style={{width:140,height:100}}/>{version&&<Text style={s.small}>Version {version}</Text>}</View>;
}
