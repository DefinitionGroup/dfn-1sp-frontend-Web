"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useRef, useId, useEffect, useCallback } from "react";
import Image from "next/image";
import DeferredVideo from "@msm/components/ui/DeferredVideo";
import { useOutsideClick } from "@1sp/utils/hooks/use-outside-click";
import { hasVisibleText } from "@1sp/utils/text-content";

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
  /** Cloudinary video URL — takes precedence over image when set */
  video?: string;
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
  onOpenModal,
  isMobile,
  itemRef,
}: {
  skill: SkillItem;
  index: number;
  isHighlighted: boolean;
  onOpenModal?: (skill: SkillItem) => void;
  isMobile: boolean;
  itemRef: (el: HTMLLIElement | null) => void;
}) {
  const id = useId();
  return (
    <motion.li
      ref={itemRef}
      className="skill-item md:p-0 py-6 flex flex-col  md:flex-row justify-start items-start  flex-grow  "
      initial={false}
      animate={{
        opacity: isHighlighted ? 1 : 1,
        scale: isMobile ? 1 : (isHighlighted ? 1.20 : 1),
        x: isHighlighted ? 0 : 0,
        transformOrigin: "left",
      }}
      transition={{ type: "spring", duration: 0.5, }}
      onClick={(e) => {
        e.stopPropagation();
        onOpenModal?.(skill);
      }}
    >

      <motion.div
        className="relative w-full  md:w-2/3 md:pr-4"

      >{(skill.video || skill.image) && (isMobile || isHighlighted) && (

        <motion.div
          layout={!isMobile}
          initial={isMobile ? { opacity: 0.5, scale: 0.8 } : { opacity: 0.5, y: -112 }}
          animate={isMobile ? { opacity: isHighlighted ? 1 : 0.83, scale: isHighlighted ? 1 : 0.8 } : { opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: isMobile ? 2.5 : 1.5 }}
          className="skill-image pr-4    mb-8"
        >
          {skill.video ? (
            <DeferredVideo
              src={skill.video}
              maxWidth={500}
              className=" w-full  rounded-xl object-cover absolute inset-0  h-full"
              mountDelay={200}
            />
          ) : (
            <Image
              src={skill.image!}
              alt={skill.name || "Service background"}
              fill
              sizes="(max-width: 640px) 75vw, 500px"
              className=" w-full md:w-full rounded-2xl object-cover"
            />
          )}
        </motion.div>)}
      </motion.div>


      <div className=" flex  flex-col ">
        {hasVisibleText(skill.name) ? (
          <h3 className="skill-name headline-display relative max-w-[20ch] ">
            {skill.name}
          </h3>
        ) : null}

        {isHighlighted && skill.text && (
          <motion.p
            className="skill-description mb-4  text-xs  md:text-base w-3/4 [hyphens:none]  "
            layout
            initial={{ opacity: 0, y: 22, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ type: "spring", duration: 1.5, bounce: 0 }}
          >
            {skill.text}
          </motion.p>
        )}


      </div>
    </motion.li >
  );
}

export default function ScrollHighlight({ items }: { items?: SkillItem[] }) {
  const [activeSkill, setActiveSkill] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<SkillItem | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const rafId = useRef<number>(0);
  const id = useId();
  const isMobile = useIsMobile();

  const setItemRef = useCallback(
    (index: number) => (el: HTMLLIElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  useOutsideClick(modalRef, () => setActiveModal(null));

  // Scroll-based active item detection — runs every frame via rAF
  useEffect(() => {
    const els = itemRefs.current;
    if (!items || items.length === 0) return;

    // Target zone: items closest to this % from the top of the viewport become active
    const targetRatio = isMobile ? 0.4 : 0.38;

    function updateActiveOnScroll() {
      const viewportH = window.innerHeight;
      const targetY = viewportH * targetRatio;
      let closest = 0;
      let closestDist = Infinity;

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Use the vertical center of each item
        const itemCenter = rect.top + rect.height / 2;
        const dist = Math.abs(itemCenter - targetY);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      }

      setActiveSkill((prev) => (prev === closest ? prev : closest));
    }

    function onScroll() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateActiveOnScroll);
    }

    // Initial calculation
    updateActiveOnScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, [items, isMobile]);

  if (!items || items.length === 0) return null;

  return (
    <div className="scroll-highlight-container relative top-0 z-99999999">
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 p-8 md:p-0 bg-black/50 z-9999999 grid place-items-center"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.18, ease: "easeInOut" } }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 5, transition: { duration: 0.15, ease: "easeIn" } }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              ref={modalRef}
              className="w-full z-9 max-w-[900px] relative h-full md:h-fit md:max-h-[90%]  flex flex-col bg-neutral-900 dark:bg-neutral-900 shadow-2xl overflow-hidden will-change-transform"
            >
              <motion.button
                key={`button-inner-${activeModal.name}-${id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="flex absolute top-14 md:top-4 right-4 items-center overflow-hidden justify-around  h-6 w-6 z-999999999999"
                onClick={() => setActiveModal(null)}
              >
                <CloseIcon />
              </motion.button>
              <motion.div
                className="w-full  relative overflow-hidden h-full"
              >
                {activeModal.video ? (
                  <div className="w-full opacity-50   h-full">
                    <DeferredVideo
                      src={activeModal.video}
                      maxWidth={1000}
                      className="w-full h-full  object-cover object-top"
                      mountDelay={100}
                    />
                  </div>
                ) : activeModal.image ? (
                  <Image
                    width={1000}
                    height={400}
                    src={activeModal.image}
                    alt={activeModal.name || "Service background"}
                    className="w-full min-h-full  opacity-50 object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-[400px]  bg-neutral-800 opacity-50" />
                )}
              </motion.div>
              <div className="flex justify-between absolute items-start m-8 pt-8 z-9999999">
                <div className="flex justify-between relative top-0 flex-col items-start z-10 left-0">
                  <div className="">
                    <motion.h3
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                      className="text-white text-3xl md:text-5xl max-w-2/3 dark:text-neutral-200 mb-4"
                    >
                      {activeModal.modalContent?.title || activeModal.name}
                    </motion.h3>
                    {activeModal.text && (
                      <motion.p
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
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
                            className="px-3 py-1 bg-neutral-700  text-xs"
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
            // onOpenModal={(skill) => setActiveModal(skill)}
            isMobile={isMobile}
            itemRef={setItemRef(index)}
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
        color: var(--color-neutral-50);
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
        max-width: 100%;
        margin: 0;

        text-transform: none;
        display: flex;

      }

      @media (min-width: 640px) {
        .skill-item { 
          padding: 1.5rem 0;
        }
      }

     
   
      .skill-name {
        white-space: normal;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        /* Step-specific exception: half the unified headline size,
           weight/family/tracking still come from headline-display */
        font-size: calc(var(--headline-size) * 0.5);
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
