from services.data_loader import LPUMaintenanceVectorStore
from config import settings

vector_store = None

def get_vector_store() -> LPUMaintenanceVectorStore:
    global vector_store
    if vector_store is None:
        vector_store = LPUMaintenanceVectorStore(
            persist_dir=settings.CHROMA_PERSIST_DIR,
            csv_path=settings.CSV_DATA_PATH
        )
        vector_store.load_data_if_empty()
    return vector_store
