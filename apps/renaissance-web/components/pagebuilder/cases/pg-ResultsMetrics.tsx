'use client';

import { stegaClean } from '@sanity/client/stega';
import { useParams } from 'next/navigation';
import type { ResultsMetricsComponent } from '@1sp/sanity-types';
import { MetricNumber } from '@1sp/utils/components/MetricNumber';
import { assetUrl, isVideoAsset } from '@1sp/utils/cloudinary';
import HeaderImageVideoComp2 from '@renaissance/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2';
import PercentageDiagramVertical from '@renaissance/components/ui/percentageDiagramVertical';
import PercentageDiagramHorizontal from '@renaissance/components/ui/percentageDiagramHorizontal';
import PercentagePosNegDiagram from '@renaissance/components/ui/percentagePosNegDiagram';

export default function ResultsMetrics({
  title, context, description, metrics = [], quote, backgroundImage,
  backgroundOpacity = 0.7, enableParallax = false, fullWidth = false,
  paddingY = '24', navPointName, sectionId = 'results',
}: ResultsMetricsComponent & { sectionId?: string }) {
  const params = useParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';
  const media = backgroundImage ? assetUrl(backgroundImage) : '';
  const video = isVideoAsset(backgroundImage, media);
  const items = metrics.filter(metric => Number.isFinite(metric.value));
  const columns = items.length === 1 ? 'md:grid-cols-1' : items.length === 2 || items.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  const spacing = ({'16': 'lg:py-16', '24': 'lg:py-24', '32': 'lg:py-32'} as Record<string, string>)[stegaClean(paddingY)] || 'lg:py-24';

  return (
    <section id={sectionId} data-component="results-metrics" data-navpoint-name={stegaClean(navPointName || title)}
      className={`relative overflow-hidden border-t border-white/20 bg-renaissance-ink font-renaissance text-white ${fullWidth ? 'w-full' : 'container mx-auto'}`}>
      {media && <HeaderImageVideoComp2 useVideo={video} opacity={Math.max(0, Math.min(1, backgroundOpacity * 0.5))}
        imageSrc={!video ? media : undefined} videoSrc={video ? media : undefined} enableParallax={enableParallax} />}
      <div className={`relative z-10 mx-auto max-w-[1680px] px-5 py-14 sm:px-8 md:py-20 lg:px-12 ${spacing}`}>
        {context && <p className="mb-5 max-w-3xl text-sm font-semibold leading-relaxed text-white/80">{context}</p>}
        {title && <h2 className="renaissance-display text-white max-w-4xl text-[clamp(2.5rem,5vw,5rem)] font-bold leading-[0.95]">{title}</h2>}
        {items.length > 0 && <div className={`mt-10 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-14 ${columns}`}>
          {items.map((metric, index) => {
            const type = stegaClean(metric.type);
            const isNumber = type === 'animatedNumber';
            return <div key={metric._key || index} className="min-w-0 border-t border-white/30 pt-6" data-metric={metric._key || index}>
              {!isNumber && (type === 'horizontal' ? <PercentageDiagramHorizontal percent={Math.max(0, metric.value)} delay={0.3} /> :
                type === 'posNeg' ? <PercentagePosNegDiagram value={metric.value} /> : <PercentageDiagramVertical percent={Math.max(0, metric.value)} delay={0.3} />)}
              <MetricNumber metric={isNumber ? metric : {...metric, suffix: '%'}} locale={locale}
                className="renaissance-display break-words text-[clamp(2.3rem,4.6vw,5rem)] font-bold leading-none tracking-tight" />
              <h3 className="mt-5 text-white max-w-[32ch] text-lg font-semibold leading-snug md:text-xl">{metric.label}</h3>
              {metric.description && <p className="mt-3 max-w-[45ch] text-base leading-relaxed text-white/85">{metric.description}</p>}
              {metric.context && <p className="mt-3 max-w-[45ch] text-sm leading-relaxed text-white/75">{metric.context}</p>}
            </div>;
          })}
        </div>}
        {description && <div className="mt-9 max-w-[72ch] space-y-5 text-base leading-relaxed text-white/90 md:mt-12 md:text-lg">
          {description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>}
        {quote?.text && quote.attribution && <figure className="mt-10 max-w-3xl border-l-2 border-white/40 pl-6">
          <blockquote className="text-xl leading-relaxed">“{quote.text}”</blockquote>
          <figcaption className="mt-4 text-sm text-white/80">{quote.attribution}</figcaption>
        </figure>}
      </div>
    </section>
  );
}
