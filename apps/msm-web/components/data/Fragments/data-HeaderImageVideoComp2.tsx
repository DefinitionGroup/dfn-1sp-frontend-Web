"use client";

import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';
import {motion, useInView, useReducedMotion, useScroll, useTransform} from 'motion/react';
import {optimizedVideoUrl, cloudinaryPosterUrl} from '@1sp/utils/cloudinary';

interface HeaderImageVideoCompProps {
  useVideo?: boolean; imageSrc?: string; videoSrc?: string; imageAlt?: string;
  className?: string; enableParallax?: boolean; opacity?: number;
}

export default function HeaderImageVideoComp2({
  useVideo = false, imageSrc = '/hero-bg-home2-34f136.png', videoSrc = '/video/atf.mp4',
  imageAlt = 'Hero Background', className = '', enableParallax = true, opacity = 0.5,
}: HeaderImageVideoCompProps) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useInView(ref, {margin: '80px 0px'});
  const reduced = useReducedMotion();
  const [readySource, setReadySource] = useState<string>();
  const {scrollYProgress} = useScroll({target: ref, offset: ['start start', 'end start']});
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  const poster = useVideo ? cloudinaryPosterUrl(videoSrc, {maxWidth: 1280}) : undefined;
  const showVideo = visible && reduced === false;
  const ready = showVideo && readySource === videoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (showVideo) void video.play().catch(() => {});
    else video.pause();
  }, [showVideo]);

  return <div ref={ref} className={`absolute inset-0 overflow-hidden bg-msm-paper ${className}`}>
    <motion.div className="absolute inset-0" style={{y: enableParallax && !reduced ? y : 0}}>
      {useVideo ? <>
        {poster && <Image src={poster} alt={imageAlt} fill sizes="100vw" priority unoptimized className="object-cover" />}
        <video ref={videoRef} src={optimizedVideoUrl(videoSrc, {maxWidth: 1280, quality: 'good', autoCodec: true})}
          muted loop playsInline preload="none" onCanPlay={() => setReadySource(videoSrc)}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 motion-reduce:transition-none"
          style={{opacity: ready ? 1 : 0}} />
      </> : imageSrc && <Image src={imageSrc} alt={imageAlt} fill sizes="100vw" priority
        className="object-cover" unoptimized={imageSrc.includes('cloudinary')} />}
    </motion.div>
    <div className="absolute inset-0 bg-black" style={{opacity}} />
  </div>;
}
