"use client";

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {motion, useInView} from 'motion/react';
import {useServiceCarousel} from './useServiceCarousel';
import {ArrowLeft, ArrowRight, Pause, Play} from '@phosphor-icons/react';
import {optimizedVideoUrl} from '@1sp/utils/cloudinary';
import SelectionFrame from '@msm/components/ui/SelectionFrame';
import Button2 from '@msm/components/ui/Button2';
import styles from './InteractiveServiceCarousel.module.css';

export type ServiceCarouselItem = {id: string; name: string; description?: string; href: string; image?: string; video?: string};

function CardMedia({item, playing}: {item: ServiceCarouselItem; playing: boolean}) {
  const [readySource, setReadySource] = useState<string>();
  const ref = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const visible = useInView(ref, {amount: 0.2});
  const shouldPlay = playing && visible;
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (shouldPlay) void element.play().catch(() => {});
    else element.pause();
  }, [shouldPlay, item.video]);
  return <div ref={ref} className={styles.media}>
    {item.image && <Image src={item.image} alt="" fill draggable={false} sizes="(min-width: 1100px) 32vw, (min-width: 700px) 48vw, 85vw" className={styles.image} />}
    {item.video && <video ref={video} src={optimizedVideoUrl(item.video, {maxWidth: 960})}
      muted loop playsInline preload="none" onPlaying={() => setReadySource(item.video)} onError={() => setReadySource(undefined)}
      className={styles.video} style={{opacity: shouldPlay && readySource === item.video ? 1 : 0}} />}
  </div>;
}

export default function InteractiveServiceCarousel({items, id, title = 'Explore our services', language = 'en', navPointName, hideFromNav}: {
  items: ServiceCarouselItem[]; id: string; title?: string; language?: string; navPointName?: string; hideFromNav?: boolean;
}) {
  const {viewportRef, trackRef, x, reduced, active, setActive, paused, setPaused, setHovered, setFocused,
    interacting, resetDrag, preventDraggedClick, onDragStart, onDragEnd, reveal, move, goTo, page, max, pages, autoplay,
    playMedia} = useServiceCarousel(items.length);
  const de = language === 'de';

  return <section id={id} data-component="interactive-service-carousel" data-navpoint-name={navPointName || title}
    data-nav-hidden={hideFromNav || undefined} className={styles.section} aria-roledescription={de ? 'Karussell' : 'carousel'} aria-labelledby={`${id}-title`}>
    <div className={styles.header}>
      <h2 id={`${id}-title`}>{title}</h2>
      <div className={styles.controls}>
        {(pages > 1 || items.some(item => item.video)) && !reduced && <button type="button" onClick={() => setPaused(value => !value)}
          aria-label={paused ? (de ? 'Karussell abspielen' : 'Play service carousel') : (de ? 'Karussell pausieren' : 'Pause service carousel')} aria-pressed={paused}>
          {paused ? <Play size={20} aria-hidden="true" /> : <Pause size={20} aria-hidden="true" />}
        </button>}
        <button type="button" onClick={() => move(-1)} disabled={page === 0} aria-controls={`${id}-rail`} aria-label={de ? 'Vorherige Services' : 'Previous services'}><ArrowLeft size={24} aria-hidden="true" /></button>
        <button type="button" onClick={() => move(1)} disabled={page >= pages - 1} aria-controls={`${id}-rail`} aria-label={de ? 'Nächste Services' : 'Next services'}><ArrowRight size={24} aria-hidden="true" /></button>
      </div>
    </div>
    <div ref={viewportRef} id={`${id}-rail`} className={styles.rail} tabIndex={0} role="group"
      aria-label={de ? 'Services durchsuchen' : 'Browse services'}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);}}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);}
        if (event.key === 'Home' || event.key === 'End') {event.preventDefault(); goTo(event.key === 'Home' ? 0 : pages - 1);}
      }}>
      <motion.div ref={trackRef} className={styles.track} style={{x: x}}
        data-dragging={interacting || undefined} data-page={page} data-autoplay={autoplay}
        drag={max > 0 ? 'x' : false} dragConstraints={{left: -max, right: 0}}
        dragElastic={reduced ? 0 : 0.18} dragMomentum={false}
        onDragStart={onDragStart} onDragEnd={onDragEnd}
        onPointerDownCapture={resetDrag}
        onDragStartCapture={event => event.preventDefault()}
        onClickCapture={preventDraggedClick}>
      {items.map((item, index) => <article key={item.id} className={styles.slide} aria-label={`${index + 1} / ${items.length}: ${item.name}`}
        onMouseEnter={() => setActive(index)} onFocusCapture={() => reveal(index)}>
        <SelectionFrame className={styles.frame} contentClassName={styles.card} transientCrosses delay={Math.min(index, 2) * 200}>
          <CardMedia item={item} playing={playMedia && active === index} />
          <div className={styles.copy}>
            <h3><Link href={item.href}>{item.name}</Link></h3>
            {item.description && <p>{item.description}</p>}
            <div className={styles.action}><Button2 text={de ? 'Mehr erfahren' : 'Explore service'} href={item.href} variant="violetsmall" magnetic={false} /></div>
          </div>
        </SelectionFrame>
      </article>)}
      </motion.div>
    </div>
  </section>;
}
