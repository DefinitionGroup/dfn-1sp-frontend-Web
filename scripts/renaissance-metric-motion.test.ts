import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';

// Use the DOM runtime already installed with Sanity; no browser or network is started.
const localRequire=createRequire(import.meta.url);
const sanityRequire=createRequire(localRequire.resolve('sanity/package.json'));
const domRequire=createRequire(sanityRequire.resolve('isomorphic-dompurify'));
const {JSDOM}=domRequire('jsdom');

test('reduced motion shows final values immediately and CMS edits settle without replay',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{pretendToBeVisual:true});
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,Element:dom.window.Element,HTMLElement:dom.window.HTMLElement,IS_REACT_ACT_ENVIRONMENT:true});
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
 dom.window.matchMedia=()=>({matches:true,addListener:()=>{},removeListener:()=>{},addEventListener:()=>{},removeEventListener:()=>{}});
 Object.assign(globalThis,{IntersectionObserver:class {observe(){} unobserve(){} disconnect(){}}});
 const React=await import('react');
 const {createRoot}=await import('react-dom/client');
 const {MetricNumber}=await import('../packages/utils/src/components/MetricNumber');
 const target=dom.window.document.getElementById('root')!;const root=createRoot(target);
 const metric={type:'animatedNumber' as const,label:'Views',value:4_900_000,displayScale:'million' as const,decimalPlaces:1,qualifier:'plus' as const};
 await React.act(async()=>{root.render(React.createElement(MetricNumber,{metric}));});
 assert.equal(target.querySelector('[data-metric-animation]')?.getAttribute('data-metric-animation'),'static');
 assert.equal(target.querySelector('[data-metric-value]')?.lastElementChild?.textContent,'4.9m+');
 await React.act(async()=>{root.render(React.createElement(MetricNumber,{metric:{...metric,value:5_200_000}}));});
 assert.equal(target.querySelector('[data-metric-value]')?.lastElementChild?.textContent,'5.2m+');
 assert.equal(target.querySelector('[data-metric-animation]')?.getAttribute('data-metric-animation'),'static');
 await React.act(async()=>{root.unmount();});dom.window.close();
});
