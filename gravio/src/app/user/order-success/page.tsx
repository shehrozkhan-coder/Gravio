/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/purity */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle, ShoppingBag, Home, Package } from "lucide-react";

const Particle = ({ delay }: { delay: number }) => {
  const colors = ["#16a34a", "#22c55e", "#4ade80", "#bbf7d0", "#fbbf24", "#f59e0b"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const size = Math.random() * 8 + 4;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${left}%`,
        top: "-10px",
        width: size,
        height: size,
        backgroundColor: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: "110vh",
        opacity: [1, 1, 0],
        rotate: Math.random() * 360,
        x: (Math.random() - 0.5) * 200,
      }}
      transition={{
        duration: Math.random() * 2 + 2,
        delay,
        ease: "easeIn",
      }}
    />
  );
};

const OrderSuccess = () => {
  const router = useRouter();
  const [particles, setParticles] = useState<number[]>([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const p = Array.from({ length: 60 }, (_, i) => i);
    setParticles(p);
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const steps = [
    { label: "Order Placed", done: true },
    { label: "Being Prepared", done: false },
    { label: "Out for Delivery", done: false },
    { label: "Delivered", done: false },
  ];

  return (
    <div className="min-h-screen bg-[#f0fdf4] flex items-center justify-center relative overflow-hidden px-4">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .display-font { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map((i) => (
          <Particle key={i} delay={i * 0.04} />
        ))}
      </div>

      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-green-200 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 bg-emerald-300 rounded-full opacity-20 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-100 rounded-full opacity-40 blur-3xl" />

      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border border-green-100"
          >
            {/* Check icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.6, type: "spring", bounce: 0.5 }}
              className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100"
            >
              <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={2} />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="display-font text-4xl font-black text-gray-800 mb-2"
            >
              Order Placed!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-gray-500 text-sm mb-8"
            >
              Your fresh groceries are on their way 🛵
            </motion.p>

            {/* Delivery tracker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between relative">
                {/* Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100 z-0" />
                <motion.div
                  className="absolute top-4 left-4 h-0.5 bg-green-500 z-0"
                  initial={{ width: 0 }}
                  animate={{ width: "8%" }}
                  transition={{ delay: 1, duration: 0.8 }}
                />

                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        step.done
                          ? "bg-green-500 border-green-500 text-white"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {step.done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[10px] font-medium ${step.done ? "text-green-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-green-50 rounded-2xl p-4 mb-8 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Estimated Delivery</p>
                <p className="text-xs text-gray-500">Within 30-45 minutes</p>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/user/my-order")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-green-200 cursor-pointer"
              >
                <ShoppingBag size={18} /> Track My Order
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/")}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all border border-gray-200 cursor-pointer"
              >
                <Home size={18} /> Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderSuccess;