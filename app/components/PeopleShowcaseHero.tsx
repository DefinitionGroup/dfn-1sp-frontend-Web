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
      className="flex flex-col gap-8 items-start justify-start w-full mx-auto "
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title">
      {/* Main Content Section */}

      {/* Team Photos */}
      <div className="flex  sm:flex-row gap-4 items-center justify-start w-full overflow-x-auto">
        <StaggeredSlideUp className="flex  flex-wrap sm:flex-row gap-4 items-center justify-start w-full overflow-x-auto">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="group relative bg-neutral-600 h-[204px] w-[272px] flex-shrink-0 rounded-sm overflow-hidden transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
              data-member={member.name.toLowerCase()}>
              <img
                src={member.image}
                alt={member.alt}
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Optional: Add hover overlay with name */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10  transition-colors duration-300"></div>
            </div>
          ))}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
