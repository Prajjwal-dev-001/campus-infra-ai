"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Compass,
  Maximize,
  Minimize,
  RotateCw,
  ExternalLink,
  MapPin,
  AlertCircle,
  HelpCircle,
  Building,
  Wrench,
  ChevronDown,
  ChevronUp,
  Navigation,
} from "lucide-react";

interface CampusTour360Props {
  onReportIssue?: (suggestedBlock?: string) => void;
  fullHeight?: boolean;
}

interface Landmark {
  id: string;
  name: string;
  category: "Hostel" | "Academic" | "Facility";
  blockCode?: string;
  description: string;
}

const LANDMARKS: Landmark[] = [
  { id: "bh", name: "Boys Hostels (BH-1 to BH-8)", category: "Hostel", blockCode: "BH-5", description: "Residential hostels with mess, gym, and study rooms" },
  { id: "gh", name: "Girls Hostels (GH-1 to GH-6)", category: "Hostel", blockCode: "GH-1", description: "Secure residential towers with indoor dining and recreational courts" },
  { id: "cse", name: "School of CSE (Blocks 32-34)", category: "Academic", blockCode: "Block-34", description: "Advanced Computing labs, AI centers, and lecture theatres" },
  { id: "unimall", name: "Uni-Mall & Food Court", category: "Facility", blockCode: "Block-32", description: "Multi-level student convenience center, banking, dining, and shops" },
  { id: "auditorium", name: "Shanti Devi Mittal Auditorium", category: "Facility", blockCode: "Block-32", description: "World-class cultural and convention hall seating 3,000+" },
  { id: "library", name: "Central University Library", category: "Academic", blockCode: "Block-32", description: "Multi-storey digital research hub, quiet zones, and archives" },
  { id: "hospital", name: "Uni-Hospital & Health Centre", category: "Facility", blockCode: "Uni-Hospital", description: "24/7 medical emergency, inpatient care, and pharmacy" },
  { id: "sports", name: "Indoor & Outdoor Sports Stadium", category: "Facility", blockCode: "BH-5", description: "Olympic-standard sports arena, swimming pool, and athletic track" },
];

