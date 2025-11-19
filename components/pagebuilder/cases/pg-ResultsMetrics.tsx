"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Badgemodule from "@/components/ui/Badgemodule";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HeaderImageVideoComp2 from "@/components/pagebuilder/Fragments/pg-HeaderImageVideoComp2";
import AnimateNumberinView from "@/components/ui/AnimateNumberinView";
import PercentageDiagramVertical from "@/components/ui/percentageDiagramVertical";
import PercentageDiagramHorizontal from "@/components/ui/percentageDiagramHorizontal";
import PercentagePosNegDiagram from "@/components/ui/percentagePosNegDiagram";
import { getTranslations } from "@/lib/translations";
import { useParams } from "next/navigation";
import { assetUrl } from "@/utils/utils";

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

  // Get the image URL
  const imageUrl = backgroundImage ? assetUrl(backgroundImage) : "";

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
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          opacity={backgroundOpacity}
          imageSrc={imageUrl}
          enableParallax={enableParallax}
        />

        <div
          className={`z-1 grid col-span-12 py-${paddingY} gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12`}
        >
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={badgeText || t.caseStudy.results}
            subtitle={badgeSubtitle || t.caseStudy.resultsSubtitle}
            numberEl={badgeNumber}
          />

          <div className="col-span-10 col-start-3">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-9xl mb-2 text-gray-100 max-w-xl font-semibold tracking-tight leading-compress">
                {title}
              </h2>
              {description && (
                <p className="text-xl text-gray-100 max-w-2xs mx-auto">
                  {description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {/* Metrics grid - uses data from props, maps over any number of metrics */}
          {metrics && metrics.length > 0 && (
            <div className="col-span-12 flex justify-between col-start-1 bg-neutral-900/60 backdrop-blur-lg gap-4 p-12 rounded-xl">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start border-b border-white/10 flex-1"
                >
                  {metric.type === "animatedNumber" ? (
                    <div className="mt-12 mb-4">
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
                        className="text-[8px] font-bold mt-12 text-gray-100"
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
                          className="text-4xl font-bold tracking-tighter"
                          delay={300}
                        />
                      </motion.div>
                    </>
                  )}
                  <StaggeredSlideUp
                    className=""
                    delay={0.0}
                    staggerDelay={0.1}
                    duration={0.5}
                    distance={80}
                  >
                    <h2 className="text-sm text-gray-100 tracking-tight">
                      {metric.label}
                    </h2>
                  </StaggeredSlideUp>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
