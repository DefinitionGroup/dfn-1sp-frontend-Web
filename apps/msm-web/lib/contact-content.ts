import type {PortableTextBlock, PortableTextSpan} from '@portabletext/types';

export type ContactCompany = {key: string; name: string; details: PortableTextBlock[]};
type ContentSection = {_type?: string; content?: PortableTextBlock[]};

export function contactEmail(value?: string | null): string | undefined {
  if (!value) return undefined;
  let email = value;
  try { email = decodeURIComponent(email); } catch { return undefined; }
  email = email.replace(/^mailto:/i, '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
}

const plainText = (block: PortableTextBlock) => block.children.map(child => child._type === 'span' ? (child as PortableTextSpan).text : '').join('').trim();

/** Accepts both imported one-paragraph-per-line content and compact address groups. */
function linesFromBlock(block: PortableTextBlock): PortableTextBlock[] {
  const lines: PortableTextSpan[][] = [[]];
  for (const child of block.children) {
    if (child._type !== 'span') continue;
    const span = child as PortableTextSpan;
    span.text.split(/\r?\n/).forEach((text, index) => {
      if (index) lines.push([]);
      if (text) lines[lines.length - 1].push({...span, _key: `${span._key}-${lines.length}`, text});
    });
  }
  return lines.map((children, index) => ({...block, _key: `${block._key}-line-${index}`, children,
    markDefs: (block.markDefs || []).filter(mark => children.some(child => child.marks?.includes(mark._key))),
  })).filter(line => plainText(line));
}

function linkContactLine(block: PortableTextBlock): PortableTextBlock {
  if (block.markDefs?.some(mark => mark._type === 'link')) return block;
  const value = plainText(block);
  const emailMatch = value.match(/^(?:Mail|E-Mail|Email|Datenschutz|Data protection):\s*(.+)$/i);
  const email = contactEmail(emailMatch?.[1]);
  const phone = value.match(/^(?:Telephone|Telefon):\s*(\+?[\d\s()-]+)$/i)?.[1];
  const href = email ? `mailto:${email}` : phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : undefined;
  if (!href) return block;
  const key = `${block._key}-contact-link`;
  return {...block, markDefs: [...(block.markDefs || []), {_type: 'link', _key: key, href}], children: block.children.map(child => child._type === 'span' ? {...child, marks: [...((child as PortableTextSpan).marks || []), key]} : child)};
}

/** The disclaimer remains the authority; no company/address copy lives in this route. */
export function getContactCompanies(content: ContentSection[] = []): ContactCompany[] {
  const lines = content.filter(section => section._type === 'contentSection').flatMap(section => section.content || []).filter(block => block._type === 'block' && (!block.style || block.style === 'normal') && !block.listItem).flatMap(linesFromBlock);
  const companies: ContactCompany[] = [];
  let company: ContactCompany | undefined;
  for (const line of lines) {
    const value = plainText(line);
    if (/(?:GmbH|S\.L\.|MSM\.digital\s+AB)$/i.test(value)) {
      if (company) companies.push(company);
      company = {key: line._key!, name: value, details: []};
    } else if (company) {
      company.details.push(linkContactLine(line));
      if (/^(?:VAT No\.|N\.I\.F\.)/i.test(value)) { companies.push(company); company = undefined; }
    }
  }
  if (company) companies.push(company);
  return companies;
}

export type ContactChannel = {href: string; label: string};
export function getContactChannels(content: ContentSection[] = []): ContactChannel[] {
  const channels = new Map<string, ContactChannel>();
  for (const section of content) for (const block of section.content || []) for (const mark of block.markDefs || []) {
    if (mark._type !== 'link' || typeof mark.href !== 'string') continue;
    const href = mark.href;
    const label = /m\.me\//i.test(href) ? 'Messenger' : /wa\.me\//i.test(href) ? 'WhatsApp' : /facebook\.com\//i.test(href) ? 'Facebook' : /instagram\.com\//i.test(href) ? 'Instagram' : /linkedin\.com\//i.test(href) ? 'LinkedIn' : undefined;
    if (label && /^https?:\/\//i.test(href)) channels.set(href, {href, label});
  }
  return [...channels.values()];
}
