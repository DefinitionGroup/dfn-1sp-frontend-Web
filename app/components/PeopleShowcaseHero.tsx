import React from "react";
import Button2 from "./Button2";
import StaggeredSlideUp from "./StaggeredSlideUp";
// Image imports from Figma assets
const torstenImage =
  "/figma-assets/8fda3690b2ecf98551e7ad4b0476a0eb38ccbc93.png";
const svenImage = "/figma-assets/3b647a430cf29747afe610df39cefa32893f4118.png";
const markusImage =
  "/figma-assets/cc92bb9d2bfb8ff0d37fb1475621a71703478baf.png";
const lineImage = "/figma-assets/beb614433c5ac223755af656c4291b170c1ece44.svg";
const arrowIcon = "/figma-assets/2bf3a6153f84d855d678d77fd5f42c6df569d50c.svg";

interface TeamMember {
  name: string;
  image: string;
  alt: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Torsten",
    image: torstenImage,
    alt: "Torsten O - Team Member",
  },
  {
    name: "Sven",
    image: svenImage,
    alt: "Sven We - Team Member",
  },
  {
    name: "Markus",
    image: markusImage,
    alt: "Markus O - Team Member",
  },
  {
    name: "Torsten",
    image: torstenImage,
    alt: "Torsten O - Team Member",
  },
  {
    name: "Sven",
    image: svenImage,
    alt: "Sven We - Team Member",
  },
  {
    name: "Markus",
    image: markusImage,
    alt: "Markus O - Team Member",
  },
  {
    name: "Torsten",
    image: torstenImage,
    alt: "Torsten O - Team Member",
  },
  {
    name: "Sven",
    image: svenImage,
    alt: "Sven We - Team Member",
  },
  {
    name: "Markus",
    image: markusImage,
    alt: "Markus O - Team Member",
  },
];

export default function PeopleShowcaseHero() {
  const handleCTAClick = () => {
    window.open("https://msm.digital", "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="flex flex-col gap-8 items-start justify-start w-full mx-auto py-8 lg:py-12"
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title">
      {/* Main Content Section */}
      <div className="flex flex-col gap-8 items-start justify-start w-full">
        {/* Header Section */}
        <header className="flex flex-col gap-4 items-start justify-start w-full">
          {/* Top Line */}
          <div className="h-px w-full relative" aria-hidden="true">
            <img
              alt=""
              className="block w-full h-px object-cover"
              src={lineImage}
            />
          </div>

          {/* Headlines */}
          <div className="flex flex-col lg:gap-8 items-start justify-start w-full">
            {/* Main Headline */}
            <div className="flex-1 flex flex-col min-w-0">
              <h2
                id="people-showcase-title"
                className="text-5xl text-neutral-900 font-normal font-aspekta">
                Igniting Creativity:{" "}
              </h2>
              <h4
                id="people-showcase-title"
                className="text-5xl  text-neutral-900 font-normal font-aspekta">
                <span className="text-neutral-200">Unique People.</span>
              </h4>

              <p className=" text-neutral-950 font-normal font-aspekta mt-4 ">
                Emotion with passion. <br className="hidden sm:block" />
                Digital by nature.
              </p>
            </div>
          </div>
        </header>

        {/* Team Photos */}
        <div className="flex  sm:flex-row gap-4 items-center justify-start w-full overflow-x-auto">
          <StaggeredSlideUp className="flex  flex-wrap sm:flex-row gap-4 items-center justify-start w-full overflow-x-auto">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="group relative bg-neutral-100 h-[204px] w-[272px] flex-shrink-0 rounded-sm overflow-hidden transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
                data-member={member.name.toLowerCase()}>
                <img
                  src={member.image}
                  alt={member.alt}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                {/* Optional: Add hover overlay with name */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
          </StaggeredSlideUp>
        </div>

        {/* Bottom Line */}
        <div className="h-px w-full relative" aria-hidden="true">
          <img
            alt=""
            className="block w-full h-px object-cover"
            src={lineImage}
          />
        </div>
      </div>
    </section>
  );
}
