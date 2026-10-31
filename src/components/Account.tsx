import {Text} from './AppText';
import React,{useEffect,useState} from 'react';
import {Alert,Pressable,View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {EmailAuthProvider,reauthenticateWithCredential,sendEmailVerification,signOut,updatePassword,updateProfile,type User} from 'firebase/auth';
import {auth} from '../services/auth';
import {api} from '../services/api';
import {Button,Card,Chips,Field,s} from './ui';
import {Checkout} from './Checkout';
const receiptKey='hindpdf.mobile.deletionReceipt';
type SavedReceipt={uid:string;receipt:string};
export function Account({user,account,onError}:{user:User;account:any;onError:(message:string)=>void}){
 const [name,setName]=useState(user.displayName||''),[current,setCurrent]=useState(''),[next,setNext]=useState(''),[busy,setBusy]=useState(false),[receipts,setReceipts]=useState<any[]>([]),[refunds,setRefunds]=useState<any[]>([]),[order,setOrder]=useState(''),[reason,setReason]=useState('TECHNICAL'),[details,setDetails]=useState(''),[saved,setSaved]=useState<SavedReceipt|null>(null);
 const [section,setSection]=useState<'profile'|'security'|'plan'|'payments'|null>(null);
 useEffect(()=>{AsyncStorage.getItem(receiptKey).then(v=>{try{setSaved(v?JSON.parse(v):null);}catch{}});},[]);
 const wrap=async(f:()=>Promise<void>)=>{setBusy(true);onError('');try{await f();}catch(e){onError((e as Error).message);}finally{setBusy(false);}};
 const verify=async()=>{if(!user.email||!current)throw Error('Enter your current password to verify your identity.');await reauthenticateWithCredential(user,EmailAuthProvider.credential(user.email,current));};
 const checkDeletion=async(value:SavedReceipt)=>{const r=await api('/api/auth/deletion-status',value,false);if(r.status==='COMPLETE'){await AsyncStorage.removeItem(receiptKey);setSaved(null);await signOut(auth);Alert.alert('Account deleted','Your deletion request is complete.');}else Alert.alert('Deletion in progress','Check the status again later.');};
 const deleteAccount=()=>Alert.alert('Delete HindPDF account?','This permanently requests deletion of your account and associated data.',[{text:'Cancel',style:'cancel'},{text:'Delete account',style:'destructive',onPress:()=>void wrap(async()=>{
   if(saved){await checkDeletion(saved);return;}await verify();
   const random=await Crypto.getRandomBytesAsync(32);const receipt=Array.from(random,x=>x.toString(16).padStart(2,'0')).join('');const request={uid:user.uid,receipt};
   await AsyncStorage.setItem(receiptKey,JSON.stringify(request));setSaved(request);
   try{await api('/api/auth/delete-account',{confirmation:'DELETE',receipt});}catch(e:any){if(e.status&&e.status<500&&!['DELETION_EXISTS','ACCOUNT_CLOSED'].includes(e.code)){await AsyncStorage.removeItem(receiptKey);setSaved(null);}throw e;}
   setCurrent('');Alert.alert('Deletion requested','Your request is processing. Use Check deletion status later.');
 })}]);
 const loadHistory=()=>wrap(async()=>{const [h,r]=await Promise.all([api('/api/payments/history'),api('/api/payments/refunds')]);setReceipts(h.receipts||[]);setRefunds(r.refunds||[]);if(!h.receipts?.length)Alert.alert('Payment history','No payments found.');});
 return <>
 <Card><View style={s.row}><View style={{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',backgroundColor:'#e4eff8'}}><Text style={s.h2}>{(user.displayName||user.email||'U').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={s.h2}>{user.displayName||'HindPDF user'}</Text><Text style={s.small}>{user.email}</Text><Text style={s.small}>Plan: {account?.user?.plan||'Loading…'}</Text></View><Pressable accessibilityRole="button" onPress={()=>setSection(section==='profile'?null:'profile')}><Text style={{color:'#164f79',fontWeight:'700',padding:8}}>Edit</Text></Pressable></View>{!user.emailVerified&&<Button title="Send verification email" secondary disabled={busy} onPress={()=>void wrap(async()=>{await sendEmailVerification(user);Alert.alert('Check your email','Verification link sent.');})}/>}</Card>
 <Card>{([{id:'plan',label:'My plan',icon:'star-outline'},{id:'payments',label:'Payments and refunds',icon:'receipt-outline'},{id:'security',label:'Settings and privacy',icon:'settings-outline'}] as const).map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityState={{expanded:section===item.id}} onPress={()=>setSection(section===item.id?null:item.id)} style={[s.row,{minHeight:48}]}><Ionicons name={item.icon} size={22} color="#506b88"/><Text style={[s.label,{flex:1}]}>{item.label}</Text><Ionicons name={section===item.id?'chevron-up':'chevron-forward'} size={20} color="#506b88"/></Pressable>)}</Card>
 {section==='profile'&&<Card><Text style={s.h2}>Profile</Text><Field label="Display name" value={name} onChangeText={setName}/><Button title="Save name" disabled={busy} onPress={()=>void wrap(async()=>{await updateProfile(user,{displayName:name.trim()});Alert.alert('Saved','Your profile name was updated.');})}/></Card>}
 {section==='security'&&<Card><Text style={s.h2}>Password and account</Text><Field label="Current password" value={current} onChangeText={setCurrent} secureTextEntry/><Field label="New password" value={next} onChangeText={setNext} secureTextEntry/><Button title="Change password" secondary disabled={busy} onPress={()=>void wrap(async()=>{await verify();await updatePassword(user,next);setCurrent('');setNext('');Alert.alert('Password updated');})}/>{saved?<Button title="Check deletion status" secondary disabled={busy} onPress={()=>void wrap(()=>checkDeletion(saved))}/>:<Button title="Delete account" secondary disabled={busy} onPress={deleteAccount}/>}</Card>}
 {section==='plan'&&<><Text style={s.body}>Current plan: {account?.user?.plan||'Loading…'}</Text><Checkout user={user} onError={onError} onRefresh={()=>{api('/api/auth/me').then(()=>Alert.alert('Account updated','Reopen your account to refresh the plan.')).catch(e=>onError(e.message));}}/></>}
 {section==='payments'&&<Card><Text style={s.h2}>Payments and refunds</Text><Button title="Load payment history" secondary disabled={busy} onPress={loadHistory}/>{receipts.map(r=><Text key={r.orderId} style={s.body}>{r.planName} · ₹{r.totalPaid} · {r.paymentStatus}{'\n'}Order: {r.orderId}</Text>)}{refunds.map(r=><Text key={r.id} style={s.body}>Refund {r.id}: {r.status}</Text>)}<Field label="Order ID" value={order} onChangeText={setOrder} autoCapitalize="none"/><Chips value={reason} onChange={setReason} items={[{id:'TECHNICAL',name:'Technical'},{id:'DUPLICATE',name:'Duplicate'},{id:'OTHER',name:'Other'}]}/><Field label="Describe your refund request (10–1000 characters)" value={details} onChangeText={setDetails} multiline maxLength={1000}/><Button title="Request refund" secondary disabled={busy} onPress={()=>void wrap(async()=>{if(details.trim().length<10)throw Error('Please describe the issue in at least 10 characters.');const r=await api('/api/payments/refund-request',{orderId:order.trim(),reason,details:details.trim()});Alert.alert('Refund requested',`Status: ${r.refund.status}`);setDetails('');})}/></Card>}
 <Button title="Sign out" secondary disabled={busy} onPress={()=>void wrap(()=>signOut(auth))}/>
 </>;
}

export function DeletionRecovery({onError}:{onError:(message:string)=>void}){
 const [saved,setSaved]=useState<SavedReceipt|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{AsyncStorage.getItem(receiptKey).then(v=>{try{setSaved(v?JSON.parse(v):null);}catch{}});},[]);
 if(!saved)return null;
 return <Card><Text style={s.h2}>Account deletion</Text><Text style={s.body}>A previous deletion request may still be processing.</Text><Button title="Check deletion status" secondary disabled={busy} onPress={()=>void (async()=>{setBusy(true);try{const r=await api('/api/auth/deletion-status',saved,false);if(r.status==='COMPLETE'){await AsyncStorage.removeItem(receiptKey);setSaved(null);Alert.alert('Account deleted','Your deletion request is complete.');}else Alert.alert('Deletion in progress','Check again later.');}catch(e){onError((e as Error).message);}finally{setBusy(false);}})()}/></Card>;
}
