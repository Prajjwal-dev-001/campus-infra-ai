from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "student", "warden", "maintenance"
    block_assigned = Column(String, nullable=True)
    room_number = Column(String, nullable=True)
    contact = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
