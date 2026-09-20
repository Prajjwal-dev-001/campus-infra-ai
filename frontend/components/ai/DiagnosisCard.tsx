import React from "react";

export interface DiagnosisCardProps {
  title: string;
  description: string;
  severity?: "Low" | "Medium" | "High" | "Critical";
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({ title, description, severity = "Medium" }) => {
  return (
    <div className="border border-lpu-blue-mid/60 rounded-lg p-3 bg-white">
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-xs text-lpu-black">{title}</span>
        <span className="text-[10px] uppercase font-bold text-lpu-orange">{severity}</span>
      </div>
      <p className="text-xs text-lpu-gray-dark">{description}</p>
    </div>
  );
};

export default DiagnosisCard;
