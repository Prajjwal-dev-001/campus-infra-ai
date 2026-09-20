import React from "react";

export const LoadingAnimation: React.FC<{ message?: string }> = ({
  message = "Analyzing similar historical campus maintenance cases...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-12 h-12 rounded-full border-4 border-lpu-orange/20 border-t-lpu-orange animate-spin" />
      <p className="text-xs text-lpu-gray-dark font-medium animate-pulse text-center">
        {message}
      </p>
    </div>
  );
};

export default LoadingAnimation;
