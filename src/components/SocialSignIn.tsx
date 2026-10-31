import {Text} from './AppText';
import React,{useEffect,useRef} from 'react';
import {Platform} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {GoogleAuthProvider,signInWithCredential} from 'firebase/auth';
import {auth} from '../services/auth';
import {Button,s} from './ui';
WebBrowser.maybeCompleteAuthSession();
function GoogleButton({onError}:{onError:(s:string)=>void}) {
 const [request,response,prompt]=Google.useAuthRequest({androidClientId:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,iosClientId:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,webClientId:process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,scopes:['profile','email']});
 const used=useRef<string|null>(null);
 useEffect(()=>{if(response?.type!=='success'||!response.authentication?.accessToken)return;const token=response.authentication.accessToken;if(used.current===token)return;used.current=token;signInWithCredential(auth,GoogleAuthProvider.credential(null,token)).catch(e=>onError(e.message));},[response,onError]);
 return <Button title="Continue with Google" secondary disabled={!request} onPress={()=>{void prompt().catch(e=>onError(e.message));}}/>;
}
export function SocialSignIn({onError}:{onError:(s:string)=>void}) {
 const client=Platform.OS==='android'?process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
 if(!client)return <><Button title="Continue with Google" secondary disabled onPress={()=>{}}/><Text style={s.small}>Google sign-in is temporarily unavailable.</Text></>;
 return <GoogleButton onError={onError}/>;
}
