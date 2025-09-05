"use client";

import { motion, AnimatePresence, PanInfo } from "motion/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import StaggeredFadeIn from "./StaggeredFadeIn";
import Button2 from "./Button2";
interface CarouselItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  video?: string;
  description: string;
  category: string;
  logosrc?: string;
}

const carouselItems: CarouselItem[] = [
  {
    id: 1,
    title: "Gaming Campaign",
    subtitle: "Epic Battle Royale",
    image: "/s1.png",
    description: "Immersive gaming experience with cutting-edge visuals",
    category: "Gaming",
    logosrc: "/logos/Ubisoft_logo.svg",
  },
  {
    id: 2,
    title: "Brand Identity",
    subtitle: "Visual Storytelling",
    image: "/s4.jpg",
    description: "Complete brand transformation with interactive elements",
    category: "Branding",
    logosrc: "/logos/Lufthansa_Logo_2018.svg",
  },
  {
    id: 3,
    title: "Interactive Web",
    subtitle: "User Experience",
    image: "/s2.png",
    description: "Revolutionary web experiences that engage and convert",
    category: "Web Design",
    logosrc: "/logos/Meta_Platforms_Inc._logo.svg",
  },
  {
    id: 4,
    title: "Motion Graphics",
    subtitle: "Dynamic Content",
    image: "/s3.png",
    description: "Stunning motion graphics for digital campaigns",
    category: "Animation",
    logosrc: "/logos/Microsoft-logo_black.svg",
  },
  {
    id: 5,
    title: "AR Experience",
    subtitle: "Augmented Reality",
    image: "/s1.png",
    description: "Next-generation AR solutions for marketing",
    category: "AR/VR",
  },
];

export default function InteractiveCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 1,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.1,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % carouselItems.length;
      } else {
        return prev === 0 ? carouselItems.length - 1 : prev - 1;
      }
    });
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <section className="  ">
      <div className="container  mx-auto w-full ">
        <motion.div
          className="text-center "
          initial={{ opacity: 1, y: 50 }}
          whileInView={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}></motion.div>

        <div className="relative h-[600px] flex items-start">
          {/* Main Carousel */}
          <div className="relative w-full  rounded-sm h-full perspective-1000">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.1 },
                  scale: { duration: 1 },
                  rotateY: { duration: 1 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}>
                <div className="relative w-full h-full overflow-hidden bg-gradient-to-brshadow-2xl">
                  {/* Background Image */}
                  <motion.img
                    src={carouselItems[currentIndex].image}
                    alt={carouselItems[currentIndex].title}
                    className="absolute inset-0 w-full h-full  object-cover"
                    initial={{ scale: 1.3, opacity: 1 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.6 }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0  flex   left-0 right-0 p-8 text-white">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      className=" flex-col items-start justify-start p-8 max-w-3xl space-y-2"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            delay: 0.6,
                            staggerChildren: 0.4252,
                          },
                        },
                      }}>
                      <div>
                        <motion.div className="w-fit  px-3   text-black  flex  text-xs rounded-xs ">
                          <Image
                            className="mb-8 invert"
                            src={
                              carouselItems[currentIndex].logosrc ||
                              "/logos/Amazon_logo.svg"
                            }
                            alt="Logo"
                            width={96}
                            height={44}
                          />
                        </motion.div>
                        <motion.h3 className="text-7xl font-semibold  leading-compressed  pb-0">
                          {carouselItems[currentIndex].title}
                        </motion.h3>
                      </div>
                      <motion.p className="text-xl text-gray-100 r">
                        {carouselItems[currentIndex].subtitle}
                      </motion.p>
                      <motion.p className="text-gray-100 text-sm max-w-2xl ">
                        {carouselItems[currentIndex].description}
                      </motion.p>
                      <motion.p className="text-gray-100 text-sm max-w-2xl ">
                        <Button2 variant="limesmall" text="View Case Study" />
                      </motion.p>
                    </motion.div>
                  </div>

                  {/* Interactive Elements */}
                  <motion.div
                    className="absolute top-4 right-4"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}>
                    <button className="w-6  h-6 cursor-pointer bg-black/50 backdrop-blur-sm rounded-xs flex items-center justify-center text-lime-400 hover:bg-white/100  hover:text-black transition-colors">
                      <svg
                        width="11"
                        height="113"
                        viewBox="0 0 14 14"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 1.00696V10.757C14 10.9061 13.9407 11.0492 13.8353 11.1547C13.7298 11.2602 13.5867 11.3195 13.4375 11.3195C13.2883 11.3195 13.1452 11.2602 13.0398 11.1547C12.9343 11.0492 12.875 10.9061 12.875 10.757V2.36446L1.83501 13.4045C1.72838 13.5038 1.58734 13.5579 1.44162 13.5553C1.29589 13.5528 1.15685 13.4937 1.05379 13.3907C0.950731 13.2876 0.891697 13.1486 0.889126 13.0028C0.886555 12.8571 0.940647 12.7161 1.04001 12.6095L12.08 1.56946H3.68751C3.53832 1.56946 3.39525 1.51019 3.28976 1.40471C3.18427 1.29922 3.12501 1.15614 3.12501 1.00696C3.12501 0.857774 3.18427 0.7147 3.28976 0.60921C3.39525 0.503721 3.53832 0.444458 3.68751 0.444458H13.4375C13.5867 0.444458 13.7298 0.503721 13.8353 0.60921C13.9407 0.7147 14 0.857774 14 1.00696Z" />
                      </svg>
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <motion.button
            className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-12 h-12  bg-gray-300  backdrop-blur-sm rounded-xs flex items-center justify-center text-black hover:bg-white/20 transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}>
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </motion.button>

          <motion.button
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gray-300 backdrop-blur-sm rounded-xs flex items-center justify-center text-black hover:bg-white/20 transition-colors z-10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}>
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-8 space-x-2">
          {carouselItems.map((_, index) => (
            <motion.button
              key={index}
              className={`w-1 h-2 rounded-full  transition-all duration-300 ${
                index === currentIndex
                  ? "bg-lime-400 min-w-16 "
                  : "bg-gray-300 min-w-3"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
            />
          ))}
        </div>

        {/* Thumbnail Strip */}
        <div className="flex justify-center mt-8 space-x-4 pt-4overflow-x-auto pb-4">
          {carouselItems.map((item, index) => (
            <motion.button
              key={item.id}
              className={`flex-shrink-0 w-32 h-32  rounded-sm overflow-hidden outline-3 transition-colors ${
                index === currentIndex
                  ? "outline-lime-500"
                  : "outline-transparent"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}>
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
