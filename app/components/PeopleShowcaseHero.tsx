import React, { useState } from "react";
import Button2 from "./Button2";
import StaggeredSlideUp from "./StaggeredSlideUp";
import StaggeredFadeIn from "./StaggeredFadeIn";
// Image imports from Figma assets
const torstenImage = "/video/people/Torsten.mp4";
const steveImage = "/video/people/Steve.mp4";
const markusImage = "/video/people/Markus.mp4";
const kirstenImage = "/video/people/Kirsten.mp4";
const kerstinImage = "/video/people/Kerstin.mp4";

interface TeamMember {
  name: string;
  image: string;
  alt: string;
  fullname?: string; // Optional full name property
  email?: string; // Optional email property
  profileUrl?: string; // Optional profile URL property
  position?: string; // Optional position property
}

const teamMembers: TeamMember[] = [
  {
    name: "Torsten",
    image: torstenImage,
    alt: "Torsten O - Team Member",
    position: "Founder & CEO",
    fullname: "Torsten Oppermann",
    email: "torsten.oppermann@1sp.agency",
    profileUrl: "https://www.linkedin.com/in/torstenoppermann/",
  },
  {
    name: "Markus",
    image: markusImage,
    alt: "Markus O - Team Member",
    fullname: "Markus Oppermann",
    email: "markus.oppermann@1sp.agency",
    position: "Founder & CEO",
    profileUrl: "https://www.linkedin.com/in/markus-oppermann/",
  },
  {
    name: "Kirsten",
    image: kirstenImage,
    alt: "Kirsten O - Team Member",
    position: "Managing Director MSM",
    fullname: "Kirsten Oppermann",
    email: "kirsten.oppermann@1sp.agency",
    profileUrl: "https://www.linkedin.com/in/kirsten-oppermann/",
  },
  {
    name: "Kerstin",
    image: kerstinImage,
    alt: "Kerstin O - Team Member",
    position: "Founder & CEO",
    fullname: "Kerstin Oppermann",
    email: "kerstin.oppermann@1sp.agency",
    profileUrl: "https://www.linkedin.com/in/kerstin-oppermann/",
  },
  {
    name: "Steve",
    image: steveImage,
    alt: "Steve O - Team Member",
    position: "Founder & CEO StudioCO2",
    fullname: "Steve Cross",
    email: "steve.cross@1sp.agency",
    profileUrl: "https://www.linkedin.com/in/steve-cross/",
  },
];

export default function PeopleShowcaseHero() {
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);

  const handleCTAClick = () => {
    window.open("https://msm.digital", "_blank", "noopener,noreferrer");
  };

  return (
    <section
      className="flex flex-col items-start justify-start w-full mx-auto "
      data-component="people-showcase-hero"
      aria-labelledby="people-showcase-title"
    >
      {/* Main Content Section */}

      {/* Team Photos */}
      <div className="flex  sm:flex-row   items-center  justify-start w-full overflow-x-auto">
        <StaggeredSlideUp className=" grid grid-cols-3 gap-1 w-full overflow-x-auto">
          {teamMembers.map((member, index) => {
            return (
              <div
                key={member.name}
                className="group relative  border-neutral-100 overflow-hidden flex-shrink-0 rounded-xs transition-transform duration-300 focus-within:scale-[1.02]"
                data-member={member.name.toLowerCase()}
                onMouseEnter={() => setHoveredMember(member.name)}
                onMouseLeave={() => setHoveredMember(null)}
              >
                <video
                  src={member.image}
                  autoPlay
                  muted
                  loop
                  className=" object-cover transition-all duration-300 group-hover:brightness-110 group:hover:scale-[0.45] "
                />
                {/* Hover overlay with additional data */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/90 to-black/95 opacity-0 group-hover:opacity-100 rounded-sm transition-opacity duration-300 flex flex-col justify-end p-4">
                  <StaggeredFadeIn
                    className="flex flex-col"
                    triggerOnView={false}
                    delay={0}
                    staggerDelay={0.1}
                    animate={
                      hoveredMember === member.name ? "visible" : "hidden"
                    }
                  >
                    {member.fullname && (
                      <h3 className="text-white font-semibold text-lg mb-2">
                        {member.fullname}
                      </h3>
                    )}
                    {member.position && (
                      <p className="text-white/80 text-sm mb-2 font-medium">
                        {member.position}
                      </p>
                    )}
                    {member.email && (
                      <p className="text-white/90 text-sm mb-1 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        {member.email}
                      </p>
                    )}
                    {member.profileUrl && (
                      <a
                        href={member.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/90 text-sm hover:text-lime-400 transition-colors flex items-center"
                      >
                        <img
                          src="/LinkedinLogo.svg"
                          alt="LinkedIn"
                          className="w-4 h-4 mr-2"
                        />
                        LinkedIn Profile
                      </a>
                    )}
                  </StaggeredFadeIn>
                </div>
              </div>
            );
          })}
        </StaggeredSlideUp>
      </div>
    </section>
  );
}
