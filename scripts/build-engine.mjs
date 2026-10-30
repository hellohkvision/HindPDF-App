import {build} from 'esbuild';
import {writeFileSync} from 'node:fs';
const result=await build({entryPoints:['src/engine/browser.js'],bundle:true,platform:'browser',format:'iife',target:['es2020'],minify:true,write:false,define:{'process.env.NODE_ENV':'"production"'},external:['canvas','fs','path','http','https','url','zlib']});
const script=result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const html=`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; img-src data: blob:; style-src 'unsafe-inline'; connect-src 'none'"></head><body><script>${script}</script></body></html>`;
writeFileSync('src/engine/bundle.json',JSON.stringify({html}));
console.log(`Bundled offline document engine: ${(html.length/1024/1024).toFixed(2)} MB`);
