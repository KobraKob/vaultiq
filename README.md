# VAULTIQ 🚀
### AI-Powered Internal Knowledge Assistant

VAULTIQ is a production-grade RAG (Retrieval-Augmented Generation) application designed to help small and mid-size companies (like our demo company, **Nexora Technologies**) turn their internal documentation into an interactive, AI-powered knowledge base.

---

## ✨ Features
- **Smart Chat Interface**: Ask questions in plain English and get instant answers.
- **Source Citations**: Every answer includes links to the specific document chunks used as context.
- **Admin Dashboard**: Easy drag-and-drop document uploads (PDF & DOCX).
- **RAG Pipeline**: Uses LangChain, ChromaDB, and HuggingFace embeddings for local vector search.
- **Llama 3 Powered**: High-speed inference via Groq Cloud.
- **Secure Auth**: Integrated with Supabase Auth for user management.

---

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), LangChain.
- **Vector DB**: ChromaDB.
- **LLM**: Groq (Llama 3 8B).
- **Embeddings**: HuggingFace `all-MiniLM-L6-v2` (Runs locally).
- **Auth & Database**: Supabase.

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker & Docker Compose
- Supabase Project (URL & API Keys)
- Groq API Key (Get it at [console.groq.com](https://console.groq.com))

### 2. Environment Setup
Create a `.env` file in the `backend/` directory based on `.env.example`:
```bash
GROQ_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Create a `.env` file in the `frontend/` directory based on `.env.example`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:8000
```

### 3. Run with Docker (Recommended)
```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:8000](http://localhost:8000)

### 4. Manual Local Setup
**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure
```text
VAULTIQ/
├── backend/
│   ├── rag/                # RAG logic (Ingestion & Query)
│   ├── routers/            # API Endpoints
│   ├── scripts/            # Seeding & utility scripts
│   ├── chroma_db/          # Persistent vector store (gitignored)
│   └── main.py             # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Chat, Layout)
│   │   ├── pages/          # Auth, Admin, Chat pages
│   │   └── lib/            # Supabase & API utilities
│   └── tailwind.config.js
├── documents/              # Place company docs here
└── docker-compose.yml
```

---

## 📝 Seeding Initial Data
To ingest the files currently in the `documents/` folder into your vector store:
```bash
cd backend
python scripts/seed_nexora.py
```

---

## 👤 Credits
Built with ❤️ for Nexora Technologies.
