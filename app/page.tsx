"use client";
import { useRef } from "react";
import { useInView } from "motion/react";
import Badgemodule from "./components/Badgemodule";
import Button2 from "./components/Button2";
import ExpandableCards from "./components/ExpandableCards";
import Footer from "./components/Footer";
import FooterBottom from "./components/FooterBottom";
import FrontNavOverlay from "./components/FrontNavOverlay2";
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
import ExpandableCards2 from "./components/ExpandableCards2";
import LogoCarousel from "./components/LogoCarousel";
import WarpOverlay from "./components/overlayNav";
import HamburgerGradientMenu from "./components/HamburgerGradientMenu";
export default function Home() {
  const typewriterref = useRef(null);
  const isInView = useInView(typewriterref);
  return (
    <>
      <section className="relative h-[65vh] overflow-hidden">
        <HamburgerGradientMenu />

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

        <div className="relative z-10 container  mt-24  mx-auto ">
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
      </section>

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

      {/* Portfolio Grid */}
      <div className="z-4 grid gap-4 col-span-12 relative col-start-1 container mx-auto row-start-1 grid-cols-12 ">
        <GridBackground delay={0.2} staggerDelay={0.06} />
        <div className="z-1 grid col-span-12 gap-4 col-start-1 pt-32 row-start-1 grid-cols-12 ">
          <Badgemodule
            className="col-span-2"
            text="Experts"
            subtitle="Services"
            numberEl={"004"}
          />
          <header className="col-span-4 col-start-3 border-t ">
            {/* Headlines */}
            <div className="flex flex-col items-start justify-start w-full">
              {/* Main Headline */}
              <div className="flex-1 flex flex-col min-w-0">
                <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                  Super*
                </h2>
                <h4 className="text-7xl  text-neutral-900 font-semibold leading-compress font-aspekta">
                  Brrrroadside
                </h4>
                <h4 className="text-xl mt-2 text-neutral-900 font-semibold leading-compress font-aspekta">
                  One Strategy. Multiple Experts
                </h4>
              </div>
            </div>
          </header>

          <div className="col-span-8 col-start-7 border-t pt-8  ">
            <ListContainerComponent>
              <ListItemComponent size="small" fontWeight="normal" color="black">
                Full Service. From Start to End.
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
          <div className="col-span-10 col-start-3  mt-8  ">
            <ExpandableCards />
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
              text="Laser Focused"
              subtitle="Our Services"
              numberEl={"005"}
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
            text="Per  Form"
            subtitle="What we do"
            numberEl={"006"}
          />
        </div>
        <div className="col-span-12 container  col-start-3 row-start-1 grid grid-cols-10 pt-32  ">
          <header className="col-span-2 col-start-1  border-t p-4">
            {/* Headlines */}
            <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
              {/* Main Headline */}
              <div className="flex-1 flex gap-4 flex-col min-w-0">
                <h2 className="text-xl text-neutral-900 font-bold font-aspekta">
                  Super*
                </h2>
                <h4 className="text-5xl  text-neutral-900 font-semibold leading-compress font-aspekta">
                  Human Touch
                </h4>
                <div className="flex flex-col items-start justify-start w-full">
                  {/* Main Headline */}

                  <h2 className="text-2xl text-neutral-900 font-aspekta">
                    Igniting Creativity:{" "}
                  </h2>
                  <h4 className="text-2xl  text-neutral-900  font-aspekta">
                    <span className="text-neutral-200">Unique People.</span>
                  </h4>
                </div>
              </div>
            </div>
          </header>

          <div className="col-span-8 grid  grid-cols-12 col-start-3 gap-8  border-t pt-8  ">
            <header className="col-span-5 col-start-1  ">
              <h2 className="text-lg text-neutral-500  font-aspekta">
                At 1sp, we are driven by a team of passionate individuals who
                thrive on creativity and innovation, crafting unique marketing
                campaigns that resonate with audiences.
              </h2>
            </header>{" "}
          </div>
          <div className=" col-span-8  row-start-2 col-start-3 ">
            <PeopleShowcaseHero />
          </div>
        </div>
      </div>
      {/* Visual Background 2 Section */}
      <div
        id="Step3"
        className="grid grid-cols-12 z-2 mx-auto bg-neutral-100 mt-8 min-h-[50vh] relative font-aspekta">
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
              distance={80}>
              <h2 className="text-7xl leading-compress text-gray-700 max-w-lg font-semibold tracking-loose leading-tighter mb-8">
                News.
              </h2>
              <p className="text text-gray-500 font-medium  max-w-2xs mx-auto">
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
        />

        <div className="z-1 grid col-span-12 py-24 gap-8 col-start-1 container mx-auto row-start-1 grid-cols-12 ">
          <div className="col-span-3  col-start-1 ">
            <StaggeredSlideUp
              className="flex flex-col  items-start justify-start "
              delay={0.0}
              staggerDelay={0.1}
              duration={0.5}
              distance={80}>
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
                variant="lime"
                text="Join us for a ride"
                className="w-fit"></Button2>
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
