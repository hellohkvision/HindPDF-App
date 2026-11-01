const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {transformSync}=require('esbuild');const matcher=require('../src/engine/pdf-search.cjs');const fonts=require('../src/engine/pdf-text-fonts.cjs');
function fixture(pageCount=1,customRender){
 const events=[],spans=[],layers=[],loads={},items=[{str:'ill will',width:70,height:10,fontName:'g_d0_f1',transform:[10,0,0,10,20,100]}];
 function element(type){return {type,style:{setProperty(k,v){this[k]=v}},children:[],dataset:{},_text:'',get textContent(){return this._text},set textContent(v){this._text=v;this.children=[]},appendChild(child){this.children.push(child)},querySelector(name){return this.children.find(n=>n.type===name)||null},replaceChildren(...nodes){this.children=nodes.flatMap(n=>n.type==='fragment'?n.children:[n]);},getContext(){return {}},scrollIntoView(){}};}
 const container=element('div'),document={fonts:[{family:'g_d0_f1',status:'loaded'}],getElementById:()=>container,querySelector:()=>null,createElement:element,createTextNode:text=>({type:'text',textContent:text}),createDocumentFragment:()=>element('fragment')};
 const page={getViewport:({scale})=>({width:200*scale,height:300*scale,scale}),render:()=>({promise:Promise.resolve(),cancel(){}}),getTextContent:async()=>({items,styles:{g_d0_f1:{fontFamily:'sans-serif'}}}),cleanup(){}};
 const pdfjs={getDocument:()=>({promise:Promise.resolve({numPages:pageCount,getPage:async number=>({...page,render:()=>customRender?customRender(number,page.render):page.render(),getTextContent:async()=>{loads[number]=(loads[number]||0)+1;return page.getTextContent();}})})}),renderTextLayer:args=>{layers.push(args);for(const item of args.textContentSource.items){const span=element('span');span.textContent=item.str;spans.push(span);args.textDivs.push(span);args.container.appendChild(span);}return {promise:Promise.resolve(),cancel(){}};}};
 const code=transformSync(fs.readFileSync('src/engine/search-view.js','utf8'),{loader:'js',format:'cjs'}).code,window={innerWidth:216,devicePixelRatio:1,ReactNativeWebView:{postMessage:x=>events.push(JSON.parse(x))}};const req=name=>name==='./pdf-search.cjs'?matcher:name==='./pdf-text-fonts.cjs'?fonts:name.endsWith('/pdf.js')?pdfjs:{};new Function('require','window','document',code)(req,window,document);return {window,events,spans,layers,loads,container};
}
test('search highlights only matching characters and changes active color during navigation',async()=>{const f=fixture();await f.window.loadPdfForSearch('AA==',1);await f.window.searchPdf(1,'ill');const result=f.events.find(e=>e.type==='results');assert.equal(result.total,2);const nodes=f.spans[0].children;assert.deepEqual(nodes.map(n=>[n.type,n.textContent,n.className]),[['mark','ill','current'],['text',' w',undefined],['mark','ill','match']]);await f.window.navigatePdfSearch(1);assert.equal(f.spans[0].children[0].className,'match');assert.equal(f.spans[0].children[2].className,'current');});
test('search cancellation discards old highlighted text',async()=>{const f=fixture();await f.window.loadPdfForSearch('AA==',1);await f.window.searchPdf(1,'ill');f.window.cancelPdfSearch();assert.equal(f.spans[0].children.length,0);assert.equal(f.spans[0].textContent,'ill will');});

test('search layout uses the same embedded font as the rendered page',async()=>{const f=fixture();await f.window.loadPdfForSearch('AA==',1);assert.equal(f.layers[0].textContentSource.styles.g_d0_f1.fontFamily,'\"g_d0_f1\", sans-serif');});

test('search bounds its page cache and can still navigate to an evicted page',async()=>{
 const f=fixture(12);await f.window.loadPdfForSearch('AA==',1);
 await f.window.searchPdf(1,'not present');assert.equal(f.loads[1],1);
 await f.window.searchPdf(2,'ill');assert.equal(f.loads[1],2);
 const result=f.events.find(e=>e.type==='results'&&e.token===2);assert.equal(result.total,24);assert.equal(result.page,1);
});
test('cancel stops a long search before it sends stale results',async()=>{
 const f=fixture(40);await f.window.loadPdfForSearch('AA==',1);
 const pending=f.window.searchPdf(3,'ill');setTimeout(()=>f.window.cancelPdfSearch(),0);await pending;
 assert.equal(f.events.some(e=>e.type==='results'&&e.token===3),false);assert.ok(Object.keys(f.loads).length<40);
});

test('keeps the previous search page visible until the next page is rendered',async()=>{
 let begin,finish;const started=new Promise(resolve=>{begin=resolve;});
 const f=fixture(2,(number,normal)=>number===2?{promise:new Promise(resolve=>{finish=resolve;begin();}),cancel(){}}:normal());
 await f.window.loadPdfForSearch('AA==',1);await f.window.searchPdf(1,'ill');await f.window.navigatePdfSearch(1);
 const previous=f.container.querySelector('canvas'),pending=f.window.navigatePdfSearch(1);await started;
 assert.equal(f.container.querySelector('canvas'),previous);assert.ok(previous.width>1);
 finish();await pending;assert.notEqual(f.container.querySelector('canvas'),previous);assert.equal(previous.width,1);
});
test('a cancelled search-page render keeps the existing page and cannot replace a newer one',async()=>{
 let begin,cancel;const started=new Promise(resolve=>{begin=resolve;});
 const f=fixture(2,(number,normal)=>number===2?{promise:new Promise((_,reject)=>{cancel=()=>reject(Object.assign(Error('cancelled'),{name:'RenderingCancelledException'}));begin();}),cancel(){cancel();}}:normal());
 await f.window.loadPdfForSearch('AA==',1);await f.window.searchPdf(1,'ill');await f.window.navigatePdfSearch(1);
 const previous=f.container.querySelector('canvas'),pending=f.window.navigatePdfSearch(1);await started;assert.equal(f.container.querySelector('canvas'),previous);
 const back=f.window.navigatePdfSearch(-1);await Promise.all([pending,back]);
 assert.notEqual(f.container.querySelector('canvas'),previous);assert.equal(f.events.filter(e=>e.type==='pageRendered').at(-1).page,1);
 assert.equal(f.events.some(e=>e.type==='error'),false);
});
test('a failed result render retains the previous page and reports the error',async()=>{
 const f=fixture(2,(number,normal)=>number===2?{promise:Promise.reject(Error('render failed')),cancel(){}}:normal());
 await f.window.loadPdfForSearch('AA==',1);await f.window.searchPdf(1,'ill');await f.window.navigatePdfSearch(1);
 const previous=f.container.querySelector('canvas');await f.window.navigatePdfSearch(1);
 assert.equal(f.container.querySelector('canvas'),previous);assert.ok(previous.width>1);
 assert.equal(f.events.filter(e=>e.type==='error').at(-1).message,'Could not render this PDF page.');
});
