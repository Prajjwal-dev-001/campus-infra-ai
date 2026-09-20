import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  message = "Something went wrong while connecting to university RMS services.",
  onRetry,
}) => {
  return (
    <div className="w-full bg-orange-50/70 border-2 border-lpu-orange/60 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 my-3">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border border-orange-200">
          <AlertTriangle className="w-5 h-5 text-lpu-orange" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">Communication Error</h4>
          <p className="text-xs text-gray-600 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="lpu-btn-primary px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 shrink-0 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};

export default ErrorCard;
