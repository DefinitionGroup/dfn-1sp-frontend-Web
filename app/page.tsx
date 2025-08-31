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
          videoSrc="/video/atf.mp4"
          enableParallax={true}
          opacity="opacity-55"
        />
        {/* Navigation */}
        <FrontNavOverlay />
        {/* Hero Content */}

        <div className="relative z-10 container top-[200px]  mx-auto ">
          <StaggeredSlideUp className="space-y-6 max-w-full ">
            <h1 className="text-neutral-50 text-headline-xl font-normal"></h1>
            <TypewriterChangeContentExample />

            <p className="text-neutral-50 text-lg font-normal max-w-1/3">
              We are group of several laser focused agencies. Each one with a
              distinctive competetive edge.
            </p>
            <p className="text-neutral-50 text-lg font-medium">
              Together we are{" "}
              <span className="bg-gradient-to-r font-bold from-lime-300 to-lime-500 bg-clip-text text-transparent">
                one Superagency.
              </span>
            </p>
            <Button2
              variant="default"
              text="Read the Story"
              className="w-fit"></Button2>
            <Button2
              variant="limesmall"
              text="Read the Story"
              className="w-fit"></Button2>
          </StaggeredSlideUp>
        </div>
        {/* Vertical Lines */}
        <div className="absolute top-0 left-[1321px] w-px h-full bg-neutral-50/50" />
        <div className="absolute top-0 left-[1033px] w-px h-full bg-neutral-50/50" />
        {/* Corner Text */}
        <div className="absolute bottom-[42px] left-[24px] text-white text-xs font-medium  -rotate-90 origin-bottom-left">
          SUPER*
        </div>
        <div className="absolute bottom-[19px] right-[18px] text-white text-eyebrow font-medium">
          / 1SP
        </div>
      </section>
      <div className="grid grid-cols-12 z-1 mx-auto container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12 pt-32 col-start-1 gap-4 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Level Up!"
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
              className="flex flex-col   items-start justify-start "
              delay={0.0}
              debug={false}
              easing="smooth"
              staggerDelay={0.1}
              duration={0.5}
              distance={40}>
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
          opacity={0.5}
          videoSrc="/video/12.mp4"
          enableParallax={true}
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
              <h2 className="text-9xl leading-compress    text-gray-100 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
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
              heading="Our roots are gaming."
              paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
              buttonText="Explore"
              buttonVariant="limesmall"
              align="right"
            />
          </div>
          <div className="col-span-5 col-start-5 mt-8 ">
            <ListContainerComponent>
              <ListItemComponent fontWeight="bold">Super*</ListItemComponent>
              <ListItemComponent fontWeight="normal">
                helping world-class brands create ground-breaking stuff
              </ListItemComponent>
              <ListItemComponent fontWeight="normal">
                helping world-class
              </ListItemComponent>
            </ListContainerComponent>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto min-h-[90vh] relative font-aspekta">
        <HeaderImageVideoComp2
          useVideo={true}
          videoSrc="/video/6.mp4"
          enableParallax={false}
        />

        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Story"
            subtitle="What we do"
            numberEl={"002"}
          />

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
      <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Our Story"
            subtitle="What we do"
            numberEl={"002"}
          />
          <div className="col-start-3 col-span-9">
            <TextReveal />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta">
        <GridBackground />
        <div className="z-1 grid col-span-12  relative top-0 py-32 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <Badgemodule
            text="Our Story"
            subtitle="What we do"
            numberEl={"003"}
          />

          <div className="col-span-9">
            <ScrollHighlight />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 z-1 mx-auto relative container font-aspekta gap-4  ">
        <GridBackground />
        <div className="z-1 flex flex-col col-span-2  justify-end items-end  col-start-1 pt-32 mx-auto row-start-1  ">
          <Badgemodule
            text="Our Story"
            subtitle="What we do"
            numberEl={"007"}
          />
          <ArrowRight size={170} className=" -rotate-45 " />
          <CtaMiniComponent
            heading="Our roots are gaming."
            paragraph="This is where we get our creative spark from. And epochs of customer focus and talking to the public."
            buttonText="Explore"
            buttonVariant="limesmall"
            align="right"
          />
        </div>
        <div className="z-1 col-span-9 container col-start-3 row-start-1 grid-cols-12 pt-32  ">
          <PeopleShowcaseHero />
        </div>
        <div className="z-1 col-span-3  border col-start-10 ">
          {/* Description and CTA Section */}
          <div className="flex flex-col gap-8 items-start justify-center w-full max-w-[320px]">
            {/* Description */}
            <p className="text-[15px] md:text-[16px] leading-[1.25] text-neutral-950 font-aspekta font-normal">
              At msm.digital, our passionate team thrives on creativity and
              innovation, crafting outstanding marketing campaigns that
              genuinely resonate with audiences.
            </p>

            {/* CTA Button */}
            <Button2
              variant="lime"
              text="Visit msm.digital"
              className="w-fit"
            />
          </div>
        </div>
      </div>

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
