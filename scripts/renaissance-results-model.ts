import assert from 'node:assert/strict';
import {campaigns,copy,CHANNEL,PILOT} from './renaissance-content-model';
import {resultGroups,validateResultSources} from './renaissance-results-data';

export function resultsBody(document:any) {
  const edition=document.siteContent?.find((e:any)=>e.channel===CHANNEL&&e.bodyMode==='custom');
  return {body:edition?edition.casesPageBuilder:document.casesPageBuilder,edition};
}
export function expectedResults(row:number,original:any) {
  return resultGroups[row].map((group,index,groups)=>{
    const {_key,title,description,metrics,quote,context,...retained}=original;
    return {...retained,_type:'resultsMetrics',_key:index===0?_key:`${_key}-${index+1}`,title:group.title,
      ...(group.context?{context:group.context}:{}),...(group.description?{description:group.description}:{}),
      metrics:group.metrics.map(({sourceText,...metric},metricIndex)=>({...metric,_key:`${_key}-${index+1}-metric-${metricIndex+1}`})),
      ...(index===groups.length-1&&quote?{quote}:{}),paddingY:'24'};
  });
}
export function assertMigratedResults(document:any,row:number) {
  const {body}=resultsBody(document);
  const key=`rpr-v4-${row}`;
  const groups=body.filter((b:any)=>b._key===key||b._key.startsWith(`${key}-`));
  assert.equal(groups.length,resultGroups[row].length,`F${row} group count`);
  const quote=groups.find((g:any)=>g.quote)?.quote;
  assert.deepEqual(groups,expectedResults(row,{...groups[0],quote}),`F${row} content mismatch`);
}
export function buildResultsPlan(all:any[],selectedRows?:number[]) {
  validateResultSources();
  const changes:any[]=[], ledger:any[]=[];
  for(const campaign of campaigns){
    const row=campaign.sourceRows.find(row=>resultGroups[row]);if(!row||selectedRows&&!selectedRows.includes(row))continue;
    const doc=all.find(d=>d._id===`drafts.${campaign.id}`);assert(doc,`Expected draft: ${campaign.id}`);
    assert.equal(doc.language,'en');assert(doc.channel.includes(CHANNEL));
    assert(campaign.id===PILOT||doc.channel.length===1,'Do not overwrite shared content of another website');
    const {body,edition}=resultsBody(doc);assert(Array.isArray(body));
    if(campaign.id===PILOT)assert(edition,'Pilot must use its Renaissance edition');
    const key=`rpr-v4-${row}`,index=body.findIndex((b:any)=>b._key===key);assert(index>=0,`Missing ${key}`);
    const original=body[index];
    if(original.title===resultGroups[row][0].title||original.description!==copy(row)||original.metrics?.length){
      assertMigratedResults(doc,row);continue;
    }
    const blocks=expectedResults(row,original);
    const nextBody=[...body.slice(0,index),...blocks,...body.slice(index+1)];
    const fields=edition?{siteContent:doc.siteContent.map((e:any)=>e===edition?{...e,casesPageBuilder:nextBody}:e)}:{casesPageBuilder:nextBody};
    changes.push({id:doc._id,rev:doc._rev,fields,row});
    ledger.push({id:doc._id,slug:campaign.slug,sourceCell:`Rewrite Comparison!F${row}`,originalText:copy(row),
      owner:edition?'siteContent[channel=renaissanceWeb].casesPageBuilder':'casesPageBuilder',originalKey:key,
      groups:blocks.map((block:any,i:number)=>({blockKey:block._key,title:block.title,context:block.context,description:block.description,quote:block.quote,
        metrics:block.metrics.map((metric:any,j:number)=>({...metric,sourceText:resultGroups[row][i].metrics[j].sourceText}))}))});
  }
  return {changes,ledger};
}
