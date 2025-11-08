# Vanna AI Service

FastAPI service for natural language to SQL queries.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Run the server:

```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

- `GET /health` - Health check
- `POST /query` - Process natural language query
  - Request: `{ "prompt": "What is the total spend?" }`
  - Response: `{ "sql": "SELECT ...", "result": [...], "error": null }`

## TODO

- Integrate with Groq API for better SQL generation
- Add Vanna AI library for schema-aware SQL generation
- Add query validation and security checks
- Add caching for common queries
