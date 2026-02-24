"use client";

import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import Link from "next/link";

type propType = {
  nextStep: (s: number) => void;
};

const Welcome = ({ nextStep }: propType) => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden">
      {/* Bottom Blur Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent backdrop-blur-2xl pointer-events-none" />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 120, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative text-6xl md:text-8xl font-black text-black tracking-tight"
        style={{ fontFamily: "Playfair Display, serif" }}
      >
        Grovi
        <span className="relative inline-block">
          a{/* Animated Leaf */}
          <motion.span
            animate={{
              y: [0, -6, 0], // up down
              scale: [1, 1.15, 1], // small → big → small
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-1 -right-6 text-green-500"
          >
            <Leaf size={28} />
          </motion.span>
        </span>
      </motion.h1>

      {/* Paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 100, filter: "blur(15px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="relative mt-8 max-w-2xl text-lg text-gray-700"
      >
        Fresh groceries delivered to your doorstep in minutes. Experience
        premium quality, lightning-fast delivery, and effortless shopping.
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.9 }}
        className="relative"
      >
        <button
          onClick={() => nextStep(2)}
          className="group mt-10 inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:bg-gray-900 cursor-pointer"
        >
          Get Started
          <ArrowRight className="transition-all duration-300 group-hover:translate-x-2 group-hover:scale-x-125" />
        </button>
      </motion.div>

      {/* Glass Key Points */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative mt-10 sm:mt-14 
  backdrop-blur-md sm:backdrop-blur-xl 
  bg-white/50 sm:bg-white/40 
  border border-white/30 
  shadow-lg sm:shadow-xl 
  rounded-2xl px-4 sm:px-8 py-5 sm:py-6"
      >
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-medium cursor-pointer">
          {[
            "Fresh Products",
            "10-Min Delivery",
            "Best Prices",
            "Secure Payments",
          ].map((item, i) => (
            <div key={i} className="group perspective">
              <div
                className="relative h-9 sm:h-10 
          w-[140px] sm:w-[170px] 
          transition-all duration-500 
          sm:group-hover:-translate-y-1"
              >
                {/* Front */}
                <div
                  className="absolute inset-0 flex items-center justify-center 
            px-3 sm:px-4 py-2 rounded-full 
            bg-white/70 sm:bg-white/60 backdrop-blur-md
            shadow-md transition-all duration-500
            sm:group-hover:rotate-x-90 origin-bottom"
                >
                  {item}

                  {/* Glass Reflection */}
                  <span
                    className="absolute inset-0 rounded-full 
            bg-gradient-to-tr from-white/40 via-transparent to-transparent 
            opacity-40 pointer-events-none"
                  />
                </div>

                {/* Back (Only animate on sm and above) */}
                <div
                  className="absolute inset-0 hidden sm:flex items-center justify-center 
            px-4 py-2 rounded-full 
            bg-green-100 text-black
            shadow-xl transition-all duration-500
            rotate-x-90 origin-top
            group-hover:rotate-x-0"
                >
                  {item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
