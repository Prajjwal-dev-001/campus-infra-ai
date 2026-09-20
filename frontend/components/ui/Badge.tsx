import React from "react";
import { UrgencyLevel, TicketStatus } from "@/lib/types";

export interface BadgeProps {
  urgency?: UrgencyLevel;
  status?: TicketStatus;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ urgency, status, children, className = "" }) => {
  let badgeClass = "bg-gray-100 text-gray-800 border-gray-200";

  if (urgency === "Critical") badgeClass = "lpu-badge-critical";
  else if (urgency === "High") badgeClass = "lpu-badge-high";
  else if (urgency === "Medium") badgeClass = "lpu-badge-medium";
  else if (urgency === "Low") badgeClass = "lpu-badge-low";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} ${className}`}>
      {children || urgency || status}
    </span>
  );
};

export default Badge;
