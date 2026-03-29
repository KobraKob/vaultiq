from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from pydantic import BaseModel
import shutil
import os
import tempfile

from rag.ingest import ingest_document
from rag.query import query_rag

router = APIRouter(prefix="/api")

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    citations: list

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    if len(request.query) > 2000:
        raise HTTPException(status_code=400, detail="Query too long (max 2000 characters)")

    try:
        response = query_rag(request.query.strip())
        return ChatResponse(answer=response["answer"], citations=response["citations"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Endpoint to manually upload a document to the RAG engine from the Admin Dashboard.
    """
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in ('.pdf', '.docx'):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    # Save to a proper temp file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            file_path = tmp.name

        metadata = {"source": file.filename}
        result = ingest_document(file_path, metadata)
        return {"success": True, "details": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to ingest document: {str(e)}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
