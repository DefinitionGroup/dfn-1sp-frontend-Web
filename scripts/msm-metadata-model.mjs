import {createHash} from 'node:crypto';

const brandImage = {_type: 'cloudinaryImage', alt: 'MSM.digital', asset: {_type: 'cloudinary.asset', resource_type: 'video', format: 'jpg', public_id: 'MSM_VIDEO_WIP_ndnprm', secure_url: 'https://res.cloudinary.com/dsu07dnes/video/upload/so_0,w_1200,h_630,c_fill,g_auto/v1788796799/MSM_VIDEO_WIP_ndnprm.jpg'}};
const nonempty = value => typeof value === 'string' && Boolean(value.trim());
const urlOf = value => typeof value === 'string' ? value : value?.asset?.secure_url || value?.secure_url || value?.url;
const validImage = value => /^https:\/\//.test(urlOf(value) || '');
const imageFrom = value => {
  if (!validImage(value)) return undefined;
  if (value?._type === 'cloudinaryImage') return structuredClone(value);
  const source = typeof value === 'string' ? {secure_url: value} : value.asset || value;
  const keys = ['public_id', 'secure_url', 'url', 'resource_type', 'format', 'width', 'height', 'version'];
  return {_type: 'cloudinaryImage', asset: {_type: 'cloudinary.asset', ...Object.fromEntries(keys.filter(key => source[key] !== undefined).map(key => [key, source[key]]))}};
};

const missingCaseCopy = {
  '47689e31-72d4-47d1-9b9f-1b09e8341062': ['Microsoft Retail & Brand Marketing | MSM.digital', 'Explore how MSM.digital, Insight, Fijak and Studio CO2 have shaped Microsoft retail displays, roadshows and brand experiences across Europe for 20 years.'],
  '6db20faa-82dc-4a1f-b608-55668e59b0dc': ['XR Community Event in Berlin | MSM.digital', 'Explore a hybrid XR event in Berlin connecting developers, enterprise decision-makers and spatial computing platforms, delivered by MSM.digital.'],
  '9fd3bef9-55d3-4235-8ea8-43b2e45e888b': ['One2Five Customer Review Campaigns | MSM.digital', 'Discover how One2Five by MSM.digital uses authentic customer reviews to support trust, product registration and sales for household brands.'],
  'aa740986-0fc9-4b83-9ef1-54ed9745041b': ['Lufthansa Mixed Reality Inflight Experience | MSM.digital', 'Explore the Lufthansa mixed reality inflight experience: innovative hardware integration and passenger-focused entertainment, developed with MSM.digital.'],
  'eab0c781-b4f0-4a6d-bf39-6a56901cbfb7': ['Fallout on Prime Video Launch Campaign | MSM.digital', 'Explore MSM.digital’s Fallout on Prime Video launch campaign, combining PR, creator engagement and an immersive live event.'],
  'efdcac3c-ac8d-4b51-86a0-72bd0ffc2c33': ['CUPRA Mixed Reality Dealership Experience | MSM.digital', 'Discover how MSM.digital helped CUPRA present an electric vehicle in mixed reality and support dealership engagement and presales across Europe.'],
};

