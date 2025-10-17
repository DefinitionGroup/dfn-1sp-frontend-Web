"use client";

import { useEffect, useRef, useState } from "react";
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
import LineMinimap from "@/app/components/MapVertical";
import FooterBottom from "../components/FooterBottom";
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
import ServiceGallery from "../components/ServiceGallery";
import CaseGallery from "../components/CaseGallery";
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
      {/* Navigation */}
      <FrontNavOverlay color="dark" />
      <LineMinimap navPoints={navPoints} />

      {/* We tell your Story */}
      <div
        id="top"
        className="grid grid-cols-12 z-1 mx-auto min-h-[66vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={false}
          imageSrc="/s3.png"
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text="MISSION"
            subtitle="What we do"
            numberEl={"001"}
          />

          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-9xl text-gray-100 max-w-xl font-semibold tracking-tighter leading-compress mb-4 pb-8">
                We tell your story.
              </h2>
              <p className="text-2xl text-gray-100  font-bold  leading-none max-w-2xs mx-auto">
                ONE SHARED PASSION: CREATING EPIC EXPERIENCES THAT CAPTIVATE.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100 ">
            <CtaMiniComponent
              heading="We use Gaming Experience"
              paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
              buttonText="Our Story"
              buttonVariant="limesmall"
              align="left"
              url="/contact"
            />
          </div>
          <div className="col-span-9 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                For Consumer Electronics, Gaming & Technology
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                We’re a Superagency of like-minded and complimentary agencies
                all across Europe. The ‘fit’ matters… that one shared passion
                for the same things. It’s what makes us so unique.
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                The loyal partnerships we have earned from our clients comes
                from our positive approach and amazing collection of experts
                across the group. With such a strong background in the Consumer
                Electronics, Gaming & Technology industries, we also bring
                gamification to everything we do.
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>

      <div
        id="Services"
        className="grid grid-cols-12 z-50 mx-auto bg-neutral-100 mt-8 min-h-[90vh] relative font-aspekta"
      >
        <div className="z-2 grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Services"
            subtitle="What we do"
            numberEl={"002"}
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
                We tell your story.
              </h2>
              <p className="text-lg text-gray-900 font-medium  max-w-2xs mx-auto">
                To drive brand awareness, make meaningful connections, and
                increase sales for our clients.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12  col-start-3">
            <ServiceGallery activeFilter="All" />
          </div>
        </div>
      </div>
      {/* Visual Background 2 Section */}
      <div
        id="Cases"
        className="grid grid-cols-12  mx-auto  mt-8 min-h-[90vh] relative font-aspekta"
      >
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/cases/squareenix.mp4"
          enableParallax={true}
          opacity={0.1}
        />

        <div className="grid gap-8 col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2 sticky top-0"
            text="Results"
            subtitle="Cases"
            numberEl={"003"}
          />
          <div className="col-span-10 col-start-3  ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}
            >
              <h2 className="text-9xl leading-compress text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                We tell your story.
              </h2>
              <p className="text-lg text-gray-100 font-medium  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12  col-start-3">
            <CaseGallery />
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
