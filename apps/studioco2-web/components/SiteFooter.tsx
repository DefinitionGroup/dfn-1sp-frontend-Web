'use client'

import { Fragment } from 'react'
import { ArrowUpRight, ArrowUp, SlidersHorizontal } from '@phosphor-icons/react'
import ContactLink from './ContactLink'
import Logo from './Logo'
import { useSite } from './SiteProvider'
import type { ContactContent } from '@studioco2/lib/content'

export default function SiteFooter({ contact }: { contact: ContactContent }) {
  const { quiet, open, fxEnabled } = useSite()
  return <footer id="contact" className="contact section-pad">
    <div className="contact-grid grid grid-cols-1 md:grid-cols-4 gap-8">
      <div><span className="contact-label">Say hello</span>{contact.email && <span>{contact.email}</span>}{contact.phone && <a href={contact.phone.href}>{contact.phone.label}</a>}</div>
      <div><span className="contact-label">Find us</span><address>{contact.address.map((line, index) => <Fragment key={line}>{index > 0 && <br />}{line}</Fragment>)}</address></div>
      <div><span className="contact-label">Our wider world</span>{contact.family && <a href={contact.family.href} target="_blank" rel="noreferrer">{contact.family.label} <ArrowUpRight /></a>}</div>
      <div className="footer-top"><a href="#top">Back to top <ArrowUp /></a></div>
    </div>
    {contact.invitation && <p>{contact.invitation}</p>}
    {contact.email && <ContactLink quiet={quiet} email={contact.email} label={contact.cta} />}
    <div className="footer-wordmark"><Logo /></div>
    <div className="footer-bottom"><span>{contact.copyright}</span>{fxEnabled && <button className="water-settings" onClick={() => open({ type: 'menu' })}><SlidersHorizontal /> Effects</button>}{contact.conceptNote && <span className="concept-note">{contact.conceptNote}</span>}</div>
  </footer>
}
