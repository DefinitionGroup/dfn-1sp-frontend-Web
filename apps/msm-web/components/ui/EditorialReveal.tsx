"use client";

import {useRef, type ReactNode} from 'react';
import {motion, useInView, useReducedMotion} from 'motion/react';

/** Readable at first paint; motion never gates access to editorial content. */
export default function EditorialReveal({children, className}: {children: ReactNode; className?: string}) {
  const ref = useRef<HTMLDivElement>(null);
  const entered = useInView(ref, {once: true, margin: '0px 0px 64px 0px'});
  const reduced = useReducedMotion();
  return <motion.div ref={ref} className={className} initial={false}
    animate={{y: entered || reduced ? 0 : 12}}
    transition={{type: 'spring', bounce: 0, visualDuration: 0.35}}>
    {children}
  </motion.div>;
}
