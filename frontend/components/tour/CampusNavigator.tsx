"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Navigation,
  ArrowRight,
  ArrowLeftRight,
  Clock,
  Footprints,
  Car,
  Bike,
  Building,
  Building2,
  Search,
  Sparkles,
  Send,
  ExternalLink,
  ChevronRight,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Wrench,
  Layers,
  Map as MapIcon,
  HelpCircle
} from "lucide-react";
import CampusTour360 from "./CampusTour360";

export interface CampusLandmark {
  id: string;
  name: string;
  code: string;
  category: "Hostel" | "Academic" | "Auditorium" | "Medical" | "Facility" | "Sports" | "Gate";
  x: number; // 0 - 1000 coordinate
  y: number; // 0 - 1000 coordinate
  shuttleStop: boolean;
  description: string;
  blockCode?: string;
  features: string[];
}

export const CAMPUS_LOCATIONS: CampusLandmark[] = [
  {
    id: "main_gate",
    name: "Main Gate (GT Road NH-1)",
    code: "Gate-1",
    category: "Gate",
    x: 500,
    y: 880,
    shuttleStop: true,
    description: "Main campus entrance, security checkpost, visitor registration, and e-rickshaw hub.",
    features: ["Security Gate", "E-Rickshaw Hub", "Visitor Pass", "ATM"]
  },
  {
    id: "unimall",
    name: "Uni-Mall & Student Centre",
    code: "Uni-Mall",
    category: "Facility",
    x: 480,
    y: 670,
    shuttleStop: true,
    blockCode: "Block-32",
    description: "4-story student mall with food court, banks, courier services, bookstores, and salons.",
    features: ["Food Court", "HDFC/SBI Banks", "Supermarket", "Stationery"]
  },
  {
    id: "unipolis",
    name: "Baldev Raj Mittal Unipolis",
    code: "Unipolis",
    category: "Auditorium",
    x: 540,
    y: 560,
    shuttleStop: true,
    description: "Massive open-air amphitheater holding 10,000+ students for campus fests and concerts.",
    features: ["Amphitheater", "Event Stage", "Open Lawn", "Wi-Fi Hub"]
  },
  {
    id: "auditorium",
    name: "Shanti Devi Mittal Auditorium",
    code: "Auditorium",
    category: "Auditorium",
    x: 370,
    y: 520,
    shuttleStop: false,
    blockCode: "Block-32",
    description: "World-class cultural and convention hall with 3,500 seating capacity.",
    features: ["A/C Main Hall", "Acoustics Stage", "VIP Green Rooms"]
  },
  {
    id: "library",
    name: "Central University Library",
    code: "Library",
    category: "Academic",
    x: 630,
    y: 470,
    shuttleStop: true,
    blockCode: "Block-32",
    description: "9-storey digital learning hub with quiet reading floors, research labs, and digital catalogue.",
    features: ["Digital Catalogue", "Reading Halls", "Discussion Pods", "Cyber Hub"]
  },
  {
    id: "block_32",
    name: "Block 32 (Central Academic Complex)",
    code: "Block-32",
    category: "Academic",
    x: 450,
    y: 420,
    shuttleStop: true,
    blockCode: "Block-32",
    description: "Central academic hub with large lecture halls, dean offices, and faculty cabins.",
    features: ["Lecture Theatres 101-412", "Faculty Cabins", "Smart Elevators"]
  },
  {
    id: "block_34",
    name: "Block 34 (School of CSE & AI)",
    code: "Block-34",
    category: "Academic",
    x: 420,
    y: 310,
    shuttleStop: true,
    blockCode: "Block-34",
    description: "High-performance computing labs, AI/Robotics centre, Apple Mac Lab, and coding arenas.",
    features: ["AI & Robotics Lab", "Apple Mac Lab", "Cybersecurity Cell", "Hackathon Arena"]
  },
  {
    id: "block_38",
    name: "Block 38 (Bio-Tech & Agriculture)",
    code: "Block-38",
    category: "Academic",
    x: 320,
    y: 250,
    shuttleStop: false,
    blockCode: "Block-38",
    description: "Biotechnology labs, tissue culture chambers, and university agricultural farms.",
    features: ["Bio-Tech Labs", "Greenhouses", "Soil Testing Lab"]
  },
  {
    id: "block_25",
    name: "Block 25 (Engineering Workshops)",
    code: "Block-25",
    category: "Academic",
    x: 580,
    y: 340,
    shuttleStop: true,
    blockCode: "Block-25",
    description: "Mechanical, Electrical, and Civil engineering heavy machinery labs and innovation workshops.",
    features: ["CNC Labs", "Robotics Workcell", "Automobile Workshop"]
  },
  {
    id: "hospital",
    name: "Uni-Hospital & Healthcare Center",
    code: "Uni-Hospital",
    category: "Medical",
    x: 230,
    y: 620,
    shuttleStop: true,
    blockCode: "Uni-Hospital",
    description: "24/7 university multi-specialty hospital with ICU, pharmacy, ambulance, and trauma care.",
    features: ["24/7 Emergency ICU", "Pharmacy", "Diagnostics & X-Ray", "Ambulance Bay"]
  },
  {
    id: "bh_5",
    name: "Boys Hostel 5 (BH-5 Mega Hostel)",
    code: "BH-5",
    category: "Hostel",
    x: 780,
    y: 320,
    shuttleStop: true,
    blockCode: "BH-5",
    description: "14-storey premier student mega-hostel with mess, study rooms, gym, and sports court.",
    features: ["Dining Mess", "Gym", "Tuck Shop", "Laundry Service", "Security Check"]
  },
  {
    id: "bh_zone",
    name: "Boys Hostels Sector (BH-1 to BH-4, BH-6 to BH-8)",
    code: "BH-Zone",
    category: "Hostel",
    x: 820,
    y: 490,
    shuttleStop: true,
    blockCode: "BH-1",
    description: "Spacious residential community with sports lawns, night canteens, and barbershops.",
    features: ["Hostel Mess", "Night Canteen", "Volleyball Court", "Stationery"]
  },
  {
    id: "gh_zone",
    name: "Girls Hostels Sector (GH-1 to GH-6)",
    code: "GH-Zone",
    category: "Hostel",
    x: 180,
    y: 440,
    shuttleStop: true,
    blockCode: "GH-1",
    description: "Secured high-rise girls residence with round-the-clock wardens, cafeteria, and reading halls.",
    features: ["Biometric Access", "All-Female Staff", "Gym", "Private Cafeteria", "Pharmacy"]
  },
  {
    id: "sports_stadium",
    name: "Olympic Sports Stadium & Complex",
    code: "Sports-Arena",
    category: "Sports",
    x: 730,
    y: 680,
    shuttleStop: true,
    blockCode: "BH-5",
    description: "All-weather Olympic athletic track, synthetic football turf, and indoor badminton arena.",
    features: ["Athletic Track", "Football Turf", "Indoor Badminton", "Swimming Pool"]
  }
];

