"use client";
import { ArrowLeft, PlusCircle, X } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChangeEvent, FormEvent, useState } from "react";
import axios from "axios";

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care",
];

const units = ["kg", "g", "liter", "ml", "piece", "pack"];

const AddGrocery = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [backendImage, setBackendImage] = useState<File | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setBackendImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPreview(null);
    setBackendImage(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
        const formData = new FormData()
        formData.append("name", name)
        formData.append("category", category)
        formData.append("price", price)
        formData.append("unit", unit)
        if(backendImage){
        formData.append("image", backendImage)
        }
        const result = await axios.post("/api/admin/add-grocery", formData)
        console.log(result.data)
    } catch (error) {
        console.log(error)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-white py-20 px-6 relative">

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 font-medium 
        hover:text-emerald-600 transition-all duration-300 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="tracking-wide text-sm">Back</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white border border-slate-200/80
        shadow-[0_30px_90px_-25px_rgba(0,0,0,0.18)]
        rounded-3xl p-14 w-full max-w-3xl transition-all duration-500"
      >

        <div className="flex flex-col items-center mb-14 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-emerald-500/10 text-emerald-600 p-6 rounded-2xl mb-6"
          >
            <PlusCircle size={40} strokeWidth={1.5} />
          </motion.div>

          <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
            Add Grocery Item
          </h1>

          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Enter the details below to add a new item to your inventory.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-12 w-full">

          {/* Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-3 text-sm">
              Grocery Name <span className="text-rose-500">*</span>
            </label>

            <input
              type="text"
              placeholder="e.g. Basmati Rice..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-5 py-4
              text-slate-700 bg-slate-50/70
              focus:bg-white focus:outline-none
              focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
              hover:border-slate-400 transition-all duration-300"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">

            <div>
              <label className="block text-slate-700 font-semibold mb-3 text-sm">
                Category <span className="text-rose-500">*</span>
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-4
                bg-slate-50/70 text-slate-700
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                hover:border-slate-400 transition-all duration-300"
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-3 text-sm">
                Unit <span className="text-rose-500">*</span>
              </label>

              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-4
                bg-slate-50/70 text-slate-700
                focus:bg-white focus:outline-none
                focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
                hover:border-slate-400 transition-all duration-300"
              >
                <option value="">Select Unit</option>
                {units.map((unit, index) => (
                  <option key={index}>{unit}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Price */}
          <div>
            <label className="block text-slate-700 font-semibold mb-3 text-sm">
              Price <span className="text-rose-500">*</span>
            </label>

            <input
              type="number"
              placeholder="e.g. 120"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-5 py-4
              text-slate-700 bg-slate-50/70
              focus:bg-white focus:outline-none
              focus:ring-2 focus:ring-emerald-500/70 focus:border-emerald-500
              hover:border-slate-400 transition-all duration-300"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-slate-700 font-semibold mb-3 text-sm">
              Upload Image <span className="text-rose-500">*</span>
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-slate-300 rounded-xl px-5 py-4
              text-slate-700 bg-slate-50/70 file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0 file:bg-emerald-600
              file:text-white file:font-medium
              hover:border-slate-400 transition-all duration-300"
            />

            {preview && (
              <div className="relative mt-6 w-32 h-32 group">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded-xl border border-slate-200 shadow-md"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 rounded-xl 
                opacity-0 group-hover:opacity-100 
                transition-all duration-300 flex items-center justify-center">

                  <button
                    type="button"
                    onClick={removeImage}
                    className="bg-white p-2 rounded-full shadow-md 
                    hover:scale-110 transition"
                  >
                    <X size={18} className="text-red-500" />
                  </button>

                </div>
              </div>
            )}

          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700
            text-white font-semibold py-4 rounded-xl
            shadow-lg shadow-emerald-500/20
            hover:shadow-emerald-500/30
            active:scale-[0.98] transition-all duration-300"
          >
            Add Grocery
          </button>

        </form>
      </motion.div>
    </div>
  );
};

export default AddGrocery;
