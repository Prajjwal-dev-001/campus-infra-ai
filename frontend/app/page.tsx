"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, ShieldCheck, Compass } from "lucide-react";

export default function LandingPage() {
  const [institute, setInstitute] = useState("");
  const router = useRouter();

  const handleContinue = () => {
    if (institute === "lpu") {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex flex-col items-center justify-center p-4 font-sans">
      {/* Main Centered Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
        
        {/* Dark Header Section */}
        <div className="bg-slate-800 p-8 text-center">
          <div className="bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Building2 className="w-8 h-8 text-blue-400"/>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Central Gateway</h1>
          <p className="text-slate-300 text-sm">Unified Infrastructure Management Portal</p>
        </div>

        {/* Selection Form Section */}
        <div className="p-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Your Institution
          </label>
          <div className="relative mb-6">
            <select 
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
            >
              <option value="" disabled>-- Choose Institute --</option>
              <option value="lpu">Lovely Professional University</option>
              <option value="dtu">Delhi Technological University</option>
              <option value="vit">VIT Vellore</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>

          <button 
            onClick={handleContinue}
            disabled={!institute}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              institute 
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Enter Portal
            <ArrowRight className="w-4 h-4"/>
          </button>

          {/* Quick 360 Tour Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => router.push("/student/tour")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Compass className="w-4 h-4 text-orange-500" />
              <span>Explore LPU Campus in 360° Virtual Tour</span>
            </button>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-green-600"/>
          Secure Multi-Tenant Auth Service
        </div>
      </div>
    </div>
  );
}
