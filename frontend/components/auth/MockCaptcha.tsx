"use client";

import React, { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

export interface MockCaptchaProps {
  onVerify?: (verified: boolean) => void;
  disabled?: boolean;
}

export const MockCaptcha: React.FC<MockCaptchaProps> = ({ onVerify, disabled }) => {
  const [status, setStatus] = useState<"idle" | "verifying" | "verified">("idle");

  const handleClick = () => {
    if (status !== "idle" || disabled) return;

    setStatus("verifying");
    setTimeout(() => {
      setStatus("verified");
      if (onVerify) {
        onVerify(true);
      }
    }, 1500);
  };

  return (
    <div className="w-full my-4 p-3 bg-[#FAFAFA] border border-[#D1D5DB] rounded-lg shadow-sm flex items-center justify-between select-none">
      <div className="flex items-center space-x-3 cursor-pointer" onClick={handleClick}>
        {status === "idle" && (
          <div className="w-7 h-7 rounded border-2 border-gray-400 bg-white hover:border-gray-500 transition-colors flex items-center justify-center cursor-pointer shadow-inner">
            <span className="sr-only">Verify you are human</span>
          </div>
        )}

        {status === "verifying" && (
          <div className="w-7 h-7 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-lpu-orange border-t-transparent animate-spin" />
          </div>
        )}

        {status === "verified" && (
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm animate-in zoom-in-50 duration-200">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-800">
            {status === "verified" ? (
              <span className="text-emerald-700 font-semibold">Success!</span>
            ) : status === "verifying" ? (
              <span className="text-gray-500">Verifying...</span>
            ) : (
              "I'm not a robot"
            )}
          </span>
          <span className="text-[10px] text-gray-400">Cloudflare Turnstile</span>
        </div>
      </div>

      <div className="flex flex-col items-end pl-2">
        <div className="flex items-center space-x-1 text-gray-400">
          <ShieldCheck className="w-4 h-4 text-lpu-orange" />
          <span className="text-[10px] font-bold tracking-wider text-gray-500">CLOUDFLARE</span>
        </div>
        <div className="text-[9px] text-gray-400 flex space-x-1">
          <span className="hover:underline cursor-pointer">Privacy</span>
          <span>•</span>
          <span className="hover:underline cursor-pointer">Terms</span>
        </div>
      </div>
    </div>
  );
};

export default MockCaptcha;
