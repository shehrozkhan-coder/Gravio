/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBasketIcon,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addToCart } from "@/redux/cartSlice";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const { cartData } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter()

  // Subtotal Calculation
  const subtotal = cartData.reduce(
    (acc, item) => acc + Number(item.price) * item.quantity,
    0
  );

  // ✅ Production Delivery Logic
  const FREE_DELIVERY_THRESHOLD = 300;
  const DELIVERY_CHARGE = 50;

  const deliveryFee =
    cartData.length === 0
      ? 0
      : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : DELIVERY_CHARGE;

  const total = subtotal + deliveryFee;

  const increaseQty = (item: any) => {
    dispatch(addToCart({ ...item, quantity: 1 }));
  };

  const decreaseQty = (item: any) => {
    dispatch(addToCart({ ...item, quantity: -1 }));
  };

  const removeItemCompletely = (item: any) => {
    dispatch(addToCart({ ...item, quantity: -item.quantity }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-12 py-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-black transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">Continue Shopping</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Shopping Cart
        </h1>

        <div />
      </div>

      {cartData.length === 0 ? (
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-10 text-center">
          <ShoppingBasketIcon className="w-16 h-16 mx-auto text-green-500 mb-6" />
          <p className="text-gray-600 mb-6 text-lg">Your cart is empty.</p>
          <Link
            href="/"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full transition font-medium"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {cartData.map((item) => {
                const itemTotal = Number(item.price) * item.quantity;

                return (
                  <motion.div
                    key={item._id.toString()}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="bg-white rounded-3xl shadow-md hover:shadow-xl transition p-5 sm:p-6 flex flex-col sm:flex-row gap-6 items-center"
                  >
                    {/* Image */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {item.name}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Rs {item.price} × {item.quantity}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => decreaseQty(item)}
                        className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                      >
                        <Minus size={16} />
                      </motion.button>

                      <span className="font-semibold text-gray-800 text-lg w-6 text-center">
                        {item.quantity}
                      </span>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => increaseQty(item)}
                        className="w-9 h-9 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center"
                      >
                        <Plus size={16} />
                      </motion.button>
                    </div>

                    {/* Price */}
                    <div className="text-green-600 font-bold text-lg min-w-[90px] text-center sm:text-right">
                      Rs {itemTotal}
                    </div>

                    {/* Remove */}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => removeItemCompletely(item)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-3xl shadow-lg p-8 h-fit lg:sticky lg:top-24">
            <h3 className="text-xl font-semibold mb-8 text-gray-800">
              Order Summary
            </h3>

            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs {subtotal}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span
                  className={
                    deliveryFee === 0 ? "text-green-600 font-medium" : ""
                  }
                >
                  {deliveryFee === 0 ? "Free" : `Rs ${deliveryFee}`}
                </span>
              </div>
            </div>

            {subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="mt-4 bg-yellow-50 text-yellow-700 text-sm p-3 rounded-xl">
                Add Rs {FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery.
              </div>
            )}

            {subtotal >= FREE_DELIVERY_THRESHOLD && (
              <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-xl">
                🎉 You unlocked free delivery!
              </div>
            )}

            <div className="border-t mt-6 pt-6 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-green-600">Rs {total}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full transition font-semibold shadow-md"
              onClick={()=>router.push("/user/checkout")}
            >
              Proceed to Checkout
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
