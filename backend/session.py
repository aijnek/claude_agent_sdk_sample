import sqlite3
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "sessions.db"
SCHEMA_PATH = Path(__file__).parent / "schema.sql"


def _get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db() -> None:
    schema = SCHEMA_PATH.read_text()
    with _get_connection() as conn:
        conn.executescript(schema)


def create_session() -> str:
    session_id = uuid.uuid4().hex
    with _get_connection() as conn:
        conn.execute("INSERT INTO sessions (id) VALUES (?)", (session_id,))
    return session_id


def save_message(session_id: str, role: str, content: str) -> None:
    with _get_connection() as conn:
        conn.execute(
            "INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)",
            (session_id, role, content),
        )


def get_conversation_history(session_id: str) -> list[dict]:
    with _get_connection() as conn:
        rows = conn.execute(
            "SELECT role, content FROM messages WHERE session_id = ? ORDER BY id",
            (session_id,),
        ).fetchall()
    return [{"role": row["role"], "content": row["content"]} for row in rows]


def list_sessions() -> list[dict]:
    with _get_connection() as conn:
        rows = conn.execute(
            """
            SELECT s.id, s.created_at,
                   SUBSTR(m.content, 1, 50) AS preview
            FROM sessions s
            LEFT JOIN (
                SELECT session_id, content,
                       ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY id) AS rn
                FROM messages
                WHERE role = 'user'
            ) m ON m.session_id = s.id AND m.rn = 1
            ORDER BY s.created_at DESC
            """,
        ).fetchall()
    return [
        {"id": row["id"], "created_at": row["created_at"], "preview": row["preview"]}
        for row in rows
    ]


def delete_session(session_id: str) -> None:
    with _get_connection() as conn:
        conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
