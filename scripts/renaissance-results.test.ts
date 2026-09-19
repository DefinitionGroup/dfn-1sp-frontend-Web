import assert from 'node:assert/strict';
import {test} from 'node:test';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import type {ResultMetric} from '../packages/sanity-types/src';
import {metricPresentation,resultSectionId} from '../packages/utils/src/result-metrics';
import {MetricNumber} from '../packages/utils/src/components/MetricNumber';
import {resultGroups,validateResultSources} from './renaissance-results-data';
import {copy} from './renaissance-content-model';
const base:ResultMetric={type:'animatedNumber',label:'Views',value:0};
const display=(m:Partial<ResultMetric>)=>metricPresentation({...base,...m}).final;

test('preserves precise totals, units, qualifiers, scores and zero',()=>{
 assert.equal(display({value:4_058_049,decimalPlaces:0}),'4,058,049');
 assert.equal(display({value:4_900_000,displayScale:'million',decimalPlaces:1,qualifier:'plus'}),'4.9m+');
 assert.equal(display({value:34e9,displayScale:'billion'}),'34bn');
 assert.equal(display({value:89.9,decimalPlaces:1}),'89.9');
 assert.equal(display({value:215,prefix:'+',suffix:'%'}),'+215%');
 assert.equal(display({value:1500,qualifier:'nearly'}),'Nearly 1,500');
 assert.equal(display({value:700000,qualifier:'lessThan'}),'Under 700,000');
 assert.equal(display({value:750e6,displayScale:'million',qualifier:'approximately'}),'~750m');
 assert.equal(display({value:0}),'0');
 assert.equal(display({value:-15,suffix:'%'}),'-15%');
});
test('old suffix-based metrics are not rescaled and encoded controls remain valid',()=>{
 assert.equal(display({value:3.5,suffix:'m+'}),'3.5m+');
 assert.equal(display({value:4.9e6,displayScale:'million\u200b' as any,qualifier:'plus\u200c' as any,decimalPlaces:1}),'4.9m+');
 assert(metricPresentation({...base,value:1,prefix:'#',animationMode:'static'}).isStatic);
});
test('server output contains final accessible values without waiting for JavaScript',()=>{
 const html=renderToStaticMarkup(createElement(MetricNumber,{metric:{...base,value:4058049,decimalPlaces:0}}));
 assert.match(html,/class="sr-only">4,058,049/);
 assert.match(html,/data-metric-value="4,058,049"/);
 assert.match(html,/aria-hidden="true"/);
 assert.doesNotMatch(html,/>0</);
});
test('Results groups preserve the first anchor and use stable unique subsequent anchors',()=>{
 const blocks=[{_type:'headlineChallenge',_key:'brief'},{_type:'resultsMetrics',_key:'media'},{_type:'resultsMetrics',_key:'creators'}];
 assert.equal(resultSectionId(blocks,blocks[1],1),'results');
 assert.equal(resultSectionId(blocks,blocks[2],2),'results-creators');
});
test('all sixty source paragraphs are mapped; ranks and qualitative cases get no artificial metrics',()=>{
 validateResultSources();assert.equal(Object.keys(resultGroups).length,60);
 assert.equal(Object.values(resultGroups).filter(groups=>groups.some(g=>g.metrics.length)).length,56);
 for(const row of [158,161,168,170])assert.equal(resultGroups[row].flatMap(g=>g.metrics).length,0);
 const numericTokens=(s:string)=>s.match(/\d+(?:,\d{3})*(?:\.\d+)?(?:bn|m|k)?\+?%?/g)||[];
 for(const [row,groups] of Object.entries(resultGroups)){
   const retained=JSON.stringify(groups);
   for(const token of numericTokens(copy(Number(row))))assert(retained.includes(token),`F${row} lost number ${token}`);
 }
});
test('selected claims are numeric counts rather than words beginning with m; scopes stay separate',()=>{
 assert.equal(resultGroups[70][0].metrics[0].value,27);
 assert.equal(resultGroups[138][1].metrics[1].value,40);
 assert.equal(resultGroups[90][1].metrics[0].value,10e6);
 assert.equal(resultGroups[44][2].metrics[0].value,4058049);
 assert.equal(resultGroups[74][0].context,'Since announcement');
 assert.equal(resultGroups[74][1].context,'Within 7 days');
 assert.equal(resultGroups[68][1].metrics[1].prefix,'+');
 assert.equal(resultGroups[68][1].metrics[1].suffix,'%');
});
