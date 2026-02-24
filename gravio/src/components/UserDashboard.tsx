/* eslint-disable react/jsx-key */
import React from "react";
import HeroSection from "./HeroSection";
import CategorySlider from "./CategorySlider";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import GroceryCard from "./GroceryCard";

async function UserDashboard() {
  await connectDb();

  const groceries = await Grocery.find({}).lean();

  const formattedGroceries = groceries.map((item) => ({
    ...item,
    _id: item._id.toString(), // 🔥 important
  }));

  return (
    <>
      <HeroSection />
      <CategorySlider />

      <section className="max-w-7xl mx-auto px-4 py-10">
        <div
          className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        gap-6
      "
        >
          {formattedGroceries.map((item) => (
            <GroceryCard key={item._id} item={item} />
          ))}
        </div>
      </section>
    </>
  );
}

export default UserDashboard;
