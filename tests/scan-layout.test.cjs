const {test}=require('node:test');
const assert=require('node:assert/strict');
const {scanLayout}=require('../src/engine/scan-layout.cjs');
test('scan pages keep their orientation without a default margin',()=>{
 assert.deepEqual(scanLayout('a4',800,1200),{width:595.28,height:841.89,margin:0});
 assert.deepEqual(scanLayout('letter',1200,800),{width:792,height:612,margin:0});
 assert.deepEqual(scanLayout('original',30000,15000),{width:14400,height:7200,margin:0});
 assert.throws(()=>scanLayout('a4',0,1));
});
test('optional margins apply to fixed and original page sizes',()=>{
 assert.equal(scanLayout('a4',800,1200,'small').margin,12);
 assert.equal(scanLayout('letter',1200,800,'medium').margin,24);
 assert.equal(scanLayout('original',800,1200,'small').margin,12);
 assert.equal(scanLayout('original',8,12,'medium').margin,2);
 assert.equal(scanLayout('a4',800,1200,'unrecognized').margin,0);
});
