"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import AnimateNumberinView from "@/components/ui/AnimateNumberinView";
import Badgemodule from "@/components/ui/Badgemodule";
import Button2 from "@/components/ui/Button2";
import GridBackground from "@/components/ui/GridBackground";
import HeaderImageVideoComp from "@/components/data/Fragments/data-HeaderImageVideoComp";
import HeaderImageVideoComp2 from "@/components/data/Fragments/data-HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/ui/HamburgerGradientMenu";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import LineMinimap from "@/components/ui/MapVertical";
import PercentageDiagramVertical from "@/components/ui/percentageDiagramVertical";
import PercentageDiagramHorizontal from "@/components/ui/percentageDiagramHorizontal";
import PercentagePosNegDiagram from "@/components/ui/percentagePosNegDiagram";
import CtaMiniComponent from "@/components/data/Fragments/data-CtaMiniComponent";
import { getTranslations } from "@/lib/translations";
interface CaseStudyData {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  websiteUrl?: string;
  websiteUrlText?: string;
  mediaGallery?: Array<{
    mediaType: "image" | "video";
    imageUrl?: string;
    videoUrl?: string;
    alt?: string;
    caption?: string;
  }>;
  imageGallery?: Array<{
    imageUrl: string;
    alt?: string;
    caption?: string;
  }>;
  units?: Array<{
    _id: string;
    name: string;
    slug: { current: string };
    tagline?: string;
    logoUrl?: string;
  }>;
  client?: {
    _id: string;
    name: string;
    slug: { current: string };
    logoUrl?: string;
  };
  challenges?: string[];
  solution?: string;
  approachToSolution?: string;
  metrics?: Array<{
    type: "vertical" | "horizontal" | "posNeg";
    label: string;
    value: number;
  }>;
  publishedAt?: string;
}

interface CaseStudyPageClientProps {
  caseStudy: CaseStudyData;
  locale: string;
}

