"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { animate, motion, transform, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import Button2 from "@flzr/components/ui/Button2";
import { optimizedImageUrl, optimizedVideoUrl, resolveLink } from "@1sp/utils/cloudinary";
import { hasVisibleText } from "@1sp/utils/text-content";
import type { CinematicBlock3CardsRevealComponent, CinematicRevealCard } from "@1sp/sanity-types";
import styles from "./CinematicBlock3CardsReveal.module.css";

/* Ported from the aquamed build (cinematic-block-3-cards-reveal). Scene
   mechanics are unchanged: one Motion timeline (scroll-scrubbed or played
   automatically after a short scroll), the primary card's clip-path shrinks
   into the middle slot, the side cards slide in, the outro settles last. */

type ResolvedCard = {
  id: string;
  title: string;
  text?: string;
  image: string;
  imageAlt?: string;
  video?: string;
  href?: string;
  linkLabel?: string;
  external?: boolean;
};

type Props = CinematicBlock3CardsRevealComponent & { language?: string };

function localize(href: string | undefined, language: string) {
  if (!href) return undefined;
  if (language !== "en" && href.startsWith("/") && !href.startsWith(`/${language}`)) return `/${language}${href}`;
  return href;
}

function CardCopy({ card }: { card: ResolvedCard }) {
  const content = <>
    <h3 className="flzr-headline">{card.title}</h3>
    {card.text && <p>{card.text}</p>}
    {card.href && <span className={styles.action}>{card.linkLabel || card.title}<span aria-hidden>↗</span></span>}
  </>;
  if (!card.href) return <div className={styles.cardLink}>{content}</div>;
  return card.external
    ? <a className={styles.cardLink} href={card.href} target="_blank" rel="noopener noreferrer">{content}</a>
    : <Link className={styles.cardLink} href={card.href}>{content}</Link>;
}

/* Automatic playback thresholds on the approach timeline (section top from
   viewport bottom = 0 to viewport top = 1). */
const PLAY_AT = 0.5;
const REWIND_AT = 0.4;

function useScrollRange<T extends string | number>(progress: MotionValue<number>, input: number[], output: T[]) {
  // Every subrange shares one JS-driven timeline with explicit clamping, so the
  // visual states stay aligned with the focus boundaries below.
  return useTransform(() => transform(progress.get(), input, output));
}

