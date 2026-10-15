import Link from 'next/link';
import {notFound} from 'next/navigation';
import {defineQuery} from 'next-sanity';
import {sanityFetch} from '@1sp/sanity-queries/fetch';
import {RENAISSANCE_CASE_CAROUSEL_PROJECTION} from '@1sp/sanity-queries/groq';
import RenaissancePageBuilder from '@renaissance/components/RenaissancePageBuilder';
import CaseCarouselPreviewMotion from '@renaissance/components/dev/CaseCarouselPreviewMotion';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'Case carousel · local preview', robots: {index: false, follow: false}};

// A synthetic page-builder block exercises the real reference projection without
// creating a CMS document. This route returns 404 outside the local dev server.
const query = defineQuery(`{
  "_type": "renaissanceCaseCarousel",
  "_key": "case-carousel-preview",
  "selectedCases": *[_type == 'caseStudy' && $channel in channel && language == $language && isPublished == true && defined(slug.current)]
    | order(defined(mainVideo) desc, publishedAt desc, _id asc)[0...5]{"_type": "reference", "_ref": _id}
}{..., ${RENAISSANCE_CASE_CAROUSEL_PROJECTION}}`);

export default async function CaseCarouselPreview({searchParams}: {searchParams: Promise<{reducedMotion?: string; autoAdvance?: string}>}) {
  if (process.env.NODE_ENV !== 'development') notFound();
  const options = await searchParams;
  const {data} = await sanityFetch({query, params: {channel: 'renaissanceWeb', language: 'en'}, tags: ['cases']});
  return <main className="min-h-screen bg-renaissance-paper py-10">
    <div className="mx-auto max-w-[1680px] px-6 pb-8 sm:px-9 lg:px-12">
      <Link href="/" className="eyebrow-mono text-renaissance-petrol underline">Renaissance</Link>
      <h1 className="mt-5 text-4xl font-semibold text-renaissance-petrol">Case carousel preview</h1>
      <p className="mt-3 max-w-2xl text-renaissance-ink">Global cases using Renaissance content and media. This local preview does not change any published page.</p>
      <nav aria-label="Preview options" className="mt-4 flex flex-wrap gap-5 text-sm text-renaissance-petrol underline">
        <Link href="/dev/case-carousel">Standard</Link>
        <Link href="/dev/case-carousel?reducedMotion=1">Reduced motion</Link>
        <Link href="/dev/case-carousel?autoAdvance=1">Automatic slides</Link>
      </nav>
    </div>
    <CaseCarouselPreviewMotion reduced={options.reducedMotion === '1'}>
      <RenaissancePageBuilder content={[{...data, autoAdvance: options.autoAdvance === '1'}]} channel="renaissanceWeb" language="en" />
    </CaseCarouselPreviewMotion>
  </main>;
}
