"use client";
import { Typewriter } from "motion-plus/react";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Badgemodule from "../components/Badgemodule";
import Button2 from "../components/Button2";
import ExpandableCards from "../components/ExpandableCards";
import ExpandableCards2 from "../components/ExpandableCards2";
import Footer from "../components/Footer";
import FooterBottom from "../components/FooterBottom";
import FrontNavOverlay from "../components/FrontNavOverlay";
import GridBackground from "../components/GridBackground";
import HamburgerGradientMenu from "../components/HamburgerGradientMenu";
import HeaderImageVideoComp from "../components/HeaderImageVideoComp";
import HeaderImageVideoComp2 from "../components/HeaderImageVideoComp2";
import InteractiveCarousel from "../components/InteractiveCarousel";
import ListContainerComponent from "../components/ListContainerComponent";
import ListItemComponent from "../components/ListItemComponent";
import LineMinimap from "../components/MapVertical";
import PeopleShowcaseHero from "../components/PeopleShowcaseHero";
import ScrollHighlight from "../components/ScrollHighlight";
import StaggeredSlideUp from "../components/StaggeredSlideUp";
import TypewriterChangeContentExample from "../components/TyperwriterHeadline";

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
      <section className="relative h-[55vh] overflow-hidden">
        <HamburgerGradientMenu />

        <LineMinimap navPoints={navPoints} />

        {/* Background Image with Overlay */}
        <HeaderImageVideoComp
          useVideo={true}
          opacity="opacity-50"
          videoSrc="/video/6.mp4"
          enableParallax={true}
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}
        <div id="Top" className=""></div>
        <div className="relative z-10 container  mx-auto px-16 md:p-0">
          <div className="grid grid-cols-12 z-1 mx-auto container  relative font-aspekta">
            <div className="z-1 grid  col-span-12 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
              <div className="z-1 col-span-16  mt-32 w-full col-start-1 ">
                {/* Description and CTA Section */}
                <div className="flex flex-col items-start gap-8 justify-end w-full">
                  <StaggeredSlideUp
                    delay={0.59}
                    staggerDelay={0.03}
                    distance={100}
                    className=" max-w-2/4 "
                  >
                    {" "}
                    <h1 className="text-7xl leading-none text-neutral-100 pb-3 font-aspekta font-light tracking-tight">
                      A big happy bunch.
                    </h1>
                    <h2 className="text-5xl  tracking-tight leading-none text-neutral-400 pb-3 font-aspekta font-light">
                      With a twist for the extraordinary.
                    </h2>
                  </StaggeredSlideUp>
                </div>
              </div>
            </div>
          </div>
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

          <div className="col-span-12 md:col-span-8 md:col-start-3 mb-12 px-4 md:px-0">
            <ExpandableCards />
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
