import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from '@phosphor-icons/react/dist/ssr';
import {assetUrl} from '@1sp/utils/cloudinary';
import Badgemodule from '@msm/components/ui/Badgemodule';
import SelectionFrame from '@msm/components/ui/SelectionFrame';
import layout from '@msm/components/ui/SelectionCards.module.css';
import type {ContactPerson} from '@msm/lib/contact-data';
import styles from './ContactBlocks.module.css';

export default function MsmContactPeopleBlock({people, language}: {people: ContactPerson[]; language: string}) {
  if (!people.length) return null;
  return <section id="contact-people" aria-labelledby="contact-people-title" className={styles.section} data-component="msm-contact-people">
    <div className={styles.inner}>
      <div className={layout.sectionLayout}>
        <Badgemodule text={language === 'de' ? 'Unser Team' : 'Our people'} subtitle="MSM.digital" />
        <div className={layout.sectionContent}>
          <h2 id="contact-people-title" className={`${styles.heading} msm-title`}>{language === 'de' ? 'Die Menschen bei MSM.digital' : 'The people at MSM.digital'}</h2>
          <div className={styles.people}>{people.map(person => {
            const src = assetUrl(person.image);
            const name = person.fullname || person.name;
            const profile = person.profileUrl;
            const external = profile?.startsWith('http');
            return <article className={styles.person} key={person._id} data-person={person._id}>
              <SelectionFrame transientCrosses contentClassName={styles.personBody}>
                {src && <div className={styles.portrait}><Image src={src} alt={person.altText || name} fill sizes="(max-width: 639px) 100vw, (max-width: 1279px) 40vw, 28vw" className={styles.image} /></div>}
                <div className={styles.personCopy}>
                  <h3>{name}</h3>
                  {person.position && <p className={styles.position}>{person.position}</p>}
                  {person.email && <a className={styles.email} href={`mailto:${person.email}`}>{person.email}</a>}
                  {profile && <Link className={styles.profile} href={profile} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                    {language === 'de' ? 'Profil ansehen' : 'View profile'}<ArrowUpRight size={18} aria-hidden="true" />
                  </Link>}
                </div>
              </SelectionFrame>
            </article>;
          })}</div>
        </div>
      </div>
    </div>
  </section>;
}
