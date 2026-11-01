import React from 'react';
import {Modal,Pressable,SafeAreaView,ScrollView,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../theme/Theme';
import {Text} from './AppText';

type Props={visible:boolean;folder:string;savedFolder:boolean|null;android:boolean;onClose:()=>void;onDismiss:()=>void;onSave:()=>void;onChooseLocation:()=>void};

/** Explains the destination before opening the platform's file picker. */
export function SaveCopyModal({visible,folder,savedFolder,android,onClose,onDismiss,onSave,onChooseLocation}:Props){
 const {dark}=useTheme();
 const surface=dark?'#1c2531':'#ffffff',ink=dark?'#f4f7fb':'#101827',muted=dark?'#b1bdcc':'#64748b',panel=dark?'#283442':'#f5f7fa',border=dark?'#354454':'#e3e9f0';
 const saveLabel=!android?'Continue':savedFolder===true?'Save here':savedFolder===false?'Select folder & save':'Save';
 const locationLabel=savedFolder===true?'Change location':'Choose location';
 return <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose} onDismiss={onDismiss}>
  <SafeAreaView style={{flex:1,backgroundColor:'rgba(7,14,25,0.58)'}}>
   <ScrollView contentContainerStyle={{flexGrow:1,justifyContent:'center',alignItems:'center',paddingHorizontal:20,paddingVertical:24}}>
    <Pressable accessibilityRole="button" accessibilityLabel="Close save dialog" onPress={onClose} style={{position:'absolute',top:0,bottom:0,left:0,right:0}}/>
   <View accessibilityViewIsModal style={{width:'100%',maxWidth:420,backgroundColor:surface,borderRadius:24,padding:20,gap:18,shadowColor:'#000000',shadowOpacity:.18,shadowRadius:20,shadowOffset:{width:0,height:10},elevation:12}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
     <View style={{width:48,height:48,borderRadius:16,backgroundColor:dark?'#492531':'#fff0f3',alignItems:'center',justifyContent:'center'}}><Ionicons name="download-outline" size={24} color={dark?'#ff8fa4':'#e91d48'}/></View>
     <View style={{flex:1,gap:3}}><Text accessibilityRole="header" style={{fontSize:18,fontWeight:'700',color:ink}}>Save a copy</Text><Text style={{fontSize:12,lineHeight:18,color:muted}}>Keep your file where you need it</Text></View>
     <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} onPress={onClose} style={{width:36,height:36,alignItems:'center',justifyContent:'center'}}><Ionicons name="close" size={22} color={muted}/></Pressable>
    </View>
    {android?<>
     <View style={{borderRadius:16,backgroundColor:panel,borderWidth:1,borderColor:border,padding:14,gap:7}}><Text style={{fontSize:11,fontWeight:'700',color:muted}}>{savedFolder===true?'PREVIOUSLY SELECTED LOCATION':'RECOMMENDED FOLDER'}</Text><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Ionicons name="folder-open-outline" size={21} color={dark?'#ff8fa4':'#e91d48'}/><Text style={{flex:1,fontSize:14,fontWeight:'700',color:ink}} numberOfLines={2}>HindPDF / {folder}</Text></View></View>
     <Text style={{fontSize:12,lineHeight:19,color:muted}}>{savedFolder===true?'Save uses your previously selected parent folder. You can change it if needed.':savedFolder===false?'Choose a parent folder once. HindPDF will create these folders inside it.':'Save uses your previously selected folder, if available; otherwise you can choose one.'}</Text>
    </>:<Text style={{fontSize:13,lineHeight:21,color:muted}}>Choose “Save to Files” in the share sheet, then select a folder.</Text>}
    <View style={{gap:9}}>
     <Pressable accessibilityRole="button" accessibilityLabel={saveLabel} onPress={onSave} style={({pressed})=>({minHeight:50,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:'#e91d48',opacity:pressed?.8:1})}><Text style={{fontSize:14,fontWeight:'700',color:'#ffffff'}}>{saveLabel}</Text></Pressable>
     {android&&<Pressable accessibilityRole="button" accessibilityLabel={locationLabel} onPress={onChooseLocation} style={({pressed})=>({minHeight:48,borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:border,opacity:pressed?.7:1})}><Text style={{fontSize:14,fontWeight:'700',color:ink}}>{locationLabel}</Text></Pressable>}
     <Pressable accessibilityRole="button" onPress={onClose} style={({pressed})=>({minHeight:40,alignItems:'center',justifyContent:'center',opacity:pressed?.7:1})}><Text style={{fontSize:13,fontWeight:'600',color:muted}}>Cancel</Text></Pressable>
    </View>
   </View>
   </ScrollView>
  </SafeAreaView>
 </Modal>;
}
