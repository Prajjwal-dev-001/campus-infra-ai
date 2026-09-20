"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Navigation, Wrench, ShieldCheck, MapPin, Compass } from "lucide-react";
import CampusNavigator from "@/components/tour/CampusNavigator";

export default function StudentCampusNavigatorPage() {
  return (
    <div className="space-y-4">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <Link
            href="/student/dashboard"
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-lpu-orange flex items-center justify-center transition-colors border border-gray-200 shrink-0"
            title="Back to Student Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                LPU Campus Google Maps & 360° Wayfinder
              </h1>
              <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Live Wayfinding
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Turn-by-turn pedestrian routing, electric shuttle schedules, campus landmarks directory, and 360° panoramic navigation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/student/tour"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors border border-gray-200"
          >
            <Compass className="w-3.5 h-3.5 text-lpu-orange" />
            <span>Full 360° View</span>
          </Link>

          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-lpu-orange hover:bg-lpu-orange-dark text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Lodge Maintenance Request</span>
          </Link>
        </div>
      </div>

      {/* Main Google Maps Navigator Component */}
      <CampusNavigator />
    </div>
  );
}
