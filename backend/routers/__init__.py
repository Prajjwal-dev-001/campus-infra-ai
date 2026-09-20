from routers.auth import router as auth_router
from routers.tickets import router as tickets_router
from routers.ai_diagnosis import router as ai_diagnosis_router

__all__ = ["auth_router", "tickets_router", "ai_diagnosis_router"]
