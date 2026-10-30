const test = require('node:test');
const assert = require('node:assert/strict');
const {pageIndices,positive} = require('../src/engine/ranges.cjs');
test('selects all pages by default and expands ranges',()=>{
 assert.deepEqual(pageIndices('',3),[0,1,2]);
 assert.deepEqual(pageIndices('1,3-5',5),[0,2,3,4]);
});
test('preserves reorder sequence and rejects duplicates',()=>{
 assert.deepEqual(pageIndices('3,1,2',3,true),[2,0,1]);
 assert.throws(()=>pageIndices('1,1',3,true));
});
test('rejects malformed and out of bounds page numbers',()=>{
 for (const input of ['0','1-4','3-2','1,abc','1,,2']) assert.throws(()=>pageIndices(input,3));
});
test('checks positive option limits',()=>{
 assert.equal(positive('',24),24);assert.equal(positive('15',1),15);
 for (const input of ['0','-1','NaN','10001']) assert.throws(()=>positive(input,1));
});
