import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Ticket, TicketFilters } from "./types";

export const INITIAL_MOCK_TICKETS: Ticket[] = [
  {
    id: "TKT-892401",
    ticketNo: "RMS-BH5-892401",
    userId: "12300001",
    userName: "Rahul Kumar",
    studentRegNo: "12300001",
    roleType: "student",
    locationBlock: "BH-5",
    block: "BH-5",
    locationRoom: "A-824",
    room: "A-824",
    category: "Water Cooler/Drinking water (Cooling Issue)",
    subCategory: "Not Cooling",
    specificCategory: ["Cooling Issue", "Compressor Humming"],
    messageType: "Grievance",
    subBlock: "A",
    roomType: "Room No",
    equipment: "Water Cooler (Voltas Minimagic)",
    userComplaintText:
      "Water cooler in 3rd floor corridor of Block A is dispensing room temperature water and making continuous humming vibration noise. Filter indicator blinking red.",
    description:
      "Water cooler in 3rd floor corridor of Block A is dispensing room temperature water and making continuous humming vibration noise. Filter indicator blinking red.",
    preferredTimeSlot: "10:00-12:00",
    timeSlots: ["10:00-12:00"],
    contactNumber: "9876543210",
    urgencyLevel: "Medium",
    status: "Pending",
    assigned_to: "warden",
    createdAt: "2026-09-19T09:30:00Z",
    created_at: "2026-09-19T09:30:00Z",
  },
  {
    id: "TKT-892402",
    ticketNo: "RMS-BH5-892402",
    userId: "12300452",
    userName: "Amit Sharma",
    studentRegNo: "12300452",
    roleType: "student",
    locationBlock: "BH-5",
    block: "BH-5",
    locationRoom: "B-312",
    room: "B-312",
    category: "Air Conditioner - Not Cooling",
    subCategory: "Low Gas / No Cooling",
    specificCategory: ["Error Code E4", "No Cooling"],
    messageType: "Grievance",
    subBlock: "B",
    roomType: "Room No",
    equipment: "Split AC (Voltas 1.5T)",
    userComplaintText:
      "AC unit in room B-312 is blowing warm room air with error code E4 on digital display. Louver flaps flapping randomly. Room unbearable during afternoon hours.",
    description:
      "AC unit in room B-312 is blowing warm room air with error code E4 on digital display. Louver flaps flapping randomly. Room unbearable during afternoon hours.",
    preferredTimeSlot: "14:00-16:00",
    timeSlots: ["14:00-16:00"],
    contactNumber: "9812345678",
    urgencyLevel: "High",
    status: "Pending",
    assigned_to: "warden",
    createdAt: "2026-09-19T11:15:00Z",
    created_at: "2026-09-19T11:15:00Z",
  },
  {
    id: "TKT-892403",
    ticketNo: "RMS-BH5-892403",
    userId: "12300789",
    userName: "Deepak Verma",
    studentRegNo: "12300789",
    roleType: "student",
    locationBlock: "BH-5",
    block: "BH-5",
    locationRoom: "C-105",
    room: "C-105",
    category: "Geyser/Water Heater Issue",
    subCategory: "Thermostat Tripping",
    specificCategory: ["Burning Smell", "MCB Tripping"],
    messageType: "Grievance",
    subBlock: "C",
    roomType: "Room No",
    equipment: "Geyser (Racold 25L)",
    userComplaintText:
      "Bathroom geyser MCB trips instantaneously upon powering on the main switch with a distinct burning odor emitting from the 16A heavy wall socket.",
    description:
      "Bathroom geyser MCB trips instantaneously upon powering on the main switch with a distinct burning odor emitting from the 16A heavy wall socket.",
    preferredTimeSlot: "08:00-10:00",
    timeSlots: ["08:00-10:00"],
    contactNumber: "9823456789",
    urgencyLevel: "Critical",
    status: "Pending",
    assigned_to: "warden",
    createdAt: "2026-09-19T14:40:00Z",
    created_at: "2026-09-19T14:40:00Z",
  },
  {
    id: "TKT-892390",
    ticketNo: "RMS-BH5-892390",
    userId: "12300211",
    userName: "Rohan Roy",
    studentRegNo: "12300211",
    roleType: "student",
    locationBlock: "BH-5",
    block: "BH-5",
    locationRoom: "D-402",
    room: "D-402",
    category: "Elevator/Lift Malfunction",
    subCategory: "Door Sensor Malfunction",
    specificCategory: ["Door Sticking", "Floor Misalignment"],
    messageType: "Grievance",
    subBlock: "D",
    roomType: "Room No",
    equipment: "KONE Elevator (Model MonoSpace 500)",
    userComplaintText:
      "Passenger elevator Lift-2 in BH-5 West wing experiencing sudden jerks when decelerating at 4th floor level. Optical door sensor fails to trigger door retract without physical push.",
    description:
      "Passenger elevator Lift-2 in BH-5 West wing experiencing sudden jerks when decelerating at 4th floor level. Optical door sensor fails to trigger door retract without physical push.",
    preferredTimeSlot: "12:00-14:00",
    timeSlots: ["12:00-14:00"],
    contactNumber: "9834567890",
    urgencyLevel: "Critical",
    status: "Assigned",
    assigned_to: "maintenance",
    createdAt: "2026-09-18T16:20:00Z",
    created_at: "2026-09-18T16:20:00Z",
  },
];