// Campus connectivity graph (edges with real distances in meters)
interface Edge {
  u: string;
  v: string;
  dist: number;
  instruction: string;
}

const EDGES: Edge[] = [
  { u: "main_gate", v: "unimall", dist: 350, instruction: "Head north along Grand Palm Boulevard" },
  { u: "main_gate", v: "hospital", dist: 450, instruction: "Turn left at Gate 1 roundabout past the medical emergency lane" },
  { u: "unimall", v: "unipolis", dist: 200, instruction: "Walk north past the fountain plaza toward Unipolis" },
  { u: "unimall", v: "auditorium", dist: 280, instruction: "Head north-west past the food kiosk strip to Auditorium gardens" },
  { u: "unimall", v: "sports_stadium", dist: 300, instruction: "Head east along the sports avenue towards Olympic Stadium" },
  { u: "unimall", v: "gh_zone", dist: 420, instruction: "Take the secure west perimeter walkway toward Girls Hostel gate" },
  { u: "unipolis", v: "library", dist: 220, instruction: "Walk north-east along the student promenade to the Library forecourt" },
  { u: "unipolis", v: "block_32", dist: 180, instruction: "Walk north into Block 32 central courtyard" },
  { u: "auditorium", v: "block_32", dist: 160, instruction: "Take the covered corridor into Block 32 south entrance" },
  { u: "auditorium", v: "hospital", dist: 300, instruction: "Head west across the shaded medical gardens" },
  { u: "block_32", v: "block_34", dist: 170, instruction: "Walk north straight through the CSE connecting bridge into Block 34" },
  { u: "block_32", v: "block_25", dist: 220, instruction: "Head east across Engineering plaza into Block 25" },
  { u: "block_34", v: "block_38", dist: 190, instruction: "Walk west along the research path towards Bio-Tech greenhouses" },
  { u: "block_32", v: "library", dist: 240, instruction: "Take the east connecting walkway directly into Central Library" },
  { u: "block_25", v: "bh_5", dist: 320, instruction: "Walk east past the Innovation center towards BH-5 security gate" },
  { u: "block_34", v: "bh_5", dist: 400, instruction: "Take North Ring Road pedestrian pathway towards BH-5" },
  { u: "library", v: "bh_zone", dist: 340, instruction: "Head east through the green belt into BH residential avenue" },
  { u: "bh_5", v: "bh_zone", dist: 280, instruction: "Walk south along the hostel avenue between BH-5 and BH-4" },
  { u: "sports_stadium", v: "bh_zone", dist: 320, instruction: "Head north along the sports complex boundary path" },
  { u: "gh_zone", v: "auditorium", dist: 260, instruction: "Walk east along the floral walkway into Auditorium west gate" },
  { u: "gh_zone", v: "hospital", dist: 250, instruction: "Head south directly along the clinic lane" }
];

