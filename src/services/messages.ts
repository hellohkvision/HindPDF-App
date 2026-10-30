import {ApiError} from './api';
export function friendlyError(value:unknown):string {
 const error=value as {code?:string;status?:number;message?:string}; const msg=String(error?.message||'');
 if(error?.code==='AUTH_REQUIRED')return 'Please sign in to continue.';
 if(error?.code==='FREE_QUOTA_EXCEEDED')return "You've reached today's free limit. Try again later or view available plans.";
 if(error?.status===401||error?.status===403)return 'Please sign in again to continue.';
 if(error?.status&&error.status>=500)return 'This service is temporarily unavailable. Please try again later.';
 if(/network|fetch|timeout|abort|internet/i.test(msg))return 'Check your internet connection and try again.';
 if(/password/i.test(msg)&&/wrong|incorrect|invalid/i.test(msg))return 'This password didn’t work. Please try again.';
 const safe=[/^Choose /,/^Please /,/^Enter /,/^Use page numbers/,/^Page numbers must/,/^Each page may/,/^Keep at least/,/^Add at least/,/^This tool is not yet/,/^For device processing/,/^Target size is too small/,/^Output is smaller/,/^Minimum size cannot/,/^Signature must fit/,/^Text position must/,/^Document engine is starting/,/^Another document is being/,/^This document took too long/,/^Camera permission is required/];
 if(!(value instanceof ApiError)&&safe.some(p=>p.test(msg))&&msg.length<180)return msg;
 return 'Something went wrong. Please try again.';
}
