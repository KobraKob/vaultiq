import os
import tempfile
from pathlib import Path
from langchain_community.document_loaders import Docx2txtLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

# Constants
FAISS_INDEX_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "faiss_index")
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

def get_embeddings():
    """Initializes and returns the HuggingFace embedding model."""
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

def get_vector_store():
    """Initializes and returns the FAISS vector store."""
    embeddings = get_embeddings()
    if os.path.exists(FAISS_INDEX_DIR):
        return FAISS.load_local(FAISS_INDEX_DIR, embeddings, allow_dangerous_deserialization=True)
    return None

def ingest_document(file_path: str, metadata: dict = None):
    """
    Loads a document (PDF or DOCX), chunks it, embeds it, and stores it in FAISS.
    """
    # 1. Load document
    ext = Path(file_path).suffix.lower()
    if ext == '.pdf':
        loader = PyPDFLoader(file_path)
    elif ext == '.docx':
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    
    docs = loader.load()

    # Apply provided metadata to each document chunk
    if metadata:
        for doc in docs:
            doc.metadata.update(metadata)

    # 2. Chunk text
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=300,
        add_start_index=True,
    )
    splits = text_splitter.split_documents(docs)

    # 3. Embed & Store
    embeddings = get_embeddings()
    
    vector_store = get_vector_store()
    if vector_store:
        vector_store.add_documents(documents=splits)
    else:
        vector_store = FAISS.from_documents(splits, embeddings)
        
    # Persist locally
    vector_store.save_local(FAISS_INDEX_DIR)
    
    return {"message": f"Successfully ingested {len(splits)} chunks.", "chunks": len(splits)}
