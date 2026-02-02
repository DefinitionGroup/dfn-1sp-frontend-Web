"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useId, useEffect } from "react";
import Image from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";

// Hook to detect mobile screen
function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

export interface SkillItem {
  name?: string;
  text?: string;
  image?: string;
  buttonLabel?: string;
  modalContent?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

function ScrollHighlightItem({
  skill,
  index,
  isHighlighted,
  onHighlight,
  onOpenModal,
  isMobile,
}: {
  skill: SkillItem;
  index: number;
  isHighlighted: boolean;
  onHighlight: (index: number) => void;
  onOpenModal: (skill: SkillItem) => void;
  isMobile: boolean;
}) {
  const id = useId();
  return (
    <motion.li
      className="skill-item md:p-0 py-6 flex flex-col  md:flex-row justify-start items-start  flex-grow  cursor-pointer"
      initial={false}
      animate={{
        opacity: isHighlighted ? 1 : 0.5,
        scale: isMobile ? 1 : (isHighlighted ? 1.20 : 1),
        x: isHighlighted ? 0 : 0,
        transformOrigin: "left",
      }}
      transition={{ type: "spring", duration: 0.5, }}
      onViewportEnter={() => onHighlight(index)}
      onClick={(e) => {
        e.stopPropagation();
        onOpenModal(skill);
      }}
      viewport={{ margin: isMobile ? "-20% 0px -20% 0px" : "-35% 0px -40% 0px", amount: "some", once: false }}
    >

      <motion.div
        className="relative  w-3/4  md:w-1/3 md:pr-4"

      >{skill.image && (isMobile || isHighlighted) && (

        <motion.div
          layout={!isMobile}
          initial={isMobile ? { opacity: 0.3, scale: 0.8 } : { opacity: 0, y: -22 }}
          animate={isMobile ? { opacity: isHighlighted ? 1 : 0.3, scale: isHighlighted ? 1 : 0.8 } : { opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: isMobile ? 2.5 : 1.5 }}
          className="skill-image pr-4 mb-8"
        >
          <Image
            src={skill.image}
            alt={skill.name || "Service background"}
            fill
            className="rounded-lg  w-3/4 md:w-full object-cover "
          />
        </motion.div>)}
      </motion.div>


      <div className=" flex  flex-col ">
        <h3 className="skill-name relative leading-none font-medium max-w-[20ch] ">{skill.name}</h3>

        {isHighlighted && skill.text && (
          <motion.p
            className="skill-description mb-4  text-xs  md:text-base w-3/4  "
            layout
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ type: "spring", }}
          >
            {skill.text}
          </motion.p>
        )}
        {isHighlighted && (
          <motion.button
            className="text-xs text-white bg-lime-500 rounded-full inline-block w-fit px-4 py-2 hover:cursor-pointer hover:bg-black transition-all"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", }}
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(skill);
            }}
          >
            {skill.buttonLabel || "Learn More"}
          </motion.button>
        )}</div>
    </motion.li >
  );
}

export default function ScrollHighlight({ items }: { items?: SkillItem[] }) {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<SkillItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const isMobile = useIsMobile();

  useOutsideClick(modalRef, () => setActiveModal(null));

  useEffect(() => {
    if (items && items.length > 0 && activeSkill === null) {
      setActiveSkill(0);
    }
  }, [items, activeSkill]);

  if (!items || items.length === 0) return null;

  return (
    <div className="scroll-highlight-container relative top-0 z-99999999">
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 p-8 md:p-0bg-black/50 backdrop-blur-lg z-9999999 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeInOut" } }}
          >
            <motion.button
              key={`button-${activeModal.name}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center overflow-hidden justify-around rounded-full h-6 w-6 z-9999999"
              onClick={() => setActiveModal(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`modal-card-${activeModal.name}-${id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18, ease: "easeInOut" } }}
              transition={{ type: "spring", visualDuration: 0.3, bounce: 0.2 }}
              ref={modalRef}
              className="w-full z-999999999  max-w-[900px] min-h-[50vh] relative h-full md:h-fit md:max-h-[90%] rounded-xl flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden"
            >
              <motion.button
                key={`button-inner-${activeModal.name}-${id}`}
                layout
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                className="flex absolute top-4 right-4 items-center overflow-hidden justify-around rounded-full h-6 w-6 z-9999999"
                onClick={() => setActiveModal(null)}
              >
                <CloseIcon />
              </motion.button>
              <motion.div
                className="w-full sm:rounded-t-xl relative overflow-hidden h-full"
                layoutId={`modal-image-${activeModal.name}-${id}`}
              >
                {activeModal.image ? (
                  <Image
                    width={1000}
                    height={400}
                    src={activeModal.image}
                    alt={activeModal.name || "Service background"}
                    className="w-full min-h-full  sm:rounded-t-xl opacity-50 object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-[400px] sm:rounded-t-xl bg-neutral-800 opacity-50" />
                )}
              </motion.div>
              <div className="flex justify-between absolute items-start m-8 pt-8 z-9999999">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  <div className="">
                    <motion.h3
                      layoutId={`modal-title-${activeModal.name}-${id}`}
                      className="text-white text-5xl max-w-2/3 dark:text-neutral-200 mb-4"
                    >
                      {activeModal.modalContent?.title || activeModal.name}
                    </motion.h3>
                    {activeModal.text && (
                      <motion.p
                        layoutId={`modal-description-${activeModal.name}-${id}`}
                        className="text-neutral-100 text-xl dark:text-neutral-400 mb-4"
                      >
                        {activeModal.text}
                      </motion.p>
                    )}
                    {activeModal.modalContent?.description && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="text-neutral-100 text-xl md:max-w-1/2 dark:text-neutral-400"
                      >
                        {activeModal.modalContent.description}
                      </motion.p>
                    )}
                  </div>
                  {activeModal.modalContent?.tags && activeModal.modalContent.tags.length > 0 && (
                    <motion.div
                      transition={{ duration: 0.3, delay: 0.5 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-white text-sm md:text-sm lg:text-base mt-8 max-w-1/2 mb-2 md:h-fit pb-8 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400"
                    >
                      <div className="text-sm text-neutral-300 mb-2">Tags:</div>
                      <div className="flex flex-wrap gap-2">
                        {activeModal.modalContent.tags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="px-3 py-1 bg-neutral-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="skills-list">
        {items.map((skill, index) => (
          <ScrollHighlightItem
            key={(skill.name || "skill") + index}
            skill={skill}
            index={index}
            isHighlighted={activeSkill === index}
            onHighlight={() => setActiveSkill(index)}
            onOpenModal={(skill) => setActiveModal(skill)}
            isMobile={isMobile}
          />
        ))}
      </ul>
      <Stylesheet />
    </div>
  );
}

const CloseIcon = () => {
  return (
    <motion.svg
      whileHover={{ rotate: 90 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

function Stylesheet() {
  return (
    <style>{`
 
      .skills-list {
        list-style: none;
        padding: 0;
        margin: 0;
        color: white;
        display: flex;
        flex-direction: column;
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
        font-size: clamp(1.25rem, 5vw, 2rem);
        font-weight: 300;
        max-width: 100%;
        margin: 0;
    
        text-transform: none;
        display: flex;
   
      }

      @media (min-width: 640px) {
        .skill-item {
          max-width: min(45ch, 80vw);
          padding: 1.5rem 0;
        }
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
   
        width: 100%;
        aspect-ratio: 16 / 12;
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

      .skill-button {
        margin-top: 1rem;
        padding: 0.5rem 1.25rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        color: white;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        width: fit-content;
      }

      .skill-button:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }

      @media (min-width: 640px) {
        .skill-button {
          font-size: 0.9375rem;
          padding: 0.625rem 1.5rem;
        }
      }
    `}</style>
  );
}
