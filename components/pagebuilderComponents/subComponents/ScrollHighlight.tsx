"use client";

import { motion } from "motion/react";
import { useState } from "react";

export interface SkillItem {
  name?: string;
  text?: string;
}

function ScrollHighlightItem({
  skill,
  index,
  isHighlighted,
  onHighlight,
}: {
  skill: SkillItem;
  index: number;
  isHighlighted: boolean;
  onHighlight: (index: number) => void;
}) {
  return (
    <motion.li
      className="skill-item"
      initial={false}
      animate={{
        opacity: isHighlighted ? 1 : 0.4,
        scale: isHighlighted ? 1.012 : 1,
      }}
      transition={{ type: "spring", stiffness: 100 }}
      onViewportEnter={() => onHighlight(index)}
      viewport={{ margin: "-28% 0px -68% 0px", amount: "some" }}
    >
      <span className="skill-name">{skill.name}</span>
      {isHighlighted && skill.text && (
        <motion.p
          className="skill-description"
          layout
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          {skill.text}
        </motion.p>
      )}
    </motion.li>
  );
}

export default function ScrollHighlight({ items }: { items?: SkillItem[] }) {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  // If no Sanity data, render nothing (no demo data)
  if (!items || items.length === 0) return null;

  return (
    <div className="containerElement">
      <ul className="skills-list">
        {items.map((skill, index) => (
          <ScrollHighlightItem
            key={(skill.name || "skill") + index}
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
          margin: 0;color: white;
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
          display: flex;
          flex-direction: column;
        }

        .skill-name {
          white-space: nowrap; /* keep title on one line */
        }

        .skill-description {
          font-size: 1.2rem;
          min-height: 9.5rem;
          font-weight: 400;
          line-height: 1.3;
          margin-top: 0.75rem;
          text-transform: none;
          opacity: 0.85;
          max-width: min(70ch, 90vw);
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          overflow: hidden;
          hyphens: auto;
        }
       
      `}
    </style>
  );
}
