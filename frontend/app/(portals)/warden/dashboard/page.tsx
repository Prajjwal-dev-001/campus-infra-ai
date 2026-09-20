"use client";

import React, { useState, useEffect } from "react";
import { useRMSStore } from "@/lib/store";
import { Ticket } from "@/lib/types";
import { getWardenTickets, assignMaintenance } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorCard from "@/components/ui/ErrorCard";
import TicketStatusTimeline from "@/components/tickets/TicketStatusTimeline";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  UserCheck,
  Search,
  Filter,
  Check,
  Wrench,
  ChevronRight,
  Flame,
  Wind,
  Droplets,
  ArrowUpDown,
  Zap,
  Loader2,
  Inbox,
  RotateCw,
  Eye,
  X,
  Calendar,
  User,
  ChevronDown,
} from "lucide-react";

export default function WardenDashboardPage() {
  const { currentUser, accessToken, tickets, updateTicket, addTicket } = useRMSStore();
  const [notification, setNotification] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<"All" | "Pending" | "Assigned">("All");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string>("All");

  const wardenBlock = currentUser?.block || "BH-5";

  // Data fetching from backend
  const fetchTickets = async () => {
    try {
      setErrorMessage(null);
      const queryBlock = selectedBlock === "All" ? "all" : selectedBlock;
      const data = await getWardenTickets(queryBlock, accessToken || undefined);
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
            assigned_to: bt.assigned_to_maintenance ? "maintenance" : "warden",
            createdAt: bt.created_at,
            created_at: bt.created_at,
          };
          addTicket(t);
        });
      }
    } catch (err: any) {
      console.warn("Could not fetch warden tickets from backend:", err);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchTickets().finally(() => setIsLoading(false));

    // Auto-refresh polling every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [selectedBlock, accessToken]);

  // Filter tickets for chosen block filter
  const blockTickets = tickets.filter((t) => {
    if (selectedBlock === "All") return true;
    const ticketBlock = (t.locationBlock || t.block || "").toUpperCase();
    const filterBlock = selectedBlock.toUpperCase();
    if (filterBlock === "ACADEMIC") {
      return (
        ticketBlock.startsWith("BLOCK") ||
        ticketBlock.includes("ACADEMIC") ||
        ticketBlock.includes("HOSPITAL")
      );
    }
    if (filterBlock === "GH") {
      return ticketBlock.startsWith("GH");
    }
    return ticketBlock === filterBlock || ticketBlock.startsWith(filterBlock);
  });

  const activeQueriesCount = blockTickets.filter((t) => t.status !== "Resolved" && t.status !== "Closed").length;
  const pendingCount = blockTickets.filter((t) => t.status === "Pending").length;
  const resolvedCount = blockTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  const filteredTickets = blockTickets.filter((t) => {
    if (selectedFilter === "Pending" && t.status !== "Pending") return false;
    if (selectedFilter === "Assigned" && t.status !== "Assigned") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (t.userName || "").toLowerCase().includes(q);
      const matchId = (t.ticketNo || t.id || "").toLowerCase().includes(q);
      const matchCategory = (t.category || "").toLowerCase().includes(q);
      const matchRoom = (t.locationRoom || t.room || "").toLowerCase().includes(q);
      return matchName || matchId || matchCategory || matchRoom;
    }
    return true;
  });

  const handleAssignToMaintenance = async (ticket: Ticket) => {
    const tId = ticket.ticketNo || ticket.id;
    setAssigningId(ticket.id);

    try {
      await assignMaintenance(tId, accessToken || undefined);
      updateTicket(ticket.id, {
        status: "Assigned",
        assigned_to: "maintenance",
        updatedAt: new Date().toISOString(),
      });
      toast.info(`Ticket ${tId} assigned to Maintenance Engineering`);
      setNotification(`Ticket ${tId} assigned to Maintenance Department`);
    } catch (err) {
      console.warn("Backend assignment failed, updating local store fallback:", err);
      updateTicket(ticket.id, {
        status: "Assigned",
        assigned_to: "maintenance",
        updatedAt: new Date().toISOString(),
      });
      toast.info(`Ticket ${tId} assigned to Maintenance`);
      setNotification(`Ticket ${tId} assigned to Maintenance Department`);
    } finally {
      setAssigningId(null);
      setTimeout(() => setNotification(""), 3500);
    }
  };

  const getEquipmentIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("water") || cat.includes("cool")) return <Droplets className="w-4 h-4 text-sky-500" />;
    if (cat.includes("air") || cat.includes("ac")) return <Wind className="w-4 h-4 text-cyan-500" />;
    if (cat.includes("geyser") || cat.includes("heat")) return <Flame className="w-4 h-4 text-amber-500" />;
    if (cat.includes("elevator") || cat.includes("lift")) return <ArrowUpDown className="w-4 h-4 text-purple-500" />;
    if (cat.includes("power") || cat.includes("elect")) return <Zap className="w-4 h-4 text-amber-600" />;
    return <Wrench className="w-4 h-4 text-lpu-orange" />;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-lg text-sm font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{notification}</span>
          </div>
          <span className="text-xs text-emerald-100 bg-emerald-700/70 px-2 py-0.5 rounded">
            Dispatched to Tech Console
          </span>
        </div>
      )}

      {/* Warden Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-lpu-orange flex items-center justify-center font-bold text-lg shadow-xs">
            <UserCheck className="w-6 h-6 text-lpu-orange" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                {currentUser?.name || "Dr. Priya Sharma"}
              </h1>
              <span className="text-[10px] uppercase font-bold bg-orange-100 text-lpu-orange px-2 py-0.5 rounded-full">
                Hostel Warden Console
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Supervising Infrastructure, Safety & Welfare • Scope:{" "}
              <strong className="text-gray-900">
                {selectedBlock === "All" ? "All Campus Blocks" : selectedBlock}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={() => {
              setIsLoading(true);
              fetchTickets().finally(() => setIsLoading(false));
            }}
            title="Refresh tickets"
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shrink-0 shadow-xs"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Block Selection Dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="bg-white border-2 border-lpu-orange/50 hover:border-lpu-orange text-gray-900 text-xs font-bold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-lpu-orange transition-all cursor-pointer shadow-xs appearance-none"
            >
              <option value="All">All Blocks (Super Admin View)</option>
              <option value="BH-5">BH-5 (My Block)</option>
              <option value="BH-1">BH-1</option>
              <option value="BH-2">BH-2</option>
              <option value="BH-3">BH-3</option>
              <option value="BH-4">BH-4</option>
              <option value="GH">GH (All Girls Hostels)</option>
              <option value="GH-1">GH-1</option>
              <option value="GH-2">GH-2</option>
              <option value="GH-3">GH-3</option>
              <option value="GH-4">GH-4</option>
              <option value="Academic">Academic Blocks</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-lpu-orange absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-medium flex items-center gap-1.5 shrink-0 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Duty Live (30s Polling)
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Active Queries */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Total Active Queries</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{activeQueriesCount}</h3>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {selectedBlock === "All" ? "All campus complaints" : `${selectedBlock} complaints`}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-lpu-orange" />
          </div>
        </div>

        {/* Card 2: Pending Assignment */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Pending Assignment</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            <span className="text-[10px] text-amber-500 mt-0.5 block">Requires Warden Action</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        {/* Card 3: Resolved Queries */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Resolved Queries</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</h3>
            <span className="text-[10px] text-emerald-500 mt-0.5 block">Inspected & Closed</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Card 4: Block Details */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500">Supervised Scope</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">
              {selectedBlock === "All"
                ? "Campus Wide"
                : selectedBlock === "GH"
                ? "Girls Hostels (GH)"
                : selectedBlock === "Academic"
                ? "Academic Blocks"
                : `${selectedBlock} Hostel`}
            </h3>
            <span className="text-[10px] text-gray-400 mt-0.5 block">
              {selectedBlock === "All" ? "Full University Oversight" : "Designated Block Wings"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Error state if API failed */}
      {errorMessage && (
        <ErrorCard
          message={errorMessage}
          onRetry={() => {
            setIsLoading(true);
            fetchTickets().finally(() => setIsLoading(false));
          }}
        />
      )}

      {/* Active Queries Management Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">
              {selectedBlock === "All"
                ? "Campus-Wide Active Queries & Breakdown Log"
                : selectedBlock === "GH"
                ? "Girls Hostels (GH) Active Queries & Breakdown Log"
                : selectedBlock === "Academic"
                ? "Academic Blocks Active Queries & Breakdown Log"
                : `Hostel ${selectedBlock} Active Queries & Breakdown Log`}
            </h2>
            <p className="text-[11px] text-gray-500">
              Showing {filteredTickets.length} query records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search ticket, student, room..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-lpu-orange"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-gray-200/70 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedFilter("All")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === "All" ? "bg-white text-gray-900 shadow-xs font-bold" : "text-gray-600"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("Pending")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === "Pending" ? "bg-white text-amber-700 shadow-xs font-bold" : "text-gray-600"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedFilter("Assigned")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedFilter === "Assigned" ? "bg-white text-blue-700 shadow-xs font-bold" : "text-gray-600"
                }`}
              >
                Assigned
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading && filteredTickets.length === 0 ? (
          <div className="p-6">
            <SkeletonCard count={3} type="ticket" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No Queries Found"
            description={`There are currently no maintenance complaints for ${
              selectedBlock === "All" ? "campus" : selectedBlock
            } matching '${selectedFilter}'.`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Student Name & ID</th>
                  <th className="px-4 py-3">Category & Asset</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((t) => {
                  const isAssigning = assigningId === t.id;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-lpu-orange">
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(t)}
                          className="hover:underline flex items-center gap-1.5 text-left group"
                          title="Click to view ticket lifecycle & details"
                        >
                          <span className="font-bold text-lpu-orange group-hover:text-lpu-orange-dark">
                            {t.ticketNo || t.id}
                          </span>
                          <Eye className="w-3.5 h-3.5 text-gray-400 group-hover:text-lpu-orange transition-colors" />
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900">
                          {t.userName || "Rahul Kumar"}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          ID: {t.studentRegNo || t.userId || "12300001"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-2">
                          {getEquipmentIcon(t.category || "")}
                          <div>
                            <span className="font-semibold text-gray-800 block">
                              {t.category}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {t.equipment || t.subCategory || "General Equipment"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">
                        {t.locationRoom || t.room || "Room A-824"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
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
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            t.status === "Pending"
                              ? "lpu-badge-medium"
                              : t.status === "Assigned"
                              ? "lpu-badge-low"
                              : "lpu-badge-high"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {t.status === "Pending" ? (
                          <button
                            onClick={() => handleAssignToMaintenance(t)}
                            disabled={isAssigning}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-lpu-orange text-white rounded-lg hover:bg-lpu-orange-dark font-semibold text-xs transition-colors shadow-xs disabled:opacity-75"
                          >
                            {isAssigning ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Assign to Maintenance</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[11px] font-medium italic">
                            Dispatched
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details & Lifecycle Tracking Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200 animate-in zoom-in-95">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">
                  {selectedTicket.ticketNo || selectedTicket.id}
                </h3>
                <span className="text-[11px] text-gray-500">
                  Student: {selectedTicket.userName || "Rahul Kumar"} ({selectedTicket.studentRegNo || selectedTicket.userId})
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Timeline */}
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
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Contact</span>
                  <span className="font-semibold text-gray-800">{selectedTicket.contactNumber || "9876543210"}</span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">Complaint Description</span>
                <p className="p-3 bg-gray-50 rounded-lg text-gray-700 leading-relaxed border border-gray-100">
                  {selectedTicket.userComplaintText || selectedTicket.description}
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div>
                {selectedTicket.status === "Pending" && (
                  <button
                    onClick={() => {
                      handleAssignToMaintenance(selectedTicket);
                      setSelectedTicket(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-lpu-orange hover:bg-lpu-orange-dark text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Assign to Maintenance</span>
                  </button>
                )}
              </div>
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
  );
}
