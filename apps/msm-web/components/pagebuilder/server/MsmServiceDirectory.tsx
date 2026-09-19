import Link from 'next/link';
import Image from 'next/image';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {msmPath} from '@msm/lib/editorial';
import SelectionFrame, {SelectionSequence} from '@msm/components/ui/SelectionFrame';
import cards from '@msm/components/ui/SelectionCards.module.css';

type Entry = {_key: string; reference?: {_ref?: string; _id?: string}; text?: string; linkLabel?: string};
export default async function MsmServiceDirectory({headline, items = [], language = 'en'}: {headline?: string; items?: Entry[]; language?: string}) {
  const ids = items.map(i => i.reference?._ref || i.reference?._id).filter(Boolean);
  const {data: pages} = await sanityFetch({query: `*[_type == "page" && _id in $ids && channel == "msmWeb" && language == $language && msmPageKind == "service"]{_id, title, slug, "image": content[_type == "servicesHeroWithBadge"][0].backgroundImage.asset.secure_url, "video": content[_type == "servicesHeroWithBadge"][0].backgroundVideo.asset.secure_url}`, params: {ids, language}});
  const entries = items.map(item => ({...item, resolved: pages.find((p: {_id: string}) => p._id === (item.reference?._ref || item.reference?._id))})).filter(i => i.resolved);
  if (!entries.length) return null;
  return <section className="msm-section container mx-auto px-[var(--container-padding)]">
    {headline && <h2 className="headline-display mb-12">{headline}</h2>}
    <SelectionSequence className={cards.grid}>
      {entries.map((item, index) => <SelectionFrame key={item._key} sequenceIndex={index + 1} className={cards.card} contentClassName={cards.cardContent}>
        <Link href={msmPath(language, item.resolved.slug.current)} className={cards.link}>
          {(item.resolved.video || item.resolved.image) && <div className={cards.media}><Image src={item.resolved.video ? item.resolved.video.replace("/video/upload/", "/video/upload/so_0,f_jpg/").replace(/\.[a-z0-9]+$/i, ".jpg") : item.resolved.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className={cards.image} /></div>}
          <div className={cards.copy}><h2 className={cards.title}>{item.resolved.title}</h2>{item.text && <p className={cards.claim}>{item.text}</p>}<span className={cards.action}>{item.linkLabel || (language === 'de' ? 'Mehr erfahren' : 'Explore service')}</span></div>
        </Link>
      </SelectionFrame>)}
    </SelectionSequence>
  </section>;
}
