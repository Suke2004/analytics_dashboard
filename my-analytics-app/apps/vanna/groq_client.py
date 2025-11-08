# app/groq_client.py
import os
import httpx
import logging
from typing import Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("vanna-ai.groq")

GROQ_API_URL = os.getenv("GROQ_API_URL")  # required
GROQ_API_KEY = os.getenv("GROQ_API_KEY")  # optional

# You can change this prompt template to guide SQL generation precisely.
PROMPT_TEMPLATE = """
You are a SQL generator for a PostgreSQL reporting database. The user asks:
\"\"\"{user_prompt}\"\"\"

Generate a single, valid PostgreSQL SELECT (or WITH + SELECT) statement that answers the user's question.
Do NOT include any explanatory text, markdown, or comments—return only the SQL statement.
Ensure table/column names are plausible for a schema with tables: vendors, customers, invoices, line_items, payments, categories, documents.
If the user asks for values/aggregations, return them in the SQL. Use LIMIT when needed.
"""

async def call_groq_api(payload: dict) -> Any:
    headers = {"Content-Type": "application/json"}
    if GROQ_API_KEY:
        headers["Authorization"] = f"Bearer {GROQ_API_KEY}"
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(GROQ_API_URL, json=payload, headers=headers)
        r.raise_for_status()
        return r.json()

async def generate_sql_from_prompt(prompt: str):
    if not GROQ_API_URL:
        raise RuntimeError("GROQ_API_URL is not set in environment")

    formatted = PROMPT_TEMPLATE.format(user_prompt=prompt)
    # The exact payload depends on your LLM provider. This is generic.
    payload = {
        "prompt": formatted,
        # If your provider expects other keys (model, max_tokens...), add here:
        **({"model": os.getenv("GROQ_MODEL")} if os.getenv("GROQ_MODEL") else {}),
        **({"temperature": float(os.getenv('GROQ_TEMP', '0'))}),
    }

    logger.info("Sending prompt to LLM provider")
    resp = await call_groq_api(payload)

    # Provider response shapes vary; attempt to extract SQL text:
    sql_text = None
    if isinstance(resp, dict):
        # Common providers: {"text": "..."} or {"choices":[{"text":"..."}]}
        if "sql" in resp:
            sql_text = resp["sql"]
        elif "text" in resp:
            sql_text = resp["text"]
        elif "choices" in resp and len(resp["choices"]) > 0:
            sql_text = resp["choices"][0].get("text") or resp["choices"][0].get("message", {}).get("content")
        elif "data" in resp and isinstance(resp["data"], list) and len(resp["data"])>0:
            # some providers return nested objects
            sql_text = resp["data"][0].get("text")
    elif isinstance(resp, str):
        sql_text = resp

    if not sql_text:
        raise RuntimeError(f"Could not extract SQL from LLM response: {resp}")

    # Trim any surrounding whitespace and remove surrounding triple backticks, markdown, etc.
    sql_text = sql_text.strip()
    if sql_text.startswith("```"):
        # remove code fence
        parts = sql_text.split("```")
        if len(parts) >= 2:
            sql_text = parts[1].strip()

    # Remove leading "SQL:" or "Answer:" tokens if present
    for prefix in ("SQL:", "sql:", "Answer:", "answer:"):
        if sql_text.startswith(prefix):
            sql_text = sql_text[len(prefix):].strip()

    logger.debug("Generated SQL: %s", sql_text[:400])
    return sql_text
