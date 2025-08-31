"use client";
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
  return (
    <>
      {/* <Nav /> */}
      <FrontNavOverlay color="dark" />
      <div className="grid grid-cols-12 z-1 mx-auto container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12 pt-32 col-start-1  row-start-1 grid-cols-12 ">
          <div className="col-span-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Our Units"
              subtitle="Services"
              numberEl={"002"}
            />
          </div>
          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col   items-start justify-start "
              delay={0.0}
              debug={false}
              easing="smooth"
              staggerDelay={0.1}
              duration={1}
              distance={120}>
              <h2 className="text-7xl font-normal tracking-tighter pr-2 mb-4">
                SuperCases
              </h2>
              <p className="text-body-lg text-gray-600  max-w-2xs mx-auto">
                Discover our latest projects in gaming,
              </p>
              <p className="text-body-lg text-gray-600  max-w-2xs mx-auto">
                marketing, and interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-12 col-start-1 mt-8 ">
            <InteractiveCarousel />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto  mt-8 min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/3.mp4"
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="col-span-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Super Form"
              subtitle="Our Story"
              numberEl={"003"}
            />
          </div>
          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.1}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
              <h2 className="text-7xl   text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-4">
                We tell your story.
              </h2>
              <p className="text-body-lg text-gray-100  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100 ">
            <StaggeredSlideUp
              className="flex flex-col  items-stretch  "
              delay={0.6}
              staggerDelay={0.1}
              duration={0.5}
              distance={22}>
              <h3 className="text-lg mb-4 font-semibold">
                Our roots are gaming.
              </h3>
              <p className="text-xxs mb-8 ">
                This is where we get our creative spark from. And epochs of
                customer focus and talking to the public.
              </p>
              <p className="text-xxs mb-8 min-w-full w-full  ">
                <Button2
                  variant="limesmall"
                  className="w-fit  "
                  text="Explore"></Button2>
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <div className="lg:col-span-8  text-gray-100">
              <StaggeredSlideUp
                delay={0.6}
                staggerDelay={0.1}
                duration={0.7}
                distance={22}>
                <div className="py-2">
                  <span className="text-body-md font-medium">Super*</span>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
                <div className="py-2">
                  <p className="text-body-md font-normal">
                    helping world-class brands create ground-breaking stuff
                  </p>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
                <div className="py-2">
                  <p className="text-body-md font-normal">
                    helping world-class
                  </p>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/6.mp4"
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="col-span-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Super Form"
              subtitle="Our Story"
              numberEl={"003"}
            />
          </div>
          <div className="col-span-10 col-start-3 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
              <h2 className="text-9xl text-gray-100 max-w-lg font-nyghtserif font-semibold tracking-tight leading-compress mb-4">
                We tell your story.
              </h2>
              <p className="text-body-lg text-gray-100  max-w-2xs mx-auto">
                Discover our latest projects in gaming, marketing, and
                interactive experiences
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-2 col-start-3 mt-8 pr-8 text-gray-100 ">
            <StaggeredSlideUp
              className="flex flex-col  items-stretch  "
              delay={0.6}
              staggerDelay={0.1}
              duration={0.5}
              distance={22}>
              <h3 className="text-lg mb-4 font-semibold">
                Our roots are gaming.
              </h3>
              <p className="text-xxs mb-8 ">
                This is where we get our creative spark from. And epochs of
                customer focus and talking to the public.
              </p>
              <p className="text-xxs mb-8 min-w-full w-full  ">
                <Button2
                  variant="limesmall"
                  className="w-fit  "
                  text="Explore"></Button2>
              </p>
            </StaggeredSlideUp>
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <div className="lg:col-span-8  text-gray-100">
              <StaggeredSlideUp
                delay={0.6}
                staggerDelay={0.1}
                duration={0.7}
                distance={22}>
                <div className="py-2">
                  <span className="text-body-md font-medium">Super*</span>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
                <div className="py-2">
                  <p className="text-body-md font-normal">
                    helping world-class brands create ground-breaking stuff
                  </p>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
                <div className="py-2">
                  <p className="text-body-md font-normal">
                    helping world-class
                  </p>
                  <div className="w-full h-px bg-gray-100 mt-2"></div>
                </div>
              </StaggeredSlideUp>
            </div>
          </div>
        </div>
      </div>
      <PeopleShowcaseHero />
      {/* Headline Combo Section */}
      <div className="grid grid-cols-12 z-1 mx-auto container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12 pt-32 col-start-1  row-start-1 grid-cols-12 ">
          <div className="col-span-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Our Units"
              subtitle="Services"
              numberEl={1}
            />
          </div>
          <div className="col-span-12 col-start-4">
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

      <div className="grid grid-cols-12 z-1 relative  mx-auto container">
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid col-span-12  col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <div className="col-span-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Our Units"
              subtitle="Services"
              numberEl={"005"}
            />
          </div>
          <div className="col-span-10  ">
            <ExpandableCards />
          </div>

          <div className="col-span-1 col-start-1 relative ">
            <Badgemodule
              className="absolute top-0 left-0 z-10"
              text="Our Units"
              subtitle="Services"
              numberEl={"005"}
            />
          </div>
          <div className="col-span-9  col-start-3 ">
            <TextLayout
              width="full"
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
