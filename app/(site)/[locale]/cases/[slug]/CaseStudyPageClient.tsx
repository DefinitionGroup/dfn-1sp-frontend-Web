"use client";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import AnimateNumberinView from "@/components/AnimateNumberinView";
import AnimatedPathIcon from "@/components/AnimatedPathIcon";
import Badgemodule from "@/components/Badgemodule";
import Button2 from "@/components/ui/Button2";
import GridBackground from "@/components/GridBackground";
import HeaderImageVideoComp from "@/components/HeaderImageVideoComp";
import HeaderImageVideoComp2 from "@/components/HeaderImageVideoComp2";
import StaggeredSlideUp from "@/components/StaggeredSlideUp";
import HamburgerGradientMenu from "@/components/HamburgerGradientMenu";
import ListContainerComponent from "@/components/ListContainerComponent";
import ListItemComponent from "@/components/ListItemComponent";
import CtaMiniComponent from "@/components/CtaMiniComponent";

interface CaseStudyData {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  category: string[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  logoImageUrl?: string;
  websiteUrl?: string;
  websiteUrlText?: string;
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

  return (
    <>
      <section className="relative h-[95vh] overflow-hidden">
        <HamburgerGradientMenu />

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
            imageSrc={caseStudy.mainImageUrl || "/placeholder.jpg"}
            enableParallax={true}
            opacity="opacity-100"
          />
        )}

        {/* Navigation */}
        {/* <FrontNavOverlay locale={locale} /> */}

        {/* Hero Content */}
        <div id="Top" className=""></div>
        <div className="relative z-10 container  mt-[30vh]  mx-auto p-8 md:p-0">
          <StaggeredSlideUp
            delay={1}
            className=" max-w-full flex flex-col  md:gap-0  md:max-w-1/3 border-l-2 border-white/50 pl-4"
          >
            <h1 className="text-neutral-50  pb-2 text-7xl ">
              {caseStudy.title}
            </h1>
            {caseStudy.subtitle && (
              <h2 className="text-neutral-50  pb-2 text-3xl ">
                {caseStudy.subtitle}
              </h2>
            )}
            {caseStudy.description && (
              <h3 className="text-neutral-50  pb-2 text-2xl">
                {caseStudy.description}
              </h3>
            )}
          </StaggeredSlideUp>
        </div>

        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium  -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>

      {/* Intro Section */}
      <div
        id="Intro"
        className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-16 col-start-1 ">
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={100}
                className=" max-w-2/4 py-32 "
              >
                <h2 className="text-xl leading-none text-neutral-700 pb-3 font-aspekta font-medium">
                  The Challenge
                </h2>
                <h2 className="text-5xl leading-none text-neutral-700 font-aspekta font-medium">
                  {caseStudy.title}
                </h2>
                {caseStudy.description && (
                  <h2 className="text-5xl leading-none text-neutral-300  pb-3 font-aspekta font-medium">
                    {caseStudy.description}
                  </h2>
                )}
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        id="Content"
        className="grid grid-cols-12 z-1 mx-auto bg-neutral-50 mt-8 min-h-[90vh] relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2 sticky top-0 "
            text="Intro"
            subtitle="The Goal"
            numberEl={"001"}
          />
          <div className="col-span-10 col-start-3  ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-7xl leading-compress text-gray-900 max-w-lg tracking-tight leading-tighter mb-8">
                {caseStudy.title}
              </h2>
              {caseStudy.description && (
                <p className="text-lg text-gray-900 font-medium  max-w-2xs mx-auto">
                  {caseStudy.description}
                </p>
              )}
            </StaggeredSlideUp>
          </div>

          {caseStudy.category && caseStudy.category.length > 0 && (
            <>
              <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-900 ">
                <CtaMiniComponent
                  heading="Categories:"
                  paragraph={`This case study covers ${caseStudy.category.join(", ")}`}
                  buttonText=""
                  buttonVariant="limesmall"
                  align="left"
                />
              </div>
              <div className="col-span-5 col-start-5 mt-8 ">
                <ListContainerComponent>
                  {caseStudy.category.map((cat) => (
                    <ListItemComponent
                      key={cat}
                      size="small"
                      fontWeight="normal"
                      color="black"
                    >
                      {cat}
                    </ListItemComponent>
                  ))}
                </ListContainerComponent>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Approach Section with Image */}
      {caseStudy.imageGallery && caseStudy.imageGallery.length > 0 && (
        <div
          id="Approach"
          className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
        >
          <HeaderImageVideoComp2
            useVideo={false}
            imageSrc={caseStudy.imageGallery[0]?.imageUrl || "/placeholder.jpg"}
            enableParallax={false}
          />

          <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
            <Badgemodule
              className="col-span-2 sticky top-0"
              text="Approach"
              subtitle="What we achieved"
              numberEl={"002"}
            />

            <div className="col-span-10 col-start-3 ">
              <StaggeredSlideUp
                className="flex flex-col  items-start justify-start "
                delay={0.0}
                staggerDelay={0.1}
                duration={0.5}
                distance={80}
              >
                <h2 className="text-9xl mb-2 text-gray-100 max-w-xl font-semibold tracking-tight leading-compress ">
                  Our
                </h2>
                <h2 className="text-5xl text-gray-100 max-w-xl font-semibold tracking-tight leading-compress mb-4 ">
                  Approach
                </h2>
                {caseStudy.description && (
                  <p className="text-xl text-gray-100  max-w-2xs mx-auto">
                    {caseStudy.description}
                  </p>
                )}
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div
        id="Results"
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          opacity={0.6}
          imageSrc={
            caseStudy.imageGallery && caseStudy.imageGallery.length > 1
              ? caseStudy.imageGallery[1]?.imageUrl
              : caseStudy.mainImageUrl || "/placeholder.jpg"
          }
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text="Results"
            subtitle="What we achieved"
            numberEl={"003"}
          />

          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-9xl mb-2 text-gray-100 max-w-xl font-semibold tracking-tight leading-compress ">
                Results
              </h2>
              <p className="text-xl text-gray-100  max-w-2xs mx-auto">
                Building awareness, expanding consideration, and ultimately
                driving more sales.
              </p>
            </StaggeredSlideUp>
          </div>

          {/* Sample metrics - you can customize these based on your needs */}
          <div className="col-span-9 flex justify-between col-start-3 gap-4  ">
            <div>
              <motion.div
                className="text-[8px] font-bold  self-end text-gray-100"
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
                  number={21}
                  format={{ minimumIntegerDigits: 2 }}
                  suffix="%"
                  className="text-8xl font-light tracking-tighter"
                  delay={300}
                />
              </motion.div>
              <StaggeredSlideUp
                className="flex  items-center justify-center "
                delay={0.0}
                staggerDelay={0.1}
                duration={0.5}
                distance={80}
              >
                <AnimatedPathIcon
                  delay={500}
                  duration={1.5}
                  strokeColor="white"
                  strokeWidth={1}
                />
                <h2 className="text-l text-gray-100 font-semibold tracking-tight leading- ">
                  Growth
                </h2>
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="grid grid-cols-12 z-1 mx-auto  relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc={caseStudy.mainImageUrl || "/placeholder.jpg"}
          enableParallax={true}
          className="object-top"
        />

        <div className="z-1 grid col-span-12 py-24 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="col-span-3  col-start-1 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-7xl text-gray-100  font-nyghtserif font-semibold tracking-tight leading-compress pb-8">
                Show&nbsp;Time
              </h2>
              <p className="text-xl text-gray-100  max-w-2xs mx-auto">
                Turn & Burn around Ideas, Deadlines, Campaigns.
              </p>
            </StaggeredSlideUp>
          </div>

          <div className="col-span-9 col-start-4  text-white ">
            <p>Touch the hearts and minds of audiences.</p>
            <p>
              Use the newest tools. Bring in your ideas. Work with top tier
              clients.
            </p>
            <p>Be heard – as we listen.</p>
            <p className="">With the best clients and colleagues.</p>

            <div className="mt-8 flex items-start justify-start gap-8">
              <Button2
                variant="limesmall"
                text="Join us for a ride"
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
