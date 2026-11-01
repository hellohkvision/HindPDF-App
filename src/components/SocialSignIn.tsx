import React,{useState} from 'react';
import {Platform} from 'react-native';
import {GoogleAuthProvider,signInWithCredential,type AuthCredential} from 'firebase/auth';
import {auth} from '../services/auth';
import {Button,s} from './ui';
import {Text} from './AppText';

// The native module is not present in Expo Go or unsupported builds.
const googleSdk:typeof import('@react-native-google-signin/google-signin')|null=(()=>{
 try{return require('@react-native-google-signin/google-signin');}catch{return null;}
})();

const webClientId=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '191538884503-kh40dmge1h4bldt4bf5fobv1jcfgaknt.apps.googleusercontent.com';
const iosClientId=process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
let configured=false;
let signingIn=false;

export const googleSignInAvailable=!!googleSdk&&(Platform.OS==='android'||(Platform.OS==='ios'&&!!iosClientId));

function configureGoogle(){
 if(!googleSdk)throw Error('Please use a build with Google sign-in enabled.');
 if(!configured){googleSdk.GoogleSignin.configure({webClientId,...(iosClientId?{iosClientId}:{})});configured=true;}
}

/** Clear any cached native Google session when the HindPDF account signs out. */
export async function googleSignOut():Promise<void>{
 if(!googleSignInAvailable||!googleSdk)return;
 try{
  configureGoogle();
  // signInSilently waits for the SDK's asynchronous configure before signOut.
  try{await googleSdk.GoogleSignin.signInSilently();}catch{/* No saved account or Google services unavailable. */}
  await googleSdk.GoogleSignin.signOut();
 }catch{/* Firebase sign-out must still work when Google services are unavailable. */}
}

/** Start native Google authentication. A cancelled account picker returns null. */
export async function googleCredential():Promise<AuthCredential|null>{
 if(!googleSignInAvailable||!googleSdk)throw Error('Please configure Google sign-in for this device.');
 if(signingIn)throw Error('Please wait for Google sign-in to finish.');
 signingIn=true;
 try{
  configureGoogle();
  if(Platform.OS==='android'&&!await googleSdk.GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true}))throw Error('Please install or update Google Play services to sign in.');
  const response=await googleSdk.GoogleSignin.signIn();
  if(response.type==='cancelled')return null;
  const idToken=response.data.idToken;
  if(!idToken)throw Error('Please check the Google sign-in configuration and try again.');
  return GoogleAuthProvider.credential(idToken);
 }catch(error){
  if(googleSdk.isErrorWithCode(error)){
   if(Platform.OS==='android'&&error.code==='10')throw Error('Please try again later. Google sign-in is not set up correctly for this app.');
   if(error.code===googleSdk.statusCodes.SIGN_IN_CANCELLED)return null;
   if(error.code===googleSdk.statusCodes.IN_PROGRESS)throw Error('Please wait for Google sign-in to finish.');
   if(error.code===googleSdk.statusCodes.PLAY_SERVICES_NOT_AVAILABLE)throw Error('Please install or update Google Play services to sign in.');
  }
  throw error;
 }finally{signingIn=false;}
}

export function SocialSignIn({onError}:{onError:(message:string)=>void}){
 const [busy,setBusy]=useState(false);
 const signIn=async()=>{
  if(busy)return;
  setBusy(true);onError('');
  try{const credential=await googleCredential();if(credential)await signInWithCredential(auth,credential);}
  catch(error){onError(error instanceof Error?error.message:'Please try Google sign-in again.');}
  finally{setBusy(false);}
 };
 if(!googleSignInAvailable)return <><Button title="Continue with Google" secondary disabled onPress={()=>{}}/><Text style={s.small}>Google sign-in is temporarily unavailable.</Text></>;
 return <Button title="Continue with Google" secondary busy={busy} onPress={()=>void signIn()}/>;
}
