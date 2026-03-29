FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required for pdfplumber/docx
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create volume dir for FAISS index persistence
RUN mkdir -p /app/faiss_index

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
