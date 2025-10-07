"use client";
import { useRef, useState, useEffect } from "react";
import { useInView } from "motion/react";
import Badgemodule from "../components/Badgemodule";
import Button2 from "../components/Button2";
import ExpandableCards from "../components/ExpandableCards";
import Footer from "../components/Footer";
import FooterBottom from "../components/FooterBottom";
import FrontNavOverlay from "../components/FrontNavOverlay";
import HeaderImageVideoComp from "../components/HeaderImageVideoComp";
import InteractiveCarousel from "../components/InteractiveCarousel";
import StaggeredSlideUp from "../components/StaggeredSlideUp";
import TypewriterChangeContentExample from "../components/TyperwriterHeadline";
import HeaderImageVideoComp2 from "../components/HeaderImageVideoComp2";
import PeopleShowcaseHero from "../components/PeopleShowcaseHero";
import { Typewriter } from "motion-plus/react";
import ScrollHighlight from "../components/ScrollHighlight";
import ListContainerComponent from "../components/ListContainerComponent";
import ListItemComponent from "../components/ListItemComponent";
import ExpandableCards2 from "../components/ExpandableCards2";
import HamburgerGradientMenu from "../components/HamburgerGradientMenu";
import LineMinimap from "../components/MapVertical";
import CaseGallery from "../components/CaseGallery";

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
      <section className="relative overflow-hidden">
        <HamburgerGradientMenu />

        <LineMinimap navPoints={navPoints} />

        <FrontNavOverlay color="dark" />

        {/* subline rightection */}
        <div
          id="Intro"
          className="grid grid-cols-12 z-1 mx-auto container  relative font-plecnik"
        >
          <div className="z-1 grid  col-span-12 py-16  col-start-1 container mx-auto row-start-1 grid-cols-12 ">
            <div className="z-1 col-span-16 col-start-1 mt-16">
              {/* Description and CTA Section */}
              <div className="flex flex-col items-start gap-8 justify-center w-full">
                <StaggeredSlideUp
                  delay={0.19}
                  staggerDelay={0.03}
                  distance={100}
                  className=" max-w-2/4 "
                >
                  {" "}
                  <h2 className="text-5xl leading-none text-neutral-700 pb-3 font-plecnik font-medium">
                    At 1SP, our passionate team thrives on creativity.
                  </h2>
                  <h2 className="text-5xl leading-none text-neutral-400  pb-3 font-plecnik font-">
                    Here is the proof. We deliver exceptional digital products
                    and experiences that make a difference.
                  </h2>
                </StaggeredSlideUp>

                {/* CTA Button */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <div></div>

      <div
        id="Cases"
        className="grid grid-cols-12 z-1 mx-auto container  mb-16  relative font-plecnik"
      >
        <div className="z-1 grid gap-8 col-span-12 py-16 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="z-1 col-span-12 col-start-1 ">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase transition-all duration-100 ${
                    activeFilter === filter
                      ? "bg-violet-500 text-black "
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-900 hover:text-neutral-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <CaseGallery activeFilter={activeFilter} />
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
