"use client";
import { Typewriter } from "motion-plus/react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Badgemodule from "./components/Badgemodule";
import Button2 from "./components/Button2";
import ExpandableCards from "./components/ExpandableCards";
import ExpandableCards2 from "./components/ExpandableCards2";
import Footer from "./components/Footer";
import FooterBottom from "./components/FooterBottom";
import FrontNavOverlay from "./components/FrontNavOverlay";
import GridBackground from "./components/GridBackground";
import HamburgerGradientMenu from "./components/HamburgerGradientMenu";
import HeaderImageVideoComp from "./components/HeaderImageVideoComp";
import HeaderImageVideoComp2 from "./components/HeaderImageVideoComp2";
import InteractiveCarousel from "./components/InteractiveCarousel";
import InteractiveCarousel2 from "./components/InteractiveCarousel2";
import ListContainerComponent from "./components/ListContainerComponent";
import ListItemComponent from "./components/ListItemComponent";
import LineMinimap from "./components/MapVertical";
import PeopleShowcaseHero from "./components/PeopleShowcaseHero";
import ScrollHighlight from "./components/ScrollHighlight";
import StaggeredSlideUp from "./components/StaggeredSlideUp";
import TypewriterChangeContentExample from "./components/TyperwriterHeadline";
import InteractiveCarousel3 from "./components/InteractiveCarousel3";
import { Link } from "next-view-transitions";

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
          opacity="opacity-50"
          videoSrc="/video/1sp_home_header_16x9.mp4"
          enableParallax={true}
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}
        <div id="Top" className=""></div>
        <div className="relative z-10 container  mt-[30vh]  mx-auto p-16 md:p-0">
          <StaggeredSlideUp className=" max-w-full flex flex-col md:gap-0">
            <h1 className="text-neutral-50 uppercase pb-2 text-xs font-bold   md:max-w-1/3">
              Welcome at 1SP
            </h1>
            <TypewriterChangeContentExample />

            <p className="text-neutral-50 text-2xl mt-2 md:max-w-1/3">
              We are group of several laser focused agencies. Each one with a
              distinctive competetive edge.
            </p>
            <p className="text-neutral-50 text-ls mt-8">
              Together we are{" "}
              <span className="bg-gradient-to-r font-bold from-lime-300 to-lime-500 bg-clip-text text-transparent">
                one Superagency.
              </span>
            </p>
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

      {/* SHOWTIME  GALLERY */}
      <div
        id="Level Up!"
        className="grid grid-cols-6 md:grid-cols-12 z-1 mx-auto container  relative font-aspekta"
      >
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid  col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            text="Level Up!"
            className="col-span-6 md:col-span-2 col-start-2 md:col-start-1"
            subtitle="Client Stories"
            numberEl={"001"}
          />

          <div className="col-span-6 md:col-span-10 col-start-2 md:col-start-3 ">
            <h2 className="text-4xl md:text-7xl  text-gray-800 pr-2 md:mb-2">
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
              className="flex flex-col items-start font-normal  justify-start "
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
          <div className="col-span-12 col-start-1 mt-8 px-8 md:px-0">
            <InteractiveCarousel />
            <div className="flex  w-fit min-w-64 justify-center mx-auto  mt-8 mb-16">
              <Link href="/cases" className="w-fit min-w-48">
                <Button2
                  text="See all Cases "
                  variant="lime"
                  className="w-fit "
                />
              </Link>
            </div>
          </div>
          <div className="col-span-12 col-start-1 mt-64 px-8 md:px-0">
            <InteractiveCarousel2 />
          </div>
          <div className="col-span-12 col-start-1 mt-64 px-8 md:px-0">
            <InteractiveCarousel3 />
          </div>
        </div>
      </div>

      {/* Skills Combo Section */}
      <div
        id="Skills"
        className="z-1 mx-auto  min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/14.mp4"
          enableParallax={true}
        />
        <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
          <div className="z-1 grid col-span-12 py-32  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
            <Badgemodule
              className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
              text="Laser Focused"
              subtitle="Our Services"
              numberEl={"002"}
            />

            <div className="col-span-9 col-start-2 mt-12 md:mt-0 md:col-start-3">
              <ScrollHighlight />
            </div>
          </div>
        </div>{" "}
      </div>

      {/* Portfolio Grid */}
      <div
        id="Services"
        className="z-4 grid col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12 "
      >
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid col-span-12 col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
            text="Experts"
            subtitle="Services"
            numberEl={"003"}
          />
          <header className="col-span-11  md:col-span-4  col-start-2 md:col-start-3 md:mt-0 mt-12 md:row-start-1 border-t border-gray-500 ">
            {/* Headlines */}
            <div className="flex flex-col items-start justify-start ">
              {/* Main Headline */}
              <div className="flex-1 flex flex-col min-w-0 w-full">
                <StaggeredSlideUp
                  className=""
                  delay={0.0}
                  debug={false}
                  easing="smooth"
                  staggerDelay={0.1}
                  duration={0.5}
                  distance={20}
                >
                  <h2 className="text text-gray-900 font-bold font-aspekta">
                    Super*
                  </h2>
                  <h4 className="text-7xl  text-gray-900  tracking-tight font-aspekta">
                    Brrrroadside
                  </h4>
                  <h4 className=" mt-2 text-gray-700 font-medium leading- font-aspekta">
                    One Strategy. Multiple Experts
                  </h4>
                </StaggeredSlideUp>
              </div>
            </div>
          </header>

          <div className="col-span-11 md:col-span-8 col-start-2 md:col-start-3 mt-12 md:mt-0 border-gray-500 pb-8 md:row-start-2 ">
            <ListContainerComponent>
              -
              <ListItemComponent
                size="small"
                fontWeight="normal"
                color="gray-500"
              >
                Full Service. From Start to End.
              </ListItemComponent>
              <ListItemComponent
                size="small"
                fontWeight="normal"
                color="gray-500"
              >
                Connected by one vision. Perfoming your mission.
              </ListItemComponent>
              <ListItemComponent
                size="small"
                fontWeight="normal"
                color="gray-500"
              >
                From longstanding veterans to fresh talents. The best of both
                worlds.
              </ListItemComponent>
            </ListContainerComponent>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-3  mt-8 mb-12 px-4 md:px-0">
            <ExpandableCards />
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
            className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
            text="Action"
            subtitle="What we do"
            numberEl={"004"}
          />
        </div>
        <div className="col-span-12 container  md:col-start-3 md:row-start-1 grid grid-cols-10 pt-32  ">
          <header className="md:col-span-3 col-start-1  col-span-12 border-t p-4">
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

          <div className="col-span-12 md:col-span-6 grid   grid-cols-12 md:col-start-4 gap-8  border-t pt-4  ">
            <header className="col-span-12 md:col-span-8 col-start-2  ">
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
          <div className="col-span-12 grid-cols-12 col-start-1  md:col-span-8  md:row-start-2 md:col-start-4 ">
            <PeopleShowcaseHero />
          </div>
        </div>
      </div>
      {/* Visual Background 2 Section */}
      <div
        id="News"
        className="grid grid-cols-12 z-2 mx-auto bg-neutral-100 mt-8 min-h-[50vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/cases/squareenix.mp4"
          enableParallax={true}
          opacity={0.1}
        />

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
