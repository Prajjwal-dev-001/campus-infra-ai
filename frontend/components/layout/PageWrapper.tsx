"use client";

import React from "react";
import { motion } from "framer-motion";
import LPUHeader from "./LPUHeader";

export interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = "" }) => {
  return (
    <div className="min-h-screen flex flex-col bg-lpu-blue-light text-lpu-black">
      {/* Top RMS Portal Header */}
      <LPUHeader />

      {/* Main Container constrained to max 1200px with smooth Framer Motion page fade-in */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`w-full ${className}`}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-500">
        <div className="max-w-[1200px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Lovely Professional University. All Rights Reserved.</span>
          <span className="text-[11px] text-gray-400">RMS AI Predictive Maintenance System • Version 1.0</span>
        </div>
      </footer>
    </div>
  );
};

export default PageWrapper;
