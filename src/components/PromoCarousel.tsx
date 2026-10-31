import React,{useRef,useState} from 'react';
import {ScrollView,Pressable,StyleSheet,useWindowDimensions,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Text} from './AppText';
import {colors,s} from './ui';
const slides=[
 {id:'merge',title:'Bring your PDFs together',subtitle:'Combine documents in the order you choose.',label:'Merge PDF',icon:'documents-outline'},
 {id:'compress',title:'Make your PDF smaller',subtitle:'Prepare documents that are easier to share.',label:'Compress PDF',icon:'download-outline'},
 {id:'scan-to-pdf',title:'Scan documents on the go',subtitle:'Capture pages and create a PDF.',label:'Open scanner',icon:'camera-outline'}
] as const;
export function PromoCarousel({onOpen}:{onOpen:(id:string)=>void}){
 const {width}=useWindowDimensions();const cardWidth=Math.max(220,width-40);const [current,setCurrent]=useState(0);const ref=useRef<ScrollView>(null);
 return <View accessibilityLabel="Featured tools" style={{gap:8}}>
  <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={e=>setCurrent(Math.max(0,Math.min(slides.length-1,Math.round(e.nativeEvent.contentOffset.x/cardWidth))))}>
   {slides.map((item,i)=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.label} onPress={()=>onOpen(item.id)} style={({pressed})=>[styles.slide,{width:cardWidth,opacity:pressed ? 0.8 : 1}]}><View style={{flex:1,gap:6}}><Text style={styles.eyebrow}>DISCOVER HINDPDF</Text><Text style={styles.title}>{item.title}</Text><Text style={s.small}>{item.subtitle}</Text><Text style={styles.link}>{item.label}  →</Text></View><View style={styles.icon}><Ionicons name={item.icon} size={28} color={colors.primary}/></View></Pressable>)}
  </ScrollView>
  <View style={{flexDirection:'row',justifyContent:'center',gap:8}}>{slides.map((item,i)=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Show slide ${i+1}`} accessibilityState={{selected:current===i}} hitSlop={8} onPress={()=>{ref.current?.scrollTo({x:i*cardWidth,animated:true});setCurrent(i);}}><View style={{width:current===i?18:6,height:6,borderRadius:3,backgroundColor:current===i?colors.primary:'#ccd7e2'}}/></Pressable>)}</View>
 </View>;
}
const styles=StyleSheet.create({slide:{backgroundColor:'#ffffff',borderRadius:16,borderWidth:1,borderColor:'#e8edf2',padding:16,flexDirection:'row',alignItems:'center',gap:14,minHeight:130},eyebrow:{fontSize:10,fontWeight:'700',letterSpacing:.6,color:colors.primary},title:{fontSize:16,lineHeight:22,fontWeight:'700',color:colors.ink},link:{fontSize:12,fontWeight:'700',color:colors.primary,marginTop:4},icon:{width:52,height:52,borderRadius:16,backgroundColor:'#fff1f4',alignItems:'center',justifyContent:'center'}});
