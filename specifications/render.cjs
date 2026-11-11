const {fork}=require('node:child_process');
const path=require('node:path');
let built=false,active=0;
async function render(system,data){
 if(active>=2){const e=new Error('The specification generator is busy. Please try again shortly.');e.status=429;throw e;}
 if(!built){require('../scripts/build-specifications.cjs').build();built=true;}
 active++;
 try{return await new Promise((resolve,reject)=>{
  const child=fork(path.join(__dirname,'worker.cjs'),[],{stdio:['ignore','ignore','ignore','ipc'],execArgv:['--max-old-space-size=512']});let done=false;
  const finish=(error,bytes)=>{if(done)return;done=true;clearTimeout(timer);child.kill();error?reject(error):resolve(bytes);};
  const timer=setTimeout(()=>finish(Object.assign(new Error('Specification generation timed out. Try fewer or smaller photos.'),{status:504})),80000);
  child.on('error',e=>finish(e));child.on('exit',()=>finish(new Error('Specification generator stopped')));
  child.on('message',m=>{if(m.error)return finish(new Error(m.error));const bytes=Buffer.from(m.pdf||'','base64');if(bytes.length>20*1024*1024||bytes.subarray(0,5).toString()!=='%PDF-')return finish(new Error('Invalid generated document'));finish(null,bytes);});child.send({system,data});
 });}finally{active--;}
}
module.exports={render};
