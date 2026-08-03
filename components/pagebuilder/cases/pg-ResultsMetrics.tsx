"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import Badgemodule from "@/components/ui/Badgemodule";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import AnimateNumberinView from "@/components/ui/AnimateNumberinView";
import PercentageDiagramVertical from "@/components/ui/percentageDiagramVertical";
import PercentageDiagramHorizontal from "@/components/ui/percentageDiagramHorizontal";
import PercentagePosNegDiagram from "@/components/ui/percentagePosNegDiagram";
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

interface Metric {
  type: "vertical" | "horizontal" | "posNeg" | "animatedNumber";
  label: string;
  value: number;
  suffix?: string;
}

interface ResultsMetricsProps {
  title: string;
  description?: string;
  badgeText?: string;
  badgeSubtitle?: string;
  badgeNumber?: string;
  metrics?: Metric[];
  backgroundImage?: CloudinaryAsset;
  backgroundOpacity?: number;
  enableParallax?: boolean;
  paddingY?: string;
  navPointName?: string;
}

export default function ResultsMetrics({
  title,
  description,
  badgeText,
  badgeSubtitle,
  badgeNumber = "003",
  metrics = [],
  backgroundImage,
  backgroundOpacity = 0.7,
  enableParallax = false,
  paddingY = "32",
  navPointName,
}: ResultsMetricsProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const t = getTranslations(locale);

  // Ensure body overflow is reset when component mounts
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

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
    <section className="relative overflow-hidden">
      <div
        id={sectionId}
        data-navpoint-name={navPointName}
        className="min-h-[80vh] md:min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={useVideo}
          opacity={backgroundOpacity}
          imageSrc={!useVideo ? backgroundMediaUrl : undefined}
          videoSrc={useVideo ? backgroundMediaUrl : undefined}
          enableParallax={enableParallax}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 py-16 sm:py-24 lg:py-${paddingY}`}>
            {/* Badge Module - Responsive sticky */}
            <div className="hidden md:block md:col-span-2 md:mb-0 md:sticky md:top-24 self-start iphone-landscape:!hidden">
              <Badgemodule
                text={badgeText || t.caseStudy.results}
                subtitle={badgeSubtitle || t.caseStudy.resultsSubtitle}
                numberEl={badgeNumber}
                variant="glass"
                size="md"
              />
            </div>

            {/* Title and Description */}
            <div className="col-span-4 sm:col-span-6 iphone-landscape:!col-span-12 iphone-landscape:!col-start-1 md:col-span-10 md:col-start-3">
              <StaggeredSlideUp
                className="flex flex-col items-start justify-start gap-3"
                delay={0.0}
                staggerDelay={0.1}
                duration={0.5}
                distance={80}
              >
                {hasVisibleText(title) ? (
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 text-gray-100 max-w-xl tracking-tight leading-[1.1]">
                    {title}
                  </h2>
                ) : null}
                {description && (
                  <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-xl leading-relaxed">
                    {description}
                  </p>
                )}
              </StaggeredSlideUp>
            </div>

            {/* Metrics grid - Responsive layout */}
            {metrics && metrics.length > 0 && (
              <div className="col-span-4 sm:col-span-6 md:col-span-12 mt-8 md:mt-12">
                <div className="bg-neutral-900/60 backdrop-blur-lg rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                    {metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-start pb-6 border-b border-white/15 last:border-b-0 sm:last:border-b sm:border-b"
                      >
                        {metric.type === "animatedNumber" ? (
                          <div className="mt-6 sm:mt-8 md:mt-12 mb-3 md:mb-4">
                            <AnimateNumberinView
                              number={metric.value}
                              format={{ minimumIntegerDigits: 1 }}
                              suffix={metric.suffix || ""}
                              className="number text-gray-100"
                              delay={300}
                            />
                          </div>
                        ) : (
                          <>
                            {getDiagramComponent(
                              metric.type as any,
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
                        <StaggeredSlideUp
                          className="mt-2"
                          delay={0.0}
                          staggerDelay={0.1}
                          duration={0.5}
                          distance={80}
                        >
                          {hasVisibleText(metric.label) ? (
                            <h3 className="text-sm sm:text-base md:text-lg text-gray-200 tracking-tight leading-snug">
                              {metric.label}
                            </h3>
                          ) : null}
                        </StaggeredSlideUp>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
