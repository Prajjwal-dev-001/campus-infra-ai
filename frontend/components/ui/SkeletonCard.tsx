import React from "react";

export interface SkeletonCardProps {
  count?: number;
  type?: "ticket" | "stat" | "table";
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ count = 3, type = "ticket" }) => {
  return (
    <div className="space-y-3.5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs animate-pulse space-y-3"
        >
          {type === "stat" ? (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-16 bg-gray-300 rounded font-bold" />
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gray-200" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-28 bg-gray-300 rounded" />
                    <div className="h-2.5 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="space-y-1.5 pt-1">
                <div className="h-2.5 w-full bg-gray-200 rounded" />
                <div className="h-2.5 w-4/5 bg-gray-200 rounded" />
              </div>
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <div className="h-2.5 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-300 rounded-lg" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;
