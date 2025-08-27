"use client";

import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
  gradient: string;
}

const services: Service[] = [
  {
    id: 1,
    title: "Gaming Experiences",
    description:
      "Immersive gaming solutions that captivate and engage players worldwide",
    icon: "🎮",
    features: [
      "Game Development",
      "Interactive Design",
      "Player Analytics",
      "Multiplayer Systems",
    ],
    color: "from-purple-500 to-pink-500",
    gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
  },
  {
    id: 2,
    title: "Brand Strategy",
    description:
      "Comprehensive brand development that resonates with your target audience",
    icon: "🚀",
    features: [
      "Brand Identity",
      "Visual Design",
      "Market Research",
      "Brand Guidelines",
    ],
    color: "from-blue-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 3,
    title: "Interactive Web",
    description:
      "Cutting-edge web experiences that convert visitors into customers",
    icon: "💻",
    features: [
      "Web Development",
      "UX/UI Design",
      "Performance Optimization",
      "SEO Strategy",
    ],
    color: "from-green-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
  },
  {
    id: 4,
    title: "Motion Graphics",
    description:
      "Dynamic visual content that brings your ideas to life with stunning animations",
    icon: "🎨",
    features: [
      "2D/3D Animation",
      "Video Production",
      "Visual Effects",
      "Motion Design",
    ],
    color: "from-orange-500 to-red-500",
    gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
  },
  {
    id: 5,
    title: "AR/VR Solutions",
    description:
      "Next-generation immersive experiences using augmented and virtual reality",
    icon: "🥽",
    features: [
      "AR Development",
      "VR Experiences",
      "3D Modeling",
      "Spatial Computing",
    ],
    color: "from-indigo-500 to-purple-500",
    gradient: "bg-gradient-to-br from-indigo-500/20 to-purple-500/20",
  },
  {
    id: 6,
    title: "Digital Marketing",
    description:
      "Data-driven marketing strategies that maximize reach and engagement",
    icon: "📈",
    features: [
      "Social Media",
      "Content Strategy",
      "Analytics",
      "Campaign Management",
    ],
    color: "from-pink-500 to-rose-500",
    gradient: "bg-gradient-to-br from-pink-500/20 to-rose-500/20",
  },
];

export default function ServicesSection() {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-20relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}>
          <h2 className="text-5xl md:text-7xl  tracking-tighter mb-4">
            <span className="">Our</span>
            <br />
            <span className="">Services</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive solutions for gaming, marketing, and interactive
            experiences
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}>
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              className="relative group"
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              whileHover={{ y: -10 }}>
              <div
                className={`relative p-8 rounded-xsbackdrop-blur-sm transition-all duration-300 ${
                  hoveredService === service.id
                    ? `${service.gradient} border-transparent shadow-2xl`
                    : " hover:bg-gray-800/50"
                }`}>
                {/* Animated Background */}
                <motion.div
                  className={`absolute inset-0 rounded-xs bg-gradient-to-br ${service.color} opacity-0 transition-opacity duration-300`}
                  animate={{
                    opacity: hoveredService === service.id ? 0.1 : 0,
                  }}
                />

                {/* Icon */}
                <motion.div
                  className="text-6xl mb-6"
                  animate={{
                    scale: hoveredService === service.id ? 1.2 : 1,
                    rotate: hoveredService === service.id ? 10 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  {service.icon}
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: hoveredService === service.id ? 1 : 0.7,
                          x: hoveredService === service.id ? 0 : -20,
                        }}
                        transition={{ delay: featureIndex * 0.1 }}>
                        <motion.div
                          className={`w-2 h-2 rounded-full bg-gradient-to-r ${service.color}`}
                          animate={{
                            scale: hoveredService === service.id ? 1.5 : 1,
                          }}
                        />
                        <span className="text-sm text-gray-800">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    className={`mt-8 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      hoveredService === service.id
                        ? `bg-gradient-to-r ${service.color} text-white shadow-lg`
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    Learn More
                  </motion.button>
                </div>

                {/* Floating Elements */}
                {hoveredService === service.id && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-4 h-4 rounded-full bg-gradient-to-r ${service.color} opacity-60`}
                        initial={{
                          x: Math.random() * 300 - 150,
                          y: Math.random() * 300 - 150,
                          scale: 0,
                        }}
                        animate={{
                          x: Math.random() * 400 - 200,
                          y: Math.random() * 400 - 200,
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.5,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.5 }}>
          {[
            { number: "500+", label: "Projects Completed" },
            { number: "50+", label: "Happy Clients" },
            { number: "5+", label: "Years Experience" },
            { number: "24/7", label: "Support Available" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              whileHover={{ scale: 1.05 }}>
              <motion.div
                className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent mb-2"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  delay: index * 0.1 + 0.7,
                }}>
                {stat.number}
              </motion.div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
