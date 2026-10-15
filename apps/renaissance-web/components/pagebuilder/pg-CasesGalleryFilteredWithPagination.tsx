"use client";

import { useDeferredValue, useState } from "react";
import CaseGalleryComponent from "@renaissance/components/data/data-CaseGallery";
import { CAMPAIGN_REGIONS, matchesCampaign, type DiscoverableCase } from "@renaissance/lib/caseDiscovery";

interface CaseStudy extends DiscoverableCase {
  _id: string; slug: {current: string}; mainImageUrl?: string; mainVideoUrl?: string;
  services?: {_id:string;name:string;taglabel?:string}[];
  client?: {_id:string;name:string;logoUrl?:string}; websiteUrl?:string; websiteUrlText?:string;
}
interface Props {locale?:string;caseStudies?:CaseStudy[];showFilters?:boolean;paddingY?:string;marginBottom?:string;navPointName?:string;rowsPerPage?:number}
export default function CasesGalleryFilteredWithPagination({locale='en',caseStudies=[],showFilters=true,navPointName,rowsPerPage=12}:Props) {
  const [region,setRegion]=useState('');
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const deferredSearch=useDeferredValue(search);
  const filtered=caseStudies.filter(study=>matchesCampaign(study,region,deferredSearch));
  const pageSize=Math.max(1, Math.min(48,rowsPerPage));
  const pages=Math.ceil(filtered.length/pageSize);
  const current=Math.min(page,Math.max(1,pages));
  return <section id="case-campaigns" data-navpoint-name={navPointName} className="container mx-auto scroll-mt-28 px-5 py-16 font-renaissance md:px-8">
    {showFilters && <div className="mb-10 space-y-6">
      <div className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Filter campaigns by region">
        {CAMPAIGN_REGIONS.map(item=><button key={item.value} type="button" aria-pressed={region===item.value}
          onClick={()=>{setRegion(item.value);setPage(1)}}
          className={`border-b-2 pb-2 text-sm font-semibold transition-colors ${region===item.value?'border-renaissance-ink text-renaissance-ink':'border-transparent text-neutral-500 hover:text-renaissance-ink'}`}>{item.label}</button>)}
      </div>
      <label className="block max-w-2xl text-sm font-semibold">Search campaigns
        <input type="search" value={search} onChange={event=>{setSearch(event.target.value);setPage(1)}} placeholder="Game, client, genre or platform"
          className="mt-2 block w-full border-b border-renaissance-ink bg-transparent py-3 text-lg font-normal outline-offset-4" />
      </label>
    </div>}
    <p aria-live="polite" className="mb-6 text-sm text-neutral-600">{filtered.length} {filtered.length===1?'campaign':'campaigns'}{pages>1?` · Page ${current} of ${pages}`:''}</p>
    {filtered.length ? <CaseGalleryComponent caseStudies={filtered.slice((current-1)*pageSize,current*pageSize)} locale={locale} /> : <p className="py-12">No campaigns match. Try another region or search term.</p>}
    {pages>1 && <nav aria-label="Campaign pages" className="mt-12 flex flex-wrap justify-center gap-2">
      {Array.from({length:pages},(_,i)=>i+1).map(number=><button key={number} type="button" aria-label={`Page ${number}`} aria-current={current===number?'page':undefined}
        className={`h-10 w-10 ${current===number?'bg-renaissance-ink text-white':'text-renaissance-ink hover:bg-renaissance-accent'}`}
        onClick={()=>{setPage(number);document.getElementById('case-campaigns')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}}>{number}</button>)}
    </nav>}
  </section>;
}
