import React from 'react';
import {StyleSheet,Text as NativeText,type TextProps} from 'react-native';
import {useTheme} from '../theme/Theme';
import {themedStyle} from '../theme/colors.cjs';
const fonts:Record<string,string>={normal:'Montserrat_400Regular','400':'Montserrat_400Regular','500':'Montserrat_500Medium','600':'Montserrat_600SemiBold','700':'Montserrat_700Bold','800':'Montserrat_800ExtraBold','900':'Montserrat_900Black',bold:'Montserrat_700Bold'};
export function Text({style,...props}:TextProps){const {dark}=useTheme();const flat=StyleSheet.flatten(style);const weight=flat?.fontWeight||'normal';return <NativeText {...props} style={[{color:dark?'#edf3fa':'#0b1220'},dark?themedStyle(flat,true):style,{fontFamily:fonts[String(weight)]||fonts.normal,fontWeight:'normal'}]}/>;}
