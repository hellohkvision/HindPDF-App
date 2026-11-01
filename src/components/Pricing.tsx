import {Pressable,View,Ionicons} from '../theme/Themed';
import React,{useState} from 'react';
import {Platform} from 'react-native';

import type {User} from 'firebase/auth';
import {Text} from './AppText';
import {Checkout} from './Checkout';
import {Button,Card,colors,s} from './ui';
export type PlanId='DAY_PASS'|'MONTHLY'|'YEARLY';
const plans:{id:PlanId;name:string;amount:string;duration:string}[]=[
 {id:'DAY_PASS',name:'Day Pass',amount:'₹19',duration:'24 hours'},
 {id:'MONTHLY',name:'Monthly',amount:'₹99',duration:'1 month'},
 {id:'YEARLY',name:'Yearly',amount:'₹799',duration:'1 year'},
];
export function Pricing({user,initialPlan,onBack,onSignIn,onError,onRefresh}:{user:User|null;initialPlan:PlanId|null;onBack:()=>void;onSignIn:(plan:PlanId)=>void;onError:(message:string)=>void;onRefresh:()=>void}){
 const [selected,setSelected]=useState<PlanId|null>(initialPlan);const signedIn=!!user&&!user.isAnonymous;const checkoutAvailable=Platform.OS==='android'&&process.env.EXPO_PUBLIC_ENABLE_RAZORPAY==='true';
 const choose=(plan:PlanId)=>{if(!signedIn){onSignIn(plan);return;}setSelected(plan);};
 return <><Pressable accessibilityRole="button" accessibilityLabel="Back to account" onPress={onBack} style={{minHeight:44,justifyContent:'center',alignSelf:'flex-start'}}><Text style={{color:colors.blue,fontWeight:'600'}}>‹ Account</Text></Pressable><Text style={s.title}>Pricing & plans</Text><Text style={s.body}>Choose a plan that fits your work.</Text><Card><View style={s.row}><View style={{flex:1}}><Text style={s.h2}>Free</Text><Text style={s.small}>5 successful tool uses per day</Text></View><Text style={{fontSize:20,fontWeight:'700',color:colors.ink}}>₹0</Text></View></Card>{plans.map(plan=><Card key={plan.id}><View style={s.row}><View style={{flex:1,gap:4}}><Text style={s.h2}>{plan.name}</Text><Text style={s.small}>{plan.duration} of plan access</Text></View><Text style={{fontSize:20,fontWeight:'700',color:colors.ink}}>{plan.amount}</Text></View><Button title={signedIn?'Choose '+plan.name:'Log in to choose'} secondary onPress={()=>choose(plan.id)}/></Card>)}<Text style={s.small}>Prices are in INR. The final amount is shown before payment.</Text>{selected&&signedIn&&user&&(checkoutAvailable?<Checkout key={selected} user={user} initialPlan={selected} onError={onError} onRefresh={onRefresh}/>:<Card><View style={s.row}><Ionicons name="information-circle-outline" size={22} color={colors.blue}/><Text style={[s.body,{flex:1}]}>Plan purchases are currently unavailable in the app.</Text></View></Card>)}</>;
}
