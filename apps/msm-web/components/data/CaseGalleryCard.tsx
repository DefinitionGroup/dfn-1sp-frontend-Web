"use client";

import {useRef} from 'react';
import {motion, useScroll, useTransform, useSpring, useReducedMotion} from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import DeferredVideo from '@msm/components/ui/DeferredVideo';
import SelectionFrame from '@msm/components/ui/SelectionFrame';
import Button2 from '@msm/components/ui/Button2';
import styles from './CaseGalleryCard.module.css';

interface CaseStudy {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  services?: { name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    logoUrl?: string;
  };
  msmUnits?: Array<{
    _id: string;
    name: string;
    slug?: { current?: string };
  }>;
}

interface CaseGalleryCardProps {
  item: CaseStudy;
  id: string;
  variant?: 'light';
  sequenceIndex?: number;
  locale?: string;
  onClick: () => void;
}

export default function CaseGalleryCard({item, id, variant, sequenceIndex = 0, locale = 'en', onClick}: CaseGalleryCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target: ref, offset: ['start end', 'end start']});
  const y = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);
  const springY = useSpring(y, {stiffness: 400, damping: 90});
  const href = `${locale === 'en' ? '' : `/${locale}`}/cases/${item.slug.current}`;

  return <SelectionFrame sequenceIndex={sequenceIndex} transientCrosses className={styles.frame} contentClassName={styles.content}>
    <motion.article ref={ref} layoutId={`card-${item.title}-${id}`} className={styles.card} data-variant={variant}>
      <motion.button type="button" onClick={onClick} aria-label={`${locale === 'de' ? 'Vorschau' : 'Preview'}: ${item.title}`}
        layoutId={`image-${item.title}-${id}`} className={styles.media}>
        <motion.div style={{y: reduced ? 0 : springY}} className={styles.mediaInner}>
          {item.mainVideoUrl ? <DeferredVideo src={item.mainVideoUrl} maxWidth={640} className={styles.image} mountDelay={300} posterFrame="0" />
            : <Image src={item.mainImageUrl || '/placeholder.png'} alt={item.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className={styles.image} />}
        </motion.div>
        {item.client?.logoUrl && <motion.img layoutId={`logo-${item.title}-${id}`} src={item.client.logoUrl} alt="" className={styles.logo} />}
      </motion.button>
      <div className={styles.copy}>
        <Link href={href} className={styles.titleLink}>
          <motion.h3 layoutId={`title-${item.title}-${id}`} className={styles.title}>{item.title}</motion.h3>
        </Link>
        {Boolean(item.services?.length) && <motion.p layoutId={`description-${item.description}-${id}`} className={styles.services}>
          {item.services!.map(service => service.name).join(', ')}
        </motion.p>}
        {Boolean(item.msmUnits?.length) && <p className={styles.units}>{item.msmUnits!.map(unit => unit.name).join(' / ')}</p>}
        <div className={styles.action}>
          <Button2 variant="violetsmall" text={locale === 'de' ? 'Case ansehen' : 'View Case Study'} href={href} />
        </div>
      </div>
    </motion.article>
  </SelectionFrame>;
}
