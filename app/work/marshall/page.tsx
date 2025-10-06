"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo, useInView } from "motion/react";
import Image from "next/image";
import { AnimateNumber } from "motion-plus/react";
import AnimateNumberinView from "@/app/components/AnimateNumberinView";
import AnimatedPathIcon from "@/app/components/AnimatedPathIcon";
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
import { Typewriter } from "motion-plus/react";
import TextReveal from "@/app/components/CursortrailExample";
import ScrollHighlight from "@/app/components/ScrollHighlight";
import ListContainerComponent from "@/app/components/ListContainerComponent";
import ListItemComponent from "@/app/components/ListItemComponent";
import CtaMiniComponent from "@/app/components/CtaMiniComponent";
import { ArrowRight } from "@phosphor-icons/react";
import ArrowBig from "@/app/components/arrowBig";
import ExpandableCards2 from "@/app/components/ExpandableCards2";
import LogoCarousel from "@/app/components/LogoCarousel";
import WarpOverlay from "@/app/components/overlayNav";
import HamburgerGradientMenu from "@/app/components/HamburgerGradientMenu";
import LineMinimap from "@/app/components/MapVertical";
import CircularDashedGauge from "@/app/components/dataPointerRadial";

export default function Home() {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);
  const [navPoints, setNavPoints] = useState<string[]>([]);

  // Function to collect all IDs from the page
  const collectPageIds = () => {
    // Wait for the DOM to be fully rendered
    setTimeout(() => {
      const allElements = document.querySelectorAll("[id]");
      const ids: string[] = [];

      allElements.forEach((element) => {
        const id = element.id;
        // Filter out IDs that are likely from components or not main sections
        // Only include IDs that are likely to be main page sections
        if (
          id &&
          !id.startsWith("headlessui-") && // Exclude headless UI IDs
          !id.startsWith("radix-") && // Exclude radix UI IDs
          !id.startsWith("__") && // Exclude internal IDs
          !id.startsWith("_") && // Exclude IDs starting with underscore
          id !== "_R_" && // Exclude specific unwanted ID
          id.length > 2 && // Exclude very short IDs
          !/^\d+$/.test(id) && // Exclude numeric-only IDs
          // Allow IDs with hyphens as they are common for section names
          id !== "root" // Exclude root element
        ) {
          ids.push(id);
        }
      });

      // Keep the DOM order instead of sorting alphabetically
      const uniqueIds = [...new Set(ids)]; // Remove duplicates while preserving order
      console.log("Collected navPoints (DOM order):", uniqueIds); // Debug log
      console.log("All found IDs:", ids); // Debug log
      setNavPoints(uniqueIds);
    }, 500); // Increased delay to ensure DOM is ready
  };

  useEffect(() => {
    console.log("useEffect running, collecting page IDs...");
    collectPageIds();
  }, []);

  return (
    <>
      <section className="relative h-[95vh] overflow-hidden">
        <HamburgerGradientMenu />

        <LineMinimap navPoints={navPoints} />
        {/* Background Image with Overlay */}
        <HeaderImageVideoComp
          useVideo={true}
          videoSrc="/video/atf.mp4"
          enableParallax={true}
          opacity="opacity-100"
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}
        <div id="Top" className=""></div>
        <div className="relative z-10 container  mt-[30vh]  mx-auto p-8 md:p-0">
          <StaggeredSlideUp
            delay={1}
            className=" max-w-full flex flex-col gap-8 md:gap-0"
          >
            <h1 className="text-neutral-50  pb-2 text-9xl max-w-1/3">
              Marshall
            </h1>{" "}
            <h2 className="text-neutral-50  pb-2 text-5xl max-w-1/3">
              Turning up the Noise on Amazon
            </h2>{" "}
            <h3 className="text-neutral-50  pb-2 text-3xl max-w-1/3">
              Expanding reach, increasing traffic, and driving deeper engagement
              through Amazon Stores globally.
            </h3>{" "}
          </StaggeredSlideUp>
        </div>
        {/* Vertical Lines */}
        {/* <div className="absolute top-0 left-[1321px] w-px h-full bg-neutral-50/50" />
        <div className="absolute top-0 left-[1033px] w-px h-full bg-neutral-50/50" /> */}
        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xxs font-medium  -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-xxs text-eyebrow font-medium">
          / 1SP
        </div>
      </section>

      {/* ////////// id Intro */}
      <div
        id="Intro"
        className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta"
      >
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-16 col-start-1 ">
            {/* Description and CTA Section */}
            <div className="flex flex-col items-start gap-8 justify-center w-full">
              <StaggeredSlideUp
                delay={0.59}
                staggerDelay={0.03}
                distance={100}
                className=" max-w-2/4 py-32 "
              >
                {" "}
                <h2 className="text-xl leading-none text-neutral-700 pb-3 font-aspekta font-medium">
                  The Challenge
                </h2>
                <h2 className="text-5xl leading-none text-neutral-700 font-aspekta font-medium">
                  Transform the User Experience
                </h2>
                <h2 className="text-5xl leading-none text-neutral-300  pb-3 font-aspekta font-medium">
                  and Sales Potential of Amazon Stores
                </h2>
              </StaggeredSlideUp>
              {/* Description */}
            </div>
          </div>
        </div>
      </div>

      {/* //////////// Start Content */}

      <div
        id="Intro"
        className="grid grid-cols-12 z-1 mx-auto bg-neutral-50 mt-8 min-h-[90vh] relative font-aspekta"
      >
        {" "}
        <GridBackground />
        <div className="z-1 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
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
              <h2 className="text-7xl leading-compress text-gray-900 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                Music for our ears.
              </h2>
              <p className="text-lg text-gray-900 font-medium  max-w-2xs mx-auto">
                Our goal was to bring the full Marshall product range, including
                Amps integration, to consumers across 9 regions.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-900 ">
            <CtaMiniComponent
              heading="Challenge:"
              paragraph="The Starting Point. A thorough analysis and understanding of the existing Stores highlighted several key issues:"
              buttonText=""
              buttonVariant="limesmall"
              align="left"
            />
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                The Stores were fragmented
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                The user experience wasn’t clear
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                They lacked educational content to introduce new customers to
                both Marshall’s heritage and our product line.
              </ListItemComponent>
            </ListContainerComponent>
            <StaggeredSlideUp
              className="flex flex-col mt-8   items-start justify-start "
              delay={0.7}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-3xl leading-compress text-gray-900 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                Solution
              </h2>
              <p className="text-lg text-gray-900 font-medium   mx-auto">
                To maximize the potential of Stores, we rebuilt them to strike
                the right balance between educational, interactive, and engaging
                content — while also embedding strong purchase and cross-sell
                opportunities throughout.
              </p>
            </StaggeredSlideUp>
          </div>
        </div>
      </div>

      {/* ////////////// Approach */}
      <div
        id="Approach"
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc="/case-marshall.jpg"
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
                Stores
              </h2>
              <h2 className="text-5xl text-gray-100 max-w-xl font-semibold tracking-tight leading-compress mb-4 ">
                that work harder:
              </h2>
              <p className="text-xl text-gray-100  max-w-2xs mx-auto">
                Building awareness, expanding consideration, and ultimately
                driving more sales.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-5 col-start-3 mt-8 border-t border-white pt-4">
            <ListContainerComponent>
              <ListItemComponent size="small" fontWeight="normal">
                Our Store revamp has delivered strong results; expanding reach,
                increasing traffic, and driving deeper engagement through rich
                media and brand storytelling. This is reflected in higher
                visits, longer dwell time, and increased sales, particularly
                through organic channels.
              </ListItemComponent>
              <ListItemComponent size="small" fontWeight="normal">
                While conversion rates are slightly down YoY, this aligns with
                the broader, awareness-based nature of organic Store traffic and
                reduced targeted paid media in EU5.
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>

      {/* /////////// RESULTS */}
      <div
        id="Results"
        className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          opacity={0.6}
          imageSrc="/headband_reactivation_2025_banner_plp_hero_desktop.avif"
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

          <div className="col-span-9 flex justify-between col-start-3 gap-4  ">
            <div>
              <motion.p
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
              </motion.p>
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
                />{" "}
                <h2 className="text-l text-gray-100 font-semibold tracking-tight leading- ">
                  Organic Sales
                </h2>
              </StaggeredSlideUp>
            </div>
            <div>
              <motion.p
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
                  delay={500}
                />
              </motion.p>
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
                />{" "}
                <h2 className="text-l text-gray-100 font-semibold tracking-tight leading-compress  ">
                  Dwell Time
                </h2>
              </StaggeredSlideUp>
            </div>
            <div>
              <motion.p
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
                  number={20}
                  format={{ minimumIntegerDigits: 2 }}
                  suffix="%"
                  className="text-8xl font-light tracking-tighter"
                  delay={700}
                />
              </motion.p>
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
                />{" "}
                <h2 className="text-l text-gray-100 font-semibold tracking-tight leading-compress  ">
                  Store Views
                </h2>
              </StaggeredSlideUp>
            </div>

            <div>
              <motion.p
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
                  number={36}
                  format={{ minimumIntegerDigits: 2 }}
                  suffix="%"
                  className="text-8xl font-light tracking-tighter"
                  delay={900}
                />
              </motion.p>
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
                />{" "}
                <h2 className="text-l text-gray-100 font-semibold tracking-tight leading-compress  ">
                  Home Page Sales
                </h2>
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>
      {/* SHOWTIME  GALLERY */}
      <div
        id="Level Up!"
        className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta"
      >
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid  col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            text="Level Up!"
            className="col-span-2"
            subtitle="Client Stories"
            numberEl={"004"}
          />

          <div className="col-span-10 col-start-3 ">
            <h2 className="text-7xl  text-gray-800 pr-2 mb-2">
              <Typewriter
                ref={typewriterref}
                play={isInView}
                speed="fast"
                cursorStyle={{ backgroundColor: "transparent" }}
                variance={0.8}
                backspace="word"
              >
                Showtime!
              </Typewriter>
            </h2>

            <StaggeredSlideUp
              className="flex flex-col items-start font-normal justify-start "
              delay={0.0}
              debug={false}
              easing="smooth"
              staggerDelay={0.1}
              duration={0.5}
              distance={20}
            >
              <p className="text text-gray-500 leading-[1.12]  ">
                Discover our hottest projects in
              </p>
              <p className="text text-gray-500 leading-snug">
                marketing, gaming and interactive experiences.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12 col-start-1 mt-8 ">
            <InteractiveCarousel />
            {/* <div className="flex container max-w-3xl justify-center gap-8 mx-auto  ">

     <CircularDashedGauge percentage={75} size={222} strokeWidth={1} />
     <CircularDashedGauge percentage={35} size={222} strokeWidth={1} />
     <CircularDashedGauge percentage={45} size={222} strokeWidth={1} />
            </div> */}
          </div>
        </div>
      </div>

      {/* People Gallery Section */}
      <div
        id="People"
        className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta  "
      >
        <GridBackground />
        <div className="z-1 grid  col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text="Action"
            subtitle="What we do"
            numberEl={"004"}
          />
        </div>
        <div className="col-span-12 container  col-start-3 row-start-1 grid grid-cols-10 pt-32  ">
          <header className="col-span-3 col-start-1  border-t p-4">
            {/* Headlines */}
            <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
              {/* Main Headline */}
              <div className="flex-1 flex flex-col min-w-0">
                <h2 className="text text-gray-900 font-bold font-aspekta">
                  Super*
                </h2>
                <h4 className="text-7xl  text-gray-900  tracking-tight font-aspekta">
                  Human Touch
                </h4>
              </div>
            </div>
          </header>

          <div className="col-span-6 grid  grid-cols-12 col-start-4 gap-8  border-t pt-4  ">
            <header className="col-span-8 col-start-1  ">
              <div className="flex flex-col items-start justify-start w-full ">
                {/* Main Headline */}

                <h2 className="text-2xl text-neutral-900 font-aspekta">
                  Igniting Creativity:
                </h2>
                <h4 className="text-2xl  text-neutral-900  font-aspekta">
                  <span className="text-neutral-200">Unique People.</span>
                </h4>
              </div>
              <h3 className="text text-neutral-500 mt-4  font-aspekta">
                At 1sp, we are driven by a team of passionate individuals who
                thrive on creativity and innovation, crafting unique marketing
                campaigns that resonate with audiences.
              </h3>
            </header>{" "}
          </div>
          <div className=" col-span-8  row-start-2 col-start-4 ">
            <PeopleShowcaseHero />
          </div>
        </div>
      </div>
      {/* Visual Background 2 Section */}
      <div
        id="News"
        className="grid grid-cols-12 z-2 mx-auto bg-neutral-900 mt-8 min-h-[50vh] relative font-aspekta"
      >
        <div className="z-1 grid gap-8 col-span-12 py-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Stories"
            subtitle="Newsroom"
            numberEl={"007"}
          />
          <div className="col-span-10 col-start-3  ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-7xl leading-compress text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                News.
              </h2>
              <p className="text text-gray-100 font-medium  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>

          <div className="col-span-9 col-start-3 mt-8 ">
            <ExpandableCards2 />
          </div>
        </div>
      </div>

      {/* We tell your Story */}
      <div className="grid grid-cols-12 z-1 mx-auto  relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc="/hr.png"
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
              {" "}
              Use the newest tools. Bring in your ideas. Work with top tier
              clients.{" "}
            </p>

            <p> Be heard – as we listen. </p>
            <p className="">With the best clients and colleagues.</p>

            <p className="mt-8 flex items-start justify-start gap-8">
              <Button2
                variant="limesmall"
                text="Join us for a ride"
                className="w-fit"
              ></Button2>
            </p>
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
