const express=require('express');
const {timingSafeEqual,createHash}=require('node:crypto');
const auth=require('../middleware/auth');
const {validate,contract}=require('../specifications/validate.cjs');
const {render}=require('../specifications/render.cjs');
const router=express.Router();
function integrationAuth(req,res,next){
 const secret=process.env.CRM_SPEC_API_KEY,provided=(req.get('Authorization')||'').replace(/^Bearer /,'');
 if(!secret||secret.length<32)return res.status(503).json({error:'CRM specification integration is not configured'});
 if(!provided||!timingSafeEqual(createHash('sha256').update(secret).digest(),createHash('sha256').update(provided).digest()))return res.status(401).json({error:'Invalid integration credentials'});
 next();
}
async function generate(req,res){
 try{
  const data=validate(req.body.system,req.body.data);
  const bytes=await render(req.body.system,data);
  res.set({'Cache-Control':'no-store','X-Spec-Template-Version':contract.version,'X-Spec-System':req.body.system});
  res.type('application/pdf').attachment('LRS-specification.pdf').send(bytes);
 }catch(e){res.status(e.status||500).json({error:e.status?e.message:'Unable to generate the specification. Please try again.'});}
}
router.post('/integrations/specifications',integrationAuth,express.json({limit:'12mb'}),generate);
// Existing Spec Tool users use their normal JWT. No CRM key is sent to browsers.
router.post('/specifications/render',auth,express.json({limit:'12mb'}),async(req,res)=>{
 const User=require('../models/User');const user=await User.findByPk(req.userId);if(!user)return res.status(401).json({error:'Please sign in again'});
 req.body={...req.body,data:{...req.body.data,preparedBy:user.name,preparedByRole:user.position,preparedByEmail:user.email,preparedByPhone:user.phone}};
 return generate(req,res);
});
module.exports=router;