export default function CinematicBlock3CardsReveal(props: Props) {
  const [animated, setAnimated] = useState(false);
  const language = props.language ?? "en";

  useEffect(() => {
    // Short viewports, touch-sized screens and reduced motion use the same
    // content in normal document flow: no pinned distance, no hidden targets.
    const query = window.matchMedia("(min-width: 900px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)");
    const update = () => setAnimated(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const cards: ResolvedCard[] = (props.cards ?? [])
    .map((card: CinematicRevealCard, index): ResolvedCard | null => {
      const image = card.image?.secure_url;
      if (!image || !hasVisibleText(card.title)) return null;
      const href = card.link ? resolveLink(card.link) : undefined;
      return {
        id: card._key ?? `${index}`,
        title: card.title!,
        text: card.text,
        image: optimizedImageUrl(image, { width: index === 0 ? 1920 : 1200, crop: "limit" }) || image,
        imageAlt: card.imageAlt,
        video: card.video?.secure_url ? optimizedVideoUrl(card.video.secure_url, { maxWidth: index === 0 ? 1920 : 1280 }) || card.video.secure_url : undefined,
        href: href && href !== "#" ? localize(href, language) : undefined,
        linkLabel: card.linkLabel,
        external: card.link?.linkType === "external" && /^https?:/.test(href ?? ""),
      };
    })
    .filter((card): card is ResolvedCard => Boolean(card))
    .slice(0, 3);
  if (!cards.length || !hasVisibleText(props.title)) return null;

  const autoComplete = props.autoComplete ?? true;
  const ctaHref = props.cta?.link ? localize(resolveLink(props.cta.link), language) : undefined;
  const outroCtaHref = props.outroCta?.link ? localize(resolveLink(props.outroCta.link), language) : undefined;
  return (
    <RevealScene
      key={`${animated}-${autoComplete}`}
      {...props}
      language={language}
      cards={cards}
      ctaHref={ctaHref && ctaHref !== "#" ? ctaHref : undefined}
      outroCtaHref={outroCtaHref && outroCtaHref !== "#" ? outroCtaHref : undefined}
      animated={animated && cards.length === 3}
      autoComplete={autoComplete}
    />
  );
}

function RevealScene({ brand, title, text, cta, ctaHref, revealTitle, outro, outroCta, outroCtaHref, cards, animated, autoComplete, navPointName, hideFromNav }: Omit<Props, "cards" | "autoComplete"> & { cards: ResolvedCard[]; ctaHref?: string; outroCtaHref?: string; animated: boolean; autoComplete: boolean }) {
  const root = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end end"] });
  // Approach: 0 while the section's top is at the bottom of the viewport, 1 once it is pinned.
  const { scrollYProgress: approach } = useScroll({ target: root, offset: ["start end", "start start"] });
  const automaticProgress = useMotionValue(0);
  const progress = autoComplete ? automaticProgress : scrollYProgress;

  useEffect(() => {
    if (!animated || !autoComplete) return;
    let target: 0 | 1 | undefined;
    let playback: ReturnType<typeof animate> | undefined;
    const trigger = () => {
      // Play as soon as the section's top has risen past the middle of the
      // viewport (approach ≥ 0.5), or after a 24px scroll into the pinned
      // scene. Rewind once the section drops back below 40% of the viewport
      // and the pinned scene is at its start. The gap between the two
      // thresholds keeps trackpad jitter from reversing the animation.
      const pinned = scrollYProgress.get();
      const near = approach.get();
      const next = near >= PLAY_AT || pinned >= 0.15 ? 1 : near <= REWIND_AT && pinned <= 0.05 ? 0 : target;
      if (next === undefined || next === target) return;
      target = next;
      playback?.stop();
      const distance = Math.abs(next - automaticProgress.get());
      if (distance === 0) return;
      // Reverse from the current frame, including when playback is interrupted.
      playback = animate(automaticProgress, next, { duration: 3 * distance, ease: [0.77, 0, 0.175, 1] });
    };
    const unsubscribe = scrollYProgress.on("change", trigger);
    const unsubscribeApproach = approach.on("change", trigger);
    trigger();
    return () => { unsubscribe(); unsubscribeApproach(); playback?.stop(); };
  }, [animated, autoComplete, automaticProgress, scrollYProgress, approach]);

  const [phase, setPhase] = useState(0);
  useMotionValueEvent(progress, "change", (value) => {
    // React only changes at accessibility boundaries; Motion handles every frame.
    setPhase(value < 0.2 ? 0 : value < 0.72 ? 1 : 2);
  });
  const clipPath = useScrollRange(progress, [0.06, 0.7], [
    "inset(0% 0% 0% 0% round 0px)",
    "inset(30% 35% 21% 35% round 40px)",
  ]);
  const imageTransform = useScrollRange(progress, [0.06, 0.7], ["translateY(0%) scale(1)", "translateY(18%) scale(0.88)"]);
  const heroOpacity = useScrollRange(progress, [0, 0.2], [1, 0]);
  const heroTransform = useScrollRange(progress, [0, 0.2], ["translateY(0px)", "translateY(-32px)"]);
  const headingOpacity = useScrollRange(progress, [0.38, 0.65], [0, 1]);
  const headingTransform = useScrollRange(progress, [0.38, 0.65], ["translateY(24px)", "translateY(0px)"]);
  const cardOpacity = useScrollRange(progress, [0.58, 0.76], [0, 1]);
  const outroOpacity = useScrollRange(progress, [0.7, 0.9], [0, 1]);
  const outroTransform = useScrollRange(progress, [0.7, 0.9], ["translateY(16px)", "translateY(0px)"]);
  const leftTransform = useScrollRange(progress, [0.42, 0.76], ["translate(32%, 10%) scale(0.94)", "translate(0%, 0%) scale(1)"]);
  const rightTransform = useScrollRange(progress, [0.48, 0.82], ["translate(-32%, 10%) scale(0.94)", "translate(0%, 0%) scale(1)"]);

  const sectionId = (title || "cinematic-reveal").replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-").toLowerCase();
  const heading = hasVisibleText(revealTitle) ? revealTitle : title;

  return (
    <section id={sectionId} ref={root} className={styles.section} data-animated={animated} data-playback={autoComplete ? "automatic" : "scroll"} data-cinematic="3-cards-reveal"
      data-navpoint-name={navPointName} data-nav-hidden={hideFromNav ? "true" : undefined}>
      <div className={styles.stage}>
        <motion.div className={styles.heroCopy} inert={animated && phase !== 0} style={animated ? { opacity: heroOpacity, transform: heroTransform } : undefined}>
          {!animated && <div className={styles.staticHeroMedia} aria-hidden>
            {cards[0].video ? <video src={cards[0].video} poster={cards[0].image} autoPlay muted loop playsInline /> : <img src={cards[0].image} alt="" />}
            <div className={styles.shade} />
          </div>}
          {hasVisibleText(brand) && <p className={`flzr-headline ${styles.brand}`}>{brand}</p>}
          <h2 className="flzr-headline">{title}</h2>
          {hasVisibleText(text) && <p className={styles.intro}>{text}</p>}
          {ctaHref && hasVisibleText(cta?.text) && <Button2 href={ctaHref} text={cta!.text} variant="violet" size="lg" />}
        </motion.div>
        {/* In normal flow the opening title is already on screen; only repeat it when the reveal title differs. */}
        {(animated || heading !== title) && (
          <motion.h2 className={`flzr-headline ${styles.revealTitle}`} style={animated ? { opacity: headingOpacity, transform: headingTransform } : undefined}>{heading}</motion.h2>
        )}
        <div className={styles.cards}>
          {cards.map((card, index) => (
            <motion.article key={card.id} className={`${styles.card} ${index === 0 ? styles.primary : index === 1 ? styles.left : styles.right}`} inert={animated && phase !== 2} style={animated && index !== 0 ? { opacity: cardOpacity, transform: index === 1 ? leftTransform : rightTransform } : undefined}>
              <motion.div className={styles.media} style={animated && index === 0 ? { clipPath } : undefined}>
                {card.video
                  ? <motion.video src={card.video} poster={card.image} autoPlay muted loop playsInline preload={index === 0 ? "auto" : "metadata"} aria-label={card.imageAlt || undefined} style={animated && index === 0 ? { transform: imageTransform } : undefined} />
                  : <motion.img src={card.image} alt={card.imageAlt || ""} loading={index === 0 ? "eager" : "lazy"} decoding="async" style={animated && index === 0 ? { transform: imageTransform } : undefined} />}
                <div className={styles.shade} />
              </motion.div>
              <motion.div className={styles.cardCopy} style={animated && index === 0 ? { opacity: cardOpacity } : undefined}>
                <CardCopy card={card} />
              </motion.div>
            </motion.article>
          ))}
        </div>
        {(hasVisibleText(outro) || (outroCtaHref && hasVisibleText(outroCta?.text))) && (
          <motion.div className={styles.outro} inert={animated && phase !== 2} style={animated ? { opacity: outroOpacity, transform: outroTransform } : undefined}>
            {hasVisibleText(outro) && <p>{outro}</p>}
            {outroCtaHref && hasVisibleText(outroCta?.text) && <div className={styles.outroAction}><Button2 href={outroCtaHref} text={outroCta!.text} variant="violet" size="md" /></div>}
          </motion.div>
        )}
      </div>
    </section>
  );
}
