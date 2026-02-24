"use client";
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Badgemodule from "./components/Badgemodule";
import Button2 from "./components/Button2";
import CaseGallery from "./components/CaseGallery";
import ExpandableCards from "./components/ExpandableCards";
import Footer from "./components/Footer";
import FooterBottom from "./components/FooterBottom";
import FrontNavOverlay from "./components/FrontNavOverlay2";
import HamburgerGradientMenu from "./components/HamburgerGradientMenu";
import HeaderImageVideoComp from "./components/HeaderImageVideoComp";
import HeaderImageVideoComp2 from "./components/HeaderImageVideoComp2";
import LineMinimap from "./components/MapVertical";
import StaggeredSlideUp from "./components/StaggeredSlideUp";
import TypewriterChangeContentExample from "./components/TyperwriterHeadline";
export default function Home() {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);
  const [navPoints, setNavPoints] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filters = ["All", "POS", "Marketing", "Social", "Design", "Web"];
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
      <section className="relative min-h-[90vh] overflow-hidden">
        <HamburgerGradientMenu />

        <LineMinimap navPoints={navPoints} />

        {/* Background Image with Overlay */}
        <HeaderImageVideoComp
          useVideo={true}
          opacity="opacity-50"
          videoSrc="/video/FLZR_WEB_VIDEO.mp4"
          enableParallax={true}
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}
        <div id="Top" className=""></div>
        <div className="relative z-10 container  mt-[30vh]  mx-auto p-16 md:p-8">
          <StaggeredSlideUp className=" max-w-full flex flex-col md:gap-4">
            <h1 className="text-neutral-50 uppercase pb-2 text-lg font-plecnikBold font-bold md:max-w-1/3">
              FLZZR — a 1SP division
            </h1>
            <TypewriterChangeContentExample />

            <p className="text-neutral-50 text-2xl mt-2 leading-relaxed md:max-w-1/2">
              We are your experts for PoS promotion and trade marketing with
              over 20 years of experience! Networked throughout Europe, we stage
              unforgettable brand experiences, precisely tailored to your target
              groups.
            </p>
            <p className="text-neutral-50 text-ls mt-8">
              Together we are{" "}
              <span className="bg-gradient-to-r font-bold from-violet-400 to-violet-600 bg-clip-text text-transparent">
                one Superagency.
              </span>
            </p>
          </StaggeredSlideUp>
        </div>

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
        <div className="z-1 grid col-span-12 col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
            text="Services"
            subtitle="Services"
            numberEl={"1"}
          />
          <header className="col-span-11  md:col-span-4  col-start-2 md:col-start-3 md:mt-0 mt-12 md:row-start-1   border-gray-500 ">
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
                  <h2 className="text text-gray-900 font-bold font-plecnik">
                    FLZR
                  </h2>
                  <h4 className="text-7xl  text-violet-700  tracking-tight font-plecnik">
                    Services for your
                  </h4>
                  <h4 className=" mt-2 text-4xl text-gray-700 font-medium leading- font-plecnik">
                    success at the point of sale
                  </h4>
                </StaggeredSlideUp>
              </div>
            </div>
          </header>

          <div className="col-span-12 md:col-span-8 md:col-start-3  mt-8 mb-12 px-4 md:px-0">
            <ExpandableCards />
          </div>
        </div>
      </div>
      <div
        id="Projects"
        className="grid grid-cols-12 z-1 mx-auto container  mb-16  relative font-plecnik"
      >
        {" "}
        <div className="z-1 grid col-span-12 col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-6 col-start-2 md:col-start-1 md:col-span-2 md:sticky top-0 "
            text="Projects"
            subtitle="Our past. Your future."
            numberEl={"2"}
          />
          <header className="col-span-11  md:col-span-5  col-start-2 md:col-start-3 md:mt-0 mt-12 md:row-start-1   border-gray-500 ">
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
                  <h2 className="text text-gray-900 font-bold font-plecnik">
                    Active for you across Europe
                  </h2>
                  <h4 className="text-7xl  text-violet-700  tracking-tight font-plecnik">
                    Projects
                  </h4>
                  <h4 className=" mt-2 text-4xl text-gray-700 font-medium leading- font-plecnik">
                    that convince at the point of sale.
                  </h4>
                </StaggeredSlideUp>
              </div>
            </div>
          </header>
        </div>
        <div className="z-1 grid  col-span-12 py-16 px-32 col-start-1 container mx-auto row-start-2 grid-cols-12 ">
          <div className="z-1 col-span-12 col-start-2 ">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase transition-all duration-100 ${activeFilter === filter
                    ? "bg-violet-500 text-black "
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>{" "}
          <div className="z-1 col-span-10 col-start-2">
            <CaseGallery activeFilter={activeFilter} />
          </div>{" "}
        </div>
      </div>

      {/* We tell your Story */}
      <div className="grid grid-cols-12 z-1 mx-auto  relative font-plecnik">
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
                variant="violetsmall"
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
