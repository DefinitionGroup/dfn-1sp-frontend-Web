"use client";
import { stegaClean } from "@sanity/client/stega";
import type { ResultMetric } from "@1sp/sanity-types";
import { MetricNumber } from "@1sp/utils/components/MetricNumber";
import { hasMetricFormatting } from "@1sp/utils/result-metrics";

import { motion } from "motion/react";
import CaseSection from "./CaseSection";
import styles from "./CaseDetail.module.css";
import HeaderImageVideoComp2 from "@msm/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import AnimateNumberinView from "@msm/components/ui/AnimateNumberinView";
import PercentageDiagramVertical from "@msm/components/ui/percentageDiagramVertical";
import PercentageDiagramHorizontal from "@msm/components/ui/percentageDiagramHorizontal";
import PercentagePosNegDiagram from "@msm/components/ui/percentagePosNegDiagram";
import { getTranslations } from "@1sp/utils/translations";
import { useParams } from "next/navigation";
import { assetUrl, isVideoAsset } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";

interface CloudinaryAsset {
  public_id?: string;
  resource_type?: string;
  format?: string;
  secure_url?: string;
}

type Metric = ResultMetric;

interface ResultsMetricsProps {
  title: string;
  badgeText?: string;
  badgeSubtitle?: string;
  quote?: {text: string; attribution: string};
  description?: string;
  context?: string;
  metrics?: Metric[];
  backgroundImage?: CloudinaryAsset;
  backgroundOpacity?: number;
  enableParallax?: boolean;
  paddingY?: string;
  navPointName?: string;
}

export default function ResultsMetrics({
  title,
  badgeText,
  badgeSubtitle,
  quote,
  context,
  description,
  metrics = [],
  backgroundImage,
  backgroundOpacity = 0.7,
  enableParallax = false,
  navPointName,
}: ResultsMetricsProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  const sectionId = t.ids.results;

  const backgroundMediaUrl = backgroundImage ? assetUrl(backgroundImage) : "";
  const useVideo = isVideoAsset(backgroundImage, backgroundMediaUrl);

  // Get the diagram component based on the metric type
  const getDiagramComponent = (
    type: "vertical" | "horizontal" | "posNeg",
    value: number,
    delay: number,
    index: number
  ) => {
    switch (type) {
      case "vertical":
        return (
          <PercentageDiagramVertical
            key={index}
            percent={Math.max(0, value)}
            delay={delay}
          />
        );
      case "horizontal":
        return (
          <PercentageDiagramHorizontal
            key={index}
            percent={Math.max(0, value)}
            delay={delay}
          />
        );
      case "posNeg":
        return <PercentagePosNegDiagram key={index} value={value} />;
      default:
        return (
          <PercentageDiagramVertical
            key={index}
            percent={Math.max(0, value)}
            delay={delay}
          />
        );
    }
  };

  return (
    <section className={styles.darkSection}>
      <div
        id={sectionId}
        data-navpoint-name={navPointName || sectionId}
        className={styles.results}
        data-media={Boolean(backgroundMediaUrl)}
      >
        {backgroundMediaUrl && <HeaderImageVideoComp2
          useVideo={useVideo}
          opacity={backgroundOpacity}
          imageSrc={!useVideo ? backgroundMediaUrl : undefined}
          videoSrc={useVideo ? backgroundMediaUrl : undefined}
          enableParallax={enableParallax}
        />}

        <div className={`relative z-10 ${styles.container}`}>
          <CaseSection title={title} badgeText={badgeText} badgeSubtitle={badgeSubtitle}>
                {context && <p className="text-sm text-gray-200">{context}</p>}
                {description && (
                  <p className={`${styles.copy} text-gray-200`}>
                    {description}
                  </p>
                )}
                {quote?.text && <blockquote className={styles.quote}><p>{quote.text}</p><footer>{quote.attribution}</footer></blockquote>}

            {/* Metrics grid - Responsive layout */}
            {metrics && metrics.length > 0 && (
              <div className={styles.metricPanel}>
                <div className="w-full">
                  <div className={`grid grid-cols-1 ${metrics.length > 1 ? 'sm:grid-cols-2' : ''} ${metrics.length > 2 ? 'xl:grid-cols-3' : ''} gap-6 sm:gap-8`}>
                    {metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="flex min-w-0 flex-col items-start pb-6 border-b border-white/15 last:border-b-0 sm:last:border-b sm:border-b"
                      >
                        {stegaClean(metric.type) === "animatedNumber" ? (
                          <div className="mt-6 sm:mt-8 md:mt-12 mb-3 md:mb-4 w-full" style={{containerType: 'inline-size'}}>
                            {hasMetricFormatting(metric) ? <MetricNumber metric={metric} locale={locale} className="text-[clamp(1.25rem,9cqw,5rem)] text-gray-100" /> : <AnimateNumberinView
                              number={metric.value}
                              format={{ minimumIntegerDigits: 1 }}
                              suffix={metric.suffix || ""}
                              className="number text-gray-100"
                              delay={300}
                            />}
                          </div>
                        ) : (
                          <>
                            {getDiagramComponent(
                              stegaClean(metric.type) as any,
                              metric.value,
                              0.3 + index * 0.1,
                              index
                            )}
                            <motion.div
                              className="text-[8px] sm:text-[9px] font-bold mt-6 sm:mt-8 md:mt-12 text-gray-100"
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                  opacity: 1,
                                  y: -10,
                                  transition: { duration: 0.6, ease: "easeOut" },
                                },
                              }}
                            >
                              <AnimateNumberinView
                                number={Math.abs(metric.value)}
                                format={{ minimumIntegerDigits: 2 }}
                                suffix="%"
                                className="text-2xl sm:text-3xl md:text-[96px] font-light tracking-tighter"
                                delay={300}
                              />
                            </motion.div>
                          </>
                        )}
                        <div className="mt-2">
                          {hasVisibleText(metric.label) ? (
                            <h3 className="text-sm sm:text-base md:text-lg text-gray-200 tracking-tight leading-snug">
                              {metric.label}
                            </h3>
                          ) : null}
                          {metric.description && <p className="mt-3 text-base leading-relaxed text-gray-200">{metric.description}</p>}
                          {metric.context && <p className="mt-2 text-sm text-gray-200">{metric.context}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CaseSection>
        </div>
      </div>
    </section>
  );
}