export function buildMsmMetadataContentPlan(documents, translations = []) {
  const published = documents.filter(doc => !doc._id.startsWith('drafts.'));
  const changes = [], coverage = [];
  for (const doc of published) {
    const kind = doc._type;
    const isShared = ['caseStudy', 'person'].includes(kind);
    const edition = doc.siteContent?.find(item => item.channel === 'msmWeb');
    if (kind === 'caseStudy' && doc.isPublished !== true) continue;
    if (kind === 'person' && !edition?.slug?.current) continue;
    if (kind === 'msmUnit' && doc.isActive === false) continue;
    const original = isShared ? edition?.seo || {} : doc.metadata || {};
    const seo = {...original};
    if (!isShared || kind === 'person') seo._type ||= 'metadata';
    const copy = missingCaseCopy[doc._id];
    const title = edition?.title || doc.title || doc.fullname || doc.name;
    if (!nonempty(seo.title)) seo.title = copy?.[0] || (kind === 'caseStudy' && nonempty(doc.seo?.title) ? doc.seo.title : /MSM(?:\.digital)?/i.test(title) ? title : `${title} | MSM.digital`);
    if (!nonempty(seo.description)) {
      seo.description = copy?.[1] || edition?.description || doc.seo?.description || doc.description || doc.claim;
      if (kind === 'person') seo.description = doc.language === 'de'
        ? `${doc.fullname || doc.name} bei MSM.digital: ${doc.position}. Entdecke das Profil und ausgewählte Projekte und nimm direkt Kontakt auf.`
        : `${doc.fullname || doc.name} at MSM.digital: ${doc.position}. Explore the profile and selected projects, and get in touch.`;
    }
    if (!nonempty(seo.title) || !nonempty(seo.description)) throw new Error(`Missing source copy for ${doc._id}`);
    let source, reason;
    if (validImage(original.openGraphImage)) {source = original.openGraphImage; reason = 'authored social image';}
    else if (validImage(original.image)) {source = original.image; reason = 'authored meta image';}
    else if (kind === 'caseStudy') {
      const custom = edition?.mediaMode === 'custom';
      source = [custom ? edition.mainImage : doc.mainImage, custom ? edition.mainVideo : doc.mainVideo].find(validImage);
      reason = source ? 'case hero / video still' : undefined;
    } else if (kind === 'person') {source = edition?.image || doc.image; reason = 'profile portrait';}
    else if (kind === 'msmUnit') {source = [doc.image, doc.heroMedia, doc.heroImageSource].find(validImage); reason = 'unit hero';}
    else {
      const hero = doc.content?.find(block => ['oneSPHeader', 'servicesHeroWithBadge'].includes(block._type));
      source = hero && [hero.backgroundImage, hero.image, hero.media, hero.backgroundVideo, hero.video].find(validImage);
      reason = source ? 'page hero' : undefined;
      if (!source) {
        const group = translations.find(group => group.translations?.some(ref => ref.value?._ref === doc._id));
        const counterpart = published.find(other => other._id !== doc._id && group?.translations?.some(ref => ref.value?._ref === other._id));
        source = counterpart?.metadata?.openGraphImage;
        if (validImage(source)) reason = 'verified translation sharing image';
      }
    }
    const image = imageFrom(source) || structuredClone(brandImage);
    if (!reason || !validImage(source)) reason = 'intentional MSM brand image for directory / contact / legal page';
    const alt = source?.alt || (kind === 'person' ? doc.altText : kind === 'msmUnit' ? doc.heroAlt : undefined);
    if (nonempty(alt) && !image.alt) image.alt = alt;
    // Keep authored overrides intact; empty social fields inherit final search copy.
    if (!validImage(seo.image)) seo.image = image;
    if (!nonempty(seo.openGraphTitle)) seo.openGraphTitle = seo.title;
    if (!nonempty(seo.openGraphDescription)) seo.openGraphDescription = seo.description;
    if (!validImage(seo.openGraphImage)) seo.openGraphImage = seo.image;
    const path = kind === 'page' ? (doc.isHomepage ? '' : doc.slug?.current) : `${kind === 'caseStudy' ? 'cases' : kind === 'msmUnit' ? 'units' : 'people'}/${kind === 'person' ? edition.slug.current : doc.slug.current}`;
    const set = {};
    if (JSON.stringify(original) !== JSON.stringify(seo)) {
      if (isShared) {
        const next = {...edition, seo};
        if (!edition) Object.assign(next, {_type: 'caseWebsiteContent', _key: `msm-seo-${createHash('sha256').update(doc._id).digest('hex').slice(0, 12)}`, channel: 'msmWeb'});
        set.siteContent = edition ? doc.siteContent.map(item => item === edition ? next : item) : [...(doc.siteContent || []), next];
      } else set.metadata = seo;
      changes.push({id: doc._id, revision: doc._rev, set});
    }
    coverage.push({id: doc._id, type: kind, language: doc.language, path, title: seo.title, description: seo.description, socialTitle: seo.openGraphTitle, socialDescription: seo.openGraphDescription, imageSource: reason, image: urlOf(seo.openGraphImage), noIndex: seo.noIndex === true});
  }
  return {changes, coverage};
}
