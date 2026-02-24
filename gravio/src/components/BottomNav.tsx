"use client";

import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

const footerLinks = {
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  Help: [
    { label: "FAQs", href: "/faq" },
    { label: "Track Order", href: "/track-order" },
    { label: "Return Policy", href: "/return-policy" },
    { label: "Cancellation Policy", href: "/cancellation" },
  ],
  Legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookie" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-gray-300 mt-auto">
      {/* Top green strip */}
      <div className="h-1 w-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-2">
              
              <span
                className="text-white text-2xl font-black tracking-tight"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Gravio
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Fresh groceries delivered to your doorstep in minutes. Quality products, unbeatable prices.
            </p>

            {/* Contact Info */}
            <div className="flex flex-col gap-3 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <div className="flex items-start gap-2 text-gray-400">
                <MapPin size={16} className="mt-0.5 text-green-400 shrink-0" />
                <span>123, Model Town, FC - 400001</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={16} className="text-green-400 shrink-0" />
                <span>+92 327 4476830</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={16} className="text-green-400 shrink-0" />
                <span>Support@Gravio.com</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-500 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon size={16} className="text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-4">
              <h3
                className="text-white font-bold text-sm uppercase tracking-widest"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {title}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-gray-400 hover:text-green-400 text-sm transition-colors duration-200"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-10" />

        {/* App Download + Copyright Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* App Download Buttons */}
          <div className="flex flex-col gap-2">
            <p
              className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Download Our App
            </p>
            <div className="flex items-center gap-3">
              {/* Play Store */}
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.18 23.76c.3.17.64.24.99.2L14.54 12 11 8.46 3.18 23.76z" fill="#EA4335"/>
                  <path d="M20.93 10.4l-2.93-1.67-3.46 3.46 3.46 3.46 2.96-1.69a1.9 1.9 0 0 0 0-3.56z" fill="#FBBC04"/>
                  <path d="M3.17.24A1.9 1.9 0 0 0 2 1.97v20.06c0 .72.4 1.35.99 1.69L14.54 12 3.17.24z" fill="#4285F4"/>
                  <path d="M3.18.24L14.54 12l3.46-3.46L5.12.07A1.9 1.9 0 0 0 3.18.24z" fill="#34A853"/>
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] text-gray-300 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>GET IT ON</span>
                  <span className="text-white text-xs font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.18 1.27-2.16 3.8.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.37 2.78M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[9px] text-gray-300 font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>DOWNLOAD ON THE</span>
                  <span className="text-white text-xs font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>App Store</span>
                </div>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <p
            className="text-gray-500 text-xs text-center sm:text-right"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            © {new Date().getFullYear()} Gravio. All rights reserved. <br className="sm:hidden" />
            Made with ❤️ for fresh deliveries.
          </p>
        </div>
      </div>
    </footer>
  );
}