import time
import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.ticket import Ticket
from models.user import User
from routers.auth import get_current_user
from services.diagnosis_agent import run_diagnosis

router = APIRouter(tags=["ai-diagnosis"])
logger = logging.getLogger("ai_diagnosis_endpoint")

@router.post("/tickets/{ticket_id}/ai-diagnose")
def ai_diagnose_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Require maintenance role
    if current_user.role.lower() != "maintenance":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="AI diagnosis engine is restricted to Maintenance & Engineering staff"
        )

    # Fetch ticket
    ticket = db.query(Ticket).filter(Ticket.ticket_id == ticket_id).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {ticket_id} not found"
        )

    start_time = time.time()
    logger.info(f"[{datetime.utcnow().isoformat()}] Starting AI diagnosis for ticket: {ticket_id}")

    ticket_dict = {
        "description": ticket.description,
        "equipment": ticket.equipment,
        "block": ticket.block,
        "room_number": ticket.room_number,
        "category": ticket.category,
    }

    try:
        diagnosis_result = run_diagnosis(ticket_dict)
    except Exception as e:
        logger.error(f"AI diagnosis execution failed for ticket {ticket_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI service temporarily unavailable. Please try again."
        )

    duration = round(time.time() - start_time, 2)
    analysis_timestamp = datetime.utcnow().isoformat()

    full_response = {
        "ticket_id": ticket.ticket_id,
        "similar_cases": diagnosis_result.get("similar_cases", []),
        "diagnosis": diagnosis_result.get("diagnosis", {}),
        "recommendation": diagnosis_result.get("recommendation", {}),
        "plain_explanation": diagnosis_result.get("plain_explanation", ""),
        "confidence_score": diagnosis_result.get("confidence_score", 0.75),
        "analysis_timestamp": analysis_timestamp
    }

    # Save result JSON to ticket.ai_diagnosis_json
    try:
        ticket.ai_diagnosis_json = json.dumps(full_response)
        ticket.updated_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.warning(f"Could not persist ai_diagnosis_json to DB: {e}")

    logger.info(
        f"[{analysis_timestamp}] AI diagnosis completed for {ticket_id} in {duration}s "
        f"(confidence: {full_response['confidence_score']})"
    )

    return full_response
