import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Image from 'next/image';
import {getMsmPerson, msmPath} from '@msm/lib/editorial';
import MsmSiteWrapper from '@msm/components/MsmSiteWrapper';
import CaseGallery from '@msm/components/data/data-CaseGallery';
import Button2 from '@msm/components/ui/Button2';

type Props = {params: Promise<{locale: string; slug: string}>};
export const revalidate = 60;
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const person = await getMsmPerson(slug, locale);
  if (!person) return {};
  const title = person.edition.seo?.title || person.fullname || person.name;
  const description = person.edition.seo?.description;
  return {title, description, alternates: {canonical: msmPath(locale, `people/${slug}`)}, openGraph: {title, description, type: 'profile'}};
}
export default async function PersonPage({params}: Props) {
  const {locale, slug} = await params;
  const person = await getMsmPerson(slug, locale);
  if (!person) notFound();
  const edition = person.edition;
  const image = person.image?.secure_url || person.image?.url;
  const de = locale === 'de';
  return <MsmSiteWrapper language={locale} navColor="light"><article className="container mx-auto px-[var(--container-padding)] pt-36">
    <header className="grid gap-12 md:grid-cols-2 items-end pb-16">
      <div><p className="msm-label text-msm-cyan mb-6">MSM.digital</p><h1 className="headline-display">{person.fullname || person.name}</h1><p className="msm-copy mt-6">{person.position}</p>
      {edition.quote && <blockquote className="text-2xl leading-relaxed mt-12">{edition.quote}</blockquote>}
      {edition.phone && <a className="block mt-6 underline underline-offset-4" href={edition.phone}>{edition.phone.replace(/^tel:/, "")}</a>}
      {person.email && <div className="mt-8"><Button2 text={de ? 'E-Mail schreiben' : 'Get in touch'} href={`mailto:${person.email}`} /></div>}</div>
      {image && <div className="relative aspect-[4/5]"><Image src={image} alt={person.altText || person.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" /></div>}
    </header>
    <div className="grid gap-12 md:grid-cols-2 border-t border-white/20 py-16">
      {edition.iDo && <section><h2 className="msm-title mb-6">{de ? 'Das mache ich' : 'I do'}</h2><p className="msm-copy whitespace-pre-line">{edition.iDo}</p></section>}
      {edition.askMe && <section><h2 className="msm-title mb-6">{de ? 'Frag mich' : 'Ask me'}</h2><p className="msm-copy whitespace-pre-line">{edition.askMe}</p></section>}
    </div>
    {edition.biography?.length > 0 && <section className="max-w-4xl py-16 space-y-6 msm-copy whitespace-pre-line">{edition.biography}</section>}
    {person.cases.length > 0 && <section className="py-16"><h2 className="msm-title mb-12">{edition.selectedCasesHeading || (de ? 'Ausgewählte Projekte' : 'Selected cases')}</h2><CaseGallery caseStudies={person.cases} locale={locale} /></section>}
  </article></MsmSiteWrapper>;
}
