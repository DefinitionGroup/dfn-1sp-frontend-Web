"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import StaggeredSlideUp from "@/components/ui/StaggeredSlideUp";
import Badgemodule from "@/components/ui/Badgemodule";
import HeaderImageVideoComp2 from "@/components/data/Fragments/data-HeaderImageVideoComp2";
import ServiceGalleryComponent from "@/components/data/data-ServiceGallery";
import CaseGalleryComponent from "@/components/data/data-CaseGallery";
import LineMinimap from "@/components/ui/MapVertical";
import ListContainerComponent from "@/components/ui/ListContainerComponent";
import ListItemComponent from "@/components/ui/ListItemComponent";
import CtaMiniComponent from "@/components/data/Fragments/data-CtaMiniComponent";

interface Service {
  _id: string;
  name: string;
  taglabel?: string;
  iconUrl?: string;
  serviceicon?: any;
  servicegrouprel?: { _id: string; name: string; taglabel?: string }[];
  unitsrel?: { _id: string; name: string; slug: { current: string } }[];
}

interface CaseStudy {
  _id: string;
  title: string;
  subtitle?: string;
  slug: { current: string };
  description?: string;
  services?: { _id: string; name: string }[];
  mainImageUrl?: string;
  mainVideoUrl?: string;
  client?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  websiteUrl?: string;
  websiteUrlText?: string;
}

interface ServicesPageClientProps {
  services: Service[];
  caseStudies: CaseStudy[];
  locale: string;
}

export default function ServicesPageClient({
  services,
  caseStudies,
  locale,
}: ServicesPageClientProps) {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);

  const [navPoints, setNavPoints] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Function to collect all IDs from the page
  const collectPageIds = () => {
    setTimeout(() => {
      const allElements = document.querySelectorAll("[id]");
      const ids: string[] = [];

      allElements.forEach((element) => {
        const id = element.id;
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

      const uniqueIds = [...new Set(ids)];
      setNavPoints(uniqueIds);
    }, 500);
  };

  // Collect page IDs on component mount
  useEffect(() => {
    collectPageIds();
  }, []);

  // Extract unique service groups for filtering
  const uniqueServiceGroups = Array.from(
    new Set(
      services
        .flatMap((service) => service.servicegrouprel || [])
        .map((group) => group.name)
    )
  ).sort();

  const filters = ["All", ...uniqueServiceGroups];

  return (
    <>
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
            text="Mission"
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
              <h2 className="text-7xl text-gray-100 max-w-xl font-semibold tracking-tighter leading-compress mb-4 ">
                We tell your story.
              </h2>
              <p className="text-2xl text-gray-100  font-semibold leading-none max-w-xs mx-auto">
                One shared passion: Creating epic experiences that captivate.
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
            {/* Content section */}
            <ListContainerComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                For Consumer Electronics, Gaming & Technology
              </ListItemComponent>
              <ListItemComponent size="medium" fontWeight="normal">
                We're a Superagency of like-minded and complimentary agencies
                all across Europe. The 'fit' matters… that one shared passion
                for the same things. It's what makes us so unique.
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
              <h2 className="text-7xl leading-compress text-neutral-700 max-w-2xl font-semibold tracking-tight leading-tighter mb-4">
                Excellence:
              </h2>
              <h2 className="text-5xl leading-compress text-neutral-700 max-w-2xl font-semibold tracking-tight leading-tighter mb-4">
                in thinking, creativity, and execution.
              </h2>
              <p className="text-lg text-neutral-700 font-medium  max-w-xs mx-auto">
                To drive brand awareness, make meaningful connections, and
                increase sales for our clients.
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12  col-start-3">
            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase transition-all duration-100 ${
                    activeFilter === filter
                      ? "bg-lime-500 text-black "
                      : "bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <ServiceGalleryComponent
              services={services}
              activeFilter={activeFilter}
              locale={locale}
            />
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
              <h2 className="text-7xl leading-none text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                Our work speaks volumes.
              </h2>
              <p className="text-lg text-gray-100 font-medium  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12  col-start-3">
            <CaseGalleryComponent
              caseStudies={caseStudies}
              variant="light"
              locale={locale}
            />
          </div>
        </div>
      </div>
    </>
  );
}
