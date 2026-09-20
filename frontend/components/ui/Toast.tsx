"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "info" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

class ToastManager {
  private toasts: ToastItem[] = [];
  private listeners: Set<ToastListener> = new Set();

  subscribe(listener: ToastListener) {
    this.listeners.add(listener);
    listener([...this.toasts]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(type: ToastType, message: string, duration = 4000) {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { id, type, message, duration };
    this.toasts = [newToast, ...this.toasts];
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, duration?: number) {
    this.show("success", message, duration);
  }

  info(message: string, duration?: number) {
    this.show("info", message, duration);
  }

  error(message: string, duration?: number) {
    this.show("error", message, duration);
  }
}

export const toast = new ToastManager();

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        let bg = "bg-emerald-600 text-white border-emerald-700";
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />;

        if (t.type === "info") {
          bg = "bg-blue-600 text-white border-blue-700";
          icon = <Info className="w-4 h-4 text-blue-100 shrink-0" />;
        } else if (t.type === "error") {
          bg = "bg-red-600 text-white border-red-700";
          icon = <AlertCircle className="w-4 h-4 text-red-100 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${bg}`}
          >
            <div className="flex items-center space-x-2.5 mr-2">
              {icon}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 rounded-md hover:bg-white/20 transition-colors shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
