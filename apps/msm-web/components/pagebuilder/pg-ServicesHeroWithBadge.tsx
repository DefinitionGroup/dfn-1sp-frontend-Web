"use client";
import {useParams} from 'next/navigation';
import type {ComponentProps} from 'react';
import HeaderImageVideoComp2 from '@msm/components/data/Fragments/data-HeaderImageVideoComp2';
import CtaMiniComponent from '@msm/components/data/Fragments/data-CtaMiniComponent';
import Badgemodule from '@msm/components/ui/Badgemodule';
import EditorialReveal from '@msm/components/ui/EditorialReveal';
import styles from '@msm/components/ui/EditorialBlocks.module.css';
import {hasVisibleText} from '@1sp/utils/text-content';
import {getTranslations} from '@1sp/utils/translations';
import {getRenderableCtaMini} from '@1sp/utils/cta';

interface ServicesHeroWithBadgeProps {
  useVideo?: boolean;
  backgroundImage?: {
    asset?: {
      secure_url?: string;
      resource_type?: string;
      public_id?: string;
    };
    alt?: string;
  };
  backgroundVideo?: {
    asset?: {
      secure_url?: string;
      resource_type?: string;
      public_id?: string;
    };
    alt?: string;
  };
  enableParallax?: boolean;
  title: string;
  titleTag?: "h1" | "h2";
  subtitle?: string;
  showCta?: boolean;
  cta?: {
    heading: string;
    paragraph?: string;
    buttonText: string;
    link?: {
      linkType?: string;
      externalUrl?: string;
      page?: {
        slug?: { current: string };
      };
    };
    variant?: string;
    alignment?: string;
  };
  listItems?: Array<{
    text: string;
    size?: string;
    fontWeight?: string;
    color?: string;
  }>;
  minHeight?: string;
  paddingY?: string;
  navPointName?: string;
  badgeText?: string;
  badgeSubtitle?: string;
  badgeNumber?: string | number;
}

export default function ServicesHeroWithBadge({
  useVideo = false, backgroundImage, backgroundVideo, enableParallax = false,
  title, titleTag = 'h2', subtitle, showCta = true, cta, listItems = [],
  navPointName, badgeText, badgeSubtitle, badgeNumber,
}: ServicesHeroWithBadgeProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = getTranslations(locale);
  const Title = titleTag === 'h1' ? 'h1' : 'h2';
  const renderedCta = showCta ? getRenderableCtaMini(cta) : null;
  const ctaUrl = renderedCta?.href.startsWith('/') && !renderedCta.href.startsWith(`/${locale}`)
    ? `/${locale}${renderedCta.href}` : renderedCta?.href;
  return <section id={t.ids.top} data-navpoint-name={navPointName} className={styles.hero}>
    <HeaderImageVideoComp2 useVideo={useVideo}
      imageSrc={backgroundImage?.asset?.secure_url}
      videoSrc={useVideo ? backgroundVideo?.asset?.secure_url : undefined}
      imageAlt={backgroundImage?.alt || backgroundVideo?.alt || ''}
      enableParallax={enableParallax} opacity={0.6} />
    <div className={styles.heroInner}>
      <div className={styles.heroGrid}>
        <EditorialReveal className={styles.heroCopy}>
          {hasVisibleText(title) && <Title className={styles.heroTitle}>{title}</Title>}
          {subtitle && <p className={styles.heroSubtitle}>{subtitle}</p>}
        </EditorialReveal>
        {badgeText && <div className={styles.heroBadge}>
          <Badgemodule text={badgeText} subtitle={badgeSubtitle || ''} numberEl={badgeNumber ?? ''} variant="glass" size="md" />
        </div>}
      </div>
      {(renderedCta && ctaUrl || listItems.length > 0) && <div className={styles.heroDetails}>
        {renderedCta && ctaUrl && <CtaMiniComponent heading={renderedCta.heading} paragraph={renderedCta.paragraph}
          buttonText={renderedCta.buttonText} url={ctaUrl}
          buttonVariant={(renderedCta.variant || 'violetsmall') as ComponentProps<typeof CtaMiniComponent>['buttonVariant']}
          align={(renderedCta.alignment || 'left') as ComponentProps<typeof CtaMiniComponent>['align']} />}
        {listItems.length > 0 && <ul className={styles.heroList}>{listItems.map((item, index) => <li key={index}>{item.text}</li>)}</ul>}
      </div>}
    </div>
  </section>;
}
