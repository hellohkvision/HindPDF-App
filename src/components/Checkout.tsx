import React,{useEffect,useState} from 'react';
import {Alert,Platform,Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RazorpayCheckout from 'react-native-razorpay';
import type {User} from 'firebase/auth';
import {api} from '../services/api';
import {Button,Card,Chips,Field,s} from './ui';
type Pending={uid:string;orderId:string;planId:string};
const pendingKey='hindpdf.mobile.pendingPayment';
export function Checkout({user,onError,onRefresh}:{user:User;onError:(s:string)=>void;onRefresh:()=>void}){
 const [plan,setPlan]=useState('MONTHLY'),[coupon,setCoupon]=useState(''),[quote,setQuote]=useState<any>(null),[busy,setBusy]=useState(false),[pending,setPending]=useState<Pending|null>(null);
 useEffect(()=>{AsyncStorage.getItem(pendingKey).then(v=>{try{setPending(v?JSON.parse(v):null);}catch{}});},[]);
 const wrap=async(f:()=>Promise<void>)=>{setBusy(true);onError('');try{await f();}catch(e){onError((e as Error).message||'Payment could not be started.');}finally{setBusy(false);}};
 const save=async(p:Pending|null)=>{setPending(p);if(p)await AsyncStorage.setItem(pendingKey,JSON.stringify(p));else await AsyncStorage.removeItem(pendingKey);};
 const check=async()=>{if(!pending)return;if(pending.uid!==user.uid)throw Error('Sign in to the account that started this payment.');const r=await api('/api/payments/status/'+encodeURIComponent(pending.orderId));const status=r.payment.status;if(status==='PAID'){await save(null);onRefresh();Alert.alert('Payment confirmed','Your account has been updated.');}else if(['FAILED','REFUNDED'].includes(status)){await save(null);Alert.alert('Payment status',status);}else Alert.alert('Payment pending','Check the status again before starting another payment.');};
 const start=async()=>{if(pending){await check();return;}if(!quote||quote.planId!==plan)throw Error('Get a quote before starting payment.');
 const response=await api('/api/payments/create-order',{planId:plan,couponCode:coupon.trim()||undefined});const order=response.order;
 if(!order?.orderId||!order?.keyId||!Number.isInteger(order.amountPaise)||order.currency!=='INR')throw Error('Payment order is invalid. Contact support.');
 const record={uid:user.uid,orderId:order.orderId,planId:plan};await save(record);
 let result:any;try{result=await RazorpayCheckout.open({key:order.keyId,amount:order.amountPaise,currency:order.currency,name:'HindPDF',description:order.planName,order_id:order.orderId,prefill:{email:user.email||''},theme:{color:'#e44237'}});}catch{throw Error('Payment was cancelled or interrupted. Check payment status before trying again.');}
 if(result.razorpay_order_id!==order.orderId||!result.razorpay_payment_id||!result.razorpay_signature)throw Error('Payment response was incomplete. Check payment status.');
 await api('/api/payments/verify-payment',{orderId:order.orderId,paymentId:result.razorpay_payment_id,signature:result.razorpay_signature});await save(null);onRefresh();Alert.alert('Payment confirmed','Your plan is active.');
 };
 if(Platform.OS!=='android'||process.env.EXPO_PUBLIC_ENABLE_RAZORPAY!=='true')return null;
 return <Card><Text style={s.h2}>HindPDF plans</Text><Chips value={plan} onChange={v=>{setPlan(v);setQuote(null);}} items={[{id:'DAY_PASS',name:'Day pass'},{id:'MONTHLY',name:'Monthly'},{id:'YEARLY',name:'Yearly'}]}/><Field label="Coupon code (optional)" value={coupon} onChangeText={v=>{setCoupon(v);setQuote(null);}} autoCapitalize="characters"/><Button title="Get price" secondary disabled={busy||!!pending} onPress={()=>void wrap(async()=>{const r=await api('/api/payments/quote',{planId:plan,couponCode:coupon.trim()||undefined});setQuote(r.quote);})}/>{quote&&<Text style={s.body}>{quote.planName}: ₹{(quote.amountPaise/100).toFixed(2)} (tax included)</Text>}{pending?<Button title="Check pending payment" disabled={busy} onPress={()=>void wrap(check)}/>:<Button title="Continue to payment" disabled={busy||!quote} onPress={()=>void wrap(start)}/>}</Card>;
}
