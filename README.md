<div align="center">

<img src="https://img.shields.io/badge/VAULTIQ-AI%20Knowledge%20Base-6C63FF?style=for-the-badge&logoColor=white" alt="VAULTIQ"/>

# VAULTIQ
### AI-Powered Internal Knowledge Base for Teams

**Upload your company docs. Ask anything. Get instant answers with source citations.**

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white)](https://langchain.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square&logoColor=white)](https://groq.com/)

[Live Demo](#) · [API Docs](#) · [Report Bug](#)

</div>

---

## What is VAULTIQ?

Most companies store critical knowledge in PDFs and docs that nobody reads. New employees ask the same 50 questions. Support agents guess. Onboarding takes weeks.

VAULTIQ fixes this. Upload your HR policies, SOPs, product docs, and security guidelines. Your team asks questions in plain English and gets accurate answers in seconds — with the exact source and page number cited.

**Built as a real B2B SaaS product for Nexora Technologies** (a 52-person startup), VAULTIQ demonstrates production-grade RAG architecture with multi-tenancy, role-based access, and cross-document retrieval.

---

## Demo

> Querying across 5 documents simultaneously — HR Policy, Employee Handbook, Product FAQ, IT Security Policy, IT Onboarding Guide

**Simple factual query — notice period lookup:**

```
Q: What is the notice period if I have been working for 2 years?

A: According to the Nexora HR Policy Handbook, for employees who have been working 
   between 1–3 years, the notice period is 60 calendar days.

Sources: nexora_hr_policy_handbook.docx (Section 7.1)
```

**Cross-document query — tools synthesis:**

```
Q: What tools does Nexora use?

A: Nexora uses: NexFlow (workflow automation), NexBase (AI knowledge base), 
   Jira (project management), Notion (wiki), GitHub (version control), 
   Google Workspace (productivity), Slack (communication), 
   CrowdStrike Falcon (endpoint security), Cloudflare WARP (VPN), 
   Freshdesk (customer support).

Sources: nexora_product_faq_technical_specs.docx, nexora_employee_handbook.docx,
         nexora_it_onboarding_setup_guide.docx
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VAULTIQ                                  │
├──────────────────────────┬──────────────────────────────────────┤
│      React Frontend      │         FastAPI Backend               │
│   • Chat Interface       │   • /upload  → ingest pipeline        │
│   • Admin Dashboard      │   • /query   → single doc search      │
│   • Source Citation UI   │   • /query/all → cross-doc search     │
└──────────────────────────┴──────────────┬───────────────────────┘
                                          │
              ┌───────────────────────────▼────────────────────────┐
              │              RAG PIPELINE                           │
              │                                                     │
              │  PDF Upload                                         │
              │      │                                              │
              │      ▼                                              │
              │  PyPDF2 → Extract Text                              │
              │      │                                              │
              │      ▼                                              │
              │  RecursiveCharacterTextSplitter                     │
              │  (chunk_size=1000, overlap=100)                     │
              │      │                                              │
              │      ▼                                              │
              │  HuggingFace Embeddings                             │
              │  (all-MiniLM-L6-v2, runs locally, free)            │
              │      │                                              │
              │      ▼                                              │
              │  FAISS Vector Store                                 │
              │  (per-document index, persisted to disk)            │
              │      │                                              │
              │   QUERY TIME                                        │
              │      │                                              │
              │      ▼                                              │
              │  Merge all org FAISS indexes                        │
              │      │                                              │
              │      ▼                                              │
              │  MMR Retrieval (k=8, fetch_k=20)                   │
              │  (deduplication via Maximum Marginal Relevance)     │
              │      │                                              │
              │      ▼                                              │
              │  Groq API → Llama 3 (8B)                           │
              │  (answers strictly from retrieved context)          │
              │      │                                              │
              │      ▼                                              │
              │  Answer + Source Citations                          │
              └─────────────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────▼────────────────────────┐
              │              DATA LAYER                             │
              │                                                     │
              │  Supabase Auth    → user login, JWT tokens          │
              │  Supabase Storage → raw PDF storage (vaultiq-docs)  │
              │  Supabase Postgres → orgs, users, collections, docs │
              │  FAISS (local)    → vector indexes per doc/org      │
              └─────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---|---|
| **Multi-document RAG** | Queries search across all uploaded docs simultaneously using merged FAISS indexes |
| **MMR Deduplication** | Maximum Marginal Relevance prevents duplicate chunks in retrieval results |
| **Source Citations** | Every answer includes the source document name and chunk preview |
| **Multi-tenancy** | Each organization's documents are isolated in separate FAISS indexes |
| **Role-based Access** | Admin (upload/manage docs) and Employee (query only) roles via Supabase Auth |
| **Collections** | Documents organized by department (HR, IT, Product, Legal) |
| **Cross-doc Retrieval** | `/query/all` endpoint merges all org indexes for company-wide search |
| **Local Embeddings** | HuggingFace `all-MiniLM-L6-v2` — zero cost, no external API for embeddings |
| **Fast Inference** | Groq API (Llama 3 8B) for sub-second LLM responses |
| **Dockerized** | Full Docker setup for consistent local and production deployment |

---

## Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| **FastAPI** | REST API — upload, ingest, query endpoints |
| **LangChain** | RAG pipeline orchestration — chunking, retrieval, QA chain |
| **FAISS** | Vector store — local, fast, persistent index per document |
| **HuggingFace Embeddings** | `all-MiniLM-L6-v2` — text → 384-dim vectors, runs fully locally |
| **Groq (Llama 3 8B)** | LLM inference — answers questions from retrieved context |
| **PyPDF2** | PDF text extraction |
| **Supabase** | Auth (JWT), Storage (PDF files), PostgreSQL (metadata) |

### Frontend
| Tool | Purpose |
|---|---|
| **React** | Chat interface and admin dashboard |
| **Tailwind CSS** | Styling |
| **Supabase JS Client** | Auth and storage integration |

### Infrastructure
| Tool | Purpose |
|---|---|
| **Docker** | Containerized backend |
| **Render** | Cloud deployment |

---

## Database Schema

```sql
-- Multi-tenant architecture
organizations        → company accounts
user_profiles        → employees (admin / employee role)
collections          → document groups (HR, IT, Product, Legal)
documents            → file metadata + Supabase Storage path + ingestion status

-- Storage
Supabase Bucket: vaultiq-docs
Path pattern:    {org_id}/{collection_id}/{filename}.pdf

-- Vectors
FAISS index per document: faiss_index/{org_id}/{doc_id}/
Merged at query time for cross-document search
```

---

## Project Structure

```
vaultiq/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + routes
│   │   ├── ingest.py        # PDF parsing + chunking + embedding + FAISS save
│   │   ├── query.py         # FAISS load + MMR retrieval + Groq LLM chain
│   │   └── config.py        # env vars
│   ├── faiss_index/         # persisted FAISS indexes (gitignored)
│   ├── uploads/             # temp PDF storage (gitignored)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat.jsx     # employee chat interface
│   │   │   └── Admin.jsx    # document upload + management
│   │   └── lib/
│   │       └── supabase.js  # supabase client
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)
- Supabase account (free tier works)
- Groq API key (free at console.groq.com)

### 1. Clone

```bash
git clone https://github.com/yourusername/vaultiq.git
cd vaultiq
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create `.env`:
```env
GROQ_API_KEY=your_groq_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

Run:
```bash
uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Docker (alternative)

```bash
cd backend
docker build -t vaultiq .
docker run -p 8000:8000 --env-file .env vaultiq
```

### 5. Supabase Setup

Run the schema in your Supabase SQL editor:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    role TEXT CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Create a storage bucket named `vaultiq-docs` in Supabase Dashboard → Storage → Files.

---

## API Reference

```
POST /upload
  Body: multipart/form-data (file, org_id, collection_id)
  Returns: { doc_id, filename, status }

POST /query
  Body: { doc_id, question }
  Returns: { answer, sources: [{ page, source, content }] }

POST /query/all
  Body: { org_id, question }
  Returns: { answer, sources: [{ page, source, content }] }

GET /docs?org_id=...
  Returns: { docs: [...] }
```

---

## Key Technical Decisions

**Why FAISS over ChromaDB?**
FAISS runs as a pure library with no server process — simpler Docker setup, faster cold starts, and index files are portable. ChromaDB requires a running server which adds operational overhead for a single-service MVP.

**Why HuggingFace embeddings over OpenAI?**
`all-MiniLM-L6-v2` runs fully locally, costs nothing, and performs competitively for retrieval tasks. Eliminating the embeddings API call also removes a network dependency and reduces latency per ingestion request.

**Why MMR over standard similarity search?**
Standard top-k retrieval returns the k most similar chunks — which often means duplicates or near-duplicates of the same paragraph. MMR (Maximum Marginal Relevance) actively diversifies results, ensuring retrieved chunks cover different parts of the document. This is critical for questions that span multiple sections.

**Why per-document FAISS indexes instead of one global index?**
Per-document indexes allow: (1) deleting a document without reindexing everything, (2) querying a single document by ID, (3) merging selected indexes for cross-doc search. A single global index makes all three significantly harder.

---

## Roadmap

- [ ] Slack integration (`/vaultiq` slash command)
- [ ] WhatsApp integration via Meta Cloud API
- [ ] pgvector migration (Supabase-native vector storage)
- [ ] Document versioning (re-ingest on update)
- [ ] Analytics dashboard (most queried topics, unanswered questions)
- [ ] Support for DOCX, PPTX, XLSX ingestion

---

## Built By

**Balavanth** — Developer & Builder

Analyst at TCS · Building AI-powered products · Open to AI Engineer / Full Stack roles

[LinkedIn](#) · [Portfolio](#) · [GitHub](#)

---

<div align="center">

**If this project helped you understand RAG architecture, drop a ⭐**

</div>
