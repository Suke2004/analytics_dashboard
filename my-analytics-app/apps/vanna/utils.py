# app/utils.py
import sqlparse
import re
from typing import Tuple

class ValidationWarning(Exception):
    pass

FORBIDDEN_KEYWORDS = [
    r"\bINSERT\b", r"\bUPDATE\b", r"\bDELETE\b", r"\bDROP\b", r"\bALTER\b",
    r"\bCREATE\b", r"\bTRUNCATE\b", r"\bGRANT\b", r"\bREVOKE\b", r"\bCOPY\b",
    r"\bEXEC\b", r";", r"\bSET\b", r"\bATTACH\b"
]

def sanitize_sql(sql: str):
    """
    Basic validation to reject obviously unsafe SQL.
    Raises ValueError on fatal issues, or ValidationWarning for warnings.
    """
    if ";" in sql:
        # disallow multiple statements or semicolons
        raise ValueError("Semicolons are not allowed in generated SQL (multiple statements are forbidden).")

    parsed = sqlparse.parse(sql)
    if not parsed:
        raise ValueError("Could not parse SQL.")
    stmt = parsed[0]
    first_tok = None
    for tok in stmt.tokens:
        if not tok.is_whitespace:
            first_tok = tok
            break
    if first_tok is None:
        raise ValueError("Empty SQL statement.")

    first_val = first_tok.value.upper()
    if not (first_val.startswith("SELECT") or first_val.startswith("WITH")):
        raise ValueError("Only SELECT (or WITH ... SELECT) statements are allowed.")

    # Check forbidden keywords anywhere (conservative)
    for pat in FORBIDDEN_KEYWORDS:
        if re.search(pat, sql, flags=re.IGNORECASE):
            raise ValueError(f"Forbidden keyword or pattern detected: {pat}")

    # Warn if no LIMIT clause (we will append limit later if needed)
    if not re.search(r"\bLIMIT\b", sql, flags=re.IGNORECASE):
        raise ValidationWarning("No LIMIT clause found; a limit will be appended automatically to constrain results.")

    return True

def ensure_limit_clause(sql: str, max_rows: int) -> Tuple[str, bool]:
    """
    If SQL already has a LIMIT, return unchanged. Otherwise append 'LIMIT {max_rows}'.
    Returns (sql_out, added_limit_flag).
    """
    if re.search(r"\bLIMIT\b", sql, flags=re.IGNORECASE):
        return sql, False

    # Try to be safe with trailing ORDER BY etc. Simply append LIMIT at the end.
    sql_out = sql.strip()
    sql_out = sql_out.rstrip(";")  # already prevented, but safe
    sql_out = f"{sql_out} LIMIT {int(max_rows)}"
    return sql_out, True
