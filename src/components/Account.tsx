import React,{useEffect,useState} from 'react';
import {Alert,Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {EmailAuthProvider,reauthenticateWithCredential,sendEmailVerification,signOut,updatePassword,updateProfile,type User} from 'firebase/auth';
import {auth} from '../services/auth';
import {api} from '../services/api';
import {Button,Card,Chips,Field,s} from './ui';
const receiptKey='hindpdf.mobile.deletionReceipt';
type SavedReceipt={uid:string;receipt:string};
export function Account({user,account,onError}:{user:User;account:any;onError:(message:string)=>void}){
 const [name,setName]=useState(user.displayName||''),[current,setCurrent]=useState(''),[next,setNext]=useState(''),[busy,setBusy]=useState(false),[receipts,setReceipts]=useState<any[]>([]),[refunds,setRefunds]=useState<any[]>([]),[order,setOrder]=useState(''),[reason,setReason]=useState('TECHNICAL'),[details,setDetails]=useState(''),[saved,setSaved]=useState<SavedReceipt|null>(null);
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
 <Card><Text style={s.h2}>{user.email}</Text><Text style={s.body}>Plan: {account?.user?.plan||'Loading…'}</Text><Text style={s.small}>Email {user.emailVerified?'verified':'not verified'}</Text>{!user.emailVerified&&<Button title="Send verification email" secondary disabled={busy} onPress={()=>void wrap(async()=>{await sendEmailVerification(user);Alert.alert('Check your email','Verification link sent.');})}/>}<Button title="Sign out" secondary disabled={busy} onPress={()=>void wrap(()=>signOut(auth))}/></Card>
 <Card><Text style={s.h2}>Profile</Text><Field label="Display name" value={name} onChangeText={setName}/><Button title="Save name" disabled={busy} onPress={()=>void wrap(async()=>{await updateProfile(user,{displayName:name.trim()});Alert.alert('Saved','Your profile name was updated.');})}/></Card>
 <Card><Text style={s.h2}>Password and account</Text><Field label="Current password" value={current} onChangeText={setCurrent} secureTextEntry/><Field label="New password" value={next} onChangeText={setNext} secureTextEntry/><Button title="Change password" secondary disabled={busy} onPress={()=>void wrap(async()=>{await verify();await updatePassword(user,next);setCurrent('');setNext('');Alert.alert('Password updated');})}/>{saved?<Button title="Check deletion status" secondary disabled={busy} onPress={()=>void wrap(()=>checkDeletion(saved))}/>:<Button title="Delete account" secondary disabled={busy} onPress={deleteAccount}/>}</Card>
 <Card><Text style={s.h2}>Payments and refunds</Text><Button title="Load payment history" secondary disabled={busy} onPress={loadHistory}/>{receipts.map(r=><Text key={r.orderId} style={s.body}>{r.planName} · ₹{r.totalPaid} · {r.paymentStatus}{'\n'}Order: {r.orderId}</Text>)}{refunds.map(r=><Text key={r.id} style={s.body}>Refund {r.id}: {r.status}</Text>)}<Field label="Order ID" value={order} onChangeText={setOrder} autoCapitalize="none"/><Chips value={reason} onChange={setReason} items={[{id:'TECHNICAL',name:'Technical'},{id:'DUPLICATE',name:'Duplicate'},{id:'OTHER',name:'Other'}]}/><Field label="Describe your refund request (10–1000 characters)" value={details} onChangeText={setDetails} multiline maxLength={1000}/><Button title="Request refund" secondary disabled={busy} onPress={()=>void wrap(async()=>{if(details.trim().length<10)throw Error('Please describe the issue in at least 10 characters.');const r=await api('/api/payments/refund-request',{orderId:order.trim(),reason,details:details.trim()});Alert.alert('Refund requested',`Status: ${r.refund.status}`);setDetails('');})}/></Card>
 </>;
}

export function DeletionRecovery({onError}:{onError:(message:string)=>void}){
 const [saved,setSaved]=useState<SavedReceipt|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{AsyncStorage.getItem(receiptKey).then(v=>{try{setSaved(v?JSON.parse(v):null);}catch{}});},[]);
 if(!saved)return null;
 return <Card><Text style={s.h2}>Account deletion</Text><Text style={s.body}>A previous deletion request may still be processing.</Text><Button title="Check deletion status" secondary disabled={busy} onPress={()=>void (async()=>{setBusy(true);try{const r=await api('/api/auth/deletion-status',saved,false);if(r.status==='COMPLETE'){await AsyncStorage.removeItem(receiptKey);setSaved(null);Alert.alert('Account deleted','Your deletion request is complete.');}else Alert.alert('Deletion in progress','Check again later.');}catch(e){onError((e as Error).message);}finally{setBusy(false);}})()}/></Card>;
}
