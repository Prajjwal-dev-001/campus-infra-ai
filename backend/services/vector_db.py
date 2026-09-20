"""
Lightweight Vector Store / Database for LPU RMS AI Maintenance System.
Engineered for low-memory environments (e.g., Render 512MB RAM tier).
Zero local ONNX / sentence-transformers weights are loaded into RAM.
"""

from services.data_loader import (
    LPUMaintenanceVectorStore,
    LightweightEmbeddingFunction,
    LightweightSimilarityEngine
)
from services.vector_store import get_vector_store

__all__ = [
    "get_vector_store",
    "LPUMaintenanceVectorStore",
    "LightweightEmbeddingFunction",
    "LightweightSimilarityEngine"
]
