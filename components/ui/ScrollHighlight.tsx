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
        scale: isHighlighted ? 1.1 : 1,
        x: isHighlighted ?30 : 0,
      
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
          initial={{ opacity: 0, y: 24 ,x:0}}
          animate={{ opacity: 1, y: 0, x: 0 }}
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

function Stylesheet() {
  return (
    <style>{`
        .containerElement { display: flex; }
        .container h3.containerED1 {
          font-size:22px;
          line-height: 1;
          font-weight: 500;
          margin: 0;
          padding: 0;
          text-align: center;
          position: sticky;
          top: 120px;
          text-transform: none;
          height: fit-content;
        }
        .skills-list {
          padding: 50vh 0;
          list-style: none;
          padding: 0;
          margin: 0; color: white;
          display: flex;
          flex-direction: column;
          gap:80px;
        }
        .skill-item {
          padding: 4rem 0;margin-bottom:2rem;
          will-change: opacity;
          font-size: clamp(1rem, 4vw, 3rem);
          font-weight: 300;   max-width: min(22ch, 44vw);
          margin: 0;
          padding: 0;
          line-height: 0.9;
          text-transform: none;
          display: flex;
          flex-direction: column;
        }
        .skill-name { white-space: wrap; }
        .skill-description {
          font-size: 1rem;
        
          font-weight: 400;
          line-height: 1.3;
          margin-top: 1rem;
          text-transform: none;
          opacity: 0.85;
          max-width: min(50ch, 90vw);
          white-space: normal;
          overflow-wrap: break-word;
          word-break: break-word;
          overflow: hidden;
          hyphens: auto;
        }
      `}</style>
  );
}
