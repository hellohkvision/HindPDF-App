const {test}=require('node:test');
const assert=require('node:assert/strict');
const {scanLayout}=require('../src/engine/scan-layout.cjs');
test('scan pages keep orientation and support A4, Letter and image size',()=>{
 assert.deepEqual(scanLayout('a4',800,1200),{width:595.28,height:841.89,margin:24});
 assert.deepEqual(scanLayout('letter',1200,800),{width:792,height:612,margin:24});
 assert.deepEqual(scanLayout('original',30000,15000),{width:14400,height:7200,margin:0});
 assert.throws(()=>scanLayout('a4',0,1));
});
