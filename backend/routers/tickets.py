import json
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import case
from pydantic import BaseModel

from database import get_db
from models.ticket import Ticket
from models.user import User
from routers.auth import get_current_user

router = APIRouter(tags=["tickets"])

def determine_urgency(category: str) -> str:
    cat = (category or "").lower()
    if any(k in cat for k in ["generator", "elevator", "lift"]):
        return "Critical"
    elif any(k in cat for k in ["air conditioner", "ac", "power trip", "electrical"]):
        return "High"
    elif any(k in cat for k in ["water cooler", "drinking water", "geyser", "water heater", "biometric"]):
        return "Medium"
    elif any(k in cat for k in ["projector", "smartboard", "network", "internet"]):
        return "Low"
    return "Medium"

def serialize_ticket(t: Ticket) -> dict:
    return {
        "id": t.id,
        "ticket_id": t.ticket_id,
        "student_user_id": t.student_user_id,
        "student_name": t.student_name,
        "block": t.block,
        "sub_block": t.sub_block,
        "room_number": t.room_number,
        "contact_number": t.contact_number,
        "category": t.category,
        "sub_category": t.sub_category,
        "specific_category": t.specific_category,
        "equipment": t.equipment,
        "message_type": t.message_type,
        "availability_date": t.availability_date,
        "time_slots": t.time_slots,
        "description": t.description,
        "status": t.status,
        "urgency_level": t.urgency_level,
        "assigned_to_warden": t.assigned_to_warden,
        "assigned_to_maintenance": t.assigned_to_maintenance,
        "ai_diagnosis_json": t.ai_diagnosis_json,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
    }

class TicketCreateRequest(BaseModel):
    block: str
    sub_block: Optional[str] = "A"
    room_number: str
    contact_number: str
    category: str
    sub_category: Optional[str] = None
    specific_category: Optional[str] = None
    equipment: Optional[str] = None
    message_type: Optional[str] = "Grievance"
    availability_date: Optional[str] = None
    time_slots: Optional[str] = None
    description: str
    urgency_level: Optional[str] = None

class AssignMaintenanceRequest(BaseModel):
    maintenance_user_id: Optional[str] = None

@router.post("/tickets/create")
def create_ticket(
    req: TicketCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.block or not req.room_number or not req.contact_number or not req.category or not req.description:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required fields for ticket creation"
        )

    ticket_id = f"TKT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    urgency = req.urgency_level or determine_urgency(req.category)
    equipment_name = req.equipment or req.category

    new_ticket = Ticket(
        ticket_id=ticket_id,
        student_user_id=current_user.user_id,
        student_name=current_user.name,
        block=req.block,
        sub_block=req.sub_block,
        room_number=req.room_number,
        contact_number=req.contact_number,
        category=req.category,
        sub_category=req.sub_category,
        specific_category=req.specific_category,
        equipment=equipment_name,
        message_type=req.message_type or "Grievance",
        availability_date=req.availability_date,
        time_slots=req.time_slots,
        description=req.description,
        status="Pending",
        urgency_level=urgency,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return serialize_ticket(new_ticket)

@router.get("/tickets/my-tickets")
def get_my_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tickets = db.query(Ticket).filter(
        Ticket.student_user_id == current_user.user_id
    ).order_by(Ticket.created_at.desc()).all()

    return [serialize_ticket(t) for t in tickets]

@router.get("/tickets/warden/{block}")
def get_warden_block_tickets(
    block: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    clean_block = block.strip().lower()
    
    if clean_block in ["all", "all blocks", "all_blocks"]:
        tickets = db.query(Ticket).filter(
            Ticket.status.in_(["Pending", "Assigned", "In_Progress", "Resolved", "Closed"])
        ).order_by(Ticket.created_at.desc()).all()
    else:
        # Match block prefix or exact block name (e.g. 'gh', 'bh-5', 'bh-1', etc.)
        tickets = db.query(Ticket).filter(
            Ticket.block.ilike(f"{clean_block}%"),
            Ticket.status.in_(["Pending", "Assigned", "In_Progress", "Resolved", "Closed"])
        ).order_by(Ticket.created_at.desc()).all()

    return [serialize_ticket(t) for t in tickets]

@router.patch("/tickets/{ticket_id}/assign-warden")
def assign_to_warden(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.assigned_to_warden = current_user.user_id
    ticket.status = "Assigned"
    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)

@router.patch("/tickets/{ticket_id}/assign-maintenance")
def assign_to_maintenance(
    ticket_id: str,
    req: Optional[AssignMaintenanceRequest] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    maint_id = req.maintenance_user_id if (req and req.maintenance_user_id) else current_user.user_id
    ticket.assigned_to_maintenance = maint_id
    ticket.status = "In_Progress"
    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)

@router.get("/tickets/maintenance/assigned")
def get_maintenance_assigned_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    urgency_sort = case(
        (Ticket.urgency_level == "Critical", 1),
        (Ticket.urgency_level == "High", 2),
        (Ticket.urgency_level == "Medium", 3),
        (Ticket.urgency_level == "Low", 4),
        else_=5
    )

    tickets = db.query(Ticket).filter(
        Ticket.status.in_(["Assigned", "In_Progress"])
    ).order_by(
        urgency_sort,
        Ticket.created_at.desc()
    ).all()

    return [serialize_ticket(t) for t in tickets]

@router.patch("/tickets/{ticket_id}/resolve")
def resolve_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = "Resolved"
    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)
    return serialize_ticket(ticket)

@router.get("/tickets/{ticket_id}")
def get_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return serialize_ticket(ticket)
