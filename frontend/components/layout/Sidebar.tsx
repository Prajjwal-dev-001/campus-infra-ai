import React from "react";
import Link from "next/link";
import { RoleType } from "@/lib/types";

export interface SidebarProps {
  role?: RoleType;
  activeTab?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = "student", activeTab }) => {
  return (
    <aside className="w-64 bg-white border-r border-lpu-blue-mid/40 p-4 min-h-[calc(100vh-56px)]">
      <div className="space-y-1">
        <Link
          href={`/${role}/dashboard`}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-lpu-orange/10 text-lpu-orange"
        >
          <span>Dashboard</span>
        </Link>
        <Link
          href="/student/tour"
          className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-lpu-orange transition-colors"
        >
          <span>360° Campus Tour</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
