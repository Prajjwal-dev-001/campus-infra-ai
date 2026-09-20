"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Compass, Wrench, ShieldCheck, Building2, MapPin } from "lucide-react";
import CampusTour360 from "@/components/tour/CampusTour360";

export default function StudentCampusTourPage() {
  const router = useRouter();

  const handleReportIssue = (suggestedBlock?: string) => {
    // Navigate back to student dashboard with log tab
    router.push("/student/dashboard");
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <Link
            href="/student/dashboard"
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-orange-50 text-gray-700 hover:text-lpu-orange flex items-center justify-center transition-colors border border-gray-200"
            title="Back to Student Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                LPU 360° Virtual Campus Tour
              </h1>
              <span className="text-[10px] uppercase font-bold bg-orange-100 text-lpu-orange px-2 py-0.5 rounded-full flex items-center gap-1">
                <Compass className="w-3 h-3" />
                Live 360 View
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <span>Interactive 360-degree panoramic navigation of Lovely Professional University infrastructure</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-lpu-orange hover:bg-lpu-orange-dark text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Lodge Maintenance Request</span>
          </Link>
        </div>
      </div>

      {/* Campus Quick Facts Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-3 px-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-lpu-orange" />
          <span className="text-slate-300">
            Campus Scale: <strong className="text-white">600+ Acres</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">
            Hostel Complexes: <strong className="text-white">BH-1 to BH-8 & GH-1 to GH-6</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Infrastructure Surveillance: <strong className="text-white">Active RMS IoT Monitoring</strong>
          </span>
        </div>
      </div>

      {/* Main Full-Height 360 Tour Component */}
      <CampusTour360 fullHeight={true} onReportIssue={handleReportIssue} />
    </div>
  );
}
