"""
Seeds the FAISS index with Nexora documents on first deploy.
Skips if the index already exists.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from rag.ingest import ingest_document, FAISS_INDEX_DIR

DOCS_DIR = os.path.join(os.path.dirname(__file__), "documents")

def seed():
    if os.path.exists(FAISS_INDEX_DIR):
        print(f"FAISS index already exists at {FAISS_INDEX_DIR}, skipping seed.")
        return

    if not os.path.exists(DOCS_DIR):
        print(f"No documents directory found at {DOCS_DIR}, skipping seed.")
        return

    files = [f for f in os.listdir(DOCS_DIR) if f.endswith(('.pdf', '.docx'))]
    if not files:
        print("No documents found to seed.")
        return

    print(f"Seeding {len(files)} documents...")
    total_chunks = 0
    for filename in files:
        filepath = os.path.join(DOCS_DIR, filename)
        result = ingest_document(filepath, {"source": filename})
        total_chunks += result["chunks"]
        print(f"  {filename}: {result['chunks']} chunks")

    print(f"Seed complete: {total_chunks} total chunks across {len(files)} documents.")

if __name__ == "__main__":
    seed()
