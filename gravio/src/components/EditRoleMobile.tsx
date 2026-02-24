"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, Truck, Check } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useSession } from "next-auth/react";

const allRoles = [
  { id: "user", title: "Customer", icon: User },
  { id: "admin", title: "Admin", icon: ShieldCheck },
  { id: "deliveryBoy", title: "Delivery Boy", icon: Truck },
];

export default function EditRoleMobile() {
  const [selected, setSelected] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  // ✅ FIXED: roles ab state mein hai taake filter ho sake
  const [roles, setRoles] = useState(allRoles);
  const router = useRouter();

  const { data: session, status, update } = useSession();

  useEffect(() => {
    console.log("=========== SESSION INFO ===========");
    console.log("SESSION STATUS:", status);
    console.log("FULL SESSION OBJECT:", session);
    console.log("SESSION USER:", session?.user);
    console.log("====================================");
  }, [session, status]);

  useEffect(() => {
    const checkForAdmin = async () => {
      try {
        const result = await axios.get("/api/check-for-admin");
        // ✅ FIXED: roles array se admin filter karo, selected string pe nahi
        if (result.data.adminExist) {
          setRoles((prev) => prev.filter((r) => r.id !== "admin"));
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkForAdmin();
  }, []);

  const handleSubmit = async () => {
    if (!selected) {
      setError("Please select a role");
      return;
    }

    if (phone.length < 8) {
      setError("Enter a valid phone number");
      return;
    }

    setError("");

    try {
      const res = await axios.post("/api/user/edit-role-mobile", {
        role: selected,
        mobile: `+${phone}`,
      });

      console.log("Data sent to backend successfully:", res.data);

      const updatedSession = await update({ role: selected });

      console.log("=========== AFTER UPDATE ===========");
      console.log("UPDATED SESSION RESPONSE:", updatedSession);
      console.log("CURRENT SESSION STATE:", session);
      console.log("====================================");

      if (selected === "admin") {
        router.push("/admin");
      } else if (selected === "deliveryBoy") {
        router.push("/delivery");
      } else {
        router.push("/");
      }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.log("Error:", err.response?.data);
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 relative group overflow-hidden">
        <img
          src="/img.jpg"
          alt="Role"
          className="w-full h-screen object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/40 transition-all duration-500 group-hover:bg-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 opacity-0 group-hover:opacity-100 transition-all duration-700">
          <h1 className="text-white text-5xl font-bold mb-4">
            Join Our Platform
          </h1>
          <p className="text-white text-lg max-w-md">
            Select your role and become part of a powerful ecosystem.
          </p>
        </div>
      </div>

      {/* Right Section */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full md:w-1/2 flex items-center justify-center px-8 bg-white"
      >
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6">Select Your Role</h2>

          {/* Role Buttons */}
          <div className="flex flex-col gap-4">
            {roles.map((item) => {
              const Icon = item.icon;
              const active = selected === item.id;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setSelected(item.id);
                    setError("");
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                    active
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-green-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={20}
                      className={active ? "text-green-600" : "text-gray-500"}
                    />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {active && <Check size={18} className="text-green-600" />}
                </motion.button>
              );
            })}
          </div>

          {/* Phone Input */}
          <div className="mt-8">
            <label className="text-sm text-gray-600 block mb-2">
              Phone Number
            </label>

            <PhoneInput
              country={"pk"}
              enableSearch={true}
              value={phone}
              onChange={(value) => {
                setPhone(value);
                setError("");
              }}
              inputStyle={{
                width: "100%",
                height: "50px",
                borderRadius: "16px",
                border: "1px solid #d1d5db",
              }}
              containerStyle={{
                width: "100%",
              }}
              buttonStyle={{
                borderTopLeftRadius: "16px",
                borderBottomLeftRadius: "16px",
              }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="mt-8 w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-green-600 transition-all duration-300"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}