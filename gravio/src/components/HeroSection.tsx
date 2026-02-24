"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "/hero1.jpg",
    title: "Freshness. Delivered.",
    subtitle:
      "Premium groceries with unmatched quality and lightning-fast delivery.",
    buttonText: "Shop Now",
    buttonLink: "/shop",
  },
  {
    id: 2,
    image: "/hero2.jpg",
    title: "Organic. Elevated.",
    subtitle:
      "Handpicked organic produce sourced directly from trusted farms.",
    buttonText: "Explore Organic",
    buttonLink: "/category/organic",
  },
  {
    id: 3,
    image: "/hero3.jpg",
    title: "Save More. Live Better.",
    subtitle:
      "Exclusive daily deals designed to make life easier.",
    buttonText: "View Offers",
    buttonLink: "/offers",
  },
];

const HeroSection = () => {
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[100vh] overflow-hidden mt-16 bg-black">
      
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[current].id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            priority
            unoptimized
            quality={80}
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 
        bg-gradient-to-b 
        from-black/70 
        via-black/60 
        to-black/80" />

      {/* Soft radial glow */}
      <div className="absolute inset-0 
        bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.08),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-6 text-white">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[current].title}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            {/* Premium Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold 
              tracking-tight leading-[1.1]
              bg-gradient-to-r from-white via-gray-200 to-gray-400
              bg-clip-text text-transparent drop-shadow-2xl">
              {slides[current].title}
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-gray-300 text-base sm:text-lg md:text-xl 
              max-w-2xl mx-auto leading-relaxed">
              {slides[current].subtitle}
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row 
              justify-center items-center gap-4 sm:gap-6 w-full">
              
              {/* Primary Button */}
              <Link
                href={slides[current].buttonLink}
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4
                bg-white text-black 
                rounded-full font-medium 
                backdrop-blur-md
                hover:scale-105 hover:shadow-xl
                transition-all duration-300 text-center"
              >
                {slides[current].buttonText}
              </Link>

              {/* Secondary Button */}
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4
                border border-white/30
                rounded-full font-medium
                bg-white/5 backdrop-blur-md
                hover:bg-white/10 hover:scale-105
                transition-all duration-300 text-center"
              >
                Learn More
              </Link>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-[3px] transition-all duration-500 rounded-full ${
              current === index
                ? "w-16 bg-white"
                : "w-8 bg-white/40"
            }`}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroSection;
