import React from "react";
import { Check, Clock, AlertCircle } from "lucide-react";

export interface TicketStatusTimelineProps {
  status: string;
}

const TIMELINE_STEPS = [
  { id: "submitted", label: "Submitted", subtext: "Logged by Student" },
  { id: "reviewed", label: "Reviewed by Warden", subtext: "Triage & Verification" },
  { id: "assigned", label: "Assigned", subtext: "Dispatched to Tech" },
  { id: "in_progress", label: "In Progress", subtext: "Diagnostic & Repair" },
  { id: "resolved", label: "Resolved", subtext: "Verified Operational" },
];

export const TicketStatusTimeline: React.FC<TicketStatusTimelineProps> = ({ status }) => {
  const getStepIndex = (st: string): number => {
    switch (st) {
      case "Pending":
        return 0; // Submitted
      case "Reviewed":
        return 1;
      case "Assigned":
        return 2;
      case "In_Progress":
        return 3;
      case "Resolved":
      case "Closed":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Connecting background track */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0" />
        {/* Progress track */}
        <div
          className="absolute top-4 left-0 h-1 bg-lpu-orange z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
        />

        {TIMELINE_STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                  isCompleted
                    ? "bg-lpu-orange text-white ring-4 ring-orange-100"
                    : isCurrent
                    ? "bg-lpu-orange text-white ring-4 ring-orange-200 animate-pulse"
                    : "bg-white border-2 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold mt-2 text-center max-w-[85px] leading-tight ${
                  isCurrent ? "text-lpu-orange" : isCompleted ? "text-gray-800" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              <span className="hidden sm:block text-[9px] text-gray-400 text-center max-w-[85px] mt-0.5">
                {step.subtext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketStatusTimeline;
