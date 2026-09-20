"use client";

import React, { useState } from "react";
import { X, Wrench, GraduationCap, ArrowRight } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: "academic" | "maintenance") => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [selectedType, setSelectedType] = useState<"academic" | "maintenance">(
    "maintenance"
  );

  if (!isOpen) return null;

  const handleNext = () => {
    onSelectCategory(selectedType);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>Select Category Type</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-600 mb-2">
            Please choose the relevant category domain for your RMS ticket to route to the appropriate department:
          </p>

          {/* Option 1: Academic */}
          <label
            onClick={() => setSelectedType("academic")}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedType === "academic"
                ? "border-lpu-orange bg-orange-50/30"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="pt-0.5 mr-3">
              <input
                type="radio"
                name="categoryType"
                value="academic"
                checked={selectedType === "academic"}
                onChange={() => setSelectedType("academic")}
                className="w-4 h-4 text-lpu-orange border-gray-300 focus:ring-lpu-orange accent-lpu-orange cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-800">
                  Academic and Administrative Issues
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fee queries, course registration, examination timetable, grade verification, and administrative clearance.
              </p>
            </div>
          </label>

          {/* Option 2: Maintenance (Pre-selected) */}
          <label
            onClick={() => setSelectedType("maintenance")}
            className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedType === "maintenance"
                ? "border-lpu-orange bg-orange-50/30"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="pt-0.5 mr-3">
              <input
                type="radio"
                name="categoryType"
                value="maintenance"
                checked={selectedType === "maintenance"}
                onChange={() => setSelectedType("maintenance")}
                className="w-4 h-4 text-lpu-orange border-gray-300 focus:ring-lpu-orange accent-lpu-orange cursor-pointer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-lpu-orange" />
                <span className="text-sm font-bold text-gray-900">
                  Maintenance / Electrical Complaints
                </span>
                <span className="text-[10px] bg-orange-100 text-lpu-orange px-2 py-0.5 rounded font-bold uppercase">
                  RMS AI Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Air conditioning, water coolers, geysers, hostel electrical, lifts, classroom projectors, and plumbing breakdowns.
              </p>
            </div>
          </label>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="lpu-btn-primary flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold shadow-sm"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
