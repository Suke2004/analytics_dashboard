# app/db.py
import asyncpg
import os
import logging
from typing import Tuple, List, Any

logger = logging.getLogger("vanna-ai.db")

_pool: asyncpg.pool.Pool | None = None

async def init_db_pool(database_url: str | None):
    global _pool
    if not database_url:
        raise RuntimeError("DATABASE_URL not provided")
    _pool = await asyncpg.create_pool(dsn=database_url, min_size=1, max_size=10)
    return _pool

async def close_db_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None

async def execute_readonly_sql(sql: str, max_exec_ms: int = 15000) -> Tuple[List[dict], List[str], int]:
    """
    Execute SQL in a transaction with read-only and timeout safeguards.
    Returns (rows_as_list_of_dicts, columns, exec_time_ms)
    """
    global _pool
    if _pool is None:
        raise RuntimeError("DB pool not initialized")

    async with _pool.acquire() as conn:
        # start a transaction so SET LOCAL applies
        async with conn.transaction():
            # set statement_timeout (ms) and read-only
            await conn.execute(f"SET LOCAL statement_timeout = {int(max_exec_ms)};")
            await conn.execute("SET LOCAL transaction_read_only = on;")
            # execute and fetch; asyncpg fetch returns list of Record
            import time
            t0 = time.time()
            rows = await conn.fetch(sql)
            t1 = time.time()
            exec_ms = int((t1 - t0) * 1000)
            # convert records to list[dict]
            cols = rows[0].keys() if rows else []
            rows_dicts = [dict(r) for r in rows]
            return rows_dicts, list(cols), exec_ms
