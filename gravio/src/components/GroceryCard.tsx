'use client'

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addToCart } from "@/redux/cartSlice";

interface IGrocery {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id?: any; // frontend me mongoose type use nahi karte
  name: string;
  category: string;
  price: string;
  unit: string;
  image: string;
}

const GroceryCard = ({ item }: { item: IGrocery }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [qty, setQty] = useState(0);

  // 🔥 Make data Redux-safe
  const createSafePayload = (quantity: number) => ({
    _id: item._id?.toString(), // ObjectId → string
    name: item.name,
    category: item.category,
    price: item.price,
    unit: item.unit,
    image: item.image,
    quantity,
  });

  const handleAddToCart = () => {
    const newQty = 1;
    setQty(newQty);
    dispatch(addToCart(createSafePayload(newQty)));
  };

  const handleIncrease = () => {
    const newQty = qty + 1;
    setQty(newQty);
    dispatch(addToCart(createSafePayload(newQty)));
  };

  const handleDecrease = () => {
    const newQty = qty - 1;

    if (newQty <= 0) {
      setQty(0);
      dispatch(addToCart(createSafePayload(0)));
    } else {
      setQty(newQty);
      dispatch(addToCart(createSafePayload(newQty)));
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <div className="relative w-full h-48 bg-gray-50 overflow-hidden">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-contain p-6 group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />

        <span className="absolute top-3 left-3 bg-emerald-50 text-emerald-600 text-xs font-medium px-3 py-1 rounded-full">
          {item.category}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              Rs: {item.price}
            </p>
            <p className="text-xs text-gray-400">
              per {item.unit}
            </p>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {qty === 0 ? (
                <motion.button
                  key="add"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add
                </motion.button>
              ) : (
                <motion.div
                  key="counter"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 bg-emerald-500 text-white px-3 py-2 rounded-full"
                >
                  <button
                    onClick={handleDecrease}
                    className="hover:scale-110 transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="text-sm font-semibold w-4 text-center">
                    {qty}
                  </span>

                  <button
                    onClick={handleIncrease}
                    className="hover:scale-110 transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroceryCard;