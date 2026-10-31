import React,{useEffect,useRef} from 'react';
import {AccessibilityInfo,Animated,Image,StyleSheet,View} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export function LaunchScreen({onFinished}:{onFinished:()=>void}){
 const opacity=useRef(new Animated.Value(1)).current;
 const mark=useRef(new Animated.Value(.96)).current;
 const started=useRef(false),alive=useRef(true),finish=useRef(onFinished);finish.current=onFinished;
 useEffect(()=>()=>{alive.current=false;},[]);
 const start=()=>{
  if(started.current)return;started.current=true;
  void SplashScreen.hideAsync().catch(()=>{});
  void AccessibilityInfo.isReduceMotionEnabled().catch(()=>false).then(reduce=>{
   if(!alive.current)return;
   if(reduce){finish.current();return;}
   Animated.sequence([
    Animated.timing(mark,{toValue:1,duration:380,useNativeDriver:true}),
    Animated.delay(300),
    Animated.timing(opacity,{toValue:0,duration:240,useNativeDriver:true})
   ]).start(({finished})=>{if(finished&&alive.current)finish.current();});
  });
 };
 return <Animated.View onLayout={start} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.overlay,{opacity}]}><View style={styles.center}><Animated.View style={{transform:[{scale:mark}]}}><Image source={require('../../assets/hindpdf-logo.png')} resizeMode="contain" style={styles.logo}/></Animated.View></View><View style={styles.footer}><View style={styles.rule}/></View></Animated.View>;
}
const styles=StyleSheet.create({overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#ffffff',zIndex:100,elevation:100},center:{flex:1,alignItems:'center',justifyContent:'center'},logo:{width:240,height:240},footer:{height:82,alignItems:'center',justifyContent:'center'},rule:{width:32,height:3,borderRadius:3,backgroundColor:'#d91635'}});
