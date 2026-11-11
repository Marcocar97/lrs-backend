const path=require('node:path');
const fs=require('node:fs');
const root=path.resolve(__dirname,'..');
function build(){
 const out=path.join(root,'.spec-cache/templates.mjs');fs.mkdirSync(path.dirname(out),{recursive:true});
 require('esbuild').buildSync({stdin:{contents:"export {default as RapidRoof} from './PdfRapidRoof.jsx'; export {default as FastCoat} from './PdfDocumentFastCoatTop.jsx';",resolveDir:path.join(root,'specifications'),sourcefile:'templates.jsx',loader:'jsx'},bundle:true,platform:'node',format:'esm',packages:'external',outfile:out,logLevel:'error'});return out;
}
if(require.main===module)build();module.exports={build};
