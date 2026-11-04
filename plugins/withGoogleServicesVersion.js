const {withProjectBuildGradle,withAppBuildGradle}=require('@expo/config-plugins');
module.exports=function withGoogleServicesVersion(config){
 config=withProjectBuildGradle(config,mod=>{
  if(mod.modResults.language!=='groovy')throw Error('Google Services requires Groovy project build.gradle.');
  let text=mod.modResults.contents;
  const entry=/classpath\s*\(?\s*["']com\.google\.gms:google-services(?::[^"']+)?["']\s*\)?/;
  if(entry.test(text))text=text.replace(entry,"classpath 'com.google.gms:google-services:4.5.0'\n    ");
  else {const marker=/buildscript\s*\{[\s\S]*?dependencies\s*\{/;if(!marker.test(text))throw Error('Google Services buildscript dependencies not found.');text=text.replace(marker,m=>m+"\n    classpath 'com.google.gms:google-services:4.5.0'");}
  mod.modResults.contents=text;return mod;
 });
 return withAppBuildGradle(config,mod=>{
  if(mod.modResults.language!=='groovy')throw Error('Firebase Analytics requires Groovy app build.gradle.');
  let text=mod.modResults.contents;
  if(!text.includes('com.google.firebase:firebase-bom:35.1.0')){const marker=/dependencies\s*\{/;if(!marker.test(text))throw Error('App dependencies block not found.');text=text.replace(marker,m=>m+"\n    implementation platform('com.google.firebase:firebase-bom:35.1.0')\n    implementation 'com.google.firebase:firebase-analytics'");}
  mod.modResults.contents=text;return mod;
 });
};
