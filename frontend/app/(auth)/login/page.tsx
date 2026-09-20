"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Eye,
  EyeOff,
  Mail,
  Award,
  Lock,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { MOCK_USERS, MockUserCredential } from "@/lib/constants";
import { useRMSStore } from "@/lib/store";
import { loginUser } from "@/lib/api";
import MockCaptcha from "@/components/auth/MockCaptcha";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useRMSStore();

  const [role, setRole] = useState<string>("Student");
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Quick autofill helper for evaluating / demo testing
  const handleQuickFill = (mockUser: MockUserCredential) => {
    setUserId(mockUser.id);
    setPassword(mockUser.password);
    if (mockUser.role === "student") setRole("Student");
    else if (mockUser.role === "warden") setRole("Faculty/Warden");
    else if (mockUser.role === "maintenance") setRole("Maintenance Staff");
    setCaptchaVerified(true);
    setErrorMessage("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userId.trim() || !password.trim()) {
      setErrorMessage("Please enter both User ID and Password.");
      return;
    }

    if (!captchaVerified) {
      setErrorMessage("Please complete the Cloudflare Turnstile verification checkbox.");
      return;
    }

    const mappedRole =
      role === "Student"
        ? "student"
        : role === "Faculty/Warden"
        ? "warden"
        : "maintenance";

    setIsLoading(true);

    try {
      // 1. Authenticate with real FastAPI backend
      const data = await loginUser(userId.trim(), password, role);
      // data: { access_token, user: { user_id, name, role, block_assigned, room_number, contact } }
      const loggedUser = {
        id: data.user.user_id,
        name: data.user.name,
        role: data.user.role,
        block: data.user.block_assigned || (data.user.role === "student" ? "BH-5" : undefined),
        room: data.user.room_number || (data.user.role === "student" ? "A-824" : undefined),
        phone: data.user.contact || "9876543210",
        email: `${data.user.user_id.toLowerCase()}@lpu.co.in`,
      };

      login(loggedUser, data.access_token);

      if (loggedUser.role === "student") {
        router.push("/student/dashboard");
      } else if (loggedUser.role === "warden") {
        router.push("/warden/dashboard");
      } else if (loggedUser.role === "maintenance") {
        router.push("/maintenance/dashboard");
      }
    } catch (apiErr: any) {
      console.warn("Backend API login failed, checking mock credentials fallback:", apiErr);
      // Fallback for mock credentials if backend is temporarily unreachable
      const matched = MOCK_USERS.find(
        (u) =>
          u.id.toLowerCase() === userId.trim().toLowerCase() &&
          u.password === password &&
          u.role === mappedRole
      );

      if (matched) {
        login({
          id: matched.id,
          name: matched.name,
          role: matched.role,
          block: matched.block,
          room: matched.room,
          department: matched.department,
          email: `${matched.id.toLowerCase()}@lpu.co.in`,
        });

        if (matched.role === "student") {
          router.push("/student/dashboard");
        } else if (matched.role === "warden") {
          router.push("/warden/dashboard");
        } else if (matched.role === "maintenance") {
          router.push("/maintenance/dashboard");
        }
      } else {
        const detail = apiErr.response?.data?.detail;
        setErrorMessage(
          typeof detail === "string"
            ? detail
            : "Invalid credentials. Please check your User ID and Password."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* =========================================================================
          LEFT PANEL (60% width on desktop): Identical to Landing Page with FadeIn
          ========================================================================= */}
      <motion.section
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full lg:w-[60%] bg-gradient-to-br from-[#EA580C] via-[#F97316] to-[#FB923C] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden min-h-[420px] lg:min-h-screen"
      >
        {/* Subtle geometric background rings */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border-[32px] border-white/40" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 rounded-full border-[24px] border-white/30" />
          <div className="absolute -bottom-20 left-1/3 w-[500px] h-[500px] rounded-full border-[40px] border-white/20" />
        </div>

        {/* Top Brand Seal */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-white text-lpu-orange font-black text-base flex flex-col items-center justify-center shadow-lg">
            <span>LPU</span>
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-wider uppercase text-white/95">
              Lovely Professional University
            </h2>
            <p className="text-[11px] text-white/80 font-medium tracking-tight">
              Phagwara, Punjab, India • NAAC A++ Accredited
            </p>
          </div>
        </div>

        {/* Center Content: LPU Achievement & RMS Vision */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border border-white/20">
            <Award className="w-4 h-4 text-amber-200" />
            <span>NAAC A++ • Highest Grade by Government of India</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4 text-white drop-shadow-sm">
            LPU Sets New Global Benchmarks
          </h1>

          <p className="text-lg sm:text-xl font-medium text-white/95 leading-snug mb-8">
            AI-Powered Relationship Management System (RMS)
          </p>

          <p className="text-sm text-white/85 leading-relaxed max-w-lg mb-8">
            Single-sign-on access for campus maintenance, automated equipment diagnostic triage, and priority student welfare dispatch across 600+ acres.
          </p>

          {/* Quick campus stats chips */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
              <div className="text-lg font-bold">600+</div>
              <div className="text-[11px] text-white/80">Acres Campus</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
              <div className="text-lg font-bold">250+</div>
              <div className="text-[11px] text-white/80">Active Assets</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5">
              <div className="text-lg font-bold">100%</div>
              <div className="text-[11px] text-white/80">RMS Automated</div>
            </div>
          </div>
        </div>

        {/* Bottom footer tag */}
        <div className="relative z-10 pt-6 text-xs text-white/70 flex items-center justify-between">
          <span>Transforming Education Transforming India</span>
          <span className="hidden sm:inline">www.lpu.in</span>
        </div>
      </motion.section>

      {/* =========================================================================
          RIGHT PANEL (40% width on desktop): White Centered Form
          ========================================================================= */}
      <section className="w-full lg:w-[40%] bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {/* LPU Logo + UMS text matching screenshot style */}
          <div className="flex flex-col items-center text-center mb-6">
            <Link href="/" className="group flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-lpu-orange to-amber-500 p-0.5 shadow-md mb-2 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-1 border-2 border-lpu-orange/20">
                  <span className="text-xl font-black tracking-tight text-lpu-orange leading-none">
                    LPU
                  </span>
                  <span className="text-[7px] font-bold text-gray-700 tracking-wider mt-0.5">
                    INDIA
                  </span>
                </div>
              </div>

              <h2 className="text-sm sm:text-base font-extrabold text-lpu-black tracking-wide">
                UMS | UNIVERSITY MANAGEMENT SYSTEM
              </h2>
            </Link>
            <div className="h-0.5 w-12 bg-lpu-orange my-1.5" />
            <p className="text-[11px] text-lpu-gray-dark font-medium">
              Lovely Professional University Gateway
            </p>
          </div>

          {/* Heading */}
          <div className="mb-5 text-center">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
              Log in
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Select your role and sign in with your university credentials
            </p>
          </div>

          {/* Quick Demo Credentials Toolbar */}
          <div className="mb-5 p-2.5 bg-orange-50/80 border border-orange-200/80 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-orange-950 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-lpu-orange" />
                Quick Test Logins:
              </span>
              <span className="text-[10px] text-orange-700">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill(MOCK_USERS.find((u) => u.role === "student") || MOCK_USERS[0])}
                className="px-2 py-1 bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-100/50 hover:text-orange-900 font-medium transition-colors text-center shadow-xs truncate"
              >
                🎓 Student (Rahul)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill(MOCK_USERS.find((u) => u.role === "maintenance") || MOCK_USERS[4])}
                className="px-2 py-1 bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-100/50 hover:text-orange-900 font-medium transition-colors text-center shadow-xs truncate"
              >
                🛠️ Maintenance (Suresh)
              </button>
            </div>
            <div className="pt-1 border-t border-orange-200/60">
              <div className="text-[10px] font-semibold text-orange-900 mb-1 flex items-center justify-between">
                <span>Multi-Block Wardens:</span>
                <span className="text-[9px] text-orange-600 font-normal">BH-5 • Block-32 • GH-2</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleQuickFill(MOCK_USERS.find((u) => u.id === "FAC001") || MOCK_USERS[1])}
                  className="px-1 py-1 bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-100/50 hover:text-orange-900 font-medium transition-colors text-center shadow-xs truncate"
                  title="Dr. Priya Sharma (BH-5)"
                >
                  BH-5 (Dr. Priya)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(MOCK_USERS.find((u) => u.id === "FAC002") || MOCK_USERS[2])}
                  className="px-1 py-1 bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-100/50 hover:text-orange-900 font-medium transition-colors text-center shadow-xs truncate"
                  title="Prof. Anil Gupta (Block-32)"
                >
                  Block-32 (Prof. Gupta)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill(MOCK_USERS.find((u) => u.id === "FAC003") || MOCK_USERS[3])}
                  className="px-1 py-1 bg-white border border-orange-200 rounded text-gray-700 hover:bg-orange-100/50 hover:text-orange-900 font-medium transition-colors text-center shadow-xs truncate"
                  title="Warden Sunita Verma (GH-2)"
                >
                  GH-2 (Warden Sunita)
                </button>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="role-select"
                className="block text-xs font-semibold text-gray-700 mb-1"
              >
                Select Role
              </label>
              <div className="relative">
                <select
                  id="role-select"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className="lpu-input appearance-none pr-10 cursor-pointer text-sm font-medium"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty/Warden">Faculty/Warden</option>
                  <option value="Maintenance Staff">Maintenance Staff</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronDown className="w-4 h-4 text-lpu-orange" />
                </div>
              </div>
            </div>

            {/* User ID Input */}
            <div>
              <label
                htmlFor="user-id-input"
                className="block text-xs font-semibold text-gray-700 mb-1"
              >
                User ID / Registration No.
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="user-id-input"
                  type="text"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder={
                    role === "Student"
                      ? "e.g. 12300001"
                      : role === "Faculty/Warden"
                      ? "e.g. FAC001"
                      : "e.g. MAINT001"
                  }
                  required
                  className="lpu-input pl-9 text-sm"
                />
              </div>
            </div>

            {/* Password Input with Eye Toggle */}
            <div>
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="••••••••"
                  required
                  className="lpu-input pl-9 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Mock CAPTCHA Component */}
            <MockCaptcha
              onVerify={(verified) => {
                setCaptchaVerified(verified);
                if (errorMessage) setErrorMessage("");
              }}
            />

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full lpu-btn-primary flex items-center justify-center space-x-2 py-2.5 text-sm font-semibold shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            {/* Inline Error Message */}
            {errorMessage && (
              <p
                id="login-error-msg"
                className="text-xs text-red-600 font-semibold text-center mt-2 animate-in fade-in"
              >
                {errorMessage}
              </p>
            )}

            {/* Forgot Password Link */}
            <div className="text-center pt-2">
              <Link
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Please contact the LPU IT Helpdesk or your hostel warden for credential recovery.");
                }}
                className="text-xs text-lpu-orange hover:text-lpu-orange-dark hover:underline font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </form>

          {/* Bottom Student Mail Footer */}
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-xs text-gray-600">
            <Mail className="w-4 h-4 text-lpu-orange" />
            <a
              href="https://mail.google.com/a/lpu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-lpu-orange hover:underline transition-colors"
            >
              Student Mail
            </a>
            <span className="text-gray-300">•</span>
            <Link
              href="/"
              className="hover:text-lpu-orange hover:underline transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
