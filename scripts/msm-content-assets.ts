import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {buildMsmPlan} from './msm-content-model';

async function main(){
  assert.equal(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,'wu6i3y0h');
  assert.equal(process.env.NEXT_PUBLIC_SANITY_DATASET,'production');
  const all=JSON.parse(readFileSync('EXPORT/msm-rewrite/before.json','utf8'));
  const needed=new Set<string>();buildMsmPlan(all,url=>{needed.add(url);return {_type:'cloudinary.asset',secure_url:url};});
  const path='EXPORT/msm-rewrite/assets.json';
  const assets:Record<string,any>=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
  const cloud=process.env.CLOUDINARY_CLOUD_NAME,key=process.env.CLOUDINARY_API_KEY,secret=process.env.CLOUDINARY_API_SECRET;
  assert(cloud&&key&&secret,'Cloudinary credentials unavailable');
  const failures:any[]=[];
  const sources=[...needed];
  for(let i=0;i<sources.length;i+=3){
    await Promise.all(sources.slice(i,i+3).map(async url=>{
      if(assets[url])return;
      try{
        const params={asset_folder:'1sp/MSM/Rewrite-v1',public_id:`msm/rewrite-v1/${createHash('sha256').update(url).digest('hex').slice(0,24)}`,overwrite:'false',timestamp:String(Math.floor(Date.now()/1000)),unique_filename:'false'};
        const signature=createHash('sha1').update(Object.entries(params).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('&')+secret).digest('hex');
        const form=new FormData();Object.entries(params).forEach(([k,v])=>form.append(k,v));form.append('api_key',key);form.append('signature',signature);form.append('file',encodeURI(decodeURI(url)));
        const response=await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(120000)});
        const body=await response.json();assert(response.ok,`HTTP ${response.status}: ${body.error?.message || 'upload failed'}`);
        assert(body.secure_url && body.width && body.height,'Incomplete asset response');
        assets[url]={_type:'cloudinary.asset',id:body.asset_id,public_id:body.public_id,secure_url:body.secure_url,width:body.width,height:body.height,format:body.format,resource_type:body.resource_type,type:body.type,version:body.version};
      }catch(error){failures.push({url,error:String(error)});}
    }));
    writeFileSync(path,JSON.stringify(assets,null,2)+'\n',{mode:0o600});
    if(i%12===0)console.log(`MSM media: ${Object.keys(assets).length}/${sources.length}; failures ${failures.length}`);
  }
  writeFileSync('EXPORT/msm-rewrite/asset-failures.json',JSON.stringify(failures,null,2)+'\n');
  console.log(JSON.stringify({assets:Object.keys(assets).length,failures}));
  assert.equal(failures.length,0);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
