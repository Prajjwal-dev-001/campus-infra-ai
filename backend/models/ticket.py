from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String, unique=True, index=True, nullable=False)
    student_user_id = Column(String, ForeignKey("users.user_id"), nullable=False)
    student_name = Column(String, nullable=False)
    block = Column(String, nullable=False)
    sub_block = Column(String, nullable=True)
    room_number = Column(String, nullable=False)
    contact_number = Column(String, nullable=False)
    category = Column(String, nullable=False)
    sub_category = Column(String, nullable=True)
    specific_category = Column(String, nullable=True)
    equipment = Column(String, nullable=False)
    message_type = Column(String, default="Grievance")
    availability_date = Column(String, nullable=True)
    time_slots = Column(String, nullable=True)  # JSON serialized list or comma separated
    description = Column(Text, nullable=False)
    status = Column(String, default="Pending")  # Pending, Assigned, In_Progress, Resolved, Closed
    urgency_level = Column(String, default="Medium")  # Low, Medium, High, Critical
    assigned_to_warden = Column(String, nullable=True)
    assigned_to_maintenance = Column(String, nullable=True)
    ai_diagnosis_json = Column(Text, nullable=True)  # Stores AI result as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
