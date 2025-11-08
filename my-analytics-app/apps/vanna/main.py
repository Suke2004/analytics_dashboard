"""
Vanna AI – Chat with Data (Production-Ready)
FastAPI Server with Groq SQL Generation and PostgreSQL Execution
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional, List
import os
import json
import logging
import requests
from dotenv import load_dotenv

# ==========================================================
# Load environment variables
# ==========================================================
load_dotenv()

# ----------------------------------------------------------
# Configuration
# ----------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "mixtral-8x7b")  # Default model
ENV = os.getenv("ENV", "development")
print(f"🚀 Starting Vanna AI in {ENV} mode...")
print(f"Using Groq Model: {GROQ_MODEL}")

if not DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL not found in environment variables")

# ==========================================================
# Logging Configuration
# ==========================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] - %(message)s",
)
logger = logging.getLogger("vanna_ai")

# ==========================================================
# FastAPI App
# ==========================================================
app = FastAPI(
    title="Vanna AI - Chat with Data",
    description="Ask questions about your data. Vanna AI converts natural language to SQL.",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if ENV == "development" else ["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# Models
# ==========================================================
class QueryRequest(BaseModel):
    prompt: str


class QueryResponse(BaseModel):
    sql: str
    result: Optional[List[dict]] = None
    error: Optional[str] = None


# ==========================================================
# Database Utilities
# ==========================================================
def get_db_connection():
    """Return a secure Postgres connection."""
    url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
    if "sslmode" not in url:
        connector = "?" if "?" not in url else "&"
        url = f"{url}{connector}sslmode=require"

    try:
        conn = psycopg2.connect(url)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")


# ==========================================================
# LLM (Groq API) SQL Generation
# ==========================================================
def generate_sql(prompt: str) -> str:
    if not GROQ_API_KEY or GROQ_API_KEY == "dummy":
        logger.warning("GROQ_API_KEY not set. Using heuristic fallback SQL generation.")
        return heuristic_sql(prompt)

    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an expert data analyst AI. "
                        "Convert the user's natural language prompt to a safe, "
                        "PostgreSQL-compatible SQL query. Output SQL only."
                    )
                },
                {"role": "user", "content": prompt}
            ]
        }

        # ✅ Updated Groq endpoint
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )

        if response.status_code != 200:
            logger.error(f"Groq API error: {response.status_code} - {response.text}")
            return heuristic_sql(prompt)

        data = response.json()
        sql = data["choices"][0]["message"]["content"].strip()

        if not sql.lower().startswith("select"):
            logger.warning("Groq output invalid, falling back.")
            return heuristic_sql(prompt)

        return sql

    except Exception as e:
        logger.error(f"Groq SQL generation failed: {e}")
        return heuristic_sql(prompt)


# ==========================================================
# Heuristic Fallback SQL
# ==========================================================
def heuristic_sql(prompt: str) -> str:
    """Simple local fallback for common natural language questions."""
    p = prompt.lower()

    if "total spend" in p or "total amount" in p:
        return 'SELECT SUM(amount) AS total_spend FROM "Invoice";'

    if "total invoices" in p or "count invoices" in p:
        return 'SELECT COUNT(*) AS total_invoices FROM "Invoice";'

    if "top vendor" in p:
        return """
            SELECT v.name, SUM(i.amount) AS total_spend 
            FROM "Vendor" v 
            JOIN "Invoice" i ON v.id = i."vendorId" 
            GROUP BY v.name 
            ORDER BY total_spend DESC 
            LIMIT 10;
        """

    if "customer" in p:
        return """
            SELECT c.name, COUNT(i.id) AS invoice_count, SUM(i.amount) AS total_spend 
            FROM "Customer" c 
            JOIN "Invoice" i ON c.id = i."customerId" 
            GROUP BY c.name 
            ORDER BY total_spend DESC 
            LIMIT 10;
        """

    if "recent" in p or "latest" in p:
        return """
            SELECT i."invoiceNo", v.name AS vendor, c.name AS customer, i.amount, i.date, i.status 
            FROM "Invoice" i 
            JOIN "Vendor" v ON i."vendorId" = v.id 
            JOIN "Customer" c ON i."customerId" = c.id 
            ORDER BY i.date DESC 
            LIMIT 20;
        """

    return """
        SELECT i."invoiceNo", v.name AS vendor, c.name AS customer, i.amount, i.date, i.status 
        FROM "Invoice" i 
        JOIN "Vendor" v ON i."vendorId" = v.id 
        JOIN "Customer" c ON i."customerId" = c.id 
        LIMIT 50;
    """


# ==========================================================
# Routes
# ==========================================================
@app.get("/health")
async def health():
    return {"status": "ok", "env": ENV}


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """Accepts a natural language query → Generates SQL → Executes → Returns result."""
    try:
        sql = generate_sql(request.prompt)
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute(sql)
        rows = cursor.fetchall()

        cursor.close()
        conn.close()

        return QueryResponse(sql=sql, result=rows)

    except psycopg2.Error as db_err:
        logger.error(f"SQL execution failed: {db_err}")
        return QueryResponse(sql=sql, error=str(db_err))
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================================
# Run Server
# ==========================================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=ENV == "development"
    )
