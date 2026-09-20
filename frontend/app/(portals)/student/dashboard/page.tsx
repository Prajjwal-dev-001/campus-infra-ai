"use client";

import React, { useState } from "react";
import { useRMSStore } from "@/lib/store";
import { Ticket } from "@/lib/types";
import {
  MessageSquarePlus,
  ClipboardList,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Inbox,
  Clock,
  Eye,
  Building,
  User,
  Check,
  Compass,
  Navigation,
} from "lucide-react";
import Link from "next/link";
import CategoryModal from "@/components/tickets/CategoryModal";
import MaintenanceForm from "@/components/tickets/MaintenanceForm";
import TicketStatusTimeline from "@/components/tickets/TicketStatusTimeline";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorCard from "@/components/ui/ErrorCard";
import CampusTour360 from "@/components/tour/CampusTour360";
import CampusNavigator from "@/components/tour/CampusNavigator";
import { getStudentTickets } from "@/lib/api";

export default function StudentDashboardPage() {
  const { currentUser, accessToken, tickets, addTicket } = useRMSStore();
  const [activeTab, setActiveTab] = useState<"log" | "history" | "tour">("log");
  const [tourSubMode, setTourSubMode] = useState<"navigator" | "360">("navigator");
  const [viewState, setViewState] = useState<"disclaimer" | "form">("disclaimer");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setFetchError(null);
      const data = await getStudentTickets(accessToken || undefined);
      if (Array.isArray(data)) {
        data.forEach((bt: any) => {
          const t: Ticket = {
            id: bt.ticket_id,
            ticketNo: bt.ticket_id,
            userId: bt.student_user_id,
            userName: bt.student_name,
            studentRegNo: bt.student_user_id,
            roleType: "student",
            locationBlock: bt.block,
            block: bt.block,
            locationRoom: bt.room_number,
            room: bt.room_number,
            category: bt.category,
            subCategory: bt.sub_category,
            specificCategory: bt.specific_category ? [bt.specific_category] : [],
            equipment: bt.equipment,
            messageType: bt.message_type,
            availabilityDate: bt.availability_date,
            timeSlots: bt.time_slots ? [bt.time_slots] : [],
            preferredTimeSlot: bt.time_slots,
            description: bt.description,
            userComplaintText: bt.description,
            urgencyLevel: bt.urgency_level,
            status: bt.status,
            assigned_to: bt.assigned_to_maintenance ? "maintenance" : bt.assigned_to_warden ? "warden" : "unassigned",
            createdAt: bt.created_at,
            created_at: bt.created_at,
          };
          addTicket(t);
        });
      }
    } catch (e: any) {
      console.warn("Could not fetch student tickets from backend:", e);
    }
  };

  React.useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [accessToken, currentUser]);

  // Student specific tickets (matching current user id or role)
  const studentTickets = tickets.filter(
    (t) => !currentUser || t.userId === currentUser.id || t.studentRegNo === currentUser.id || t.roleType === "student"
  );

  const handleAgreeAndProceed = () => {
    setIsCategoryModalOpen(true);
  };

  const handleCategorySelect = (category: "academic" | "maintenance") => {
    if (category === "maintenance") {
      setViewState("form");
    } else {
      alert("Academic and Administrative ticketing is handled via UMS Academic Affairs.");
    }
  };

  const handleFormSuccess = (ticket: Ticket) => {
    setViewState("disclaimer");
    setActiveTab("history");
    fetchTickets();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "lpu-badge-medium"; // yellow
      case "Assigned":
      case "In_Progress":
        return "lpu-badge-low"; // blue
      case "Resolved":
      case "Closed":
        return "lpu-badge-high"; // green / resolved
      case "Rejected":
        return "lpu-badge-critical"; // red
      default:
        return "lpu-badge-low";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Student Profile Details */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-lpu-orange flex items-center justify-center font-bold text-lg shadow-xs">
            <User className="w-6 h-6 text-lpu-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {currentUser?.name || "Rahul Kumar"}
              </h1>
              <span className="text-[10px] uppercase font-bold bg-orange-100 text-lpu-orange px-2 py-0.5 rounded-full">
                Student RMS
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Reg No: <strong>{currentUser?.id || "12300001"}</strong></span>
              <span>•</span>
              <span>Hostel: <strong>{currentUser?.block || "BH-5"}</strong></span>
              <span>•</span>
              <span>Room: <strong>{currentUser?.room || "A-824"}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 text-xs bg-lpu-blue-light/60 p-2.5 rounded-lg border border-blue-100">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-blue-900 font-medium">
              Standard Maintenance SLA: <strong>Within 4 to 24 Hours</strong>
            </span>
          </div>

          <button
            onClick={() => {
              setActiveTab("tour");
              setTourSubMode("navigator");
              setSelectedTicket(null);
            }}
            className="flex items-center space-x-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold p-2.5 rounded-lg border border-blue-200 transition-colors"
            title="Open Campus Google Maps Wayfinder"
          >
            <Navigation className="w-4 h-4 text-blue-600" />
            <span>Campus Maps & GPS</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("tour");
              setTourSubMode("360");
              setSelectedTicket(null);
            }}
            className="flex items-center space-x-1.5 text-xs bg-orange-50 hover:bg-orange-100 text-lpu-orange font-semibold p-2.5 rounded-lg border border-orange-200 transition-colors"
            title="Open Campus 360 View"
          >
            <Compass className="w-4 h-4 text-lpu-orange animate-spin-slow" />
            <span>Explore 360°</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TOP NAVIGATION TABS (Card Styled Tabs with Orange Active Line)
          ========================================================================= */}
      <div className="flex space-x-2 border-b border-gray-200">
        {/* Tab 1: Log Request */}
        <button
          onClick={() => {
            setActiveTab("log");
            setSelectedTicket(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === "log"
              ? "bg-white text-lpu-orange border-b-2 border-lpu-orange shadow-xs -mb-[1px]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
          }`}
        >
          <MessageSquarePlus
            className={`w-4 h-4 ${
              activeTab === "log" ? "text-lpu-orange" : "text-gray-500"
            }`}
          />
          <span>Log Request</span>
        </button>

        {/* Tab 2: RMS History */}
        <button
          onClick={() => {
            setActiveTab("history");
            setSelectedTicket(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === "history"
              ? "bg-white text-lpu-orange border-b-2 border-lpu-orange shadow-xs -mb-[1px]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
          }`}
        >
          <ClipboardList
            className={`w-4 h-4 ${
              activeTab === "history" ? "text-lpu-orange" : "text-gray-500"
            }`}
          />
          <span>RMS History</span>
          {studentTickets.length > 0 && (
            <span
              className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
                activeTab === "history"
                  ? "bg-orange-100 text-lpu-orange"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {studentTickets.length}
            </span>
          )}
        </button>

        {/* Tab 3: Campus Maps & 360° Tour */}
        <button
          onClick={() => {
            setActiveTab("tour");
            setSelectedTicket(null);
          }}
          className={`flex items-center space-x-2 px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all ${
            activeTab === "tour"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-xs -mb-[1px]"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200/70 hover:text-gray-900"
          }`}
        >
          <Navigation
            className={`w-4 h-4 ${
              activeTab === "tour" ? "text-blue-600" : "text-gray-500"
            }`}
          />
          <span>Campus Maps & 360°</span>
          <span className="ml-1 px-1.5 py-0.5 text-[9px] rounded-full font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
            Google Maps
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LOG REQUEST CONTENT
          ========================================================================= */}
      {activeTab === "log" && (
        <>
          {viewState === "disclaimer" ? (
            /* DISCLAIMER VIEW (Screenshot 2 Replication) */
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-orange-50/50 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-orange-900 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4 text-lpu-orange" />
                  <span>RMS Student Declaration & Integrity Guidelines</span>
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  University Disciplinary Code 2026
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <p className="text-xs text-gray-600 font-medium">
                  Please review and accept the following declarations prior to lodging an official infrastructure grievance through the Relationship Management System (RMS):
                </p>

                {/* 5 Orange Bullet Points */}
                <div className="space-y-4">
                  {/* Bullet 1 */}
                  <div className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-lpu-orange flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lpu-orange stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      I have not shared my UMS password with anyone.
                    </p>
                  </div>

                  {/* Bullet 2 */}
                  <div className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-lpu-orange flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lpu-orange stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      I am responsible for the content typed in query.
                    </p>
                  </div>

                  {/* Bullet 3 */}
                  <div className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-lpu-orange flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lpu-orange stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      I understand that necessary disciplinary action can be initiated against me in case of use of derogatory words or false statements against any Student/Faculty/Staff/Higher Authority.
                    </p>
                  </div>

                  {/* Bullet 4 */}
                  <div className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-lpu-orange flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lpu-orange stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      The information given me regarding the complaint/request is true to the best of my knowledge and if found false/wrong, necessary disciplinary action can be initiated against me.
                    </p>
                  </div>

                  {/* Bullet 5 */}
                  <div className="flex items-start space-x-3.5 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full bg-orange-100 border border-lpu-orange flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-lpu-orange stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed">
                      I have read the policy / UMS Notification related to the concerned matter already before submitting the RMS and I am unable to find the answer related to my query.
                    </p>
                  </div>
                </div>

                {/* Agree & Proceed Button */}
                <div className="pt-6 border-t border-gray-100 flex flex-col items-center">
                  <button
                    onClick={handleAgreeAndProceed}
                    className="lpu-btn-primary px-8 py-3 text-sm font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <span>Agree & Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-gray-400 mt-2">
                    Clicking confirms agreement to university IT policy
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* MAINTENANCE REQUEST FORM (Screenshots 4 & 5 Replication) */
            <MaintenanceForm
              onCancel={() => setViewState("disclaimer")}
              onSuccess={handleFormSuccess}
            />
          )}
        </>
      )}

      {/* =========================================================================
          TAB 2: RMS HISTORY CONTENT
          ========================================================================= */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">
              Submitted Maintenance Complaints & Service Status
            </h2>
            <span className="text-xs text-gray-500">
              Showing {studentTickets.length} record(s)
            </span>
          </div>

          {studentTickets.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-lpu-orange flex items-center justify-center mx-auto mb-3">
                <Inbox className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">
                No complaints submitted yet
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
                When you encounter broken campus equipment, switch to the "Log Request" tab to notify hostel wardens and engineers.
              </p>
              <button
                onClick={() => {
                  setActiveTab("log");
                  setViewState("disclaimer");
                }}
                className="lpu-btn-primary px-5 py-2 text-xs font-semibold"
              >
                Submit First Request
              </button>
            </div>
          ) : (
            /* Ticket History Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                    <th className="px-4 py-3">Ticket ID</th>
                    <th className="px-4 py-3">Category & Equipment</th>
                    <th className="px-4 py-3">Block / Room</th>
                    <th className="px-4 py-3">Date Submitted</th>
                    <th className="px-4 py-3">Urgency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {studentTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-lpu-orange">
                        {t.ticketNo || t.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900">
                          {t.category}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {t.equipment || t.subCategory || "General Equipment"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {t.locationBlock || t.block} • {t.locationRoom || t.room}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Today"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.urgencyLevel === "Critical"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : t.urgencyLevel === "High"
                              ? "bg-orange-100 text-orange-700 border border-orange-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {t.urgencyLevel || "Medium"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${getStatusBadge(t.status)}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-lpu-orange hover:text-lpu-orange-dark hover:underline"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Ticket Details Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Ticket {selectedTicket.ticketNo || selectedTicket.id}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Submitted on {selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString("en-IN") : "Today"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                </div>

                <div className="p-6 space-y-4 text-xs">
                  {/* Status Timeline */}
                  <div className="bg-orange-50/40 p-3.5 rounded-lg border border-orange-100">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      Resolution Lifecycle & Tracking
                    </span>
                    <TicketStatusTimeline status={selectedTicket.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-semibold text-gray-800">{selectedTicket.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Equipment</span>
                      <span className="font-semibold text-gray-800">{selectedTicket.equipment || "Standard"}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Location</span>
                      <span className="font-semibold text-gray-800">
                        {selectedTicket.locationBlock || selectedTicket.block} / {selectedTicket.locationRoom || selectedTicket.room}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Preferred Slot</span>
                      <span className="font-semibold text-gray-800">{selectedTicket.preferredTimeSlot || "Anytime"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Complaint Description</span>
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-700 leading-relaxed border border-gray-100">
                      {selectedTicket.userComplaintText || selectedTicket.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="px-4 py-2 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: 360° CAMPUS TOUR
          ========================================================================= */}
      {activeTab === "tour" && (
        <CampusTour360
          onReportIssue={(suggestedBlock) => {
            setActiveTab("log");
            setViewState("form");
          }}
        />
      )}

      {/* Category Selection Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSelectCategory={handleCategorySelect}
      />
    </div>
  );
}
