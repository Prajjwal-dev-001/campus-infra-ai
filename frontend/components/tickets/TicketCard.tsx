import React from "react";
import { Ticket } from "@/lib/types";
import Badge from "../ui/Badge";

export interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="lpu-card p-4 hover:border-lpu-orange cursor-pointer transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs font-bold text-lpu-orange">{ticket.ticketNo}</span>
        <Badge urgency={ticket.urgencyLevel}>{ticket.urgencyLevel}</Badge>
      </div>
      <h4 className="font-semibold text-sm text-lpu-black mb-1">{ticket.equipment}</h4>
      <p className="text-xs text-lpu-gray-dark line-clamp-2 mb-2">{ticket.userComplaintText}</p>
      <div className="flex items-center justify-between text-[11px] text-gray-500 border-t pt-2 mt-2">
        <span>{ticket.locationBlock} • {ticket.locationRoom}</span>
        <span className="font-medium text-lpu-black">{ticket.status}</span>
      </div>
    </div>
  );
};

export default TicketCard;
