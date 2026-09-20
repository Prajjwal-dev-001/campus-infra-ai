import os
import chromadb
import pandas as pd
from chromadb.utils import embedding_functions

class LPUMaintenanceVectorStore:
    def __init__(self, persist_dir: str, csv_path: str):
        os.makedirs(persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_dir)
        # Use ChromaDB's default embedding function
        self.embedding_fn = embedding_functions.DefaultEmbeddingFunction()
        self.collection = self.client.get_or_create_collection(
            name="lpu_maintenance_records",
            embedding_function=self.embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        # Resolve CSV path with fallbacks
        if not os.path.exists(csv_path):
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            alt_path = os.path.join(base_dir, "data", "lpu_maintenance_records.csv")
            root_alt_path = os.path.join(os.path.dirname(base_dir), "lpu_maintenance_records.csv")
            if os.path.exists(alt_path):
                self.csv_path = alt_path
            elif os.path.exists(root_alt_path):
                self.csv_path = root_alt_path
            else:
                self.csv_path = csv_path
        else:
            self.csv_path = csv_path

    def load_data_if_empty(self):
        """Load CSV into ChromaDB only if collection is empty"""
        current_count = self.collection.count()
        if current_count > 0:
            print(f"ChromaDB already has {current_count} records. Skipping load.")
            return

        if not os.path.exists(self.csv_path):
            print(f"Warning: CSV file not found at {self.csv_path}")
            return

        print(f"Reading maintenance records from {self.csv_path}...")
        df = pd.read_csv(self.csv_path)

        # Build rich text for embedding (combine relevant fields)
        documents = []
        metadatas = []
        ids = []

        for _, row in df.iterrows():
            doc_text = f"""
            Location: {row['Location_Block']} {row['Location_Room']}
            Equipment: {row['Equipment']}
            Complaint: {row['User_Complaint_Text']}
            Diagnosis: {row['Actual_Diagnosed_Problem']}
            Fix: {row['Fix_Action_Taken']}
            Parts: {row['Parts_Replaced']}
            """

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
                "status": str(row.get('Status', 'Resolved'))
            }

            documents.append(doc_text.strip())
            metadatas.append(metadata)
            ids.append(str(row['Issue_ID']))

        # Load in batches of 50
        batch_size = 50
        for i in range(0, len(documents), batch_size):
            self.collection.add(
                documents=documents[i:i+batch_size],
                metadatas=metadatas[i:i+batch_size],
                ids=ids[i:i+batch_size]
            )
            print(f"Loaded batch {i//batch_size + 1} of {(len(documents) + batch_size - 1)//batch_size}")

        print(f"Successfully loaded {len(documents)} records into ChromaDB")

    def search_similar_cases(
        self,
        query: str,
        location_block: str = None,
        equipment: str = None,
        n_results: int = 5
    ) -> list:
        """
        Semantic search for similar maintenance cases.
        Optionally filter by location or equipment for better relevance.
        """
        where_filter = None
        if location_block:
            where_filter = {"location_block": {"$eq": location_block}}

        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where_filter,
                include=["documents", "metadatas", "distances"]
            )
        except Exception as e:
            # Fallback without where filter if filter errors
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )

        similar_cases = []
        if results and results.get('metadatas') and len(results['metadatas']) > 0:
            for i, metadata in enumerate(results['metadatas'][0]):
                distance = results['distances'][0][i] if results.get('distances') else 0.0
                case = {
                    **metadata,
                    "similarity_score": round(max(0.0, 1.0 - float(distance)), 3),
                    "document": results['documents'][0][i] if results.get('documents') else ""
                }
                similar_cases.append(case)

        return similar_cases