export default function CaseStudyPageClient({
  caseStudy,
  locale,
}: CaseStudyPageClientProps) {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);

  // Get translations for the current locale
  const t = getTranslations(locale);

  // === Added navPoints collection to drive LineMinimap (matches Plain) ===
  const [navPoints, setNavPoints] = useState<string[]>([]);

  // Ensure body overflow is reset when component mounts (fixes scroll lock issue from gallery navigation)
  useEffect(() => {
    document.body.style.overflow = "auto";
  }, []);

  useEffect(() => {
    const collectPageIds = () => {
      setTimeout(() => {
        const all = document.querySelectorAll<HTMLElement>("[id]");
        const ids: string[] = [];
        all.forEach((el) => {
          const id = el.id;
          if (
            id &&
            !id.startsWith("headlessui-") &&
            !id.startsWith("radix-") &&
            !id.startsWith("__") &&
            !id.startsWith("_") &&
            id !== "_R_" &&
            id.length > 2 &&
            !/^\d+$/.test(id) &&
            id !== "root"
          ) {
            ids.push(id);
          }
        });
        setNavPoints([...new Set(ids)]);
      }, 500);
    };
    collectPageIds();
  }, []);

  // Helper: choose a safe image for sections
  const heroImage = caseStudy.mainImageUrl || "/placeholder.jpg";

  // Get media items with fallback to imageGallery
  const mediaItems =
    caseStudy.mediaGallery && caseStudy.mediaGallery.length > 0
      ? caseStudy.mediaGallery
      : caseStudy.imageGallery?.map((item) => ({
          mediaType: "image" as const,
          imageUrl: item.imageUrl,
          alt: item.alt,
          caption: item.caption,
        })) || [];

  const resultBackdrop =
    mediaItems.length > 1
      ? (mediaItems[1].mediaType === "image"
          ? mediaItems[1].imageUrl
          : mediaItems[1].videoUrl) || heroImage
      : heroImage;

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
    <>
      <section className="relative h-[95vh] overflow-hidden">
        <HamburgerGradientMenu />
        {/* === Added minimap like Plain === */}
        <LineMinimap navPoints={navPoints} />

        {/* Background Image with Overlay */}
        {caseStudy.mainVideoUrl ? (
          <HeaderImageVideoComp
            useVideo={true}
            videoSrc={caseStudy.mainVideoUrl}
            enableParallax={true}
            opacity="opacity-100"
          />
        ) : (
          <HeaderImageVideoComp
            useVideo={false}
            imageSrc={heroImage}
            enableParallax={true}
            opacity="opacity-100"
          />
        )}

        {/* Hero Content */}
        <div id={t.ids.top} className="" />
        <div className="relative z-10 container mt-[30vh] mx-auto p-8 md:p-0">
          <StaggeredSlideUp
            delay={1}
            className="max-w-full flex flex-col md:gap-0 md:max-w-1/3 border-l-2 border-white/50 pl-4"
          >
            <h1 className="text-neutral-50 pb-2 text-7xl">{caseStudy.title}</h1>
            {caseStudy.subtitle && (
              <h2 className="text-neutral-50 pb-2 text-3xl">
                {caseStudy.subtitle}
              </h2>
            )}
            {caseStudy.description && (
              <h3 className="text-neutral-50 pb-2 text-2xl">
                {caseStudy.description}
              </h3>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>

      {/* Intro Section */}
      <div
        id={t.ids.intro}
        className="grid grid-cols-12 z-1 mx-auto container relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-16 col-start-1 container mx-auto row-start-1 grid-cols-12">
          <div className="z-1 col-span-16 col-start-1">
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={100}
                className="max-w-2/4 py-32"
              >
                <h2 className="text-xl leading-none text-neutral-700 pb-3 font-aspekta font-medium">
                  {t.caseStudy.theChallenge}
                </h2>
                <h2 className="text-5xl leading-none text-neutral-700 font-aspekta font-medium">
                  {caseStudy.title}
                </h2>
                {caseStudy.description && (
                  <h2 className="text-5xl leading-none text-neutral-300 pb-3 font-aspekta font-medium">
                    {caseStudy.description}
                  </h2>
                )}
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section  */}
      <div
        id={t.ids.content}
        className="grid grid-cols-12 z-1 mx-auto bg-neutral-50 mt-8 min-h-[90vh] relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={t.badges.intro}
            subtitle={t.badges.theGoal}
            numberEl={"001"}
          />

          <div className="col-span-10 col-start-3">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-7xl leading-compress text-gray-900 max-w-lg tracking-tight leading-tighter mb-8">
                {caseStudy.title}
              </h2>
              {caseStudy.description && (
                <p className="text-lg text-gray-900 font-medium max-w-2xs mx-auto">
                  {caseStudy.description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {/* Challenge and Solution section - dynamic from Sanity */}
          {(caseStudy.services && caseStudy.services.length > 0) ||
          (caseStudy.challenges && caseStudy.challenges.length > 0) ? (
            <>
              <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-900">
                <CtaMiniComponent
                  heading={
                    caseStudy.challenges && caseStudy.challenges.length > 0
                      ? t.caseStudy.challenge
                      : t.caseStudy.services
                  }
                  paragraph={
                    caseStudy.challenges && caseStudy.challenges.length > 0
                      ? t.caseStudy.challengeDescription
                      : `${t.caseStudy.servicesDescription} ${caseStudy.services?.map((s) => s.name).join(", ")}`
                  }
                  buttonText=""
                  buttonVariant="limesmall"
                  align="left"
                />
              </div>
              <div className="col-span-5 col-start-5 mt-8">
                <ListContainerComponent>
                  {caseStudy.challenges && caseStudy.challenges.length > 0
                    ? caseStudy.challenges.map((challenge, idx) => (
                        <ListItemComponent
                          key={idx}
                          size="small"
                          fontWeight="normal"
                          color="black"
                        >
                          {challenge}
                        </ListItemComponent>
                      ))
                    : caseStudy.services?.map((service) => (
                        <ListItemComponent
                          key={service._id}
                          size="small"
                          fontWeight="normal"
                          color="black"
                        >
                          {service.name}
                        </ListItemComponent>
                      ))}
                </ListContainerComponent>
                {caseStudy.solution && (
                  <StaggeredSlideUp
                    className="flex flex-col mt-8 items-start justify-start"
                    delay={0.7}
                    staggerDelay={0.1}
                    duration={0.5}
                    distance={80}
                  >
                    <h2 className="text-2xl leading-compress text-gray-900 max-w-lg font-semibold tracking-tight leading-tighter mb-8">
                      {t.caseStudy.solution}
                    </h2>
                    <p className="text text-gray-900 mx-auto">
                      {caseStudy.solution}
                    </p>
                  </StaggeredSlideUp>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Approach Section (with image) */}
      <div
        id={t.ids.approach}
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        {mediaItems.length > 0 &&
        mediaItems[0].mediaType === "video" &&
        mediaItems[0].videoUrl ? (
          <HeaderImageVideoComp2
            useVideo={true}
            videoSrc={mediaItems[0].videoUrl}
            enableParallax={false}
          />
        ) : (
          <HeaderImageVideoComp2
            useVideo={false}
            imageSrc={mediaItems[0]?.imageUrl || heroImage}
            enableParallax={false}
          />
        )}

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={t.caseStudy.approach}
            subtitle={t.caseStudy.approachSubtitle}
            numberEl={"002"}
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
                Stores
              </h2>
              <h2 className="text-5xl text-gray-100 max-w-xl font-semibold tracking-tight leading-compress mb-4">
                that work harder:
              </h2>
              <p className="text-xl text-gray-100 max-w-2xs mx-auto">
                {t.caseStudy.approachDescription}
              </p>
            </StaggeredSlideUp>
          </div>
          {caseStudy.approachToSolution ? (
            <div className="col-span-5 col-start-3 mt-8 border-t border-white pt-4">
              <ListContainerComponent>
                <ListItemComponent size="small" fontWeight="normal">
                  {caseStudy.approachToSolution}
                </ListItemComponent>
              </ListContainerComponent>
            </div>
          ) : (
            <div className="col-span-5 col-start-3 mt-8 border-t border-white pt-4">
              <ListContainerComponent>
                <ListItemComponent size="small" fontWeight="normal">
                  Our Store revamp has delivered strong results; expanding
                  reach, increasing traffic, and driving deeper engagement
                  through rich media and brand storytelling. This is reflected
                  in higher visits, longer dwell time, and increased sales,
                  particularly through organic channels.
                </ListItemComponent>
                <ListItemComponent size="small" fontWeight="normal">
                  While conversion rates are slightly down YoY, this aligns with
                  the broader, awareness-based nature of organic Store traffic
                  and reduced targeted paid media in EU5.
                </ListItemComponent>
              </ListContainerComponent>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div
        id={t.ids.results}
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          opacity={0.7}
          imageSrc={resultBackdrop}
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text={t.caseStudy.results}
            subtitle={t.caseStudy.resultsSubtitle}
            numberEl={"003"}
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
                {t.caseStudy.results}
              </h2>
              <p className="text-xl text-gray-100 max-w-2xs mx-auto">
                {t.caseStudy.resultsDescription}
              </p>
            </StaggeredSlideUp>
          </div>

          {/* Metrics grid - uses data from Sanity, maps over any number of metrics */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <div className="col-span-12 flex justify-between col-start-1 bg-neutral-900/60 backdrop-blur-lg gap-4 p-12 rounded-xl">
              {caseStudy.metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start border-b border-white/10 flex-1"
                >
                  {getDiagramComponent(
                    metric.type,
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

      {/* CTA / Show Time Section */}
      <div className="grid grid-cols-12 z-1 mx-auto relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc={heroImage}
          enableParallax={true}
          className="object-top"
        />

        <div className="z-1 grid col-span-12 py-24 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12">
          <div className="col-span-3 col-start-1">
            <StaggeredSlideUp
              className="flex flex-col items-start justify-start"
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-7xl text-gray-100 font-nyghtserif font-semibold tracking-tight leading-compress pb-8">
                {t.caseStudy.showTime}
              </h2>
              <p className="text-xl text-gray-100 max-w-2xs mx-auto">
                {t.caseStudy.showTimeDescription}
              </p>
            </StaggeredSlideUp>
          </div>

          <div className="col-span-9 col-start-4 text-white">
            <p>{t.caseStudy.ctaText}</p>
            <p>{t.caseStudy.ctaDescription}</p>
            <p>Be heard – as we listen.</p>
            <p className="">With the best clients and colleagues.</p>

            <div className="mt-8 flex items-start justify-start gap-8">
              <Button2
                variant="limesmall"
                text={t.caseStudy.ctaButton}
                href={`/${locale}/contact`}
                className="w-fit"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