export const CampusTour360: React.FC<CampusTour360Props> = ({
  onReportIssue,
  fullHeight = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = "https://iviewd.com/lpu2/";
    }
  };

  const handleSelectLandmark = (lm: Landmark) => {
    setSelectedLandmark(lm);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Tour Container with Frame and Controls Bar */}
      <div
        ref={containerRef}
        className={`relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col transition-all ${
          fullHeight ? "h-[calc(100vh-140px)] min-h-[600px]" : "h-[620px] sm:h-[680px]"
        }`}
      >
        {/* Top Floating Controls Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Status Badge */}
          <div className="pointer-events-auto flex items-center space-x-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 shadow-lg text-white">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lpu-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lpu-orange"></span>
            </span>
            <span className="text-xs font-bold tracking-tight">LPU 360° Interactive Campus Tour</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="pointer-events-auto flex items-center space-x-2">
            {/* Guide Tips Toggle */}
            <button
              onClick={() => setShowTips(!showTips)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md backdrop-blur-md"
              title="Toggle Navigation Tips"
            >
              <HelpCircle className="w-3.5 h-3.5 text-lpu-orange" />
              <span className="hidden sm:inline">Tips</span>
            </button>

            {/* Landmarks Drawer Toggle */}
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-md backdrop-blur-md"
              title="Campus Landmarks Directory"
            >
              <MapPin className="w-3.5 h-3.5 text-lpu-orange" />
              <span className="hidden sm:inline">Landmarks</span>
              {showLandmarks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Refresh / Reset */}
            <button
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors shadow-md backdrop-blur-md"
              title="Reload Tour"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors shadow-md backdrop-blur-md"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Campus Wayfinder / Google Maps Button */}
            <Link
              href="/student/navigator"
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md backdrop-blur-md"
              title="Open Campus Google Maps Wayfinder"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Directions & Map</span>
            </Link>

            {/* Standalone New Tab */}
            <a
              href="https://iviewd.com/lpu2/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-lpu-orange hover:bg-lpu-orange-dark text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-md"
              title="Open directly in new tab"
            >
              <span className="hidden md:inline">Open Tour Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Overlay Navigation Tips Bar */}
        {showTips && (
          <div className="absolute top-14 left-3 right-3 z-20 pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-xs text-slate-200 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              <Compass className="w-4 h-4 text-lpu-orange shrink-0" />
              <div className="flex items-center gap-4 text-[11px] whitespace-nowrap">
                <span>🖱️ <strong>Click & Drag</strong> to rotate 360°</span>
                <span>•</span>
                <span>🔍 <strong>Scroll / Pinch</strong> to zoom in/out</span>
                <span>•</span>
                <span>📍 <strong>Click arrows/hotspots</strong> to step into buildings</span>
              </div>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-slate-400 hover:text-white text-[11px] font-semibold shrink-0 px-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Landmarks Directory Dropdown Overlay */}
        {showLandmarks && (
          <div className="absolute top-14 right-3 z-30 pointer-events-auto w-80 max-h-96 bg-slate-900/98 backdrop-blur-lg border border-slate-700 rounded-xl p-3 shadow-2xl overflow-y-auto text-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-lpu-orange" />
                <span className="text-xs font-bold">Key Campus Landmarks</span>
              </div>
              <button
                onClick={() => setShowLandmarks(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              {LANDMARKS.map((lm) => (
                <div
                  key={lm.id}
                  onClick={() => handleSelectLandmark(lm)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors text-left border ${
                    selectedLandmark?.id === lm.id
                      ? "bg-orange-500/20 border-orange-500/50"
                      : "bg-slate-800/60 hover:bg-slate-800 border-slate-700/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{lm.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                      {lm.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{lm.description}</p>
                  <div className="mt-2 flex items-center justify-between gap-1">
                    <Link
                      href="/student/navigator"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded"
                    >
                      <Navigation className="w-2.5 h-2.5" />
                      Get Directions
                    </Link>
                    {lm.blockCode && onReportIssue && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportIssue(lm.blockCode);
                        }}
                        className="text-[10px] text-lpu-orange hover:text-orange-400 font-semibold flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 rounded"
                      >
                        <Wrench className="w-2.5 h-2.5" />
                        Report Issue
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 text-slate-200">
            <div className="w-12 h-12 border-4 border-lpu-orange/20 border-t-lpu-orange rounded-full animate-spin mb-3"></div>
            <p className="text-xs font-medium text-slate-300">Loading LPU 360° Virtual Experience...</p>
            <p className="text-[11px] text-slate-500 mt-1">Lovely Professional University Panoramic View</p>
          </div>
        )}

        {/* Main 360 IFrame */}
        <iframe
          ref={iframeRef}
          id="tour-iframe"
          src="https://iviewd.com/lpu2/"
          title="LPU 360 Virtual Tour"
          allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-0 flex-1 relative z-0"
        />

        {/* Bottom Bar: Quick Reporting & Info */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-lpu-orange" />
            <span>
              Navigating: <strong>Lovely Professional University Campus</strong> (Phagwara, Punjab)
            </span>
          </div>

          {onReportIssue && (
            <button
              onClick={() => onReportIssue()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-lpu-orange font-semibold transition-colors border border-orange-500/30"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Report Infrastructure Defect from Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Under-Card Contextual Information for Students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-orange-50 text-lpu-orange shrink-0">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Hostel & Block Inspection</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Verify your hostel wing, room corridor, or classroom location before submitting a maintenance request.
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Campus Navigation</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Explore auditoriums, Uni-Mall, sports complexes, libraries, and hospital facilities across 600+ acres.
            </p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900">Smart AI Ticket Resolution</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Pinpoint equipment damage or facility outages for faster warden approval and technician dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusTour360;
