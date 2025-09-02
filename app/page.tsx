"use client";
import { useRef } from "react";
import { useInView } from "motion/react";
import Badgemodule from "./components/Badgemodule";
import Button2 from "./components/Button2";
import ExpandableCards from "./components/ExpandableCards";
import Footer from "./components/Footer";
import FooterBottom from "./components/FooterBottom";
import FrontNavOverlay from "./components/FrontNavOverlay";
import GridBackground from "./components/GridBackground";
import HeaderImageVideoComp from "./components/HeaderImageVideoComp";
import InteractiveCarousel from "./components/InteractiveCarousel";
import { Nav } from "./components/Nav";
import StaggeredSlideUp from "./components/StaggeredSlideUp";
import TextHeadlineCombo from "./components/TextHeadlineCombo";
import TextLayout from "./components/TextLayout";
import TypewriterChangeContentExample from "./components/TyperwriterHeadline";
import HeaderImageVideoComp2 from "./components/HeaderImageVideoComp2";
import PeopleShowcaseHero from "./components/PeopleShowcaseHero";
import { Typewriter } from "motion-plus/react";
import TextReveal from "./components/CursortrailExample";
import ScrollHighlight from "./components/ScrollHighlight";
import ListContainerComponent from "./components/ListContainerComponent";
import ListItemComponent from "./components/ListItemComponent";
import CtaMiniComponent from "./components/CtaMiniComponent";
import { ArrowRight } from "@phosphor-icons/react";
import ArrowBig from "./components/arrowBig";
import LogoCarousel from "./components/LogoCarousel";
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
          videoSrc="/video/cases/1SP Agency - 1SP Homepage-07.mp4"
          enableParallax={true}
          opacity="opacity-25"
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}

        <div className="relative z-10 container top-[200px]  mx-auto ">
          <StaggeredSlideUp className="space-y-6 max-w-full ">
            <h1 className="text-neutral-50 uppercase pb-2 text-xs border-b font-bold  max-w-1/3">
              Welcome at 1SP
            </h1>
            <TypewriterChangeContentExample />

            <p className="text-neutral-50 text-lg  max-w-1/3">
              We are group of several laser focused agencies. Each one with a
              distinctive competetive edge.
            </p>
            <p className="text-neutral-50 text-lg">
              Together we are{" "}
              <span className="bg-gradient-to-r font-bold from-lime-300 to-lime-500 bg-clip-text text-transparent">
                one Superagency.
              </span>
            </p>
            <Button2
              variant="default"
              text="Read the Story"
              className="w-fit"></Button2>
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
        <div className="absolute bottom-0 left-0 right-0 invert py-8 container mx-auto">
          <LogoCarousel />
        </div>
      </section>

      {/* subline rightection */}
      <div className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta">
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-4  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
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

      {/* SHOWTIME  GALLERY */}
      <div className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta">
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            text="Level Up!"
            className="col-span-2"
            subtitle="Client Stories"
            numberEl={"001"}
          />

          <div className="col-span-10 col-start-3 ">
            <h2 className="text-7xl font-bold tracking-tighter pr-2 mb-4">
              <Typewriter
                ref={typewriterref}
                play={isInView}
                speed="fast"
                cursorStyle={{ backgroundColor: "transparent" }}
                variance={0.8}
                backspace="word">
                Showtime!
              </Typewriter>
            </h2>

            <StaggeredSlideUp
              className="flex flex-col items-start justify-start "
              delay={0.0}
              debug={false}
              easing="smooth"
              staggerDelay={0.1}
              duration={0.5}
              distance={40}>
              <p className="text-lg text-gray-600   ">
                Discover our latest projects in gaming,
              </p>
              <p className="text-lg text-gray-600  ">
                marketing, and interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12 col-start-1 mt-8 ">
            <InteractiveCarousel />
          </div>
        </div>
      </div>

      {/* We tell your Story */}
      <div className="grid grid-cols-12 z-1 mx-auto  relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/cases/1SP Agency - 1SP Homepage-06.mp4"
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
              <h2 className="text-9xl text-gray-100 max-w-xl font-nyghtserif font-semibold tracking-tight leading-compress mb-4 pb-8">
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
              <ListItemComponent size="medium" fontWeight="normal">
                From Game and Retail.
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                helping world-class brands create ground-breaking stuff
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                helping world-class
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>
      {/* Founders Section */}
      <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Visions"
            subtitle="The Founders"
            numberEl={"004"}
          />
          <div className="col-start-3 col-span-9">
            <TextReveal />
          </div>
        </div>
      </div>
      {/* Skills Combo Section */}
      <div
        id="Step1"
        className="z-1 mx-auto  mt-8 min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/14.mp4"
          enableParallax={true}
        />
        <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
          <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
            <Badgemodule
              className="col-span-2"
              text="Our Story"
              subtitle="What we do"
              numberEl={"003"}
            />

            <div className="col-span-9 col-start-3">
              <ScrollHighlight />
            </div>
          </div>
        </div>{" "}
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
            buttonText="Get in touch"
            buttonVariant="limesmall"
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
            text="Our Units"
            subtitle="Services"
            numberEl={"005"}
          />

          <div className="col-span-9  col-start-3 mt-32">
            <TextLayout
              width="full"
              padded={false}
              eyebrow="About"
              title="Integrated Experiences"
              highlight="Platform"
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
                "Progressive onboarding",
                "Behavioral telemetry",
                "Realtime segmentation",
                "Composable reward layer",
              ]}
              stats={[
                { label: "Avg. Retention", value: 1268, suffix: "%" },
                { label: "Latency", value: "<40", suffix: "ms" },
                { label: "Avg. Retention", value: 638, suffix: "%" },
                { label: "Latency", value: "<40", suffix: "ms" },
                { label: "Avg. Retention", value: 26, suffix: "%" },
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
