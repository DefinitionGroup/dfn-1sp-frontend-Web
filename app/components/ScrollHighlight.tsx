"use client";

import { motion } from "motion/react";
import { useState } from "react";

function ScrollHighlightItem({
  skill,
  index,
  isHighlighted,
  onHighlight,
}: {
  skill: Skill;
  index: number;
  isHighlighted: boolean;
  onHighlight: (index: number) => void;
}) {
  return (
    <motion.li
      className="skill-item"
      initial={false}
      animate={{
        opacity: isHighlighted ? 1 : 0.1,
        scale: isHighlighted ? 1.02 : 1,
      }}
      transition={{
        duration: 0.1,
        ease: "linear",
      }}
      onViewportEnter={() => onHighlight(index)}
      viewport={{
        /**
         * Create an intersection area that's a little way down the screen -
         * -50% 0px -49% 0px would work for the middle of the screen
         */
        margin: "-28% 0px -68% 0px",
        amount: "some",
      }}>
      {skill.name}
    </motion.li>
  );
}

export default function ScrollHighlight() {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  return (
    <div className="containerElement border ">
      <h3 className="containerED1">Skills</h3>
      <ul className="skills-list">
        {skills.map((skill, index) => (
          <ScrollHighlightItem
            key={skill.name}
            skill={skill}
            index={index}
            isHighlighted={activeSkill === index}
            onHighlight={() => setActiveSkill(index)}
          />
        ))}
      </ul>

      <Stylesheet />
    </div>
  );
}

/**
 * ==============   Styles   ================
 */

function Stylesheet() {
  return (
    <style>
      {`
        .containerElement {
          display: flex;
        }

        .container h3.containerED1 {
          font-size: 24px;
          line-height: 1;
          font-weight: 700;
          margin: 0;
          padding: 0;
          text-align: center;
          position: sticky;
          top: 10px;
          text-transform: uppercase;
  
          height: fit-content;
        }

        .skills-list {
          padding: 50vh 0;
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .skill-item {
          padding: 4rem 0;
          will-change: opacity;
          font-size: clamp(2rem, 8vw, 6rem);
          font-weight: 700;
          margin: 0;
          padding: 0;
          line-height: 0.9;
          text-transform: uppercase;
          text-wrap: nowrap;
        }

       
      `}
    </style>
  );
}

/**
 * Mock data
 */

interface Skill {
  name: string;
}

const skills: Skill[] = [
  { name: "Branding" },
  { name: "Web Design" },
  { name: "Marketing" },
  { name: "UI/UX Design" },
  { name: "Development" },
  { name: "Motion Design" },
  { name: "Branding" },
  { name: "Web Design" },
  { name: "Marketing" },
  { name: "UI/UX Design" },
  { name: "Development" },
  { name: "Motion Design" },
];
