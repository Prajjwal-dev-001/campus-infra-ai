"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  Wrench,
  FileDown,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { toast } from "@/components/ui/Toast";

export interface SimilarCaseData {
  issue_id: string;
  date: string;
  location_block: string;
  location_room: string;
  equipment: string;
  complaint?: string;
  diagnosis?: string;
  fix_action?: string;
  time_hours?: string;
  cost_inr?: string;
  parts_replaced?: string;
  similarity_score?: number;
}

export interface AIDiagnosisResult {
  ticket_id: string;
  similar_cases: SimilarCaseData[];
  diagnosis: {
    most_likely_cause: string;
    confidence: number;
    pattern_observed?: string;
    supporting_evidence?: string;
  };
  recommendation: {
    immediate_action: string;
    fix_steps: string[];
    parts_needed: string[];
    estimated_time_hours: number;
    estimated_cost_inr: {
      minimum: number;
      maximum: number;
      most_likely: number;
    };
    urgency_level: string;
    urgency_reason: string;
    preventive_note?: string;
  };
  plain_explanation: string;
  confidence_score: number;
  analysis_timestamp?: string;
}

export interface AIAnalysisPanelProps {
  data: AIDiagnosisResult;
  onMarkInProgress?: () => void;
  onResolveTicket?: () => void;
  onReanalyze?: () => void;
  ticketStatus?: string;
  location?: string;
  equipment?: string;
  ticketCreatedAt?: string;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  data,
  onMarkInProgress,
  onResolveTicket,
  onReanalyze,
  ticketStatus,
  location,
  equipment,
  ticketCreatedAt,
}) => {
  const [isReasoningOpen, setIsReasoningOpen] = useState<boolean>(true);
  const [inProgressSuccess, setInProgressSuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const confidencePercent = Math.round(
    (data.confidence_score || data.diagnosis?.confidence || 0.8) * 100
  );

  const handleExportReport = async () => {
    try {
      setIsExporting(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Clean filename with fallback
      const tktId = data.ticket_id || "REPORT";
      const filename = `LPU-RMS-AI-Report-${tktId}.pdf`;

      // ── Header ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(249, 115, 22); // LPU Orange
      doc.text("LPU RMS AI - Diagnostic Intelligence Report", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Ticket ID: ${tktId}`, 14, 34);

      // ── Divider ──
      doc.setDrawColor(249, 115, 22);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);

      // ── Section 1: Diagnosis & Root Cause ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text("1. Diagnosis & Root Cause", 14, 48);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const diagnosisText =
        data.diagnosis?.most_likely_cause || "No diagnosis available";
      const diagLines = doc.splitTextToSize(diagnosisText, 180);
      doc.text(diagLines, 14, 56);

      let yPos = 56 + diagLines.length * 5 + 6;

      // Pattern observed (if available)
      if (data.diagnosis?.pattern_observed) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(
          `Pattern: ${data.diagnosis.pattern_observed}`,
          14,
          yPos
        );
        yPos += 8;
      }

      // ── Section 2: Cost & Resource Estimates ──
      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text("2. Cost & Resource Estimates", 14, yPos);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      yPos += 10;
      doc.text(
        `Estimated Time: ${data.recommendation?.estimated_time_hours || "1.5"} hours`,
        14,
        yPos
      );
      yPos += 7;
      doc.text(
        `Estimated Cost: INR ${data.recommendation?.estimated_cost_inr?.most_likely || "1200"}`,
        14,
        yPos
      );
      yPos += 7;
      doc.text(
        `Urgency Level: ${data.recommendation?.urgency_level || "High"}`,
        14,
        yPos
      );
      yPos += 7;
      if (data.recommendation?.urgency_reason) {
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Reason: ${data.recommendation.urgency_reason}`, 14, yPos);
        yPos += 8;
      }

      // ── Section 3: Recommended Fix Steps ──
      yPos += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(26, 26, 26);
      doc.text("3. Step-by-Step Action Plan", 14, yPos);
      yPos += 10;

      if (data.recommendation?.immediate_action) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(220, 38, 38);
        doc.text(
          `⚠ IMMEDIATE: ${data.recommendation.immediate_action}`,
          14,
          yPos
        );
        yPos += 8;
      }

      const steps = data.recommendation?.fix_steps?.length
        ? data.recommendation.fix_steps
        : [
            "Conduct preliminary safety check.",
            "Inspect hardware for wear or damage.",
            "Replace degraded components.",
            "Verify normal operation post-repair.",
          ];

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      steps.forEach((step, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const stepLines = doc.splitTextToSize(`${idx + 1}. ${step}`, 180);
        doc.text(stepLines, 14, yPos);
        yPos += stepLines.length * 5 + 3;
      });

      // ── Section 4: Parts Needed ──
      if (
        data.recommendation?.parts_needed &&
        data.recommendation.parts_needed.length > 0
      ) {
        yPos += 4;
        if (yPos > 260) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 26, 26);
        doc.text("4. Required Parts & Materials", 14, yPos);
        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        data.recommendation.parts_needed.forEach((part) => {
          doc.text(`• ${part}`, 18, yPos);
          yPos += 6;
        });
      }

      // ── Section 5: Similar Historical Cases ──
      if (data.similar_cases && data.similar_cases.length > 0) {
        yPos += 6;
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(26, 26, 26);
        doc.text("5. Similar Historical Cases (ChromaDB)", 14, yPos);
        yPos += 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        data.similar_cases.slice(0, 3).forEach((c) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          const score = Math.round((c.similarity_score || 0.8) * 100);
          doc.text(
            `${c.issue_id} — ${c.location_block}/${c.location_room} — ${c.equipment} — ${score}% match`,
            14,
            yPos
          );
          yPos += 5;
          if (c.fix_action) {
            doc.text(`  Fix: ${c.fix_action}`, 14, yPos);
            yPos += 5;
          }
          yPos += 2;
        });
      }

      // ── Footer ──
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `LPU RMS AI • Confidential • Page ${p}/${totalPages}`,
          105,
          290,
          { align: "center" }
        );
      }

      // CRITICAL: Pure client-side direct save — doc.save() is async in jsPDF v4
      await doc.save(filename);
      toast.success(`Exported: ${filename}`);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleMarkProgress = () => {
    setInProgressSuccess(true);
    if (onMarkInProgress) onMarkInProgress();
    setTimeout(() => setInProgressSuccess(false), 3000);
  };

  return (
    <div
      id="ai-results-panel"
      data-visible="true"
      className="w-full bg-white rounded-xl shadow-md border-t-4 border-t-lpu-orange border-x border-b border-gray-200 overflow-hidden mt-6 animate-in fade-in duration-300"
    >
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white px-6 py-4 border-b border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-lpu-orange text-white flex items-center justify-center shadow-xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>AI Diagnostic Intelligence Report</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Analysis Complete
              </span>
            </h3>
            <p className="text-xs text-gray-500">
              Correlated against 250+ LPU historical maintenance records via LangGraph & ChromaDB
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onReanalyze}
            className="text-xs text-gray-600 hover:text-lpu-orange font-semibold flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* =========================================================================
            SECTION 1 - SIMILAR CASES FOUND
            ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <span>📁 Similar Historical Cases Found ({data.similar_cases?.length || 0})</span>
            </h4>
            <span className="text-[11px] text-gray-400">
              Cosine vector distance matching
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {(data.similar_cases || []).slice(0, 3).map((item, idx) => {
              const score = Math.round((item.similarity_score || 0.85) * 100);
              const badgeColor =
                score >= 80
                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                  : score >= 60
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-blue-100 text-blue-800 border-blue-200";

              return (
                <div
                  key={idx}
                  className="bg-gray-50/80 hover:bg-orange-50/20 rounded-xl p-3.5 border border-gray-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[11px] text-gray-700 font-mono">
                        {item.issue_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}
                      >
                        {score}% Match
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-2.5">
                      <div className="flex items-center space-x-1 font-semibold text-gray-900">
                        <MapPin className="w-3 h-3 text-lpu-orange shrink-0" />
                        <span className="truncate">
                          {item.location_block} / Room {item.location_room}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-gray-500">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{item.date || "Past Record"}</span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-800 line-clamp-1 pt-0.5">
                        {item.equipment}
                      </p>
                    </div>

                    <div className="p-2 bg-white rounded-lg border border-gray-100 text-[11px] text-gray-700 leading-snug">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">
                        Previous Fix:
                      </span>
                      <span className="line-clamp-2">
                        {item.fix_action || item.diagnosis || "Standard repair applied"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-gray-500 text-[11px]">Historical Cost:</span>
                    <span className="font-bold text-gray-900">
                      ₹{item.cost_inr || "1,200"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2 - AI DIAGNOSIS
            ========================================================================= */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-lpu-orange text-xs font-bold uppercase tracking-wider mb-1">
                <Brain className="w-4 h-4" />
                <span>🎯 Most Likely Cause</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight">
                {data.diagnosis?.most_likely_cause || "Hardware or electrical component failure"}
              </h3>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                Diagnostic Confidence
              </span>
              <span className="text-xl font-black text-lpu-orange">
                {confidencePercent}%
              </span>
            </div>
          </div>

          {/* Confidence Bar */}
          <div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 via-lpu-orange to-lpu-orange-dark h-full rounded-full transition-all duration-700"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>

          {/* Pattern Observed Box */}
          {data.diagnosis?.pattern_observed && (
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl p-3.5 text-xs text-orange-950 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-lpu-orange shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Observed Failure Pattern: </strong>
                <span>{data.diagnosis.pattern_observed}</span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 3 - RECOMMENDATION
            ========================================================================= */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-gray-700">
            <Wrench className="w-4 h-4 text-lpu-orange" />
            <span>🔧 Recommended Action Plan</span>
          </div>

          {/* Immediate Action Callout */}
          {data.recommendation?.immediate_action && (
            <div className="bg-orange-100/70 border-l-4 border-lpu-orange rounded-r-xl p-3.5 text-xs text-orange-950 font-medium">
              <span className="font-bold uppercase tracking-wider text-[10px] text-lpu-orange-dark block mb-0.5">
                Immediate Action Required:
              </span>
              <span>{data.recommendation.immediate_action}</span>
            </div>
          )}

          {/* Numbered Steps List */}
          <div>
            <span className="text-xs font-bold text-gray-800 block mb-2">
              Procedure / Fix Steps:
            </span>
            <div className="space-y-2">
              {(data.recommendation?.fix_steps || [
                "Isolate electrical breaker switch",
                "Inspect terminals and wiring harness",
                "Replace defective components and test under load",
              ]).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-800"
                >
                  <span className="w-5 h-5 rounded-full bg-orange-100 text-lpu-orange font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parts Needed Chips */}
          {data.recommendation?.parts_needed && data.recommendation.parts_needed.length > 0 && (
            <div>
              <span className="text-xs font-bold text-gray-800 block mb-2">
                Parts & Spares Needed:
              </span>
              <div className="flex flex-wrap gap-2">
                {data.recommendation.parts_needed.map((part, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-100/60 border border-orange-200 text-xs font-semibold text-orange-900"
                  >
                    <span>🛠️</span>
                    <span>{part}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 4 - ESTIMATES (3 Stat Boxes Side by Side)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Box 1: Estimated Time */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">⏱️ Estimated Time</span>
              <h4 className="text-xl font-bold text-gray-900 mt-1">
                {data.recommendation?.estimated_time_hours || 2.0} hours
              </h4>
              <span className="text-[10px] text-gray-400">Average technician duration</span>
            </div>
            <Clock className="w-7 h-7 text-blue-500/80" />
          </div>

          {/* Box 2: Estimated Cost */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">💰 Estimated Cost</span>
              <h4 className="text-xl font-bold text-gray-900 mt-1">
                ₹{data.recommendation?.estimated_cost_inr?.most_likely || 1200}
              </h4>
              <span className="text-[10px] text-gray-500 font-medium">
                Range: ₹{data.recommendation?.estimated_cost_inr?.minimum || 800} - ₹
                {data.recommendation?.estimated_cost_inr?.maximum || 1800}
              </span>
            </div>
            <Coins className="w-7 h-7 text-amber-500/80" />
          </div>

          {/* Box 3: Urgency */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-500">🚨 Urgency Level</span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    (data.recommendation?.urgency_level || "Medium") === "Critical"
                      ? "bg-red-100 text-red-800"
                      : (data.recommendation?.urgency_level || "Medium") === "High"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {data.recommendation?.urgency_level || "Medium"}
                </span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block truncate max-w-[180px]">
                {data.recommendation?.urgency_reason || "Campus priority rating"}
              </span>
            </div>
            <AlertCircle className="w-7 h-7 text-lpu-orange/80" />
          </div>
        </div>

        {/* =========================================================================
            SECTION 5 - AI REASONING (Collapsible)
            ========================================================================= */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
          <button
            onClick={() => setIsReasoningOpen(!isReasoningOpen)}
            className="w-full px-5 py-3.5 bg-gray-50/80 hover:bg-gray-100/60 flex items-center justify-between text-xs font-bold text-gray-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-lpu-orange" />
              <span>View AI Reasoning Chain & Multi-Node Diagnostic Synthesis</span>
            </span>
            {isReasoningOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {isReasoningOpen && (
            <div className="p-5 border-t border-gray-200 space-y-3">
              <div className="border-l-4 border-lpu-orange pl-4 py-1 text-xs text-gray-700 leading-relaxed bg-orange-50/20 rounded-r-lg">
                <p className="whitespace-pre-line">{data.plain_explanation}</p>
              </div>

              {data.recommendation?.preventive_note && (
                <div className="pt-2 text-xs text-gray-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Preventive Guidance: </strong>
                    {data.recommendation.preventive_note}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 6 - ACTION BUTTONS
            ========================================================================= */}
        <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {ticketStatus !== "Resolved" && onResolveTicket && (
              <button
                type="button"
                onClick={onResolveTicket}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as Resolved</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleMarkProgress}
              className="lpu-btn-primary px-5 py-2 text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {inProgressSuccess ? "Marked In Progress!" : "Mark as In Progress"}
              </span>
            </button>

            <button
              type="button"
              id="export-pdf-report-btn"
              onClick={handleExportReport}
              disabled={isExporting}
              className="lpu-btn-secondary px-4 py-2 text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-60 transition-all hover:border-lpu-orange/40 hover:text-lpu-orange"
              title="Download Executive AI Diagnostic Report as PDF"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-lpu-orange" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-lpu-orange" />
                  <span>Export Report</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onReanalyze}
            className="text-xs font-semibold text-gray-500 hover:text-lpu-orange hover:underline transition-colors flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-analyze with updated query</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisPanel;
