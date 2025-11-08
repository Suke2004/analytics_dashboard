"""
FastAPI server for Vanna AI - Chat with Data
This service accepts natural language prompts and generates SQL queries
to interact with the analytics database.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Vanna AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql+psycopg2://admin:admin@localhost:5432/analytics"
)

# Groq API key (optional - for future LLM integration)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "dummy")


class QueryRequest(BaseModel):
    prompt: str


class QueryResponse(BaseModel):
    sql: str
    result: list[dict]
    error: Optional[str] = None


def get_db_connection():
    """Get database connection for Neon Postgres"""
    # Parse DATABASE_URL (format: postgresql+psycopg2://user:password@host:port/dbname)
    # For Neon, the connection string should include SSL mode
    url = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://")
    print("going to connect to", url)
    
    # Neon requires SSL connections
    # If SSL mode is not in the URL, add it
    if "sslmode" not in url:
        connector = "?" if "?" not in url else "&"
        url = f"{url}{connector}sslmode=require"
    
    return psycopg2.connect(url)


def generate_sql(prompt: str) -> str:
    """
    Generate SQL query from natural language prompt.
    
    TODO: Integrate with Groq API or Vanna AI for actual SQL generation.
    For now, this is a mock implementation that handles basic queries.
    """
    prompt_lower = prompt.lower()
    
    # Mock SQL generation based on common patterns
    # In production, use Groq API or Vanna AI
    
    if "total spend" in prompt_lower or "total amount" in prompt_lower:
        return "SELECT SUM(amount) as total_spend FROM \"Invoice\""
    
    if "total invoices" in prompt_lower or "count invoices" in prompt_lower:
        return "SELECT COUNT(*) as total_invoices FROM \"Invoice\""
    
    if "top vendor" in prompt_lower or "vendor" in prompt_lower:
        return """
            SELECT v.name, SUM(i.amount) as total_spend 
            FROM "Vendor" v 
            JOIN "Invoice" i ON v.id = i."vendorId" 
            GROUP BY v.id, v.name 
            ORDER BY total_spend DESC 
            LIMIT 10
        """
    
    if "category" in prompt_lower or "spend by category" in prompt_lower:
        return """
            SELECT v.category, SUM(i.amount) as total_spend 
            FROM "Vendor" v 
            JOIN "Invoice" i ON v.id = i."vendorId" 
            WHERE v.category IS NOT NULL 
            GROUP BY v.category 
            ORDER BY total_spend DESC
        """
    
    if "customer" in prompt_lower:
        return """
            SELECT c.name, COUNT(i.id) as invoice_count, SUM(i.amount) as total_spend 
            FROM "Customer" c 
            JOIN "Invoice" i ON c.id = i."customerId" 
            GROUP BY c.id, c.name 
            ORDER BY total_spend DESC 
            LIMIT 10
        """
    
    if "recent" in prompt_lower or "latest" in prompt_lower:
        return """
            SELECT i."invoiceNo", v.name as vendor, c.name as customer, i.amount, i.date, i.status 
            FROM "Invoice" i 
            JOIN "Vendor" v ON i."vendorId" = v.id 
            JOIN "Customer" c ON i."customerId" = c.id 
            ORDER BY i.date DESC 
            LIMIT 20
        """
    
    # Default: return all invoices
    return """
        SELECT i."invoiceNo", v.name as vendor, c.name as customer, i.amount, i.date, i.status 
        FROM "Invoice" i 
        JOIN "Vendor" v ON i."vendorId" = v.id 
        JOIN "Customer" c ON i."customerId" = c.id 
        LIMIT 50
    """


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}


@app.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    """
    Process a natural language query and return SQL + results.
    
    This endpoint:
    1. Accepts a natural language prompt
    2. Generates SQL query (using Groq API or Vanna AI)
    3. Executes SQL on PostgreSQL
    4. Returns SQL and results
    """
    try:
        # Generate SQL from prompt
        sql = generate_sql(request.prompt)
        
        # Execute SQL query
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            cursor.execute(sql)
            rows = cursor.fetchall()
            result = [dict(row) for row in rows]
        except Exception as e:
            return QueryResponse(
                sql=sql,
                result=[],
                error=f"SQL execution error: {str(e)}"
            )
        finally:
            cursor.close()
            conn.close()
        
        return QueryResponse(sql=sql, result=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
