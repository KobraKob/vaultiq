import os
import logging
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from .ingest import get_vector_store
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()

# Initialize Groq LLM
def get_llm():
    return ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
    )

RELEVANCE_THRESHOLD = 0.95

prompt_template = """
You are VAULTIQ, a friendly and confident AI knowledge assistant for Nexora Technologies.

RULES:
- If the user sends a greeting or casual message (like "hello", "hi", "thanks"), respond warmly and conversationally. You don't need context for these.
- For knowledge questions, answer based ONLY on the context retrieved from internal company documents below.
- Be direct and confident. If the context contains the answer, give it clearly without hedging or adding unnecessary disclaimers like "more information would be required" or "I don't have complete information."
- Only say you don't know if the context genuinely has zero relevant information on the topic.
- Do not invent or hallucinate answers.
- When answering broad questions (e.g. "all leave types"), be thorough — cover every item mentioned in the context.

Context:
{context}

Question: {question}

Answer:"""

prompt = ChatPromptTemplate.from_template(prompt_template)

def format_docs(docs):
    return "\n\n".join(
        f"[Source: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content}" 
        for doc in docs
    )

def query_rag(question: str):
    """
    Retrieves context from FAISS and passes it to Llama 3 to generate a final answer.
    """
    vector_store = get_vector_store()
    if not vector_store:
        logger.warning("No FAISS index found — knowledge base is empty.")
        return {
            "answer": "The knowledge base is currently empty. Please upload documents in the Admin Dashboard first.",
            "citations": []
        }

    # Fetch 8 candidates with scores for LLM context
    scored_docs = vector_store.similarity_search_with_score(question, k=8)
    all_docs = [doc for doc, _ in scored_docs]

    # Filter to only relevant docs for citations (tight threshold)
    citation_docs = [(doc, score) for doc, score in scored_docs if score <= RELEVANCE_THRESHOLD]
    if len(citation_docs) < 2:
        citation_docs = scored_docs[:2]
    elif len(citation_docs) > 5:
        citation_docs = citation_docs[:5]

    try:
        llm = get_llm()
    except Exception as e:
        logger.error(f"Failed to initialize LLM: {e}")
        raise RuntimeError("Failed to connect to the AI model. Please check your API key configuration.")

    # Pass ALL 8 docs to LLM for maximum context, but only show relevant ones as citations
    context_text = format_docs(all_docs)
    chain = prompt | llm | StrOutputParser()

    # Deduplicate citations
    seen = set()
    citations = []
    for doc, score in citation_docs:
        content_preview = doc.page_content[:300]
        if content_preview not in seen:
            seen.add(content_preview)
            citations.append({
                "source": doc.metadata.get("source", "Unknown"),
                "content": content_preview + "..."
            })

    try:
        answer = chain.invoke({"context": context_text, "question": question})
    except Exception as e:
        logger.error(f"LLM generation failed: {e}")
        raise RuntimeError("Failed to generate an answer. The AI service may be temporarily unavailable.")

    return {
        "answer": answer,
        "citations": citations
    }
