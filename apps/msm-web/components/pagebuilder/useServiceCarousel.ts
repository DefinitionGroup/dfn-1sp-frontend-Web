"use client";

import {useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent} from 'react';
import {animate, useInView, useMotionValue, useReducedMotion, type PanInfo} from 'motion/react';

const AUTOPLAY_MS = 5500;
const SPRING = {type: 'spring' as const, stiffness: 180, damping: 24, mass: 1};

/** One Motion track owns dragging, wheel input, autoplay and settling. */
export function useServiceCarousel(count: number) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const reduced = useReducedMotion();
  const inView = useInView(viewport, {amount: 0.45});
  const [active, setActive] = useState(0);
  const [page, setPage] = useState(0);
  const [geometry, setGeometry] = useState({max: 0, pages: 1});
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [restart, setRestart] = useState(0);
  const targets = useRef([0]);
  const current = useRef(0);
  const step = useRef(0);
  const visibleWidth = useRef(0);
  const direction = useRef(1);
  const dragged = useRef(false);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const goTo = useCallback((index: number, velocity = 0) => {
    const next = Math.max(0, Math.min(targets.current.length - 1, index));
    const target = targets.current[next];
    current.current = next;
    setPage(next);
    setActive(step.current ? Math.round(-target / step.current) : 0);
    setRestart(value => value + 1);
    x.stop();
    if (reduced) x.set(target);
    else animate(x, target, {...SPRING, velocity: Math.max(-1500, Math.min(1500, velocity))});
  }, [reduced, x]);

  function move(delta: number) {
    direction.current = delta;
    goTo(current.current + delta);
  }

  const snap = useCallback((velocity = 0) => {
    // Project a short distance so a deliberate flick advances without skipping the whole rail.
    const projected = x.get() + Math.max(-step.current * 0.8, Math.min(step.current * 0.8, velocity * 0.18));
    const nearest = targets.current.reduce((best, target, index) =>
      Math.abs(target - projected) < Math.abs(targets.current[best] - projected) ? index : best, 0);
    if (nearest !== current.current) direction.current = nearest > current.current ? 1 : -1;
    goTo(nearest, velocity);
  }, [goTo, x]);

  useEffect(() => {
    const element = viewport.current;
    const rail = track.current;
    if (!element || !rail) return;
    const measure = () => {
      const cards = Array.from(rail.children) as HTMLElement[];
      const padding = getComputedStyle(element);
      const width = element.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
      const first = cards[0];
      const last = cards.at(-1);
      const max = first && last ? Math.max(0, last.offsetLeft + last.offsetWidth - first.offsetLeft - width) : 0;
      step.current = cards[1] && first ? cards[1].offsetLeft - first.offsetLeft : width;
      visibleWidth.current = width;
      // Include the exact end stop, even when mobile shows a partial next card.
      const stops = cards.map(card => -Math.min(max, card.offsetLeft - (first?.offsetLeft || 0)));
      targets.current = stops.filter((target, index) => index === 0 || Math.abs(target - stops[index - 1]) > 1);
      if (!targets.current.length) targets.current = [0];
      current.current = Math.min(current.current, targets.current.length - 1);
      x.stop();
      x.set(targets.current[current.current]);
      setPage(current.current);
      setActive(step.current ? Math.round(-targets.current[current.current] / step.current) : 0);
      setGeometry({max, pages: targets.current.length});
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    observer.observe(rail);
    return () => {observer.disconnect(); x.stop();};
  }, [count, x]);

  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  const autoplay = inView && reduced === false && !paused && !hovered && !focused && !interacting && !hidden && geometry.pages > 1;
  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => {
      const last = targets.current.length - 1;
      if (current.current >= last) direction.current = -1;
      if (current.current <= 0) direction.current = 1;
      goTo(current.current + direction.current);
    }, AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [autoplay, restart, goTo]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (!delta || !geometry.max) return; // Vertical page scrolling remains native.
      event.preventDefault();
      x.stop();
      setInteracting(true);
      const pixels = delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? visibleWidth.current : 1);
      x.set(Math.max(-geometry.max, Math.min(0, x.get() - pixels)));
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {snap(); setInteracting(false);}, 160);
    };
    element.addEventListener('wheel', wheel, {passive: false});
    return () => {element.removeEventListener('wheel', wheel); clearTimeout(wheelTimer.current);};
  }, [geometry.max, snap, x]);

  function onDragStart() {
    clearTimeout(wheelTimer.current);
    x.stop();
    dragged.current = true;
    setInteracting(true);
  }
  function onDragEnd(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    snap(info.velocity.x);
    setInteracting(false);
  }
  function reveal(index: number) {
    const card = track.current?.children[index] as HTMLElement | undefined;
    const first = track.current?.children[0] as HTMLElement | undefined;
    if (!card || !first) return;
    const left = card.offsetLeft - first.offsetLeft;
    const right = left + card.offsetWidth;
    const offset = -targets.current[current.current];
    if (left < offset - 1 || right > offset + visibleWidth.current + 1) {
      const fitting = targets.current.map((target, i) => ({target, i}))
        .filter(({target}) => left >= -target - 1 && right <= -target + visibleWidth.current + 1);
      const nearest = fitting.reduce((best, stop) => Math.abs(stop.target - x.get()) < Math.abs(best.target - x.get()) ? stop : best, fitting[0]);
      goTo(nearest?.i ?? index);
    }
    setActive(index);
  }

  function resetDrag() {dragged.current = false;}
  function preventDraggedClick(event: ReactMouseEvent) {
    if (!dragged.current || event.detail === 0) return;
    event.preventDefault();
    event.stopPropagation();
    dragged.current = false;
  }

  return {viewportRef: viewport, trackRef: track, x, reduced, active, setActive, paused, setPaused, setHovered, setFocused,
    interacting, resetDrag, preventDraggedClick, onDragStart, onDragEnd, reveal, move, goTo, page, ...geometry, autoplay,
    playMedia: inView && !hidden && !paused && reduced === false};
}
