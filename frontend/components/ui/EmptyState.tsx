import React from "react";
import { LucideIcon, Inbox } from "lucide-react";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title = "No Tickets Found",
  description = "There are currently no maintenance queries or work orders matching your selection.",
  actionText,
  onAction,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-dashed border-gray-300 p-8 sm:p-12 flex flex-col items-center justify-center text-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-lpu-orange mb-3.5 shadow-xs">
        <Icon className="w-7 h-7 text-lpu-orange" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="lpu-btn-primary px-4 py-2 text-xs font-semibold shadow-xs"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
