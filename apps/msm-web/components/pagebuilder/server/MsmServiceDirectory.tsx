import Link from 'next/link';
import Image from 'next/image';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {msmPath} from '@msm/lib/editorial';
import styles from '@msm/components/ui/EditorialBlocks.module.css';

type Entry = {_key: string; reference?: {_ref?: string; _id?: string}; text?: string; linkLabel?: string};
export default async function MsmServiceDirectory({headline, items = [], language = 'en'}: {headline?: string; items?: Entry[]; language?: string}) {
  const ids = items.map(i => i.reference?._ref || i.reference?._id).filter(Boolean);
  const {data: pages} = await sanityFetch({query: `*[_type == "page" && _id in $ids && channel == "msmWeb" && language == $language && msmPageKind == "service"]{_id, title, slug, "image": content[_type == "servicesHeroWithBadge"][0].backgroundImage.asset.secure_url, "video": content[_type == "servicesHeroWithBadge"][0].backgroundVideo.asset.secure_url}`, params: {ids, language}});
  const entries = items.map(item => ({...item, resolved: pages.find((p: {_id: string}) => p._id === (item.reference?._ref || item.reference?._id))})).filter(i => i.resolved);
  if (!entries.length) return null;
  return <section className={styles.section}>
    <div className={styles.inner}>
      {headline && <h2 className={`${styles.heading} mb-12`}>{headline}</h2>}
      <div className={styles.directory}>
        {entries.map(item => <Link key={item._key} href={msmPath(language, item.resolved.slug.current)}
          className={styles.directoryLink} data-media={Boolean(item.resolved.video || item.resolved.image)}>
          {(item.resolved.video || item.resolved.image) && <div className={styles.directoryMedia}>
            <Image src={item.resolved.video ? item.resolved.video.replace("/video/upload/", "/video/upload/so_0,f_jpg/").replace(/\.[a-z0-9]+$/i, ".jpg") : item.resolved.image}
              alt="" fill sizes="(min-width: 768px) 22vw, 100vw" />
          </div>}
          <div className={styles.directoryCopy}>
            <h2 className={styles.heading}>{item.resolved.title}</h2>
            {item.text && <p>{item.text}</p>}
            <span className={styles.directoryAction}>{item.linkLabel || (language === 'de' ? 'Mehr erfahren' : 'Explore service')}</span>
          </div>
          <svg className={styles.directoryArrow} width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 19 19 5M5 5h14v14" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </Link>)}
      </div>
    </div>
  </section>;
}
