"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  LogIn,
  Leaf,
  Mail,
  Lock,
  Chrome,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const session = useSession()
  console.log(session)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        alert("Invalid credentials");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Heading */}
        <h1 className="text-3xl font-semibold tracking-tight text-black text-center">
          Welcome to Grovia
        </h1>

        {/* Subtitle (Leaf AFTER text ✅) */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-gray-600 text-sm">
            Fresh groceries delivered fast
          </p>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Leaf className="text-green-500 w-5 h-5" />
          </motion.div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          
          {/* Email */}
          <div className="relative group">
            <Mail
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 
              text-gray-400 group-focus-within:text-green-500 transition"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-300 
              rounded-xl focus:outline-none focus:ring-2 
              focus:ring-green-400 transition"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 
              text-gray-400 group-focus-within:text-green-500 transition"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-11 py-3 border border-gray-300 
              rounded-xl focus:outline-none focus:ring-2 
              focus:ring-green-400 transition"
            />

            {/* Eye Toggle */}
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 
              cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold 
            hover:bg-green-500 transition duration-300 
            disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Signing In..." : "Login"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-sm text-gray-800">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={() => signIn("google", {callbackUrl:"/"})}
            className="w-full flex items-center justify-center gap-3 
            border border-gray-300 py-3 rounded-xl 
            hover:bg-gray-50 transition cursor-pointer"
          >
            <Chrome size={20} className="text-orange-500" />
            Continue with Google
          </button>

          {/* Register Redirect */}
          <div className="flex items-center justify-center gap-2 text-sm mt-4">
            <span className="text-gray-500">
              Don’t have an account?
            </span>
            <div
              className="flex items-center gap-1 text-black font-medium cursor-pointer hover:underline"
              onClick={() => router.push("/register")}
            >
              <LogIn size={16} />
              SignUp
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
