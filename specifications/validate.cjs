const contract=require('./contract.json');
function invalid(message){const e=new Error(message);e.status=400;throw e;}
function image(value){
 if(value===null||value===undefined||value==='')return null;
 if(typeof value!=='string'||value.length>Math.ceil(contract.max_image_bytes*4/3)+40)invalid('Each image must be a JPEG or PNG up to 1.5 MB');
 const m=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);if(!m)invalid('Use uploaded JPEG or PNG images');
 const bytes=Buffer.from(m[2],'base64');if(bytes.length>contract.max_image_bytes||bytes.toString('base64')!==m[2])invalid('Invalid image');
 if(m[1]==='png'&&(bytes.length<24||!bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))))invalid('Invalid PNG image');
 if(m[1]==='jpeg'&&(bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes[2]!==255))invalid('Invalid JPEG image');
 if(m[1]==='png'&&(bytes.readUInt32BE(16)>10000||bytes.readUInt32BE(20)>10000||bytes.readUInt32BE(16)*bytes.readUInt32BE(20)>24000000))invalid('Image dimensions are too large');
 return value;
}
function validate(system,input){
 const selected=contract.systems.find(s=>s.key===system);if(!selected)invalid('Choose RapidRoof or FastCoat');
 if(!input||typeof input!=='object'||Array.isArray(input))invalid('Specification details are required');const data={};
 for(const f of contract.fields){
  if(f.system&&f.system!==system)continue;if(f.when&&input.roofType!==f.when){data[f.name]='';continue;}
  let value=input[f.name]??'';if(typeof value!=='string'&&!(f.type==='number'&&typeof value==='number'))invalid(f.label+' must be text');value=String(value).trim();
  if(f.required&&!value)invalid(f.label+' is required');if(value.length>(f.max||200))invalid(f.label+' is too long');
  const options=f.name==='surface'?selected.surfaces:f.name==='guarantee'?selected.guarantees:f.options;
  if(value&&options&&!options.includes(value))invalid('Choose a valid '+f.label);
  if(f.type==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value))invalid('Enter a valid date');
  if(f.type==='number'){const size=Number(value.replace(/,/g,''));if(!Number.isFinite(size)||size<=0||size>10000000)invalid('Enter a valid roof size');value=String(size);}
  if(f.name==='roofSize'&&/^\d+(?:\.\d+)?$/.test(value))value+=' m²';
  data[f.name]=value;
 }
 if(data.preparedByEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.preparedByEmail))invalid('Enter a valid contact email');
 data.image=image(input.image);if(input.photos!==undefined&&!Array.isArray(input.photos))invalid('Invalid photos');
 if((input.photos||[]).length>contract.max_photos)invalid('Upload up to four project photos');data.photos=(input.photos||[]).map(image).filter(Boolean);
 return data;
}
module.exports={validate,contract};
