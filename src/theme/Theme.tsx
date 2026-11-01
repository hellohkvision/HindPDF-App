import React,{createContext,useCallback,useContext,useEffect,useRef,useState} from 'react';
import {Platform,useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
export type ThemePreference='system'|'light'|'dark';
type ThemeValue={dark:boolean;preference:ThemePreference;setPreference:(value:ThemePreference)=>void};
const ThemeContext=createContext<ThemeValue>({dark:false,preference:'system',setPreference:()=>{}});
const key='hindpdf.mobile.theme';
export function ThemeProvider({children}:{children:React.ReactNode}){
 const system=useColorScheme(),[preference,setState]=useState<ThemePreference>('system'),changed=useRef(false);const dark=preference==='system'?system==='dark':preference==='dark';
 useEffect(()=>{let active=true;void AsyncStorage.getItem(key).then(value=>{if(active&&!changed.current&&(value==='light'||value==='dark'||value==='system'))setState(value);}).catch(()=>{});return()=>{active=false;};},[]);
 useEffect(()=>{void SystemUI.setBackgroundColorAsync(dark?'#10151d':'#ffffff').catch(()=>{});if(Platform.OS==='android'){void NavigationBar.setButtonStyleAsync(dark?'light':'dark').catch(()=>{});void NavigationBar.setBackgroundColorAsync(dark?'#10151d':'#ffffff').catch(()=>{});}},[dark]);
 const setPreference=useCallback((value:ThemePreference)=>{changed.current=true;setState(value);void AsyncStorage.setItem(key,value).catch(()=>{});},[]);
 return <ThemeContext.Provider value={{dark,preference,setPreference}}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
