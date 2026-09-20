import {PortableText, type PortableTextComponents} from '@portabletext/react';
import type {PortableTextBlock} from '@portabletext/types';
import type {CSSProperties} from 'react';
import {hasVisibleText} from '@1sp/utils/text-content';
import EditorialReveal from '@msm/components/ui/EditorialReveal';
import styles from '@msm/components/ui/EditorialBlocks.module.css';

type ContentSectionData = {
  title?: string; introHeading?: string; introSubheading?: string;
  content?: PortableTextBlock[]; contentSize?: string; columnSpan?: string;
  paddingY?: string; navPointName?: string; hideFromNav?: boolean;
};

const components: PortableTextComponents = {
  marks: {
    link: ({value, children}) => value?.href
      ? <a href={value.href} target={value.blank ? '_blank' : undefined} rel={value.blank ? 'noopener noreferrer' : undefined}>{children}</a>
      : <>{children}</>,
  },
};
const copySizes: Record<string, string> = {sm: '0.9375rem', base: '1rem', lg: 'clamp(1.0625rem, 1.3vw, 1.25rem)', xl: 'clamp(1.125rem, 1.5vw, 1.375rem)'};

export default function ContentSection({data}: {data: ContentSectionData}) {
  const {title, introHeading, introSubheading, content, contentSize = 'lg', navPointName, hideFromNav} = data || {};
  if (!content?.length) return null;
  const sectionId = title || introHeading
    ? (title || introHeading!.substring(0, 30)).replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-').toLowerCase()
    : 'content-section';
  return <section id={sectionId} data-navpoint-name={navPointName} data-nav-hidden={hideFromNav ? 'true' : undefined} className={styles.section}>
    <div className={styles.inner}>
      {(hasVisibleText(introHeading) || hasVisibleText(introSubheading)) && <div className={styles.introduction}>
        {hasVisibleText(introHeading) && <h2 className={styles.heading}>{introHeading}</h2>}
        {hasVisibleText(introSubheading) && <h2 className={styles.support}>{introSubheading}</h2>}
      </div>}
      <EditorialReveal className={`${styles.editorial} ${!hasVisibleText(title) ? styles.unheaded : ''}`}>
        {hasVisibleText(title) && <h2 className={styles.heading}>{title}</h2>}
        <div className={styles.prose} style={{'--editorial-copy-size': copySizes[contentSize] || copySizes.lg} as CSSProperties}>
          <PortableText value={content} components={components} />
        </div>
      </EditorialReveal>
    </div>
  </section>;
}
