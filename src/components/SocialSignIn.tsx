import React,{useEffect,useRef} from 'react';
import {Platform} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import {FacebookAuthProvider,GoogleAuthProvider,signInWithCredential} from 'firebase/auth';
import {auth} from '../services/auth';
import {Button} from './ui';
WebBrowser.maybeCompleteAuthSession();
function GoogleButton({onError}:{onError:(s:string)=>void}) {
 const [request,response,prompt]=Google.useAuthRequest({androidClientId:process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,iosClientId:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,webClientId:process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,scopes:['profile','email']});
 const used=useRef<string|null>(null);
 useEffect(()=>{if(response?.type!=='success'||!response.authentication?.accessToken)return;const token=response.authentication.accessToken;if(used.current===token)return;used.current=token;signInWithCredential(auth,GoogleAuthProvider.credential(null,token)).catch(e=>onError(e.message));},[response,onError]);
 return <Button title="Continue with Google" secondary disabled={!request} onPress={()=>{void prompt().catch(e=>onError(e.message));}}/>;
}
function FacebookButton({onError}:{onError:(s:string)=>void}) {
 const [request,response,prompt]=Facebook.useAuthRequest({clientId:process.env.EXPO_PUBLIC_FACEBOOK_APP_ID||'',scopes:['public_profile','email']});
 const used=useRef<string|null>(null);
 useEffect(()=>{if(response?.type!=='success'||!response.authentication?.accessToken)return;const token=response.authentication.accessToken;if(used.current===token)return;used.current=token;signInWithCredential(auth,FacebookAuthProvider.credential(token)).catch(e=>onError(e.message));},[response,onError]);
 return <Button title="Continue with Facebook" secondary disabled={!request} onPress={()=>{void prompt().catch(e=>onError(e.message));}}/>;
}
export function SocialSignIn({onError}:{onError:(s:string)=>void}) {
 const google=Platform.OS==='android'?process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
 return <>{google&&<GoogleButton onError={onError}/ >}{process.env.EXPO_PUBLIC_FACEBOOK_APP_ID&&<FacebookButton onError={onError}/>}</>;
}
