import {stegaClean} from '@sanity/client/stega';
import {FacebookLogoIcon, InstagramLogoIcon, LinkedinLogoIcon, MessengerLogoIcon, WhatsappLogoIcon} from '@phosphor-icons/react/ssr';
import type {MsmSocialLinksComponent, MsmSocialPlatform} from '@1sp/sanity-types';
import {hasVisibleText} from '@1sp/utils/text-content';
import EditorialReveal from '@msm/components/ui/EditorialReveal';
import editorial from '@msm/components/ui/EditorialBlocks.module.css';
import styles from './MsmSocialLinks.module.css';

const services = {
  messenger: {name: 'Messenger', Icon: MessengerLogoIcon},
  whatsapp: {name: 'WhatsApp', Icon: WhatsappLogoIcon},
  facebook: {name: 'Facebook', Icon: FacebookLogoIcon},
  instagram: {name: 'Instagram', Icon: InstagramLogoIcon},
  linkedin: {name: 'LinkedIn', Icon: LinkedinLogoIcon},
};

export default function MsmSocialLinks({data, language}: {data: MsmSocialLinksComponent; language: string}) {
  const links = (data.links || []).flatMap(link => {
    const service = services[stegaClean(link.platform) as MsmSocialPlatform];
    const url = stegaClean(link.url || '');
    return service && /^https?:\/\//i.test(url) ? [{...link, url, service}] : [];
  });
  if (!links.length) return null;
  const heading = hasVisibleText(data.title);
  const id = stegaClean(data.title || `social-links-${data._key || 'section'}`).replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
  return <section id={id} data-component="msm-social-links" data-color={stegaClean(data.color || 'white')} data-navpoint-name={data.navPointName} data-nav-hidden={data.hideFromNav ? 'true' : undefined} className={`${editorial.section} ${styles.section}`}>
    <div className={editorial.inner}>
      <EditorialReveal className={editorial.editorial}>
        {heading && <h2 className={`${editorial.heading} ${styles.heading}`}>{data.title}</h2>}
        <ul className={`${styles.links} ${!heading ? styles.unheaded : ''}`}>
          {links.map(({_key, label, url, openInNewTab, service: {name, Icon}}) => <li key={_key}>
            <a className={styles.link} href={url} target={openInNewTab ? '_blank' : undefined} rel={openInNewTab ? 'noopener noreferrer' : undefined}>
              <Icon className={styles.icon} size={30} weight="regular" aria-hidden="true" />
              <span>{hasVisibleText(label) ? label : name}</span>
              {openInNewTab && <span className="sr-only">{language === 'de' ? ' (öffnet in neuem Tab)' : ' (opens in a new tab)'}</span>}
            </a>
          </li>)}
        </ul>
      </EditorialReveal>
    </div>
  </section>;
}
