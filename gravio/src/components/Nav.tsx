"use client";

import {
  Search,
  ShoppingBagIcon,
  User,
  LogOut,
  Package,
  X,
  Shield,
  Truck,
  UserCircle2,
  PlusCircle,
  Boxes,
  ClipboardCheck,
  Menu,
} from "lucide-react";
import mongoose from "mongoose";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface IUser {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  mobile?: string;
  role: "user" | "deliveryBoy" | "admin";
  image?: string;
}

const Nav = ({ user }: { user: IUser }) => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const cartData = useSelector(
  (state: RootState) => state.cart.cartData
);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/register");
  };

  const roleConfig = {
    admin: {
      label: "Administrator",
      color: "bg-red-100 text-red-600",
      icon: <Shield size={14} />,
    },
    deliveryBoy: {
      label: "Delivery Boy",
      color: "bg-blue-100 text-blue-600",
      icon: <Truck size={14} />,
    },
    user: {
      label: "Customer",
      color: "bg-green-100 text-green-600",
      icon: <UserCircle2 size={14} />,
    },
  };

  return (
    <>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-[95%] fixed top-5 left-1/2 -translate-x-1/2 
        backdrop-blur-2xl bg-gradient-to-r from-black/50 via-black/40 to-emerald-900/40
        rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]
        flex justify-between items-center
        h-16 px-4 md:px-10 z-50 border border-white/10"
      >
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          {user.role === "admin" && (
            <button
              className="md:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={26} />
            </button>
          )}

          <Link href="/" className="text-white font-extrabold text-xl">
            Gravio
          </Link>
        </div>

        {/* USER SEARCH */}
        {user.role === "user" && (
          <form className="hidden md:flex items-center 
          bg-white/90 rounded-full px-5 py-2.5 w-1/2 max-w-xl">
            <Search className="text-gray-500 w-5 h-5 mr-3" />
            <input
              type="text"
              placeholder="Search groceries..."
              className="w-full bg-transparent outline-none text-gray-700"
            />
          </form>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4 relative">
          {user.role === "user" && (
            <Link
              href="/user/cart"
              className="relative rounded-full bg-white
              w-10 h-10 flex items-center justify-center"
            >
              <ShoppingBagIcon className="text-green-600 w-5 h-5" />
              <span className="absolute -top-1 -right-1 
              bg-red-500 text-white text-xs
              w-5 h-5 flex items-center justify-center rounded-full">
                {cartData.length}
              </span>
            </Link>
          )}

          {user.role === "admin" && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                href={"/admin/add-grocery"}
                className="flex items-center gap-2 bg-white text-green-600 font-semibold
                px-4 py-2 rounded-full hover:scale-105 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                Add Grocery
              </Link>
              <Link
                href=""
                className="flex items-center gap-2 bg-white text-green-600 font-semibold
                px-4 py-2 rounded-full hover:scale-105 transition-all"
              >
                <Boxes className="h-5 w-5" />
                Products
              </Link>
              <Link
                href="/admin/manage-orders"
                className="flex items-center gap-2 bg-white text-green-600 font-semibold
                px-4 py-2 rounded-full hover:scale-105 transition-all"
              >
                <ClipboardCheck className="w-5 h-5" />
                Orders
              </Link>
            </div>
          )}

          {/* PROFILE */}
          <div ref={dropdownRef} className="relative">
            <div
              className="w-10 h-10 rounded-full overflow-hidden
              bg-white flex items-center justify-center cursor-pointer"
              onClick={() => setOpen((prev) => !prev)}
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="text-green-600 w-5 h-5" />
              )}
            </div>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 mt-3 w-72
                  bg-white rounded-2xl shadow-2xl p-5 flex flex-col gap-4"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>

                    <div
                      className={`inline-flex items-center gap-1 text-xs mt-2 px-2 py-1 rounded-full ${roleConfig[user.role].color}`}
                    >
                      {roleConfig[user.role].icon}
                      {roleConfig[user.role].label}
                    </div>
                  </div>

                  {/* ✅ Orders ONLY for USER */}
                  {user.role === "user" && (
                    <Link
                      href="/user/my-order"
                      className="flex items-center gap-2 text-sm px-3 py-2 
                      rounded-xl hover:bg-gray-100 transition"
                    >
                      <Package size={16} />
                      Orders
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm px-3 py-2 
                    rounded-xl hover:bg-red-50 text-red-600 transition"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ADMIN MOBILE SIDEBAR unchanged */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 120 }}
              className="fixed top-0 left-0 h-full w-64 
              bg-white shadow-2xl z-50 p-6 flex flex-col gap-6"
            >
              <button
                className="self-end"
                onClick={() => setSidebarOpen(false)}
              >
                <X />
              </button>
              <h1 className="font-bold text-green-700">Admin Panel</h1>
              <Link href="/admin/add-grocery" className="flex items-center gap-3">
                <PlusCircle /> Add Grocery
              </Link>

              <Link href="" className="flex items-center gap-3">
                <Boxes /> Products
              </Link>

              <Link href={"/admin/manage-orders"} className="flex items-center gap-3">
                <ClipboardCheck /> Orders
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
