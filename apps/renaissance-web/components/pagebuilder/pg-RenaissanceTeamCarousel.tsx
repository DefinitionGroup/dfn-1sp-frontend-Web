"use client";

import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ResolvedRenaissanceMediaItem } from "@renaissance/lib/renaissanceMediaItems";

// Five portraits share the desktop row; a longer team runs as a ticker.
const DESKTOP_VISIBLE = 5;
const SECONDS_PER_PERSON = 5;
const HOVER_RATE = 0.2;

const controlClass = "grid h-11 min-w-11 place-items-center rounded-control border border-white/40 px-3 text-white transition-colors hover:bg-white hover:text-renaissance-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const portraitVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (order: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.04 + Math.min(order, DESKTOP_VISIBLE) * 0.08, duration: 0.72, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function RenaissanceTeamCarousel({ people }: { people: ResolvedRenaissanceMediaItem[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const size = useRef({ step: 0, copy: 0 });
  const inView = useInView(viewportRef);
  const reducedMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [slowed, setSlowed] = useState(false);
  const ticker = people.length > DESKTOP_VISIBLE && !reducedMotion;
  const x = useMotionValue(0);
  // Eases between full speed, the hover crawl and a standstill instead of jumping.
  const rate = useSpring(1, { stiffness: 40, damping: 16 });

  useEffect(() => {
    rate.set(paused ? 0 : slowed ? HOVER_RATE : 1);
  }, [paused, slowed, rate]);

  // The track renders the team twice; a whole copy apart, both positions look identical.
  useEffect(() => {
    const track = trackRef.current;
    if (!ticker || !track) return;
    const measure = () => {
      const cards = track.children as HTMLCollectionOf<HTMLElement>;
      const step = cards[1].offsetLeft - cards[0].offsetLeft;
      size.current = { step, copy: step * people.length };
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [ticker, people.length]);

  useAnimationFrame((_, delta) => {
    const { step, copy } = size.current;
    if (!ticker || !inView || !copy) return;
    x.set((x.get() - (rate.get() * step * delta) / (SECONDS_PER_PERSON * 1000)) % copy);
  });

  const slides = ticker ? [...people, ...people] : people;

  return (
    <div className="relative">
      <div ref={viewportRef} role="region" aria-label="Renaissance team"
        onPointerEnter={(event) => { if (event.pointerType === "mouse") setSlowed(true); }}
        onPointerLeave={() => setSlowed(false)}
        onTouchStart={() => setSlowed(true)} onTouchEnd={() => setSlowed(false)} onTouchCancel={() => setSlowed(false)}
        className={`relative mx-auto max-w-[1680px] px-5 sm:px-8 lg:px-12 ${ticker
          ? "overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_3%,#000_97%,transparent)]"
          : "snap-x snap-mandatory overflow-x-auto scroll-px-5 scrollbar-hide sm:scroll-px-8 lg:scroll-px-12"}`}>
        <motion.div ref={trackRef} style={ticker ? { x } : undefined}
          className="flex gap-[var(--gap)] [--gap:1rem] [--visible:2.2] sm:[--visible:3] lg:[--gap:1.25rem] lg:[--visible:5]"
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.16 }}>
          {slides.map((person, index) => {
            const clone = index >= people.length;

            return (
              <motion.figure key={`${person.key}-${clone ? "clone" : "lead"}`}
                custom={index % people.length} variants={reducedMotion ? undefined : portraitVariants}
                aria-hidden={clone || undefined} inert={clone || undefined}
                className="relative aspect-[0.78] w-[calc((100%_-_(var(--visible)_-_1)_*_var(--gap))_/_var(--visible))] shrink-0 snap-start overflow-hidden bg-renaissance-accent">
                <Image
                  src={person.src}
                  alt={clone ? "" : person.name}
                  fill
                  sizes="(max-width: 639px) 46vw, (max-width: 1023px) 33vw, 20vw"
                  unoptimized={person.src.startsWith("https://") && !person.src.startsWith("https://res.cloudinary.com/")}
                  className="object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-renaissance-ink/90 via-renaissance-ink/40 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4 lg:p-5">
                  <span className="block text-base font-semibold leading-tight text-white sm:text-lg lg:text-xl">{person.name}</span>
                  {person.position ? <span className="mt-1 block text-xs text-white/80 sm:text-sm">{person.position}</span> : null}
                </figcaption>
              </motion.figure>
            );
          })}
        </motion.div>
      </div>

      {ticker ? (
        <div className="relative mx-auto mt-6 flex max-w-[1680px] justify-end px-5 sm:px-8 lg:px-12">
          <button type="button" aria-label={paused ? "Resume team ticker" : "Pause team ticker"} aria-pressed={paused}
            className={`${controlClass} text-xs`} onClick={() => setPaused((value) => !value)}>{paused ? "Play" : "Pause"}</button>
        </div>
      ) : null}
    </div>
  );
}
