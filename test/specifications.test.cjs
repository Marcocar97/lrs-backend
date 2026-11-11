const {test}=require('node:test');const assert=require('node:assert/strict');
const express=require('express');const {validate}=require('../specifications/validate.cjs');
const sample={lrsReference:'LRS-TEST',reference:'Roof - Whitchurch',date:'2026-11-10',roofSize:'100 m²',attention:'Test contractor',preparedBy:'Test author',preparedByEmail:'author@example.test',guarantee:'20-year',surface:'Concrete',roofType:'Warm Roof',uValue:'0.18W/m²K',roofBuildUp:'Existing concrete deck',outlets:'2',skylights:'1',acUnits:'0',existingCoatings:'No',pondingWater:'No',antiSkid:'Yes',trafficCoat:'Yes'};
test('system-specific validation, conditional fields and uploaded images',()=>{
 assert.equal(validate('fastcoat',sample).trafficCoat,'Yes');assert.equal(validate('fastcoat',sample).antiSkid,undefined);
 assert.equal(validate('rapidroof',{...sample,roofType:'Existing Overlay'}).uValue,'');
 assert.throws(()=>validate('fastcoat',{...sample,guarantee:'10-year'}));assert.throws(()=>validate('grflex',sample));
 assert.throws(()=>validate('rapidroof',{...sample,image:'https://example.test/photo.png'}));
 assert.throws(()=>validate('rapidroof',{...sample,date:'2026-02-30'}));
 assert.throws(()=>validate('fastcoat',{...sample,trafficCoat:''}));
 assert.throws(()=>validate('rapidroof',{...sample,photos:Array(5).fill(null)}));
});
test('protected API renders both current templates and guarantee variants',async t=>{
 const app=express();app.use('/api',require('../routes/specifications'));const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));t.after(()=>new Promise(r=>server.close(r)));
 const url='http://127.0.0.1:'+server.address().port+'/api/integrations/specifications';
 const request=(body,key)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',...(key?{Authorization:'Bearer '+key}:{})},body:JSON.stringify(body)});
 delete process.env.CRM_SPEC_API_KEY;assert.equal((await request({})).status,503);
 const key='test-connection-key-32-characters-long';process.env.CRM_SPEC_API_KEY=key;
 assert.equal((await request({})).status,401);assert.equal((await request({},'wrong')).status,401);
 assert.equal((await request({system:'fastcoat',data:{...sample,guarantee:'10-year'}},key)).status,400);
 for(const [system,guarantee,surface] of [['rapidroof','10-year','Timber'],['rapidroof','20-year','Concrete'],['rapidroof','25-year','Asbestos'],['fastcoat','20-year','Concrete'],['fastcoat','25-year','Timber']]){
  const photo='data:image/png;base64,'+require('node:fs').readFileSync(require('node:path').join(__dirname,'../specifications/assets/last.png')).toString('base64');
  const res=await request({system,data:{...sample,guarantee,surface,...(guarantee==='20-year'?{image:photo,photos:[photo]}:{})}},key);assert.equal(res.status,200,await(res.ok?Promise.resolve(''):res.text()));assert.ok(res.headers.get('X-Spec-Template-Version'));const bytes=Buffer.from(await res.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.ok(bytes.length>10000);
 }
});
