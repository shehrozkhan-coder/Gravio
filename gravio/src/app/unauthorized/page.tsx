"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const Page = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">

      {/* ===== Premium Background Gradient ===== */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-250px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-red-600/20 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[700px] h-[700px] bg-indigo-600/20 blur-[180px] rounded-full" />
      </div>

      {/* ===== Floating Glass Card ===== */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/5 backdrop-blur-3xl border border-white/10 
        rounded-[40px] px-10 md:px-16 py-14 md:py-20 
        max-w-2xl text-center shadow-[0_60px_140px_rgba(0,0,0,0.8)]"
      >

        {/* Soft Border Glow */}
        <div className="absolute inset-0 rounded-[40px] border border-white/10 pointer-events-none" />

        {/* 401 Big Number */}
        <h1 className="text-8xl md:text-[160px] font-bold tracking-tight 
        bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 
        bg-clip-text text-transparent">
          401
        </h1>

        <h2 className="mt-6 text-2xl md:text-4xl font-semibold tracking-tight">
          Unauthorized Access
        </h2>

        <p className="mt-6 text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          This area is restricted. You don’t have the required 
          permissions to view this page.
        </p>

        {/* Single Button */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-block px-10 py-4 bg-white text-black 
            rounded-full font-medium 
            hover:scale-105 hover:shadow-2xl 
            transition-all duration-300"
          >
            Go to Home
          </Link>
        </div>

      </motion.div>

      {/* Subtle Noise Overlay (Luxury Feel) */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />

    </div>
  );
};

export default Page;
