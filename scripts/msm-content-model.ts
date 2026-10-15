import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import source from './data/msm-rewrite-v1.json';
import recovered from './data/msm-legacy-v1.json';

export const CHANNEL = 'msmWeb';
export type Row = typeof source[number];
export const rows = source as Row[];
export const legacy = recovered as Record<string, any>;
export const slug = (s: string) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const key = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 16);
const urlPath = (url: string) => new URL(url).pathname.replace(/^\/de\//, '/').replace(/\/$/, '');
const lang = (r: Row) => r.language.toLowerCase();
const pt = (text: string, style = 'normal') => text.split(/\n\s*\n/).filter(Boolean).map((text, i) => ({_type: 'block', _key: key(`${i}:${text}`), style, markDefs: [], children: [{_type: 'span', _key: 'text', text, marks: []}]}));
const ref = (id: string, type: string) => ({_type: 'reference', _ref: id, _weak: true, _strengthenOnPublish: {type}});
const refs = (ids: string[], type: string) => [...new Set(ids)].map(id => ({...ref(id, type), _key: key(id)}));
const instructionRows = new Set([573,589,704,731,749,758,785,794,812,821,838,887,920,966,1319]);
export function approvedCopy(r: Row): string | undefined {
  const text = String(r.rewrite || '').trim();
  if (instructionRows.has(r.row)) return undefined;
  if (/^\((unchanged|unverändert)/i.test(text)) return String(r.original || '').trim();
  return text.replace(/\s*\(unchanged\)$/, '');
}
const pages = [...new Map(rows.map(r => [r.url, rows.filter(x => x.url === r.url)])).entries()];
// Explicit translation identity map, checked against campaign/client and source media.
const sourceAliases: Record<string,string> = {
 'technologysystems':'technology-systems','review-plattform':'review-platform','content-kreation':'content-creation','cashback-services':'cashback-solutions',
 'turtle-beach-digitale-produkt-kommunikation':'turtle-beach-digital-product-communications',
 'anker-und-soundcore-retail-space-experience':'anker-and-soundcore-retail-space-experience',
 'eppendorf-e-learning':'eppendorf-e-learning-concept','microsoft-xbox-cassette-player-fotoshooting':'microsoft-xbox-cassette-player-photo-shoot',
 'riot-games-valorant-gen-z-adventskalender':'riot-games-valorant-gen-z-advent-calendar','expert-augmented-reality-produkterlebnis':'expert-augmented-reality-product-experience',
 'retail-training-per-escape-room':'microsoft-retail-training-per-escape-room','ea-need-for-speed-influencer-kampagne':'ea-need-for-speed-influencer-campaign',
 'ubs-virtuelle-treasure-hunt':'ubs-virtual-treasure-hunt','hisense-uefa-cashback-kampagne':'hisense-uefa-cashback',
 'minimax-virtual-reality-videoerlebnis':'minimax-virtual-reality-experience','garmin-esports-kooperation':'garmin-esports-cooperation',
 'recaro-gaming-social-media-und-pr':'recaro-gaming-social-media-and-pr','aeg-electrolux-one2five-review-plattform':'aeg-electrolux-one2five-review-platform',
 'merlin-entertainments-digital-signage-terminals':'merlin-entertainments-sea-life-digital-queue-entertainment','microsoft-misx-moebel-rollout':'microsoft-misx-furniture-rollout',
 'schleich-digitale-instore-activation':'schleich-digital-instore-activation','ernst-klett-verlag-content-enrichment-fuer-printprodukte':'ernst-klett-verlag-printed-content-enrichment',
 'erfal-eq3-influencer-kooperationen':'erfal-eq3-influencer-cooperations','riot-games-social-media-aktivierung':'riot-games-social-media-activation',
 'tiktok-influencer-kampagne':'tiktok-influencer-campaign','migros-digitale-ar-loyalty-kampagne':'migros-ar-digital-loyalty-campaign',
 'foerde-sparkasse-reviews-und-ratings-strategie':'sparkasse-reviews-and-ratings-strategy','jakks-pacifik-harry-potter-zauberstab-activation':'jakks-pacifik-harry-potter-magic-wand-activation',
 'coop-kvicki-q-warteschlangen-management':'coop-queue-management','decivisual-ux-ui-und-branding':'priokoll-ux-ui-and-branding',
 'daikin-b2c-b2b-energie-bonus':'daikin-energy-bonus','obi-micro-influencer-kampagne':'obi-influencer-campaign','nespresso-okr-visualisierung':'nespresso-okr-vizualization',
 'can-do-marketingstrategie':'can-do-marketing-strategy','avm-pos-optimierung':'avm-shelf-system-optimization','electrolux-showkuechen-rollout':'aeg-electrolux-showkitchen-rollout',
 'ea-die-sims-tiktok-influencer-marketing':'ea-the-sims-tiktok-influencer-marketing','oculus-produkt-launch-europa':'oculus-european-product-launch',
};
const translationPath = (url: string) => {const parts=urlPath(url).split('/'); const last=parts.pop()!;return [...parts,sourceAliases[last]||last].join('/');};
const servicesEN: Record<string, string> = {
  'social-media': 'c14eb875-b2d1-4e6e-9a92-60cdc249e30b',
  'influencer-marketing': 'f172b651-99a4-4471-94c6-1ac402a109eb',
  'pos-marketing': 'ccb58dec-5ce3-4d6d-bdc5-549e42be254b',
  'review-platform': '390b907a-714e-4c06-a733-845c155580ca',
  'augmented-and-virtual-reality': 'e0a5b3ac-34a8-4498-8db0-b81dddd0f7fa',
  'experiential-marketing': 'd118cc4d-59f7-44a2-9ebd-64fffd1f773f',
  'content-creation': 'eb1ade77-fd4b-4a0f-9d1c-08687f770c75',
};
// Only explicit campaign figures, never prices, dates, awards or total game audience.
// Values retain the source sentence as context and are checked against each language's copy.
const metricSpecs: Record<string, [number,string,string,string?][]> = {
  'ea-star-wars-battlefront-influencer-marketing': [[80,'Creator posts','Creator-Beiträge','moreThan'],[5600000,'Campaign reach','Kampagnenreichweite','moreThan']],
  'ea-sims4-influencer-marketing': [[50,'Influencers involved','Beteiligte Influencer','moreThan'],[20000000,'Net campaign reach','Netto-Kampagnenreichweite','moreThan']],
  'reifen-helm-digital-marketing': [[30,'Organic reach increase','Zuwachs organischer Reichweite']],
  'riot-games-valorant-gen-z-advent-calendar': [[600000,'Additional Instagram reach','Zusätzliche Instagram-Reichweite'],[40,'Engagement growth','Engagement-Zuwachs'],[8,'Follower growth','Follower-Zuwachs']],
  'riot-games-social-media-activation': [[3000000,'Organic reach','Organische Reichweite'],[13,'Peak engagement rate','Spitzen-Engagement-Rate'],[216,'Advent calendar content pieces','Adventskalender-Content-Beiträge']],
  'warner-pr-experiential-events': [[2000,'Gamescom event attendees','Teilnehmende beim gamescom-Event','approximately']],
  'bandai-namco-pr': [[55,'Software titles supported in 2018','Betreute Software-Titel 2018']],
  'ea-need-for-speed-influencer-campaign': [[250000,'YouTube views','YouTube-Aufrufe','moreThan'],[2000000,'People reached','Erreichte Menschen','moreThan']],
  'microsoft-retail-training-per-escape-room': [[70,'Retail staff trained','Geschulte Verkaufsmitarbeiter','moreThan']],
  'daikin-energy-bonus': [[5000,'Cashback claims','Cashback-Anträge','moreThan']],
  'mr-showroom': [[10,'Reach multiplier','Reichweitenfaktor'],[90,'Lower cost','Weniger Kosten'],[99,'Lower carbon footprint','Geringerer CO₂-Fußabdruck']],
  'aeg-electrolux-one2five-review-platform': [[30,'Brand sites and languages','Markenwebsites und Sprachen','moreThan'],[100000,'Displayed reviews after 12 months','Angezeigte Bewertungen nach 12 Monaten','moreThan']],
  'microsoft-expertzone-social-media': [[1.6,'Peak social engagement rate','Spitzenwert der Social-Engagement-Rate']],
  'ea-the-sims-tiktok-influencer-marketing': [[3200000,'People engaged','Erreichte Menschen','moreThan']],
  'obi-influencer-campaign': [[200,'Content pieces','Content-Beiträge','moreThan'],[30000,'User engagements','Nutzerinteraktionen','approximately'],[95,'Positive comments','Positive Kommentare','moreThan']],
  'ernst-klett-verlag-printed-content-enrichment': [[1000,'Books using the tool','Bücher mit dem Tool','moreThan']],
  'hisense-uefa-cashback': [[10000,'Payouts processed','Abgewickelte Auszahlungen','moreThan']],
};

export function buildMsmPlan(all: any[], asset: (url: string) => any) {
  const canonical = new Map<string, any>();
  for (const d of all.filter(d => !d._id.startsWith('drafts.'))) canonical.set(d._id, d);
  for (const d of all.filter(d => d._id.startsWith('drafts.'))) canonical.set(d._id.slice(7), {...d, _id: d._id.slice(7)});
  const changes = new Map<string, {id: string; type: string; fields: any}>();
  const coverage = new Map<number, {row: number; url: string; status: string; destination: string; note?: string}>();
  const issues: {url: string; row?: number; reason: string}[] = [];
  const routes: Record<string, {id: string; type: string; path: string; language: string}> = {};
  const mark = (r: Row, destination: string, status = 'mapped', note?: string) => coverage.set(r.row, {row: r.row, url: r.url, status, destination, ...(note ? {note} : {})});
  const use = (r: Row | undefined, destination: string) => {if (!r) return undefined; const text = approvedCopy(r); if (text === undefined) {mark(r, '', 'editorial-note', 'Not public copy; no missing result or quotation fabricated.'); return undefined;} mark(r, destination, /^\((unchanged|unverändert)/i.test(String(r.rewrite)) ? 'preserved' : 'mapped'); return text;};
  const stage = (id: string, type: string, fields: any) => changes.set(id, {id, type, fields: {...changes.get(id)?.fields, ...fields}});
  const doc = (id: string) => ({...canonical.get(id), ...changes.get(id)?.fields});
  const edition = (id: string, type: string, fields: any) => {
    const base = doc(id);
    stage(id, type, {channel: [...new Set([...(base.channel || []), CHANNEL])], siteContent: [...(base.siteContent || []).filter((s: any) => s.channel !== CHANNEL), {_type: type === 'caseStudy' ? 'caseWebsiteContent' : type === 'person' ? 'personWebsiteContent' : 'serviceWebsiteContent', _key: CHANNEL, channel: CHANNEL, ...fields}]});
  };
  const localized = (language: string, path: string) => `${language === 'en' ? '' : '/de'}${path}`;
  const addRoute = (url: string, id: string, type: string, path: string, language: string) => routes[url] = {id, type, path: localized(language, path), language};
  const metadata = (rs: Row[], id: string, field = 'metadata') => {
    const title = use(rs.find(r => /meta.?title/i.test(r.role)), `${id}.${field}.title`);
    const description = use(rs.find(r => /meta.?description/i.test(r.role)), `${id}.${field}.description`);
    for (const r of rs.filter(r => /^og_|open graph/i.test(r.role))) mark(r, `${id}.${field}`, 'mapped', 'Open Graph uses the same approved SEO fields.');
    return {_type: 'metadata', ...(title ? {title} : {}), ...(description && !/^\(/.test(description) ? {description} : {})};
  };
  const content = (rs: Row[], id: string, title?: string) => ({_type: 'contentSection', _key: key(rs.map(r => r.row).join(',')), ...(title ? {title} : {}), content: rs.flatMap(r => {const text = use(r, `${id}.content`); return text ? pt(text, /^(H3|H2)/.test(r.role) ? 'h3' : 'normal') : [];}), paddingY: '16'});
  const cta = (text: string, url: string, language: string, label?: string) => ({_type: 'intertitleCTA', _key: key(text), title: language === 'de' ? 'Sprich mit uns' : 'Let’s talk', subtitle: text, cta: {_type: 'cta', text: label || (language === 'de' ? 'Kontakt aufnehmen' : 'Get in touch'), link: {_type: 'link', linkType: 'external', externalUrl: url}}});
  const contact = (url: string, language: string) => legacy[url]?.links?.find((l: any) => /^mailto:/.test(l.url) && !/info@/.test(l.url))?.url || localized(language, '/contact');
  const imageFor = (url: string) => {const l = legacy[url]; return l?.heroImages?.[0] || (l?.image && !/ograph-msm/.test(l.image) ? l.image : (/\/people\//.test(url) ? l?.images?.[0] : undefined));};
  const hero = (rs: Row[], id: string, title: string, subtitle?: string, url?: string) => {
    const media = url ? imageFor(url) : undefined;
    const video = url ? legacy[url]?.videos?.[0] : undefined;
    return {_type: 'servicesHeroWithBadge', _key: 'hero', title, titleTag: 'h1', ...(subtitle ? {subtitle} : {}), showCta: false,
      ...(media ? {backgroundImage: {_type: 'cloudinaryImage', asset: asset(media)}} : {}),
      ...(video ? {useVideo: true, backgroundVideo: {_type: 'cloudinaryImage', asset: asset(video)}} : {})};
  };
  // Every genuine source campaign receives its own identity. Existing MSM cases are
  // relationship/programme overviews (Microsoft, One2Five) or different campaigns.
  for (const [url, rs] of pages.filter(([u]) => /\/project\//.test(u))) {
    const language = lang(rs[0]), short = urlPath(url).split('/').pop()!;
    const match = [...canonical.values()].find(d => d._type === 'caseStudy' && d.language === language && d.slug?.current === short);
    const id = match?._id || `case-msm-${short}-${language}`;
    addRoute(url, id, 'caseStudy', `/cases/${match?.slug?.current || short}`, language);
    if (!match) stage(id, 'caseStudy', {language, slug: {_type: 'slug', current: short}, channel: [CHANNEL], isPublished: true});
  }
  for (const [url, rs] of pages.filter(([u]) => /\/people\//.test(u))) {
    const language = lang(rs[0]), short = urlPath(url).split('/').pop()!;
    const identity = rs.find(r => /^(Name\/Title|name_titel)$/i.test(r.role))!;
    const name = String(identity.rewrite).split(/\s*[|–—]\s*/)[0];
    const normalized = (s: string) => slug(s.replace(/ue/g, 'u'));
    const match = [...canonical.values()].find(d => d._type === 'person' && d.language === language && normalized(d.name || '') === normalized(name));
    const id = match?._id || `person-msm-${short}-${language}`;
    addRoute(url, id, 'person', `/people/${short}`, language);
    const base = match || [...canonical.values()].find(d => d._type === 'person' && normalized(d.name || '') === normalized(name));
    if (!match) stage(id, 'person', {language, name, fullname: name, slug: {_type: 'slug', current: short}, position: base?.position || String(identity.rewrite).split(/\s*[|–—]\s*/).slice(1).join(' — '), ...(base?.email ? {email: base.email} : {}), channel: [CHANNEL]});
    mark(identity, `${id}.name`, match ? 'preserved' : 'mapped', 'Shared identity retained; editorial profile route is website-specific.');
    if (!doc(id).image && imageFor(url)) stage(id, 'person', {image: asset(imageFor(url)!), altText: name});
  }
  const caseLinks = (url: string, language: string) => {
    const links = [...new Set<string>((legacy[url]?.links || []).map((l: any) => l.url).filter((u: string) => /\/project\//.test(u)))];
    const ids: string[] = [];
    for (const link of links) {
      const target = routes[link] || Object.entries(routes).find(([u,r]) => r.type === 'caseStudy' && r.language === language && urlPath(u) === urlPath(link))?.[1];
      if (target) ids.push(target.id); else issues.push({url, reason: `Legacy related project has no matching rewritten ${language} page: ${link}`});
    }
    return refs(ids, 'caseStudy');
  };
  const serviceRoute = new Map<string,string>();
  for (const [url, rs] of pages.filter(([u]) => /\/service\//.test(u))) {
    const language = lang(rs[0]), short = urlPath(url).split('/').pop()!, id = `page-msm-service-${short}-${language}`;
    const serviceId = (language === 'en' ? servicesEN[short] : undefined) || `service-msm-${short}-${language}`;
    serviceRoute.set(`${language}:${short}`, serviceId);
    addRoute(url, id, 'page', `/services/${short}`, language);
    const title = rs[0].section.replace(/^Service:\s*/, '');
    if (!canonical.has(serviceId)) stage(serviceId, 'services', {language, name: title, channel: [CHANNEL]});
    const paragraphs = rs.filter(r => r.role === 'Paragraph').map(r => approvedCopy(r)).filter(Boolean).join('\n\n');
    edition(serviceId, 'services', {name: title, serviceDescription: paragraphs, mediaMode: 'custom', ...(imageFor(url) || legacy[url]?.videos?.[0] ? {serviceBackground: {_type: 'cloudinaryImage', asset: asset(legacy[url]?.videos?.[0] || imageFor(url))}} : {})});
  }
  for (const [url, rs] of pages.filter(([u]) => /\/project\//.test(u))) {
    const {id, language} = routes[url];
    const titleRow = rs.find(r => /^(headline|h1|h1\/headline)$/i.test(r.role));
    const title = use(titleRow, `${id}.siteContent[msmWeb].title`)!;
    const sub = use(rs.find(r => /^subline$/i.test(r.role)), `${id}.siteContent[msmWeb].subtitle`);
    const challenge = rs.find(r => /challenge|herausforderung/i.test(r.role));
    const solution = rs.find(r => /solution|lösung/i.test(r.role));
    const result = rs.find(r => /result|ergebnis/i.test(r.role) && r !== solution);
    const quoteRow = rs.find(r => /quote|testimonial|zitat/i.test(r.role));
    const blocks: any[] = [];
    const challengeText = use(challenge, `${id}.siteContent[msmWeb].casesPageBuilder.challenge.description`);
    const solutionText = use(solution, `${id}.siteContent[msmWeb].casesPageBuilder.challenge.solution`);
    if (challengeText || solutionText) blocks.push({_type: 'challengeAndSolution', _key: 'challenge-solution', title: language === 'de' ? 'Die Herausforderung' : 'The challenge', description: challengeText || '', showContent: false, showCta: false, showSolution: Boolean(solutionText), solutionHeadline: language === 'de' ? 'Unsere Lösung' : 'Our solution', solution: pt(solutionText || '')});
    const resultText = use(result, `${id}.siteContent[msmWeb].casesPageBuilder.results.description`);
    const quoteText = use(quoteRow, `${id}.siteContent[msmWeb].casesPageBuilder.results.quote`);
    let quote: any;
    if (quoteText) {
      const parts = quoteText.match(/^([\s\S]+?)[”"“]\s*[—–-]\s*([\s\S]+)$/) || quoteText.match(/^([\s\S]+)\s+[—–]\s+([^—–]+)$/);
      if (parts) quote = {text: parts[1].replace(/^[“„"]/, ''), attribution: parts[2]};
      else if (legacy[url]?.quoteAttribution) quote = {text: quoteText, attribution: legacy[url].quoteAttribution};
      else {issues.push({url, row: quoteRow!.row, reason: 'Quote withheld pending named attribution.'}); mark(quoteRow!, '', 'dependency', 'Missing named quote attribution.');}
    }
    const specs = metricSpecs[translationPath(url).split('/').pop()!] || [];
    const numbersInCopy = `${challengeText || ''} ${solutionText || ''} ${resultText || ''} ${quoteText || ''}`;
    const metrics = specs.flatMap(([value, en, de, qualifier], index) => {
      // Match numeric spelling before exposing a count-up metric in this language.
      const forms = [String(value), value.toLocaleString(language), value >= 1e6 ? (value / 1e6).toLocaleString(language) : '____'];
      if (!forms.some(f => numbersInCopy.includes(f))) return [];
      return [{_type: 'metric', _key: `metric-${index}`, type: 'animatedNumber', value, label: language === 'de' ? de : en, qualifier: qualifier || 'exact', animationMode: 'countUp', displayScale: value >= 1e6 ? 'million' : 'none', decimalPlaces: (value >= 1e6 ? value / 1e6 : value) % 1 ? 1 : 0, ...(/rate|comments|Lower|increase|growth/.test(en) ? {suffix: '%'} : en.includes('multiplier') ? {suffix: '×'} : {}), description: ''}];
    });
    if (resultText || quote || metrics.length) blocks.push({_type: 'resultsMetrics', _key: 'results', title: language === 'de' ? 'Ergebnisse' : 'Results', ...(resultText ? {description: resultText} : {}), ...(quote ? {quote} : {}), metrics, paddingY: '24'});
    for(const r of rs.filter(r=>r.role==='Zwischenüberschrift')){const results=blocks.find(b=>b._type==='resultsMetrics');if(results)results.title=use(r,`${id}.siteContent[msmWeb].casesPageBuilder.results.title`);}
    for(const r of rs.filter(r=>r.role.includes('Social Wall'))){mark(r,'','dependency','Legacy social-wall embed requires a supported provider and consent integration.');issues.push({url,row:r.row,reason:'Social-wall embed retained in source inventory; no unsupported third-party script injected.'});}
    const end = rs.find(r => /^cta$/i.test(r.role));
    if (end) {const text = use(end, `${id}.siteContent[msmWeb].casesPageBuilder.contact.subtitle`); if (text) blocks.push(cta(text, contact(url, language), language));}
    const media = imageFor(url);
    const categoryService: Record<string,string> = {'ar-vr':'augmented-and-virtual-reality','print-enrichment':'couplar','review-management-hub':language==='de'?'review-plattform':'review-platform','skreeens-digital-signage':'digital-signage','training-elearnings':'training','content-creation':language==='de'?'content-kreation':'content-creation','cashback-solutions':language==='de'?'cashback-services':'cashback-solutions'};
    const categories = [...new Set<string>(Object.values(legacy).flatMap((page:any)=>(page.projectCards||[]).filter((card:any)=>card.url===url).flatMap((card:any)=>card.categories)))];
    const services = refs(categories.flatMap(category=>{const name=slug(category);const id=serviceRoute.get(`${language}:${categoryService[name]||name}`);return id?[id]:[];}), 'services');
    const clientName=legacy[url]?.text?.match(/Client:\s*\n([^\n]+)/)?.[1]?.trim();
    let clientId: string | undefined;
    if(clientName && !/^(various|tech company)$/i.test(clientName)){
      const normalize=(s:string)=>slug(s).replace(/^ea$/,'electronic-arts').replace(/^warner$/,'warner-bros').replace(/^obi$/,'obi');
      const existing=[...canonical.values(),...[...changes.values()].filter(c=>c.type==='client').map(c=>({...c.fields,_id:c.id,_type:c.type}))].find(d=>d._type==='client'&&d.language===language&&normalize(d.name||'')===normalize(clientName));
      clientId=existing?._id||`client-msm-${slug(clientName)}-${language}`;
      stage(clientId!,'client',{...(!existing?{language,name:clientName,slug:{_type:'slug',current:slug(clientName)}}:{}),channel:[...new Set([...(existing?.channel||[]),CHANNEL])]});
    }
    if (!canonical.has(id)) stage(id, 'caseStudy', {title, ...(clientId ? {client:ref(clientId,'client')} : {}), ...(sub ? {subtitle: sub} : {}), ...(media ? {mainImage: asset(media)} : {}), ...(legacy[url]?.videos?.[0] ? {mainVideo:asset(legacy[url].videos[0])} : {}), services});
    // New MSM-only campaigns use shared base fields; editions remain available for
    // future channel differences. Avoid duplicating the same full body in an edition.
    const seo = metadata(rs, id, canonical.has(id) ? 'siteContent[msmWeb].seo' : 'seo');
    if (!canonical.has(id)) {
      stage(id, 'caseStudy', {seo: {title:seo.title,description:seo.description}, casesPageBuilder: blocks});
      for (const r of rs) {const mapping = coverage.get(r.row); if (mapping) mapping.destination = mapping.destination.replace(`${id}.siteContent[msmWeb].`, `${id}.`);}
    }
    else edition(id, 'caseStudy', {title, ...(sub ? {subtitle: sub} : {hideSubtitle: true}), hideDescription: true, seo, mediaMode: 'inherit', bodyMode: 'custom', casesPageBuilder: blocks});
  }
  for (const [url, rs] of pages.filter(([u]) => /\/people\//.test(u))) {
    const {id, language, path} = routes[url];
    const profile: any = {slug: {_type: 'slug', current: path.split('/').pop()}, seo: metadata(rs,id,'siteContent[msmWeb].seo')};
    for (const r of rs) {
      if (/^(Quote|zitat)$/i.test(r.role)) profile.quote = use(r, `${id}.siteContent[msmWeb].quote`);
      else if (/^(Bio - I Do|i_do)$/i.test(r.role)) profile.iDo = use(r, `${id}.siteContent[msmWeb].iDo`);
      else if (/^(Bio - Ask Me|ask_me)$/i.test(r.role)) profile.askMe = use(r, `${id}.siteContent[msmWeb].askMe`);
      else if (/^(bio|Bio Paragraph|bio_absatz_\d)$/i.test(r.role)) profile.biography = [profile.biography, use(r, `${id}.siteContent[msmWeb].biography`)].filter(Boolean).join('\n\n');
      else if (/Selected Cases|projects_cta/i.test(r.role)) {profile.selectedCases = caseLinks(url,language); mark(r, `${id}.siteContent[msmWeb].selectedCases`, 'resolved-reference', 'Exact project links recovered from the source page.');}
      else if (/CTA - Contact|^kontakt$/i.test(r.role)) {const email = contact(url,language); if (!doc(id).email && email.startsWith('mailto:')) stage(id,'person',{email:email.slice(7)});const phone=String(approvedCopy(r)||'').match(/\+[\d ()-]+/)?.[0]?.trim();if(phone)profile.phone=`tel:${phone}`; mark(r, `${id}.siteContent[msmWeb].phone + shared email`, 'preserved', 'Approved phone retained; existing shared email preserved.');}
    }
    edition(id,'person',profile);
  }
  for (const [url, rs] of pages.filter(([u]) => /\/service\//.test(u))) {
    const {id,language} = routes[url], short = urlPath(url).split('/').pop()!;
    const serviceId = serviceRoute.get(`${language}:${short}`)!;
    const h = rs.find(r => /^h1/i.test(r.role))!;
    const hText = use(h, `${id}.content[hero].title`) || doc(serviceId).name;
    const parts = hText.split(' / '), title = parts[0], subRow = rs.find(r => /^(subline|sub-headline)$/i.test(r.role));
    const subtitle = parts.slice(1).join(' / ') || use(subRow,`${id}.content[hero].subtitle`);
    const blocks: any[] = [hero(rs,id,title,subtitle,url)];
    let prose: Row[] = [];
    const flush = () => {if (prose.length) {blocks.push(content(prose,id)); prose=[];}};
    for (const r of rs) {
      if (coverage.has(r.row) || /meta|og_/i.test(r.role)) continue;
      if (/Business Unit/i.test(r.role)) {blocks[0].badgeText = use(r,`${id}.content[hero].badgeText`); continue;}
      if (/case reference|case-referenz/i.test(r.role)) {flush(); const selectedCases = caseLinks(url,language); if (selectedCases.length) blocks.push({_type:'casesGalleryFiltered',_key:`cases-${r.row}`,selectionMode:'manual',selectedCases,showFilters:false}); mark(r,`${id}.content.casesGalleryFiltered`,'resolved-reference'); continue;}
      if (/cta/i.test(r.role)) {
        flush(); const text = approvedCopy(r); if (!text) {use(r,'');continue;}
        let target = contact(url,language), label: string | undefined;
        if (/report|Forrester/i.test(text)) {issues.push({url,row:r.row,reason:'The legacy report uses its own gated download form. Retaining a link to that form; no report delivery is promised by the MSM contact form.'}); target=url+'#wpcf7-f2760-p2743-o1';label=language==='de'?'Zum Report':'Get the report';}
        else if (/pdf|LinkedIn/i.test(text)) {target=legacy[url]?.links?.find((l:any)=>/linkedin.*(feed|posts|pulse|smart-links)|\.pdf/i.test(l.url))?.url;}
        else if (/Visit Hashtag|hashtaglove\.de/i.test(text)) {target='https://www.hashtaglove.de';label=text;}
        if (target) {blocks.push(cta(use(r,`${id}.content.cta.subtitle`)!,target,language,label));} else {issues.push({url,row:r.row,reason:'Missing verified download destination.'});mark(r,'','dependency');}
        continue;
      }
      if (r.role==='Stat block') {flush();const text=use(r,`${id}.content.resultsMetrics`)!;const n=text.match(/^(\d+)%\s*(.+)$/);if(n){let group=blocks.find(b=>b._key==='research-metrics');if(!group){group={_type:'resultsMetrics',_key:'research-metrics',title:language==='de'?'Mixed Reality im Training':'Mixed reality training',metrics:[]};blocks.push(group);}group.metrics.push({_type:'metric',_key:`metric-${r.row}`,type:'animatedNumber',value:Number(n[1]),suffix:'%',label:n[2]});}continue;}
      prose.push(r);
    }
    flush();
    stage(id,'page',{language,channel:CHANNEL,title:rs[0].section.replace(/^Service:\s*/,''),slug:{_type:'slug',current:`services/${short}`},msmPageKind:'service',services:refs([serviceId],'services'),isHomepage:false,navbarVariant:'light',metadata:metadata(rs,id),content:blocks});
  }
  // Unit-owned attribution: relationships never synchronize back onto shared cases.
  for (const [url, rs] of pages.filter(([u]) => /\/business-units\/.+/.test(urlPath(u)))) {
    const language=lang(rs[0]), short=urlPath(url).split('/').pop()!.replace('ar-vr-labs','xr-labs').replace('technologysystems','technology-systems'),id=`msm-unit-${short}-${language}`;
    const base=doc(id),fallback=doc(`msm-unit-${short}-en`);
    const h=rs.find(r=>r.role==='H1')!, name=use(h,`${id}.name`)!;
    const first=rs.find(r=>r.role==='Subline') || rs.find(r=>r.role==='Paragraph');
    const fields:any={language,name,slug:{_type:'slug',current:short},claim:use(first,`${id}.claim`),metadata:metadata(rs,id),isActive:true,sortOrder:fallback.sortOrder??0,heroAlt:name,capabilities:[]};
    const image=imageFor(url);if(image && !base.heroMedia)fields.image=asset(image);
    let additional=false;const body:Row[]=[],extra:Row[]=[];
    for(const r of rs){
      if(coverage.has(r.row))continue;
      if(/Kicker|Eyebrow/i.test(r.role)){fields.descriptor=use(r,`${id}.descriptor`);continue;}
      if(r.role==='H3'){additional=true;extra.push(r);continue;}
      if(r.role==='H2'){const text=approvedCopy(r)||'';if(/project|projekt/i.test(text)){fields.casesHeading=use(r,`${id}.casesHeading`);additional=false;}else fields.leadershipHeading=use(r,`${id}.leadershipHeading`);continue;}
      if(r.role==='Paragraph' || r.role==='Subline'){(additional?extra:body).push(r);continue;}
      if(r.role==='CTA'){fields.contactCta=cta(use(r,`${id}.content[contact].subtitle`)!,localized(language,'/contact'),language);continue;}
      if(/list|testimonial/i.test(r.role)){mark(r,`${id}.relationships`,'resolved-reference','Recovered exact campaign and person URLs from the source page.');continue;}
    }
    fields.body=body.flatMap(r=>pt(use(r,`${id}.body`)!));
    if(!fields.body.length && fields.claim)fields.body=pt(fields.claim);
    fields.content=[...(extra.length?[content(extra,id)]:[]),...(fields.contactCta?[fields.contactCta]:[])];delete fields.contactCta;
    fields.caseStudies=caseLinks(url,language);
    const leadershipSlugs: Record<string,string[]> = {'communications':['kirsten-huecker','nikolas-angerstein','nils-kedeinis','timo-studt'],'channel-marketing':['lennart-scheel','sven-weber','tobias-schn','maic-ungermann'],'technology-systems':['lennart-scheel']};
    const people=(leadershipSlugs[short]||[]).flatMap(n=>{const r=routes[`https://www.msm.digital/${language==='de'?'de/':''}people/${n}/`];return r?[r.id]:[];});
    if(short==='xr-labs'){
      const camillo=[...canonical.values()].find(d=>d._type==='person'&&d.name==='Camillo Stark'&&d.language===language);
      if(camillo){people.push(camillo._id);if(!camillo.image&&legacy[url]?.images?.[1])stage(camillo._id,'person',{image:asset(legacy[url].images[1]),altText:camillo.name});}else{const en=[...canonical.values()].find(d=>d._type==='person'&&d.name==='Camillo Stark');if(en){const cid='person-msm-camillo-stark-de';stage(cid,'person',{language:'de',name:en.name,fullname:en.fullname||en.name,slug:{_type:'slug',current:'camillo-stark'},position:en.position,email:en.email,channel:[CHANNEL],...(doc(en._id).image?{image:doc(en._id).image}:{})});people.push(cid);}}
    }
    fields.leadership=[...new Set(people)].map((pid,i)=>{
      const person=doc(pid);const original=legacy[url]?.leaders?.find((l:any)=>l.email===person.email || routes[l.profile]?.id===pid);
      const rewritten=rs.find(r=>r.role==='Testimonial' && String(r.rewrite).startsWith((person.name||'').split(' ')[0]+' — '));
      const parts=rewritten?approvedCopy(rewritten)?.split(' — '):undefined;
      return {_type:'msmUnitLeader',_key:key(pid),person:ref(pid,'person'),isPrimary:i===0,
        ...(parts?.[1]||original?.position?{position:parts?.[1]||original.position}:{}),
        ...(parts?.[2]||original?.quote?{quote:(parts?.[2]||original.quote).replace(/^['“]|['”]$/g,'')}:{}),
        ...(original?.phone?{phone:original.phone}:{}),};
    });
    stage(id,'msmUnit',fields);addRoute(url,id,'msmUnit',`/units/${short}`,language);
  }
  // Directories use their own context copy; detail claims are not recycled as teasers.
  for(const [url,rs] of pages.filter(([u])=>/\/(business-units|services-products)$/.test(urlPath(u)))){
    const language=lang(rs[0]),units=urlPath(url).endsWith('business-units'),id=`msm-page-${units?'units':'services'}-${language}`;
    let blocks:any[];
    if(units){const h=rs.find(r=>r.role==='H1')!,intro=rs.find(r=>r.role==='Paragraph'),eyebrow=rs.find(r=>/Eyebrow|Kicker/.test(r.role));
      const teasers=rs.filter(r=>r.role==='List Item').map((r,i)=>{const t=use(r,`${id}.content[units].items`)!;const parts=t.split(' — ');const unit=['communications','channel-marketing','xr-labs','technology-systems'][i];return{_type:'msmUnitTeaser',_key:unit,reference:ref(`msm-unit-${unit}-${language}`,'msmUnit'),text:parts[1]||t,...(parts[2]?{linkLabel:parts[2]}:{})};});
      blocks=[{_type:'msmUnitsGrid',_key:'units',headline:use(h,`${id}.content[units].headline`),intro:use(intro,`${id}.content[units].intro`)||'',eyebrow:use(eyebrow,`${id}.content[units].eyebrow`)||'',selectionMode:'auto',items:teasers}];
    }else{
      const h=rs.find(r=>/H1/.test(r.role))!,text=use(h,`${id}.content[hero].title`)!;const parts=text.split(' / ');
      blocks=[hero(rs,id,parts.at(-1)!,undefined),content(rs.filter(r=>r.role==='Paragraph'),id)];if(parts.length>1)blocks[0].badgeText=parts[0];
      const list=rs.filter(r=>/List Item/.test(r.role)),targets=pages.filter(([u,r])=>/\/service\//.test(u)&&lang(r[0])===language);
      const items=list.map((r,i)=>{const target=targets.find(([,tr])=>slug(tr[0].section.replace(/^Service:\s*/,''))===slug(String(r.rewrite).split(' — ')[0])) || targets.find(([u])=>urlPath(u).split('/').pop()?.replace('review-plattform','review-platform').replace('content-kreation','content-creation').replace('cashback-services','cashback-solutions')===['social-media','pr','influencer-marketing','pos-marketing','review-platform','augmented-and-virtual-reality','couplar','ar-link','digital-signage','training','development','experiential-marketing','strategy','content-creation','cashback-solutions','mixed-reality-in-manufacturing','hashtaglove'][i]);if(!target){mark(r,'','dependency');return null;}const copy=use(r,`${id}.content.directory.items`)!;const parts=copy.split(' — ');const linkLabel=parts.pop();const text=language==='en'?parts.slice(1).join(' — '):parts.join(' — ');return{_type:'msmServiceEntry',_key:`service-${r.row}`,reference:ref(routes[target[0]].id,'page'),text,linkLabel};}).filter(Boolean);
      // The workbook's listing omits HashtagLove in DE; keep the detail route available without inventing a teaser.
      blocks.push({_type:'msmServiceDirectory',_key:'directory',items});for(const r of rs.filter(r=>r.role==='CTA'))mark(r,`${id}.content.directory.items.linkLabel`,'mapped','Destination-specific links use the existing localized component label.');
    }
    for(const r of rs.filter(r=>r.role==='Hero/Kicker'))blocks[0].badgeText=use(r,`${id}.content.hero.badgeText`);
    for(const r of rs.filter(r=>r.role==='CTA tile'))blocks.push(cta(use(r,`${id}.content.godigital.cta`)!.replace(/ \(landing page, not a service\)$/, ''),'https://www.msm.digital/go-digital/',language));
    stage(id,'page',{language,channel:CHANNEL,title:units?(language==='de'?'Units':'Units'):'Services',slug:{_type:'slug',current:units?'units':'services'},isHomepage:false,navbarVariant:'light',metadata:metadata(rs,id),content:blocks});addRoute(url,id,'page',units?'/units':'/services',language);
  }
  // Homepage: explicit per-language composition; preserve the current MSM hero media.
  for(const [url,rs] of pages.filter(([u])=>urlPath(u)==='')){
    const language=lang(rs[0]),id=`msm-page-home-${language}`,en=language==='en',by=(n:number)=>rows.find(r=>r.row===n)!;
    const base=doc('msm-page-home-en').content?.find((b:any)=>b._type==='oneSPHeader')||{};
    const blocks:any[]=[{...base,_type:'oneSPHeader',_key:'hero',headlineMode:'headlineReveal',headline:use(by(en?5:956),`${id}.content.hero.headline`),eyebrow:en?use(by(4),`${id}.content.hero.eyebrow`):'',paragraphs:pt(use(by(en?6:957),`${id}.content.hero.paragraphs`)!),mobileParagraphs:[],rotatingText:[],cta:{_type:'cta',text:use(by(en?7:959),`${id}.content.hero.cta.text`),link:{_type:'link',linkType:'external',externalUrl:localized(language,'/units')}}}];
    if(!en){blocks[0].paragraphs.push(...pt(use(by(958),`${id}.content.hero.paragraphs`)!));mark(by(960),'site shell network membership','preserved');}
    const headline=use(by(en?15:964),`${id}.content.proof.title`)!;
    blocks.push({_type:'casesIntro',_key:'proof',showHamburgerMenu:false,title:headline,subtitle:en?use(by(14),`${id}.content.proof.subtitle`):use(by(965),`${id}.content.proof.subtitle`)});
    const homeCases=caseLinks(url,language);blocks.push({_type:'casesGalleryFiltered',_key:'proof-cases',selectionMode:'manual',selectedCases:homeCases,showFilters:false});mark(by(en?18:966),`${id}.content.proof-cases`,'resolved-reference','Exact original campaign URLs, not the spreadsheet layout recommendation.');
    const hashTitle=use(by(en?8:961),`${id}.content.hashtaglove.title`)!;blocks.push(content([by(en?9:962)],id,hashTitle));blocks.push(cta(use(by(en?10:963),`${id}.content.hashtaglove.cta`)!,localized(language,'/services/hashtaglove'),language,use(by(en?10:963),`${id}.content.hashtaglove.cta`)));
    if(en){blocks.push(content([by(12)],id,use(by(11),`${id}.content.godigital.title`)));const target=legacy[url]?.links?.find((l:any)=>/godigital|go-digital/.test(l.url))?.url || 'https://www.msm.digital/#godigitalnow';issues.push({url,row:13,reason:`Legacy #godigitalnow destination retained for review: ${target}`});blocks.push(cta(use(by(13),`${id}.content.godigital.cta`)!,target,language,use(by(13),`${id}.content.godigital.cta`)));}
    const unitTeasers=en?use(by(16),`${id}.content.units.items`)!.split(' | ').map((t,i)=>{const unit=['xr-labs','channel-marketing','technology-systems','communications'][i];return{_type:'msmUnitTeaser',_key:unit,reference:ref(`msm-unit-${unit}-${language}`,'msmUnit'),text:t.split(' — ').slice(1).join(' — ')};}):[];
    blocks.push({_type:'msmUnitsGrid',_key:'units',embedded:true,headline:en?'Our four units':'Unsere vier Units',selectionMode:'auto',items:unitTeasers});
    if(en){const names=['sven-weber','nils-kedeinis','maic-ungermann','nathalia-t','lennart-scheel','tobias-schn','nikolas-angerstein'];const teamMembers=refs(names.map(n=>routes[`https://www.msm.digital/people/${n}/`].id),'person');blocks.push({_type:'galleryPeopleStep',_key:'people',header:{_type:'peopleStepHeader',mainHeadline:'We are MSM.digital'},showBadgeMiniCta:false,teamMembers});mark(by(17),`${id}.content.galleryPeopleStep`,'preserved','Seven named staff quotations resolve through the MSM person editions.');}
    const founderTitle=use(by(en?19:969),`${id}.content.founders.title`)!;blocks.push(content(en?[by(20),by(21)]:[by(967),by(968),by(970)],id,founderTitle));blocks.push(cta(use(by(en?22:971),`${id}.content.founders.cta`)!,`https://www.msm.digital/${en?'':'de/'}founders-keepers/`,language,use(by(en?22:971),`${id}.content.founders.cta`)));
    stage(id,'page',{language,channel:CHANNEL,title:'Home',slug:{_type:'slug',current:'homepage'},isHomepage:true,navbarVariant:'light',metadata:metadata(rs,id),content:blocks});addRoute(url,id,'page','/',language);
  }
  // Contact details are recovered as actual links. No form submissions are sent.
  for(const [url,rs] of pages.filter(([u])=>/\/contact$/.test(urlPath(u)))){
    const language=lang(rs[0]),id=`msm-page-contact-${language}`;
    const headline=use(rs.find(r=>r.role==='H1'),`${id}.contactForm.headline`),sub=use(rs.find(r=>/Subheading|Paragraph/.test(r.role)),`${id}.contactForm.subheadline`);
    const links=[...new Map((legacy[url]?.links||[]).filter((l:any)=>/^(mailto:|tel:)|wa.me|m.me|facebook.com|instagram.com|linkedin.com/i.test(l.url)).map((l:any)=>[l.url,l])).values()] as any[];
    const linkContent=links.map((l,i)=>({_type:'block',_key:`contact-${i}`,style:'normal',markDefs:[{_type:'link',_key:'link',href:l.url.replace(/^tel:\s*/,'tel:')}],children:[{_type:'span',_key:'text',text:l.text && !/icon|Mail|Phone/.test(l.text)?l.text:l.url.replace(/^mailto:|^tel:\s*/g,''),marks:['link']}]}));
    const social=(url:string)=>/facebook.com|instagram.com|linkedin.com/i.test(url);
    const blocks:any[]=[{_type:'contentSection',_key:'contact-links',content:linkContent.filter((_,i)=>!social(links[i].url))},{_type:'contentSection',_key:'social-links',content:[]}];
    for(const r of rs.filter(r=>!coverage.has(r.row)&&!/^meta/i.test(r.role))) {
      if(r.role==='H2')blocks[1].title=use(r,`${id}.content.social-links.title`);
      else if(/^\((unchanged|unverändert)/i.test(String(r.rewrite)))mark(r,`${id}.content.contact-links`,'preserved','Source contact URLs retained as functional links.');
      else {const target=/Subheading|Subline/.test(r.role)||r.row===1055?blocks[1]:blocks[0];target.content.push(...pt(use(r,`${id}.content[${target._key}].content`)!));}
    }
    blocks[1].content.push(...linkContent.filter((_,i)=>social(links[i].url)));
    stage(id,'page',{language,channel:CHANNEL,title:headline,slug:{_type:'slug',current:'contact'},isHomepage:false,navbarVariant:'light',metadata:metadata(rs,id),contactForm:{...doc(id).contactForm,headline,subheadline:sub},content:blocks});addRoute(url,id,'page','/contact',language);
  }
  // Restore the complete original legal body, not the workbook's abbreviated extracts.
  for(const [url,rs] of pages.filter(([u])=>/\/(disclaimer|privacy-policy|impressum|datenschutz)$/.test(urlPath(u)))){
    const language=lang(rs[0]),short=urlPath(url).split('/').pop()!,id=`page-msm-${short}-${language}`;
    const legalBlocks=legacy[url]?.legalBlocks;
    assert(legalBlocks?.length>5,`Missing complete original legal body: ${url}`);
    const h=rs.find(r=>r.role==='H1')!; const title=use(h,`${id}.content.hero.title`)!;
    const meta=metadata(rs,id);
    for(const r of rs.filter(r=>!coverage.has(r.row)))mark(r,`${id}.content.legal`,'preserved','Complete original legal body recovered; workbook legal-review notes remain review items.');
    stage(id,'page',{language,channel:CHANNEL,title,slug:{_type:'slug',current:short},isHomepage:false,navbarVariant:'light',metadata:meta,content:[hero(rs,id,title),{_type:'contentSection',_key:'legal',content:legalBlocks}]});
    addRoute(url,id,'page',`/${short}`,language);
    issues.push({url,reason:'Legal body preserved from original in draft; workbook legal review comments still require client review before publication.'});
  }
  // Keep the case hub's supported copy, remove only invisible orphan block types.
  for(const language of ['en','de']){const id=`msm-page-cases-${language}`,base=doc(id);const blocks=(base.content||[]).filter((b:any)=>['servicesHeroWithBadge','casesIntro','casesGalleryFiltered'].includes(b._type));if(!blocks.length)blocks.push(hero([],id,language==='de'?'Unsere Projekte':'Our projects'),{_type:'casesGalleryFiltered',_key:'cases',selectionMode:'auto'});stage(id,'page',{content:blocks});}
  // Pair translations only by identical source campaign/profile/service paths.
  const pairs=new Map<string,typeof routes[string][]>();
  for(const [url,r] of Object.entries(routes)){const k=`${r.type}:${translationPath(url)}`;pairs.set(k,[...(pairs.get(k)||[]),r]);}
  for(const [path,items] of pairs)if(items.length===2&&items[0].language!==items[1].language){
    const already=all.find(d=>d._type==='translation.metadata'&&d.translations?.some((t:any)=>items.some(i=>i.id===t.value?._ref)));
    if(!already)stage(`translation-msm-${key(path)}`,'translation.metadata',{schemaTypes:[items[0].type],translations:items.map(i=>({_key:i.language,_type:'internationalizedArrayReferenceValue',value:ref(i.id,i.type)}))});
  }
  for(const r of rows)if(!coverage.has(r.row)&&instructionRows.has(r.row))use(r,'');
  for(const r of rows)if(!coverage.has(r.row)){mark(r,'','dependency','Source role requires an explicit reviewed destination.');issues.push({url:r.url,row:r.row,reason:`Unmapped source role: ${r.role}`});}
  // Only unpublished targets need Sanity's temporary weak-reference markers.
  const published = new Set(all.filter(d => !d._id.startsWith('drafts.')).map(d => d._id));
  const normalizeRefs = (value: any, translation: boolean) => {
    if (!value || typeof value !== 'object') return;
    if (typeof value.channel === 'string' && value.channel !== CHANNEL) return;
    if (value._ref && published.has(value._ref) && !translation) {delete value._weak; delete value._strengthenOnPublish;}
    if (value._ref && translation) {value._weak = true; delete value._strengthenOnPublish;}
    Object.values(value).forEach(item => normalizeRefs(item, translation));
  };
  for(const c of changes.values()) {
    assert(['page','msmUnit','caseStudy','person','services','client','translation.metadata'].includes(c.type));
    // Clone before normalization to avoid mutating shared baseline objects.
    c.fields = JSON.parse(JSON.stringify(c.fields)); normalizeRefs(c.fields, c.type === 'translation.metadata');
  }
  return {changes:[...changes.values()],coverage:[...coverage.values()].sort((a,b)=>a.row-b.row),issues,routes};
}
