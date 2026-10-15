import {readFileSync,writeFileSync} from 'node:fs';
import {buildMsmPlan} from './msm-content-model';
const all=JSON.parse(readFileSync('EXPORT/msm-rewrite/before.json','utf8'));
const assets=new Set<string>();
const plan=buildMsmPlan(all,url=>{assets.add(url);return {_type:'cloudinary.asset',secure_url:url};});
writeFileSync('EXPORT/msm-rewrite/plan.json',JSON.stringify({...plan,assets:[...assets]},null,2)+'\n');
console.log(JSON.stringify({documents:plan.changes.length,types:plan.changes.reduce((a:any,c)=>({...a,[c.type]:(a[c.type]||0)+1}),{}),sourceRows:plan.coverage.length,statuses:plan.coverage.reduce((a:any,r)=>({...a,[r.status]:(a[r.status]||0)+1}),{}),assets:assets.size,issues:plan.issues},null,2));