// Dijkstra shortest path calculation
function computeRoute(startId: string, endId: string) {
  if (startId === endId) return null;

  const graph: Record<string, { to: string; dist: number; note: string }[]> = {};
  CAMPUS_LOCATIONS.forEach((l) => (graph[l.id] = []));

  EDGES.forEach(({ u, v, dist, instruction }) => {
    if (graph[u] && graph[v]) {
      graph[u].push({ to: v, dist, note: instruction });
      graph[v].push({ to: u, dist, note: instruction });
    }
  });

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const prevNotes: Record<string, string> = {};
  const unvisited = new Set(CAMPUS_LOCATIONS.map((l) => l.id));

  CAMPUS_LOCATIONS.forEach((l) => {
    distances[l.id] = Infinity;
    previous[l.id] = null;
  });
  distances[startId] = 0;

  while (unvisited.size > 0) {
    let closestNode: string | null = null;
    let minDistance = Infinity;
    unvisited.forEach((node) => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        closestNode = node;
      }
    });

    if (!closestNode || minDistance === Infinity || closestNode === endId) break;

    unvisited.delete(closestNode);

    graph[closestNode]?.forEach((edge) => {
      if (unvisited.has(edge.to)) {
        const alt = distances[closestNode!] + edge.dist;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = closestNode;
          prevNotes[edge.to] = edge.note;
        }
      }
    });
  }

  if (distances[endId] === Infinity) return null;

  const path: string[] = [];
  let curr: string | null = endId;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const steps = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromId = path[i];
    const toId = path[i + 1];
    const fromLoc = CAMPUS_LOCATIONS.find((l) => l.id === fromId)!;
    const toLoc = CAMPUS_LOCATIONS.find((l) => l.id === toId)!;
    const note = prevNotes[toId] || `Proceed to ${toLoc.name}`;
    const edge = EDGES.find(
      (e) => (e.u === fromId && e.v === toId) || (e.u === toId && e.v === fromId)
    );
    const dist = edge ? edge.dist : 150;
    steps.push({
      stepNum: i + 1,
      from: fromLoc,
      to: toLoc,
      instruction: note,
      distance: dist,
      estMinutes: Math.max(1, Math.ceil(dist / 75))
    });
  }

  const totalDistance = distances[endId];
  const walkingMinutes = Math.max(1, Math.ceil(totalDistance / 75));
  const shuttleMinutes = Math.max(2, Math.ceil(totalDistance / 250) + 2);
  const cycleMinutes = Math.max(1, Math.ceil(totalDistance / 200));

  return {
    path,
    steps,
    totalDistance,
    walkingMinutes,
    shuttleMinutes,
    cycleMinutes,
  };
}

