"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRMSStore } from "@/lib/store";
import { LogOut, Home, Bell, Compass } from "lucide-react";
import ToastContainer from "@/components/ui/Toast";

export const LPUHeader: React.FC = () => {
  const router = useRouter();
  const { currentUser, tickets, logout } = useRMSStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Compute pending notification count based on user role
  const pendingNotificationCount = (() => {
    if (!currentUser) return 0;
    if (currentUser.role === "student") {
      return tickets.filter(
        (t) =>
          (t.userId === currentUser.id || t.studentRegNo === currentUser.id) &&
          (t.status === "Pending" || t.status === "Assigned" || t.status === "In_Progress")
      ).length;
    } else if (currentUser.role === "warden") {
      const blk = currentUser.block || "BH-5";
      return tickets.filter(
        (t) => (t.locationBlock === blk || t.block === blk) && t.status === "Pending"
      ).length;
    } else if (currentUser.role === "maintenance") {
      return tickets.filter(
        (t) => t.status === "Assigned" || t.status === "In_Progress"
      ).length;
    }
    return 0;
  })();

  return (
    <>
      <ToastContainer />
      <header className="w-full bg-white border-b border-gray-200 shadow-xs relative z-30">
        {/* Top 2px decorative orange line */}
        <div className="h-0.5 w-full bg-lpu-orange" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* LEFT: LPU circular logo + text */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              {/* LPU Logo Seal Badge */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-lpu-orange-dark via-lpu-orange to-amber-500 p-0.5 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-0.5">
                  <span className="text-[11px] font-black tracking-tighter text-lpu-orange leading-none">
                    LPU
                  </span>
                  <span className="text-[6px] font-bold text-gray-700 tracking-tightest leading-none mt-0.5">
                    INDIA
                  </span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold tracking-tight text-lpu-black leading-tight">
                  LOVELY PROFESSIONAL UNIVERSITY
                </span>
                <span className="text-[10px] text-gray-500 leading-tight">
                  Transforming Education Transforming India
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Relationship Management System (RMS) */}
          <div className="hidden md:flex items-center justify-center flex-1 px-4">
            <div className="text-center">
              <span className="text-sm lg:text-base font-semibold text-gray-800 tracking-normal">
                Relationship Management System{" "}
              </span>
              <span className="text-sm lg:text-base font-bold text-lpu-orange">
                (RMS)
              </span>
            </div>
          </div>

          {/* RIGHT: Links and user info */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-lpu-orange transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>UMS Home</span>
            </Link>

            {/* 360 Campus Tour Direct Link */}
            <Link
              href="/student/tour"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-lpu-orange transition-colors"
              title="Explore Campus in 360°"
            >
              <Compass className="w-3.5 h-3.5 text-lpu-orange" />
              <span className="hidden sm:inline">360° Tour</span>
            </Link>

            {currentUser && (
              <div className="relative">
                <button
                  type="button"
                  title="Notifications"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-4 h-4" />
                  {pendingNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-lpu-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                      {pendingNotificationCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-gray-900 leading-tight">
                    Welcome, {currentUser.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-lpu-orange leading-tight">
                    {currentUser.role} {currentUser.block ? `• ${currentUser.block}` : ""}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="flex items-center space-x-1 text-xs text-gray-600 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-600 hover:text-lpu-orange font-semibold transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Center Subheader */}
        <div className="md:hidden py-1.5 px-4 bg-lpu-blue-light/60 border-t border-gray-100 text-center">
          <span className="text-xs font-semibold text-gray-800">
            Relationship Management System{" "}
          </span>
          <span className="text-xs font-bold text-lpu-orange">
            (RMS)
          </span>
        </div>

        {/* Bottom 2px orange accent stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-lpu-orange-dark via-lpu-orange to-amber-400" />
      </header>
    </>
  );
};

export default LPUHeader;
