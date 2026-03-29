import os
import sys

# Add parent directory to path so we can import from backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rag.ingest import ingest_document

def seed_documents():
    docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "documents")
    
    print(f"Checking for documents in: {docs_dir}")
    if not os.path.exists(docs_dir):
        print(f"Error: Directory {docs_dir} not found.")
        return

    for root, _, files in os.walk(docs_dir):
        for file in files:
            if file.endswith('.docx') or file.endswith('.pdf'):
                file_path = os.path.join(root, file)
                print(f"Ingesting: {file}")
                
                try:
                    metadata = {"source": file, "collection": "General"}
                    # Assuming local chunking and vector storage
                    res = ingest_document(file_path, metadata)
                    print(f"Success: {file} -> {res['chunks']} chunks ingested.")
                except Exception as e:
                    print(f"Failed to ingest {file}: {e}")

if __name__ == "__main__":
    seed_documents()
