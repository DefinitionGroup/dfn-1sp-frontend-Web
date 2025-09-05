import React from "react";
import Button2 from "./Button2";
import StaggeredSlideUp from "./StaggeredSlideUp";
// Image imports from Figma assets
const torstenImage = "/torsten.png";
const svenImage = "/sven.png";
const markusImage = "/markus.png";

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
      className="flex flex-col gap-8  items-start justify-start w-full mx-auto "
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title">
      {/* Main Content Section */}

      {/* Team Photos */}
      <div className="flex  sm:flex-row   items-center  justify-start w-full overflow-x-auto">
        <StaggeredSlideUp className=" grid grid-cols-4 gap-4 w-full overflow-x-auto">
          {teamMembers.map((member, index) => (
            <div
              key={member.name}
              className="group relative border border-neutral-100 overflow-hidden bg-neutral-600   flex-shrink-0 rounded-xs transition-transform duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
              data-member={member.name.toLowerCase()}>
              <img
                src={member.image}
                alt={member.alt}
                className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                loading={index === 0 ? "eager" : "lazy"}
              />
              {/* Optional: Add hover overlay with name */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-sm p-4 overflow-hidden transition-colors duration-300"></div>
            </div>
          ))}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
