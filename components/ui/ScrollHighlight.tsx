"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Image from "next/image";

export interface SkillItem {
  name?: string;
  text?: string;
  image?: string;
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
        opacity: isHighlighted ? 1 : 0.35,
        scale: isHighlighted ? 1.02 : 1,
        x: isHighlighted ? 8 : 0,
      }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      onViewportEnter={() => onHighlight(index)}
      viewport={{ margin: "-50% 0px -55% 0px", amount: "some" }}
    >
      <span className="skill-name">{skill.name}</span>
      {isHighlighted && skill.image && (
        <motion.div
          className="skill-image"
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        >
          <Image
            src={skill.image}
            alt={skill.name || "Service background"}
            fill
            className="rounded-lg object-cover"
          />
        </motion.div>
      )}
      {isHighlighted && skill.text && (
        <motion.p
          className="skill-description"
          layout
          initial={{ opacity: 0, y: 16, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
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
    <div className="scroll-highlight-container">
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
      .scroll-highlight-container {
        display: flex;
        width: 100%;
      }

      .skills-list {
        list-style: none;
        padding: 0;
        margin: 0;
        color: white;
        display: flex;
        flex-direction: column;
        gap: 2.5rem;
        width: 100%;
      }

      @media (min-width: 640px) {
        .skills-list {
          gap: 3.5rem;
        }
      }

      @media (min-width: 768px) {
        .skills-list {
          gap: 1rem;
        }
      }

      .skill-item {
        will-change: opacity, transform;
        font-size: clamp(1.25rem, 5vw, 3rem);
        font-weight: 300;
        max-width: 100%;
        margin: 0;
        padding: 1rem 0;
        line-height: 1;
        text-transform: none;
        display: flex;
        flex-direction: column;
      }

      @media (min-width: 640px) {
        .skill-item {
          max-width: min(28ch, 80vw);
          padding: 1.5rem 0;
        }
      }

      @media (min-width: 768px) {
        .skill-item {
          max-width: min(24ch, 50vw);
          padding: 1rem 0;
        }
      }

      .skill-name {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        line-height: 1.1;
      }

      .skill-image {
        position: relative;
        margin-top: 1rem;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 0.5rem;
        overflow: hidden;
      }

      @media (min-width: 640px) {
        .skill-image {
          max-width: 320px;
        }
      }

      @media (min-width: 768px) {
        .skill-image {
          max-width: 400px;
        }
      }

      .skill-description {
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.5;
        margin-top: 0.75rem;
        text-transform: none;
        opacity: 0.85;
        max-width: 100%;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: break-word;
        hyphens: auto;
      }

      @media (min-width: 640px) {
        .skill-description {
          font-size: 0.9375rem;
          margin-top: 1rem;
          max-width: min(45ch, 85vw);
        }
      }

      @media (min-width: 768px) {
        .skill-description {
          font-size: 1rem;
          max-width: min(50ch, 70vw);
        }
      }
    `}</style>
  );
}
