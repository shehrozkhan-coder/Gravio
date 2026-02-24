'use client'

import { useState, useEffect, useRef } from "react";
import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  HeartPulse,
  Home,
  Package,
  Baby,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";

const categories = [
  { name: "Fruits & Vegetables", icon: Apple, color: "from-green-400 to-green-600" },
  { name: "Dairy & Eggs", icon: Milk, color: "from-blue-400 to-blue-600" },
  { name: "Rice, Atta & Grains", icon: Wheat, color: "from-yellow-400 to-yellow-600" },
  { name: "Snacks & Biscuits", icon: Cookie, color: "from-orange-400 to-orange-600" },
  { name: "Beverages & Drinks", icon: Coffee, color: "from-amber-400 to-amber-600" },
  { name: "Personal Care", icon: HeartPulse, color: "from-pink-400 to-pink-600" },
  { name: "Household Essentials", icon: Home, color: "from-indigo-400 to-indigo-600" },
  { name: "Instant & Packaged Food", icon: Package, color: "from-purple-400 to-purple-600" },
  { name: "Baby & Pet Care", icon: Baby, color: "from-rose-400 to-rose-600" },
];

const loopCategories = [...categories, ...categories];

const CategorySlider = () => {
  const [active, setActive] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreen = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const amount = 250;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">

        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-800 mb-6">
          Shop by Category
        </h2>

        {/* Mobile Arrows */}
        {!isDesktop && (
          <div className="flex justify-end gap-3 mb-4">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full bg-white shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full bg-white shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Slider */}
        <div className="overflow-hidden">
          {isDesktop ? (
            // Desktop → Auto Animation
            <motion.div
              className="flex gap-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                repeat: Infinity,
                duration: 25,
                ease: "linear",
              }}
            >
              {loopCategories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <div key={index} className="min-w-[190px] cursor-pointer">
                    <CategoryCard
                      cat={cat}
                      Icon={Icon}
                      active={active}
                      setActive={setActive}
                    />
                  </div>
                );
              })}
            </motion.div>
          ) : (
            // Mobile → Manual Scroll
            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto scroll-smooth"
            >
              {categories.map((cat, index) => {
                const Icon = cat.icon;
                return (
                  <div key={index} className="min-w-[150px] cursor-pointer">
                    <CategoryCard
                      cat={cat}
                      Icon={Icon}
                      active={active}
                      setActive={setActive}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CategoryCard({ cat, Icon, active, setActive }: any) {
  const isActive = active === cat.name;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.05 }}
      onClick={() => setActive(cat.name)}
      className={`
        relative
        bg-white/60
        backdrop-blur-xl
        border
        ${isActive ? "border-emerald-500 shadow-xl" : "border-white/40"}
        rounded-3xl
        p-5
        flex
        flex-col
        items-center
        justify-center
        gap-4
        transition-all
        duration-300
      `}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${cat.color} text-white shadow-md`}
      >
        <Icon className="w-6 h-6" />
      </div>

      <p className="text-xs sm:text-sm font-semibold text-gray-800 text-center">
        {cat.name}
      </p>
    </motion.div>
  );
}

export default CategorySlider;
