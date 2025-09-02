"use client";
import { useRef } from "react";
import { useInView } from "motion/react";
import LogoCarousel from "../components/LogoCarousel";
import { Typewriter } from "motion-plus/react";
import CtaMiniComponent from "../components/CtaMiniComponent";
import ListContainerComponent from "../components/ListContainerComponent";
import ListItemComponent from "../components/ListItemComponent";
import TextReveal from "../components/CursortrailExample";
import ScrollHighlight from "../components/ScrollHighlight";
import ArrowBig from "../components/arrowBig";
import Image from "next/image";
import Badgemodule from "@/app/components/Badgemodule";
import Button2 from "@/app/components/Button2";
import ExpandableCards from "@/app/components/ExpandableCards";
import Footer from "@/app/components/Footer";
import FooterBottom from "@/app/components/FooterBottom";
import FrontNavOverlay from "@/app/components/FrontNavOverlay";
import GridBackground from "@/app/components/GridBackground";
import HeaderImageVideoComp from "@/app/components/HeaderImageVideoComp";
import InteractiveCarousel from "@/app/components/InteractiveCarousel";
import { Nav } from "@/app/components/Nav";
import StaggeredSlideUp from "@/app/components/StaggeredSlideUp";
import TextHeadlineCombo from "@/app/components/TextHeadlineCombo";
import TextLayout from "@/app/components/TextLayout";
import TypewriterChangeContentExample from "@/app/components/TyperwriterHeadline";
import HeaderImageVideoComp2 from "@/app/components/HeaderImageVideoComp2";
import PeopleShowcaseHero from "@/app/components/PeopleShowcaseHero";
export default function Home() {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);
  return (
    <>
      <Nav />
      <section className="relative h-[95vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <HeaderImageVideoComp
          useVideo={true}
          videoSrc="/video/cases/squareenix.mp4"
          enableParallax={true}
          opacity="opacity-75"
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}

        <div className="relative z-10 container top-[200px]  mx-auto ">
          <StaggeredSlideUp className="space-y-6 max-w-full ">
            <h1 className="text-neutral-50  pb-2 text-9xl border-b font-bold  max-w-1/3">
              SquareEnix
            </h1>{" "}
            <p className="text-neutral-50 text-xl  max-w-1/3">
              We are group of several laser focused agencies. Each one with a
              distinctive competetive edge.
            </p>
            <div className="flex items-center gap-4 border border-white/50 rounded-sm px-6 py-3 w-fit">
              <Image
                src="/msmlogo.svg"
                alt="SquareEnix"
                className=" h-auto "
                width={20}
                height={20}
              />
              <p className="text-neutral-50 upppercase text-xs tracking-wider font-bold max-w-1/3">
                MSM.Digital
              </p>
            </div>
          </StaggeredSlideUp>
        </div>
        {/* Vertical Lines */}
        {/* <div className="absolute top-0 left-[1321px] w-px h-full bg-neutral-50/50" />
        <div className="absolute top-0 left-[1033px] w-px h-full bg-neutral-50/50" /> */}
        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xs font-medium  -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>

      {/* subline rightection */}
      <div className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta">
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-3  col-start-10 ">
            {/* Description and CTA Section */}
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              {/* Description */}
              <p className="text-xs leading-normal text-neutral-800 font-aspekta font-normal">
                At 1SP, our passionate team thrives on creativity and
                innovation, crafting outstanding marketing campaigns that
                genuinely resonate with audiences.
              </p>

              {/* CTA Button */}
              <Button2
                variant="limesmall"
                text="Contact us"
                className="w-fit"
              />
            </div>
          </div>
        </div>
      </div>

      {/* We tell your Story */}
      <div className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc="/s3.png"
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Story"
            subtitle="What we do"
            numberEl={"003"}
          />

          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
              <h2 className="text-9xl text-gray-100 max-w-xl font-semibold tracking-tight leading-compress mb-4 pb-8">
                We tell your story.
              </h2>
              <p className="text-body-lg text-gray-100  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100 ">
            <CtaMiniComponent
              heading="We use Gaming Experience"
              paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
              buttonText="Explore"
              buttonVariant="limesmall"
              align="left"
            />
          </div>
          <div className="col-span-9 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent size="medium" fontWeight="">
                From Game and Retail.
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="">
                helping world-class brands create ground-breaking stuff
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="">
                helping world-class
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>

      {/* People Gallery Section */}
      <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta gap-4  ">
        <GridBackground />
        <div className="z-1 flex flex-col col-span-2 pt-32 justify-start items-start  col-start-1 mx-auto row-start-1">
          <Badgemodule
            text="Our Story"
            subtitle="What we do"
            numberEl={"007"}
          />
          <ArrowBig animate={true} size={230} className=" my-16 pr-32 pt-32" />
          <CtaMiniComponent
            className="pt-32 max-w-1/2"
            heading="Ideas."
            paragraph="At 1sp, our dedicated team is fueled by creativity and innovation, designing exceptional marketing campaigns that truly connect with audiences."
          />
        </div>
        <div className="col-span-12 container col-start-3 row-start-1 grid grid-cols-12 gap-4  pt-32  ">
          <header className="col-span-3 col-start-1  border-t ">
            {/* Headlines */}
            <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
              {/* Main Headline */}
              <div className="flex-1 flex flex-col min-w-0">
                <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                  Super*
                </h2>
                <h4 className="text-7xl  text-neutral-900 font-semibold leading-compress font-aspekta">
                  Human Touch
                </h4>
              </div>
            </div>
          </header>

          <div className="col-span-8 col-start-4  border-t pt-8  ">
            <ListContainerComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                We are 350 Experts.
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                Connected by one vision. Perfoming your mission.
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                From longstanding veterans to fresh talents. The best of both
                worlds.
              </ListItemComponent>
            </ListContainerComponent>
          </div>
          <div className="col-span-12  col-start-1 ">
            <PeopleShowcaseHero />
          </div>
          <header className="col-span-3 col-start-1 ">
            {/* Headlines */}
            <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
              {/* Main Headline */}
              <div className="flex-1 flex flex-col min-w-0">
                <h2 className="text-3xl text-neutral-900 f font-aspekta">
                  Igniting Creativity:{" "}
                </h2>
                <h4 className="text-3xl  text-neutral-900  font-aspekta">
                  <span className="text-neutral-200">Unique People.</span>
                </h4>
              </div>
            </div>
          </header>
          <header className="col-span-6 col-start-4  ">
            <h2 className="text-base text-neutral-900 font-aspekta">
              At 1sp, we are driven by a team of passionate individuals who
              thrive on creativity and innovation, crafting unique marketing
              campaigns that resonate with audiences.
            </h2>
          </header>
        </div>
      </div>

      {/* Visual Background 2 Section */}
      <div
        id="Step3"
        className="grid grid-cols-12 z-1 mx-auto  mt-8 min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/cases/squareenix.mp4"
          enableParallax={true}
          opacity={0.1}
        />

        <div className="z-1 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Story"
            subtitle="What we do"
            numberEl={"002"}
          />
          <div className="col-span-10 col-start-3  ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
              <h2 className="text-9xl leading-compress text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                We tell your story.
              </h2>
              <p className="text-lg text-gray-100 font-medium  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100 ">
            <CtaMiniComponent
              heading="Our roots are gaming."
              paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
              buttonText="Explore"
              buttonVariant="limesmall"
              align="left"
            />
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent size="medium" fontWeight="bold">
                Super*
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="bold">
                helping world-class brands create ground-breaking stuff
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                helping world-class
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>
      {/* Visual Background 2 Section */}
      <div className="grid grid-cols-12 z-1 mx-auto bg-neutral-100 mt-8 min-h-[90vh] relative font-aspekta">
        <div className="z-1 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Story"
            subtitle="What we do"
            numberEl={"012"}
          />
          <div className="col-span-10 col-start-3  ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
              <h2 className="text-7xl leading-compress text-gray-900 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                We tell your story.
              </h2>
              <p className="text-lg text-gray-900 font-medium  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-900 ">
            <CtaMiniComponent
              heading="Our roots are gaming."
              paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
              buttonText="Explore"
              buttonVariant="limesmall"
              align="left"
            />
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent size="small" fontWeight="bold" color="black">
                Super*
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="bold" color="black">
                helping world-class brands create ground-breaking stuff
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="bold" color="black">
                helping world-class
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>
      {/* Unified engagement O */}

      <div className="grid grid-cols-12 z-1 gap-8  mx-auto  relative container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12  relative top-0 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Units"
            subtitle="Services"
            numberEl={1}
          />

          <div className="col-span-9 col-start-3 row-start-1 ">
            <TextHeadlineCombo
              eyebrow="Overview"
              headline="Unified Engagement"
              highlight="OS"
              subhead="A modular interaction layer bridging real‑time data, progression & storytelling dynamics."
              kicker="Latency <40ms · Active Retention 68%"
              align="left"
              size="xl"
            />
          </div>
        </div>
      </div>
      {/* Portfolio Grid */}
      <div className="z-1 grid gap-8 col-span-12 col-start-1 container mx-auto row-start-1 grid-cols-12 mb-32">
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid col-span-12 gap-4 col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Units"
            subtitle="Services"
            numberEl={"005"}
          />

          <div className="col-span-9 col-start-3  ">
            <ExpandableCards />
          </div>

          <Badgemodule
            className="col-span-2 col-start-1 mt-16"
            text="Results"
            subtitle="What we achieved"
            numberEl={"005"}
          />

          <div className="col-span-9  col-start-3 mt-32">
            <TextLayout
              width="full"
              padded={false}
              eyebrow="METRICS"
              title="Improved "
              highlight="Experiences"
              subtitle="Bridging interactive engagement & scalable infrastructure."
              lead="We design modular experiential systems that unify gaming dynamics, marketing funnels, and real-time data insights."
              paragraphs={[
                "Our approach starts from core player motivations— translating intent into progressive interaction loops.",
                "Through layered narrative states and adaptive UI motion, we maintain momentum while surfacing actionable context.",
              ]}
              bullets={[
                "Progressive onboarding",
                "Behavioral telemetry",
                "Realtime segmentation",
                "Composable reward layer",
              ]}
              stats={[
                { label: "Avg. Retention", value: 68, suffix: "%" },
                { label: "Latency", value: "<40", suffix: "ms" },
                { label: "Avg. Retention", value: 68, suffix: "%" },
                { label: "Latency", value: "<40", suffix: "ms" },
                { label: "Avg. Retention", value: 68, suffix: "%" },
                { label: "Latency", value: "<40", suffix: "ms" },
              ]}
              align="left"
              split
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      {/* Footer Bottom */}
      <FooterBottom />
    </>
  );
}
