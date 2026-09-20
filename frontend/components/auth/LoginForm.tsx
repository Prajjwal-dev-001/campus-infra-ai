"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { useRMSStore } from "@/lib/store";
import { Lock, User as UserIcon, ChevronDown, AlertCircle } from "lucide-react";

export interface LoginFormProps {
  onSuccess?: () => void;
  defaultRole?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, defaultRole = "Student" }) => {
  const router = useRouter();
  const { login } = useRMSStore();

  const [role, setRole] = useState<string>(defaultRole);
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userId.trim() || !password.trim()) {
      setErrorMessage("Please enter both User ID and Password.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await loginUser(userId.trim(), password, role);
      // data: { access_token, user: { user_id, name, role, block_assigned, room_number, contact } }
      const loggedUser = {
        id: data.user.user_id,
        name: data.user.name,
        role: data.user.role,
        block: data.user.block_assigned,
        room: data.user.room_number,
        phone: data.user.contact,
        email: `${data.user.user_id.toLowerCase()}@lpu.co.in`,
      };

      login(loggedUser, data.access_token);

      if (onSuccess) {
        onSuccess();
      } else {
        if (loggedUser.role === "student") router.push("/student/dashboard");
        else if (loggedUser.role === "warden") router.push("/warden/dashboard");
        else if (loggedUser.role === "maintenance") router.push("/maintenance/dashboard");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const detail = err.response?.data?.detail;
      setErrorMessage(
        typeof detail === "string" ? detail : "Authentication failed. Check your ID & password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Select Role</label>
        <div className="relative">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setErrorMessage("");
            }}
            className="lpu-input appearance-none pr-9 text-xs font-medium cursor-pointer"
          >
            <option value="Student">Student</option>
            <option value="Faculty/Warden">Faculty/Warden</option>
            <option value="Maintenance Staff">Maintenance Staff</option>
          </select>
          <ChevronDown className="w-4 h-4 text-lpu-orange absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* User ID */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Registration / User ID</label>
        <div className="relative">
          <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setErrorMessage("");
            }}
            placeholder="e.g. 12300001, FAC001, MAINT001"
            className="lpu-input pl-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            placeholder="••••••••"
            className="lpu-input pl-9 text-xs"
            required
          />
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full lpu-btn-primary flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold shadow-sm disabled:opacity-75"
      >
        {isLoading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <span>Sign In to UMS Gateway</span>
        )}
      </button>
    </form>
  );
};

export default LoginForm;
