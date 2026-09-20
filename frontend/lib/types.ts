/**
 * TypeScript Type Definitions for LPU RMS AI Maintenance System
 */

export type RoleType = "student" | "warden" | "maintenance" | "faculty" | "lab_technician";

export type UrgencyLevel = "Low" | "Medium" | "High" | "Critical";

export type TicketStatus = "Pending" | "Assigned" | "In_Progress" | "Resolved" | "Closed" | "Rejected";

export interface User {
  id: string;
  name: string;
  role: RoleType;
  registrationId?: string;
  email?: string;
  block?: string;
  blockAssigned?: string;
  room?: string;
  phone?: string;
  department?: string;
}

export interface SimilarCase {
  issueId: string;
  date: string;
  locationBlock: string;
  locationRoom: string;
  equipment: string;
  userComplaintText: string;
  actualDiagnosedProblem: string;
  fixActionTaken: string;
  timeTakenHours: number;
  costINR: number;
  partsReplaced: string;
  urgencyLevel: UrgencyLevel;
  similarityScore: number;
}

export interface AIAnalysisResult {
  diagnosis: string;
  rootCause: string;
  urgency: UrgencyLevel;
  recommendedFix: string;
  partsLikelyNeeded: string[];
  estimatedCostINR: {
    min: number;
    max: number;
    expected: number;
  };
  estimatedTimeHours: {
    min: number;
    max: number;
    expected: number;
  };
  reasoningChain: string[];
  similarCases: SimilarCase[];
  confidenceScore: number;
}

export interface Ticket {
  id: string;
  ticketNo?: string;
  userId?: string;
  userName?: string;
  studentRegNo?: string;
  roleType?: string;
  locationBlock?: string;
  block?: string;
  locationRoom?: string;
  room?: string;
  equipment?: string;
  category?: string;
  subCategory?: string;
  specificCategory?: string[];
  messageType?: string;
  subBlock?: string;
  roomType?: string;
  availabilityDate?: string;
  userComplaintText?: string;
  description?: string;
  preferredTimeSlot?: string;
  timeSlots?: string[];
  contactNumber?: string;
  urgencyLevel?: UrgencyLevel;
  status: TicketStatus;
  assigned_to?: string;
  
  // Technical & Diagnosis fields
  actualDiagnosedProblem?: string;
  fixActionTaken?: string;
  partsReplaced?: string;
  costINR?: number;
  timeTakenHours?: number;
  assignedTechnician?: string;
  
  // Timestamps
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  resolvedAt?: string;
  
  // AI metadata
  aiAnalysis?: AIAnalysisResult;
}

export interface TicketFilters {
  status?: TicketStatus | "All";
  urgency?: UrgencyLevel | "All";
  block?: string | "All";
  equipment?: string | "All";
  searchQuery?: string;
}
