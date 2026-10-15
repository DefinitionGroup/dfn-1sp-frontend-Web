import {PortableText, type PortableTextComponents} from '@portabletext/react';
import Badgemodule from '@msm/components/ui/Badgemodule';
import EditorialReveal from '@msm/components/ui/EditorialReveal';
import layout from '@msm/components/ui/SelectionCards.module.css';
import type {ContactCompany, ContactChannel} from '@msm/lib/contact-content';
import styles from './ContactBlocks.module.css';

const components: PortableTextComponents = {marks: {link: ({value, children}) => value?.href ? <a href={value.href}>{children}</a> : <>{children}</>}};

export default function MsmContactDetailsBlock({companies, channels, language}: {companies: ContactCompany[]; channels: ContactChannel[]; language: string}) {
  if (!companies.length && !channels.length) return null;
  return <section id="contact-details" aria-labelledby="contact-details-title" className={styles.section} data-component="msm-contact-details">
    <div className={styles.inner}>
      <div className={layout.sectionLayout}>
        <Badgemodule text={language === 'de' ? 'Kontakt' : 'Contact'} subtitle="MSM.digital" />
        <div className={layout.sectionContent}>
          <h2 id="contact-details-title" className={`${styles.heading} msm-title`}>{language === 'de' ? 'Kontakt & Unternehmensdaten' : 'Contact & company details'}</h2>
          <div className={styles.companies}>{companies.map(company => <EditorialReveal key={company.key} className={styles.company}>
            <h3>{company.name}</h3>
            <div className={styles.details}><PortableText value={company.details} components={components} /></div>
          </EditorialReveal>)}</div>
          {channels.length > 0 && <nav aria-label={language === 'de' ? 'Weitere Kontaktwege' : 'More ways to connect'} className={styles.channels}>
            {channels.map(channel => <a key={channel.href} className={styles.channel} href={channel.href} target="_blank" rel="noopener noreferrer">{channel.label}</a>)}
          </nav>}
        </div>
      </div>
    </div>
  </section>;
}
