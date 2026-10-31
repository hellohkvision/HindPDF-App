import {Text} from './AppText';
import React,{useRef,useState} from 'react';
import {PanResponder,View} from 'react-native';
import Svg,{Path} from 'react-native-svg';
import {Button,s} from './ui';
export function SignaturePad({onChange}:{onChange:(paths:string[])=>void}){
 const paths=useRef<string[]>([]);const width=useRef(300);const [drawing,setDrawing]=useState<string[]>([]);
 const update=()=>{setDrawing([...paths.current]);onChange([...paths.current]);};
 const responder=useRef(PanResponder.create({onStartShouldSetPanResponder:()=>true,onMoveShouldSetPanResponder:()=>true,onPanResponderGrant:e=>{const k=300/width.current;paths.current.push(`M ${e.nativeEvent.locationX*k} ${e.nativeEvent.locationY*k}`);update();},onPanResponderMove:e=>{const k=300/width.current;const i=paths.current.length-1;if(i<0)return;paths.current[i]+=` L ${e.nativeEvent.locationX*k} ${e.nativeEvent.locationY*k}`;update();}})).current;
 return <View style={{gap:10}}><Text style={s.label}>Draw your signature</Text><View onLayout={e=>{width.current=e.nativeEvent.layout.width;}} {...responder.panHandlers} style={{height:130,borderWidth:1,borderColor:'#c6d0db',borderRadius:12,backgroundColor:'white'}}><Svg width="100%" height="100%" viewBox="0 0 300 130" preserveAspectRatio="none">{drawing.map((d,i)=><Path key={i} d={d} stroke="#14263b" strokeWidth={2} fill="none"/>)}</Svg></View><Button title="Clear signature" secondary onPress={()=>{paths.current=[];update();}}/></View>;
}