export const CampusNavigator: React.FC = () => {
  // Navigation State
  const [originId, setOriginId] = useState<string>("bh_5"); // Default Student Hostel
  const [destinationId, setDestinationId] = useState<string>("block_34"); // Default CSE Block
  const [transitMode, setTransitMode] = useState<"walk" | "shuttle" | "bike">("walk");
  const [viewMode, setViewMode] = useState<"split" | "map" | "tour">("split");
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>("");

  // AI Assistant Query State
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiChatMessages, setAiChatMessages] = useState<
    { sender: "user" | "agent"; text: string; action?: { origin: string; dest: string } }[]
  >([
    {
      sender: "agent",
      text: "👋 Hi Rahul! I am your LPU Campus Navigation Agent. Where on campus would you like to go today?",
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Compute Active Route
  const route = useMemo(() => {
    return computeRoute(originId, destinationId);
  }, [originId, destinationId]);

  const originLocation = CAMPUS_LOCATIONS.find((l) => l.id === originId);
  const destLocation = CAMPUS_LOCATIONS.find((l) => l.id === destinationId);

  // Swap Origin and Destination
  const handleSwap = () => {
    const temp = originId;
    setOriginId(destinationId);
    setDestinationId(temp);
  };

  // AI Wayfinder Query Handler
  const handleAiQuerySubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || aiQuery;
    if (!query.trim()) return;

    setAiChatMessages((prev) => [...prev, { sender: "user", text: query }]);
    setAiQuery("");
    setIsAiLoading(true);

    try {
      const qLower = query.toLowerCase();
      let matchedDest = "block_34";

      if (qLower.includes("cse") || qLower.includes("34") || qLower.includes("computer") || qLower.includes("lab") || qLower.includes("mac")) {
        matchedDest = "block_34";
      } else if (qLower.includes("hospital") || qLower.includes("doctor") || qLower.includes("clinic") || qLower.includes("medicine")) {
        matchedDest = "hospital";
      } else if (qLower.includes("mall") || qLower.includes("food") || qLower.includes("eat") || qLower.includes("atm") || qLower.includes("shopping")) {
        matchedDest = "unimall";
      } else if (qLower.includes("library") || qLower.includes("book") || qLower.includes("reading")) {
        matchedDest = "library";
      } else if (qLower.includes("auditorium") || qLower.includes("shanti")) {
        matchedDest = "auditorium";
      } else if (qLower.includes("unipolis") || qLower.includes("fest") || qLower.includes("concert")) {
        matchedDest = "unipolis";
      } else if (qLower.includes("sports") || qLower.includes("gym") || qLower.includes("stadium") || qLower.includes("ground")) {
        matchedDest = "sports_stadium";
      } else if (qLower.includes("hostel 5") || qLower.includes("bh5") || qLower.includes("bh-5")) {
        matchedDest = "bh_5";
      } else if (qLower.includes("gate") || qLower.includes("exit")) {
        matchedDest = "main_gate";
      }

      setDestinationId(matchedDest);
      const destItem = CAMPUS_LOCATIONS.find((l) => l.id === matchedDest)!;
      const calc = computeRoute(originId, matchedDest);

      const agentReply = `I've mapped the fastest route to **${destItem.name}**! Total distance is **${calc?.totalDistance || 400} meters** (approx. ${calc?.walkingMinutes || 5} min walk). Follow the glowing route line on your map or view in 360° below!`;

      setTimeout(() => {
        setAiChatMessages((prev) => [
          ...prev,
          {
            sender: "agent",
            text: agentReply,
            action: { origin: originId, dest: matchedDest }
          }
        ]);
        setIsAiLoading(false);
      }, 400);
    } catch {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* =========================================================================
          TOP GOOGLE MAPS NAVIGATION CONTROL BAR
          ========================================================================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title with Google Maps style branding */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Navigation className="w-6 h-6 text-white transform -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                  LPU Campus Google Maps & 360° Wayfinder
                </h2>
                <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Guided
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time campus navigation, pedestrian routes, electric shuttle stands, and synchronized 360° vistas
              </p>
            </div>
          </div>

          {/* View Mode Switcher (Split / Map / 360) */}
          <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl self-start sm:self-auto border border-gray-200">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "split"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Split (Map + 360°)</span>
            </button>

            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Campus Map</span>
            </button>

            <button
              onClick={() => setViewMode("tour")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "tour"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-lpu-orange" />
              <span>Full 360° Tour</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            ORIGIN & DESTINATION SELECTOR + TRANSIT MODES (Google Maps Card)
            ========================================================================= */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Origin & Destination Inputs (Col 1-7) */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-center gap-2 relative">
            {/* Origin (A) */}
            <div className="w-full flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mr-2 shadow-xs">
                A
              </div>
              <div className="flex-1">
                <span className="block text-[10px] uppercase font-bold text-gray-400">Starting From</span>
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.id === "bh_5" ? "(My Hostel)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="p-2 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-600 hover:text-blue-600 transition-colors shadow-xs shrink-0"
              title="Swap Start and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* Destination (B) */}
            <div className="w-full flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mr-2 shadow-xs">
                B
              </div>
              <div className="flex-1">
                <span className="block text-[10px] uppercase font-bold text-gray-400">Destination</span>
                <select
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Transit Mode Selector (Col 8-12) */}
          <div className="lg:col-span-5 flex items-center justify-between sm:justify-end gap-2 bg-slate-50 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setTransitMode("walk")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                transitMode === "walk"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
            >
              <Footprints className="w-4 h-4" />
              <span>Walk ({route?.walkingMinutes || 5} min)</span>
            </button>

            <button
              onClick={() => setTransitMode("shuttle")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                transitMode === "shuttle"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
              title="Electric Campus E-Rickshaw Shuttle"
            >
              <Car className="w-4 h-4" />
              <span>Shuttle ({route?.shuttleMinutes || 3} min)</span>
            </button>

            <button
              onClick={() => setTransitMode("bike")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                transitMode === "bike"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white"
              }`}
              title="Campus Bicycle Tracks"
            >
              <Bike className="w-4 h-4" />
              <span>Bicycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MAIN INTERACTIVE GRID: CAMPUS MAP + 360 TOUR + AI WAYFINDER
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Interactive Map & Turn-by-Turn Directions (7 Cols in split, 12 in map, 0 in tour) */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className={`${viewMode === "map" ? "lg:col-span-12" : "lg:col-span-7"} space-y-4`}>
            {/* Visual Campus Map Canvas */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
              {/* Map Top Bar Overlay */}
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-white flex items-center gap-2 text-xs shadow-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">LPU Interactive Wayfinding Map</span>
                  <span className="text-[10px] text-slate-400">• Click any building to route</span>
                </div>

                <div className="pointer-events-auto bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-white text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {transitMode === "walk"
                      ? `${route?.walkingMinutes || 5} min • ${route?.totalDistance || 300} m`
                      : transitMode === "shuttle"
                      ? `${route?.shuttleMinutes || 3} min E-Rickshaw`
                      : `${route?.cycleMinutes || 3} min Cycle`}
                  </span>
                </div>
              </div>

              {/* Interactive SVG Campus Map */}
              <div className="w-full h-[380px] sm:h-[420px] relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
                <svg
                  viewBox="0 0 1000 1000"
                  className="w-full h-full select-none"
                  style={{ filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.5))" }}
                >
                  {/* Background Grid & Campus Perimeter */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
                    </pattern>
                    <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  <rect width="1000" height="1000" fill="url(#grid)" />

                  {/* Campus Lawns & Green Belts */}
                  <ellipse cx="500" cy="500" rx="350" ry="320" fill="#064e3b" opacity="0.15" />
                  <circle cx="800" cy="400" r="140" fill="#064e3b" opacity="0.18" />
                  <circle cx="200" cy="450" r="120" fill="#064e3b" opacity="0.18" />

                  {/* Grand Palm Boulevard (Main Road Spine) */}
                  <path
                    d="M 500 950 L 500 700 L 480 670 L 540 560 L 450 420 L 420 310"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 500 950 L 500 700 L 480 670 L 540 560 L 450 420 L 420 310"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeDasharray="8,8"
                  />

                  {/* Secondary Roads & Pedestrian Walkways */}
                  {EDGES.map((edge, idx) => {
                    const u = CAMPUS_LOCATIONS.find((l) => l.id === edge.u);
                    const v = CAMPUS_LOCATIONS.find((l) => l.id === edge.v);
                    if (!u || !v) return null;
                    return (
                      <line
                        key={`edge-${idx}`}
                        x1={u.x}
                        y1={u.y}
                        x2={v.x}
                        y2={v.y}
                        stroke="#1e293b"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    );
                  })}

                  {/* Active Calculated Route (Glowing Animated Line) */}
                  {route && route.path.length > 1 && (
                    <g>
                      {/* Glow underneath */}
                      <path
                        d={route.path
                          .map((nodeId, idx) => {
                            const node = CAMPUS_LOCATIONS.find((l) => l.id === nodeId)!;
                            return `${idx === 0 ? "M" : "L"} ${node.x} ${node.y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.3"
                        filter="url(#glow)"
                      />
                      {/* Animated dashed line */}
                      <path
                        d={route.path
                          .map((nodeId, idx) => {
                            const node = CAMPUS_LOCATIONS.find((l) => l.id === nodeId)!;
                            return `${idx === 0 ? "M" : "L"} ${node.x} ${node.y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="10 8"
                        className="animate-pulse"
                      />
                    </g>
                  )}

                  {/* Campus Landmark Nodes */}
                  {CAMPUS_LOCATIONS.map((loc) => {
                    const isOrigin = loc.id === originId;
                    const isDestination = loc.id === destinationId;
                    const isWaypoint = route?.path.includes(loc.id);

                    return (
                      <g
                        key={loc.id}
                        transform={`translate(${loc.x}, ${loc.y})`}
                        onClick={() => {
                          if (loc.id !== originId) setDestinationId(loc.id);
                        }}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        {/* Node circle */}
                        <circle
                          r={isOrigin || isDestination ? 24 : isWaypoint ? 18 : 14}
                          fill={
                            isOrigin
                              ? "#10b981"
                              : isDestination
                              ? "#ef4444"
                              : isWaypoint
                              ? "#3b82f6"
                              : "#1e293b"
                          }
                          stroke={isOrigin || isDestination ? "#ffffff" : "#475569"}
                          strokeWidth={isOrigin || isDestination ? "3" : "2"}
                          filter={isOrigin || isDestination ? "url(#glow)" : undefined}
                        />

                        {/* Node Icon / Letter */}
                        <text
                          textAnchor="middle"
                          dy="4"
                          fill="#ffffff"
                          fontSize={isOrigin || isDestination ? "13" : "10"}
                          fontWeight="bold"
                        >
                          {isOrigin ? "A" : isDestination ? "B" : loc.code.charAt(0)}
                        </text>

                        {/* Label Badge */}
                        <g transform="translate(0, 26)">
                          <rect
                            x={-loc.name.length * 3.4}
                            y="-10"
                            width={loc.name.length * 6.8}
                            height="18"
                            rx="5"
                            fill="#0f172a"
                            stroke="#334155"
                            strokeWidth="1"
                            opacity="0.9"
                          />
                          <text
                            textAnchor="middle"
                            dy="3"
                            fill={isDestination ? "#fca5a5" : isOrigin ? "#86efac" : "#e2e8f0"}
                            fontSize="9"
                            fontWeight="600"
                          >
                            {loc.name.split("(")[0].trim()}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>

                {/* Map Bottom Legend */}
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Start (A)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination (B)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Waypoints
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-500">600+ Acres Campus Map Model</span>
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Navigation Steps (Google Maps Directions) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">
                    Step-by-Step Directions to {destLocation?.name.split("(")[0]}
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {route?.steps.length || 0} Turn Steps
                </span>
              </div>

              {/* Route Summary Pill */}
              <div className="mt-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-blue-700">
                    {transitMode === "walk"
                      ? `${route?.walkingMinutes || 5} min`
                      : transitMode === "shuttle"
                      ? `${route?.shuttleMinutes || 3} min`
                      : `${route?.cycleMinutes || 3} min`}
                  </span>
                  <span>({route?.totalDistance || 300} meters)</span>
                  <span>•</span>
                  <span>Fastest Pedestrian Route</span>
                </div>

                {destLocation?.blockCode && (
                  <Link
                    href="/student/dashboard"
                    className="text-[11px] font-bold text-lpu-orange hover:text-orange-700 flex items-center gap-1"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Report Issue in {destLocation.blockCode}</span>
                  </Link>
                )}
              </div>

              {/* Steps List */}
              <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {route?.steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-3 rounded-xl border transition-all flex items-start space-x-3 cursor-pointer ${
                      activeStepIndex === idx
                        ? "bg-orange-50/60 border-orange-200 shadow-2xs"
                        : "bg-gray-50/50 hover:bg-gray-100/70 border-gray-100"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {step.stepNum}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">
                        {step.instruction}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>Walk ~{step.distance} meters</span>
                        <span>•</span>
                        <span>Est: ~{step.estMinutes} min</span>
                        <span>•</span>
                        <span>Approaching: <strong>{step.to.name.split("(")[0]}</strong></span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode("tour");
                      }}
                      className="px-2 py-1 rounded bg-white border border-gray-200 text-gray-600 hover:text-lpu-orange hover:border-orange-300 text-[10px] font-semibold flex items-center gap-1 shrink-0"
                      title="View this landmark in 360°"
                    >
                      <Eye className="w-3 h-3 text-lpu-orange" />
                      <span>360° View</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Interactive LPU 360 View + AI Wayfinder Assistant (5 Cols in split, 12 in tour, 0 in map) */}
        {(viewMode === "split" || viewMode === "tour") && (
          <div className={`${viewMode === "tour" ? "lg:col-span-12" : "lg:col-span-5"} space-y-4`}>
            {/* Embedded 360 Tour with Live Panoramic Waypoints */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-lpu-orange animate-spin-slow" />
                  <span className="font-bold">LPU 360° Panoramic Waypoint</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Focused on: <strong className="text-slate-200">{destLocation?.name.split("(")[0]}</strong>
                </span>
              </div>

              {/* 360 IFrame Viewer */}
              <div className={viewMode === "tour" ? "h-[650px]" : "h-[380px] sm:h-[420px]"}>
                <iframe
                  src="https://iviewd.com/lpu2/"
                  title="LPU 360 Virtual Tour Navigation"
                  allow="fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* 360 Overlay Quick Controls */}
              <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span>🖱️ Click & Drag to look around in 360°</span>
                <a
                  href="https://iviewd.com/lpu2/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lpu-orange hover:text-orange-400 font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>Open Fullscreen Tour</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* AI Wayfinding Assistant Chat Box */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                <div className="p-1.5 rounded-lg bg-orange-100 text-lpu-orange">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                    Ask Campus AI Wayfinder
                  </h3>
                  <p className="text-[10px] text-gray-500">Ask questions like &ldquo;Where is Block 34?&rdquo; or &ldquo;Nearest food court&rdquo;</p>
                </div>
              </div>

              {/* Quick Prompt Chips */}
              <div className="py-2.5 flex flex-wrap gap-1.5">
                {[
                  "CSE Block 34 Mac Labs",
                  "Uni-Hospital Emergency",
                  "Uni-Mall Food Court",
                  "Central Library",
                  "Olympic Sports Complex"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAiQuerySubmit(undefined, `How do I reach ${chip}?`)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full bg-gray-100 hover:bg-orange-50 hover:text-lpu-orange text-gray-700 transition-colors border border-gray-200"
                  >
                    📍 {chip}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 my-2 text-xs">
                {aiChatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl ${
                      msg.sender === "agent"
                        ? "bg-slate-50 border border-slate-100 text-slate-800"
                        : "bg-blue-600 text-white ml-auto max-w-[85%]"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                    <span>Calculating optimal campus path...</span>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAiQuerySubmit} className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Where do you want to go on campus?"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!aiQuery.trim() || isAiLoading}
                  className="p-2 rounded-xl bg-lpu-orange hover:bg-lpu-orange-dark disabled:bg-gray-200 text-white transition-colors shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CAMPUS DIRECTORY QUICK-CARDS
          ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-lpu-orange" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-900">
              LPU Campus Landmarks Quick Directory
            </h3>
          </div>
          <span className="text-[11px] text-gray-500">Click any card to calculate directions</span>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CAMPUS_LOCATIONS.slice(0, 8).map((landmark) => (
            <div
              key={landmark.id}
              onClick={() => {
                setDestinationId(landmark.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                destinationId === landmark.id
                  ? "bg-blue-50/70 border-blue-300 shadow-xs"
                  : "bg-gray-50/40 hover:bg-gray-100/60 border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">{landmark.name.split("(")[0]}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-gray-200 text-gray-700">
                  {landmark.category}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {landmark.description}
              </p>
              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px]">
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  Route Here
                </span>
                {landmark.shuttleStop && (
                  <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
                    🛺 Shuttle Stop
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusNavigator;
