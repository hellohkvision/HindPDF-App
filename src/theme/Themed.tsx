import React,{forwardRef} from 'react';
import {View as NativeView,Pressable as NativePressable,ScrollView as NativeScrollView,TextInput as NativeTextInput,StyleSheet,type ViewProps,type PressableProps,type ScrollViewProps,type TextInputProps} from 'react-native';
import {SafeAreaView as NativeSafeAreaView,type SafeAreaViewProps} from 'react-native-safe-area-context';
import {Ionicons as NativeIonicons} from '@expo/vector-icons';
import {useTheme} from './Theme';
import {themedColor,themedStyle} from './colors.cjs';
function resolve(style:any,dark:boolean){return dark?themedStyle(StyleSheet.flatten(style),true):style;}
export const View=forwardRef<NativeView,ViewProps>(function View({style,...props},ref){const {dark}=useTheme();return <NativeView {...props} ref={ref} style={resolve(style,dark)}/>;});
export const Pressable=forwardRef<NativeView,PressableProps>(function Pressable({style,...props},ref){const {dark}=useTheme();return <NativePressable {...props} ref={ref} style={typeof style==='function'?state=>resolve(style(state),dark):resolve(style,dark)}/>;});
export const ScrollView=forwardRef<NativeScrollView,ScrollViewProps>(function ScrollView({style,contentContainerStyle,...props},ref){const {dark}=useTheme();return <NativeScrollView {...props} ref={ref} style={resolve(style,dark)} contentContainerStyle={resolve(contentContainerStyle,dark)}/>;});
export const TextInput=forwardRef<NativeTextInput,TextInputProps>(function TextInput({style,placeholderTextColor,...props},ref){const {dark}=useTheme();return <NativeTextInput {...props} ref={ref} style={resolve(style,dark)} placeholderTextColor={themedColor(placeholderTextColor,'foreground',dark)}/>;});
export const SafeAreaView=forwardRef<NativeView,SafeAreaViewProps>(function SafeAreaView({style,...props},ref){const {dark}=useTheme();return <NativeSafeAreaView {...props} ref={ref} style={resolve(style,dark)}/>;});
export function Ionicons(props:React.ComponentProps<typeof NativeIonicons>){const {dark}=useTheme();return <NativeIonicons {...props} color={themedColor(props.color,'foreground',dark)}/>;}
