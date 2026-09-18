const {getCliClient}=require('sanity/cli');
const fs=require('node:fs');
(async()=>{
 const client=getCliClient({apiVersion:'2025-09-16'}).withConfig({projectId:'wu6i3y0h',dataset:'production',perspective:'raw',useCdn:false});
 const docs=await client.fetch('*[_type == "page" && channel == "flizrWeb" && language == "en" && slug.current in ["services", "home"]]');
 fs.writeFileSync('tmp/flzr-verbatim/services-layout-before.json',JSON.stringify(docs,null,2));
 for(const d of docs) console.log(JSON.stringify({_id:d._id,_rev:d._rev,content:d.content?.map(b=>({...b,...(b._type==='oneSPHeader'?{media:undefined,paragraphs:undefined}:{}),selectedCases:undefined}))}));
})().catch(e=>{console.error(e.message);process.exitCode=1});
