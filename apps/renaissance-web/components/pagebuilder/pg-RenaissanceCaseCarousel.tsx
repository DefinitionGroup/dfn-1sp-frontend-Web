"use client";

import {AnimatePresence, MotionConfigContext, motion, useInView, useReducedMotion, type PanInfo} from 'motion/react';
import {useContext, useEffect, useRef, useState} from 'react';
import {stegaClean} from '@sanity/client/stega';
import type {RenaissanceCaseCarousel, RenaissanceCarouselBackgroundTone} from '@1sp/sanity-types';
import {assetUrl} from '@1sp/utils/cloudinary';
import {getCarouselImageUrl, getCarouselPosterUrl, getCarouselVideoSources} from '@1sp/utils/carousel-media';
import {caseCarouselItems} from '@renaissance/lib/caseCarousel';
import Button2 from '@renaissance/components/ui/Button2';
import {CarouselTextOverlay} from './Fragments/CarouselTextOverlay';

const controlClass = 'grid h-11 min-w-11 place-items-center rounded-control border border-renaissance-ink px-3 text-renaissance-ink transition-colors hover:bg-renaissance-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-renaissance-ink';

export default function RenaissanceCaseCarouselBlock({data, backgroundTone = 'darkGreen'}: {
  data: RenaissanceCaseCarousel;
  backgroundTone?: RenaissanceCarouselBackgroundTone;
}) {
  const items = caseCarouselItems(data.caseStudies);
  const [selectedId, setSelectedId] = useState<string | number>();
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [failedVideo, setFailedVideo] = useState<string | number>();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(sectionRef);
  const nearView = useInView(sectionRef, {once: true, margin: '200px'});
  const systemReducedMotion = useReducedMotion();
  const motionConfig = useContext(MotionConfigContext);
  // A containing preview/accessibility preference may reduce motion further,
  // but must never override the visitor's system preference to allow motion.
  const reducedMotion = systemReducedMotion || motionConfig.reducedMotion === 'always';
  // Keep live-preview changes safe when the selected case is removed or reordered.
  const index = Math.max(0, items.findIndex(item => item.id === selectedId));
  const active = items[index];
  const canMove = items.length > 1;
  const moving = !paused && !hidden && inView && !reducedMotion;
  const advancing = Boolean(data.autoAdvance && canMove && moving && !hovered && !focused);
  const rawVideo = assetUrl(active?.video);
  const poster = getCarouselImageUrl(assetUrl(active?.image)) || getCarouselPosterUrl(rawVideo);
  const renderVideo = Boolean(rawVideo && nearView && !reducedMotion && failedVideo !== active?.id);

  const paginate = (step: number) => {
    if (!canMove) return;
    setDirection(step);
    setSelectedId(items[(index + step + items.length) % items.length].id);
  };
  const nextId = items[(index + 1) % items.length]?.id;

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!advancing) return;
    const timer = window.setInterval(() => {setDirection(1); setSelectedId(nextId);}, 7000);
    return () => window.clearInterval(timer);
  }, [advancing, active?.id, nextId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (moving) void video.play().catch((error: DOMException) => {
      // A rejected candidate <source> can bubble an error while another source
      // is playable. Only replace the video when playback itself is unsupported.
      if (videoRef.current === video && error.name === 'NotSupportedError') setFailedVideo(active?.id);
    });
    else video.pause();
  }, [moving, active?.id, renderVideo]);

  if (!active) return null;

  const anchor = stegaClean(data.navPointName || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const onDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60 || info.offset.x * info.velocity.x > 10000 && info.offset.x < 0) paginate(1);
    else if (info.offset.x > 60 || info.offset.x * info.velocity.x > 10000 && info.offset.x > 0) paginate(-1);
  };
  const duration = reducedMotion ? 0 : 0.72;
  const variants = {
    enter: (step: number) => ({clipPath: reducedMotion ? 'inset(0)' : step > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'}),
    center: {clipPath: 'inset(0)'},
    exit: (step: number) => ({clipPath: reducedMotion ? 'inset(0)' : step < 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)'}),
  };

  return (
    <section ref={sectionRef} id={anchor || undefined} aria-roledescription="carousel" aria-label="Renaissance cases"
      data-navpoint-name={data.navPointName || undefined} data-nav-hidden={data.hideFromNav || undefined}
      data-renaissance-case-carousel data-carousel-background={backgroundTone}
      className={`relative scroll-mt-28 py-3 text-white sm:py-5 ${backgroundTone === 'light' ? 'bg-renaissance-paper' : 'bg-renaissance-ink'}`}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault(); paginate(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}>
      <div className="relative mx-auto max-w-[1680px] overflow-hidden rounded-media border-b-[3px] border-renaissance-signal">
        <div className="relative grid overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.article key={active.id} custom={direction} variants={variants} initial="enter" animate="center" exit="exit"
              transition={{duration, ease: [0.22, 1, 0.36, 1]}}
              role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${items.length}: ${stegaClean(active.title || '')}`}
              data-media-state={failedVideo === active.id ? 'fallback' : renderVideo ? 'video' : 'poster'}
              drag={canMove && !reducedMotion ? 'x' : false} dragConstraints={{left: 0, right: 0}} dragElastic={0.15} onDragEnd={onDragEnd}
              className="relative col-start-1 row-start-1 flex min-h-[34rem] flex-col justify-end bg-renaissance-ink sm:min-h-[42rem] lg:min-h-[48rem]"
              style={{touchAction: 'pan-y'}}>
              {renderVideo ? (
                <video key={rawVideo} ref={videoRef} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover" onError={event => {if (event.currentTarget.error) setFailedVideo(active.id);}}>
                  {getCarouselVideoSources(rawVideo).map(source => <source key={source.src} src={source.src} media={source.media} />)}
                </video>
              ) : poster ? (
                // Cloudinary helper supplies the responsive media stage's optimized source.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              ) : null}
              <CarouselTextOverlay />
              <div className="relative z-10 px-6 pb-28 pt-44 sm:px-9 sm:pt-56 lg:px-12">
                <motion.div initial={{opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20}} animate={{opacity: 1, y: 0}}
                  transition={{delay: reducedMotion ? 0 : 0.24, duration: reducedMotion ? 0 : 0.5}} className="max-w-[48rem]">
                  <p className="eyebrow-mono mb-3 tracking-[0.04em] text-white">Case {String(index + 1).padStart(2, '0')}{active.subtitle ? ` · ${active.subtitle}` : ''}</p>
                  <h3 className="break-words text-[clamp(2.25rem,5.3vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance text-white">{active.title}</h3>
                  <div className="mt-5 max-w-lg border-t border-white/35 pt-5">
                    {active.description ? <p className="text-sm leading-relaxed text-white sm:text-base">{active.description}</p> : null}
                    <div className="mt-5"><Button2 href={active.linkHref!} text="View case study" variant="default" /></div>
                  </div>
                </motion.div>
              </div>
            </motion.article>
          </AnimatePresence>
        </div>
        <div className="absolute bottom-0 left-6 z-20 flex max-w-[calc(100%-3rem)] flex-wrap items-center gap-2 rounded-t-control bg-renaissance-signal px-3 py-2 sm:left-9 lg:left-12">
          <span aria-hidden="true" className="mr-3 font-mono text-xs font-semibold text-renaissance-ink">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
          {canMove ? <>
            <button type="button" aria-label="Previous case" className={controlClass} onClick={() => paginate(-1)}><span aria-hidden="true">←</span></button>
            <button type="button" aria-label="Next case" className={controlClass} onClick={() => paginate(1)}><span aria-hidden="true">→</span></button>
          </> : null}
          {!reducedMotion && (rawVideo || data.autoAdvance && canMove) ? (
            <button type="button" aria-label={paused ? 'Resume carousel motion' : 'Pause carousel motion'} aria-pressed={paused}
              className={`${controlClass} text-xs`} onClick={() => setPaused(value => !value)}>{paused ? 'Play' : 'Pause'}</button>
          ) : null}
          <span className="sr-only" aria-live={advancing ? 'off' : 'polite'} aria-atomic="true">Case {index + 1} of {items.length}: {stegaClean(active.title || '')}</span>
        </div>
      </div>
    </section>
  );
}
