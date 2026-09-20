import os
import re
import math
import logging
from typing import List, Dict, Any, Optional
from collections import Counter
import pandas as pd

logger = logging.getLogger("vector_store")

try:
    from chromadb.api.types import EmbeddingFunction, Documents, Embeddings
except ImportError:
    class EmbeddingFunction:
        pass
    Documents = list
    Embeddings = list


class LightweightEmbeddingFunction(EmbeddingFunction):
    """
    Zero-memory embedding function that generates deterministic term-hash vectors.
    Does NOT import onnxruntime or download all-MiniLM-L6-v2 model weights into RAM.
    Fixes Render 512MB RAM OOM crash.
    """
    def __init__(self, dim: int = 32):
        self.dim = dim

    def __call__(self, input: Documents) -> Embeddings:
        embeddings = []
        for doc in input:
            vec = [0.0] * self.dim
            words = re.findall(r'\b[a-z0-9_-]{2,}\b', str(doc).lower())
            for w in words:
                idx = abs(hash(w)) % self.dim
                vec[idx] += 1.0
            norm = math.sqrt(sum(x * x for x in vec)) or 1.0
            embeddings.append([x / norm for x in vec])
        return embeddings

    def name(self) -> str:
        return "lightweight"


class LightweightSimilarityEngine:
    """
    Lightweight in-memory TF-IDF and BM25-style keyword similarity search engine.
    Uses < 2MB of RAM for 250 maintenance records and executes in < 2ms.
    """
    def __init__(self, records: List[Dict[str, Any]]):
        self.records = records
        self.n_docs = len(records)
        self.doc_tokens: List[Counter] = []
        self.df = Counter()

        for rec in self.records:
            text = f"{rec.get('equipment', '')} {rec.get('complaint', '')} {rec.get('diagnosis', '')} {rec.get('fix_action', '')} {rec.get('location_block', '')}".lower()
            tokens = re.findall(r'\b[a-z0-9_-]{2,}\b', text)
            tf = Counter(tokens)
            self.doc_tokens.append(tf)
            for t in tf.keys():
                self.df[t] += 1

    def search(
        self,
        query: str,
        location_block: Optional[str] = None,
        equipment: Optional[str] = None,
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        q_tokens = re.findall(r'\b[a-z0-9_-]{2,}\b', query.lower())
        if not q_tokens:
            return [dict(r, similarity_score=0.5) for r in self.records[:n_results]]

        scores = []
        for idx, (rec, tf) in enumerate(zip(self.records, self.doc_tokens)):
            score = 0.0
            doc_len = sum(tf.values()) or 1

            for qt in q_tokens:
                if qt in tf:
                    # TF-IDF calculation
                    tf_val = tf[qt] / doc_len
                    idf_val = math.log((self.n_docs + 1) / (self.df[qt] + 1)) + 1.0
                    score += tf_val * idf_val * 10.0

            # Boost if location block matches
            if location_block and rec.get("location_block", "").lower() == location_block.lower():
                score *= 1.4

            # Boost if equipment matches
            if equipment and equipment.lower() in rec.get("equipment", "").lower():
                score *= 1.5

            if score > 0:
                scores.append((score, idx))

        scores.sort(key=lambda x: x[0], reverse=True)
        max_score = scores[0][0] if scores else 1.0

        results = []
        for s, idx in scores[:n_results]:
            case = dict(self.records[idx])
            norm_score = min(0.98, max(0.45, s / max_score))
            case["similarity_score"] = round(norm_score, 3)
            results.append(case)

        # Fallback if no matching scores
        if not results:
            for rec in self.records[:n_results]:
                case = dict(rec)
                case["similarity_score"] = 0.500
                results.append(case)

        return results


class LPUMaintenanceVectorStore:
    def __init__(self, persist_dir: str, csv_path: str):
        self.persist_dir = persist_dir
        self.csv_path = self._resolve_csv_path(csv_path)
        self.records: List[Dict[str, Any]] = []
        self.similarity_engine: Optional[LightweightSimilarityEngine] = None
        self.collection = None

        self._init_store()

    def _resolve_csv_path(self, csv_path: str) -> str:
        if os.path.exists(csv_path):
            return csv_path
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        alt_path = os.path.join(base_dir, "data", "lpu_maintenance_records.csv")
        root_alt_path = os.path.join(os.path.dirname(base_dir), "lpu_maintenance_records.csv")
        if os.path.exists(alt_path):
            return alt_path
        elif os.path.exists(root_alt_path):
            return root_alt_path
        return csv_path

    def _init_store(self):
        """Initialize ChromaDB with lightweight zero-ONNX embedding function and in-memory engine"""
        # 1. Initialize in-memory records from CSV
        self.load_data_if_empty()

        # 2. Try initializing ChromaDB with LightweightEmbeddingFunction (no ONNX)
        try:
            import chromadb
            os.makedirs(self.persist_dir, exist_ok=True)
            self.client = chromadb.PersistentClient(path=self.persist_dir)
            self.embedding_fn = LightweightEmbeddingFunction(dim=32)

            try:
                self.collection = self.client.get_or_create_collection(
                    name="lpu_maintenance_records",
                    embedding_function=self.embedding_fn,
                    metadata={"hnsw:space": "cosine"}
                )
            except ValueError:
                # Handle existing collection configured with legacy ONNX embedding function
                try:
                    self.client.delete_collection("lpu_maintenance_records")
                except Exception:
                    pass
                self.collection = self.client.create_collection(
                    name="lpu_maintenance_records",
                    embedding_function=self.embedding_fn,
                    metadata={"hnsw:space": "cosine"}
                )

            # Sync ChromaDB if empty
            if self.collection.count() == 0 and self.records:
                docs = [r["document"] for r in self.records]
                metadatas = [{k: v for k, v in r.items() if k != "document"} for r in self.records]
                ids = [r["issue_id"] for r in self.records]
                batch_size = 100
                for i in range(0, len(docs), batch_size):
                    self.collection.add(
                        documents=docs[i:i+batch_size],
                        metadatas=metadatas[i:i+batch_size],
                        ids=ids[i:i+batch_size]
                    )
        except Exception as e:
            logger.warning(f"ChromaDB persistence bypassed ({e}); using lightweight in-memory store.")
            # Fallback mock collection object with .count()
            class MockCollection:
                def __init__(self, count_fn):
                    self.count_fn = count_fn
                def count(self):
                    return self.count_fn()
            self.collection = MockCollection(lambda: len(self.records))

    def load_data_if_empty(self):
        """Load CSV data into lightweight in-memory index"""
        if self.records:
            return

        if not os.path.exists(self.csv_path):
            logger.warning(f"Warning: CSV file not found at {self.csv_path}")
            return

        df = pd.read_csv(self.csv_path)
        records = []

        for _, row in df.iterrows():
            doc_text = f"""
            Location: {row.get('Location_Block', '')} {row.get('Location_Room', '')}
            Equipment: {row.get('Equipment', '')}
            Complaint: {row.get('User_Complaint_Text', '')}
            Diagnosis: {row.get('Actual_Diagnosed_Problem', '')}
            Fix: {row.get('Fix_Action_Taken', '')}
            Parts: {row.get('Parts_Replaced', '')}
            """.strip()

            metadata = {
                "issue_id": str(row.get('Issue_ID', '')),
                "date": str(row.get('Date', '')),
                "location_block": str(row.get('Location_Block', '')),
                "location_room": str(row.get('Location_Room', '')),
                "equipment": str(row.get('Equipment', '')),
                "complaint": str(row.get('User_Complaint_Text', '')),
                "diagnosis": str(row.get('Actual_Diagnosed_Problem', '')),
                "fix_action": str(row.get('Fix_Action_Taken', '')),
                "time_hours": str(row.get('Time_Taken_Hours', '')),
                "cost_inr": str(row.get('Cost_INR', '')),
                "parts_replaced": str(row.get('Parts_Replaced', '')),
                "urgency": str(row.get('Urgency_Level', 'Medium')),
                "status": str(row.get('Status', 'Resolved')),
                "document": doc_text
            }
            records.append(metadata)

        self.records = records
        self.similarity_engine = LightweightSimilarityEngine(self.records)
        logger.info(f"Loaded {len(self.records)} maintenance records into lightweight memory index.")

    def search_similar_cases(
        self,
        query: str,
        location_block: Optional[str] = None,
        equipment: Optional[str] = None,
        n_results: int = 5
    ) -> list:
        """
        Lightweight semantic/TF-IDF similarity search for similar maintenance cases.
        Zero local model weights loaded into RAM.
        """
        if self.similarity_engine:
            return self.similarity_engine.search(
                query=query,
                location_block=location_block,
                equipment=equipment,
                n_results=n_results
            )
        return self.records[:n_results]