interface RMSStoreState {
  currentUser: User | null;
  accessToken: string | null;
  tickets: Ticket[];
  activeTicket: Ticket | null;
  activeFilters: TicketFilters;

  // Auth actions
  login: (user: User, token?: string) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;

  // Ticket actions
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  setActiveTicket: (ticket: Ticket | null) => void;
  setTickets: (tickets: Ticket[]) => void;
  setFilters: (filters: Partial<TicketFilters>) => void;
}

export const useRMSStore = create<RMSStoreState>()(
  persist(
    (set) => ({
      currentUser: null,
      accessToken: null,
      tickets: INITIAL_MOCK_TICKETS,
      activeTicket: null,
      activeFilters: {
        status: "All",
        urgency: "All",
        block: "All",
        equipment: "All",
        searchQuery: "",
      },

      login: (user: User, token?: string) => {
        const authToken = token || null;
        if (typeof window !== "undefined") {
          localStorage.setItem("lpu_rms_user", JSON.stringify(user));
          if (authToken) {
            localStorage.setItem("lpu_rms_token", authToken);
          }
        }
        set({ currentUser: user, accessToken: authToken });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("lpu_rms_user");
          localStorage.removeItem("lpu_rms_token");
          localStorage.removeItem("lpu_rms_store");
        }
        set({ currentUser: null, accessToken: null, activeTicket: null });
      },

      setAccessToken: (token: string | null) => {
        if (typeof window !== "undefined") {
          if (token) localStorage.setItem("lpu_rms_token", token);
          else localStorage.removeItem("lpu_rms_token");
        }
        set({ accessToken: token });
      },

      addTicket: (ticket: Ticket) =>
        set((state) => {
          // Avoid duplicate ticket IDs
          const exists = state.tickets.some((t) => t.id === ticket.id || (ticket.ticketNo && t.ticketNo === ticket.ticketNo));
          const updated = exists
            ? state.tickets.map((t) => (t.id === ticket.id ? { ...t, ...ticket } : t))
            : [ticket, ...state.tickets];
          return { tickets: updated };
        }),

      updateTicket: (id: string, updates: Partial<Ticket>) =>
        set((state) => {
          const updated = state.tickets.map((t) =>
            t.id === id || t.ticketNo === id ? { ...t, ...updates } : t
          );
          return {
            tickets: updated,
            activeTicket:
              state.activeTicket && (state.activeTicket.id === id || state.activeTicket.ticketNo === id)
                ? { ...state.activeTicket, ...updates }
                : state.activeTicket,
          };
        }),

      setActiveTicket: (ticket: Ticket | null) => set({ activeTicket: ticket }),

      setTickets: (tickets: Ticket[]) => set({ tickets }),

      setFilters: (filters: Partial<TicketFilters>) =>
        set((state) => ({ activeFilters: { ...state.activeFilters, ...filters } })),
    }),
    {
      name: "lpu_rms_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
        accessToken: state.accessToken,
        tickets: state.tickets,
      }),
    }
  )
);

export const useAuthStore = useRMSStore;
