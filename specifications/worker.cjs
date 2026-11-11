const path=require('node:path');
const {pathToFileURL}=require('node:url');
process.once('message',async ({system,data})=>{
 try{
  const React=(await import('react')).default;
  const {renderToBuffer}=await import('@react-pdf/renderer');
  const templates=await import(pathToFileURL(path.resolve(__dirname,'../.spec-cache/templates.mjs')).href);
  const bytes=await renderToBuffer(React.createElement(system==='rapidroof'?templates.RapidRoof:templates.FastCoat,{...data,assetBase:path.join(__dirname,'assets')}));
  process.send({pdf:bytes.toString('base64')},()=>process.exit(0));
 }catch{process.send({error:'Unable to render specification'},()=>process.exit(1));}
});
