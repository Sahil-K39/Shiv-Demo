"""
SHIV SHAKTI PROJECT - Zero-Dependency Server v3.0
Serves static files and a small JSON API using only Python standard library.

Run:  python3 server.py
Open: http://127.0.0.1:8000
"""

from __future__ import annotations

import hashlib
import hmac
import json
import mimetypes
import os
import secrets
import sqlite3
import urllib.parse
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("DB_PATH", str(BASE_DIR / "shiv_shakti.db")))
PUBLIC_DIR = BASE_DIR / "frontend" / "public"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect_db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                password TEXT,
                token TEXT,
                name TEXT DEFAULT '',
                role TEXT DEFAULT 'user',
                is_verified BOOLEAN DEFAULT 1,
                created_at TEXT,
                updated_at TEXT
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                category TEXT,
                price REAL,
                description TEXT,
                image_url TEXT
            );

            CREATE TABLE IF NOT EXISTS ngo_interests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT,
                message TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        ensure_column(conn, "users", "password_hash", "TEXT")
        ensure_column(conn, "users", "name", "TEXT DEFAULT ''")
        ensure_column(conn, "users", "role", "TEXT DEFAULT 'user'")
        ensure_column(conn, "users", "is_verified", "BOOLEAN DEFAULT 1")
        ensure_column(conn, "users", "updated_at", "TEXT")


def ensure_column(conn: sqlite3.Connection, table: str, column: str, ddl: str) -> None:
    columns = {row["name"] for row in conn.execute(f"PRAGMA table_info({table})")}
    if column not in columns:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
    return f"pbkdf2_sha256${salt}${digest.hex()}"


def check_password(stored: str | None, password: str) -> bool:
    if not stored:
        return False
    if stored.startswith("pbkdf2_sha256$"):
        try:
            _, salt, expected = stored.split("$", 2)
        except ValueError:
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000)
        return hmac.compare_digest(digest.hex(), expected)
    return hmac.compare_digest(stored, password)


def product_from_row(row: sqlite3.Row) -> dict:
    data = dict(row)
    image = data.get("image_url") or ""
    return {
        "id": data.get("id"),
        "name": data.get("name") or "",
        "slug": str(data.get("name") or "").lower().replace(" ", "-"),
        "description": data.get("description") or "",
        "price": data.get("price") or 0,
        "sale_price": data.get("sale_price") or 0,
        "currency": data.get("currency") or "USD",
        "category": data.get("category") or "shakti",
        "collection": data.get("collection") or "SS26",
        "sizes": data.get("sizes") or '["OS"]',
        "colors": data.get("colors") or '["Default"]',
        "images": data.get("images") or json.dumps([image] if image else []),
        "in_stock": bool(data.get("in_stock", True)),
        "featured": bool(data.get("featured", False)),
        "quantity": data.get("quantity") or 0,
        "sku": data.get("sku") or "",
        "is_active": bool(data.get("is_active", True)),
        "created_at": data.get("created_at") or now_iso(),
        "updated_at": data.get("updated_at") or now_iso(),
    }


class ShivShaktiHandler(BaseHTTPRequestHandler):
    server_version = "ShivShaktiZeroDependency/3.0"

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_common_headers()
        self.end_headers()

    def do_GET(self) -> None:
        path = self.clean_path()
        if path == "/health":
            self.write_json({"status": "operational", "service": "shiv-shakti-zero-dependency"})
            return
        if path == "/api/csrf-token":
            self.write_json({"csrf_token": secrets.token_hex(32)})
            return
        if path == "/api/auth/me":
            self.handle_me()
            return
        if path == "/api/products":
            self.handle_products()
            return
        if path.startswith("/api/products/category/"):
            category = urllib.parse.unquote(path.rsplit("/", 1)[-1])
            self.handle_products(category=category)
            return
        if path.startswith("/api/products/"):
            self.handle_product(path.rsplit("/", 1)[-1])
            return
        self.serve_static(path)

    def do_POST(self) -> None:
        path = self.clean_path()
        if path == "/api/auth/register":
            self.handle_register()
            return
        if path == "/api/auth/login":
            self.handle_login()
            return
        if path == "/api/auth/logout":
            self.write_json({"message": "Logged out"}, cookies=["shiv_session=; Path=/; Max-Age=0"])
            return
        if path == "/api/ngo/interest":
            self.handle_ngo_interest()
            return
        self.write_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)

    def handle_products(self, category: str | None = None) -> None:
        with connect_db() as conn:
            if category:
                rows = conn.execute(
                    "SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY id ASC",
                    (category,),
                ).fetchall()
            else:
                rows = conn.execute("SELECT * FROM products ORDER BY id ASC").fetchall()
        products = [product_from_row(row) for row in rows]
        self.write_json({"products": products, "total": len(products)})

    def handle_product(self, product_id: str) -> None:
        try:
            parsed_id = int(product_id)
        except ValueError:
            self.write_json({"error": "invalid_id"}, HTTPStatus.BAD_REQUEST)
            return

        with connect_db() as conn:
            row = conn.execute("SELECT * FROM products WHERE id = ?", (parsed_id,)).fetchone()
        if row is None:
            self.write_json({"error": "product_not_found"}, HTTPStatus.NOT_FOUND)
            return
        self.write_json(product_from_row(row))

    def handle_register(self) -> None:
        data = self.read_json()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))
        name = str(data.get("name", "")).strip()
        if not email or "@" not in email or len(password) < 8 or len(name) < 2:
            self.write_json({"error": "validation_failed"}, HTTPStatus.BAD_REQUEST)
            return

        token = secrets.token_urlsafe(32)
        try:
            with connect_db() as conn:
                conn.execute(
                    """
                    INSERT INTO users (email, password_hash, name, token, role, is_verified, created_at, updated_at)
                    VALUES (?, ?, ?, ?, 'user', 1, ?, ?)
                    """,
                    (email, hash_password(password), name, token, now_iso(), now_iso()),
                )
        except sqlite3.IntegrityError:
            self.write_json({"error": "email_already_registered"}, HTTPStatus.CONFLICT)
            return

        self.write_json(
            {"message": "Account created", "user": {"email": email, "name": name, "role": "user"}},
            HTTPStatus.CREATED,
            cookies=[self.session_cookie(token)],
        )

    def handle_login(self) -> None:
        data = self.read_json()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        with connect_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email,)).fetchone()
            if row is None:
                self.write_json({"error": "login_failed"}, HTTPStatus.UNAUTHORIZED)
                return
            stored = row["password_hash"] if "password_hash" in row.keys() else None
            legacy = row["password"] if "password" in row.keys() else None
            if not check_password(stored, password) and not check_password(legacy, password):
                self.write_json({"error": "login_failed"}, HTTPStatus.UNAUTHORIZED)
                return

            token = secrets.token_urlsafe(32)
            conn.execute(
                "UPDATE users SET token = ?, updated_at = ? WHERE id = ?",
                (token, now_iso(), row["id"]),
            )

        self.write_json(
            {
                "message": "Login successful",
                "user": {
                    "id": row["id"],
                    "email": row["email"],
                    "name": row["name"] if "name" in row.keys() else "",
                    "role": row["role"] if "role" in row.keys() else "user",
                },
            },
            cookies=[self.session_cookie(token)],
        )

    def handle_me(self) -> None:
        token = self.cookie_value("shiv_session")
        if not token:
            self.write_json({"error": "authentication_required"}, HTTPStatus.UNAUTHORIZED)
            return
        with connect_db() as conn:
            row = conn.execute("SELECT id, email, name, role FROM users WHERE token = ?", (token,)).fetchone()
        if row is None:
            self.write_json({"error": "authentication_required"}, HTTPStatus.UNAUTHORIZED)
            return
        self.write_json(dict(row))

    def handle_ngo_interest(self) -> None:
        data = self.read_json()
        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip()
        phone = str(data.get("phone", "")).strip()
        message = str(data.get("message", "")).strip()
        if len(name) < 2 or "@" not in email or len(phone) < 5:
            self.write_json({"error": "validation_failed"}, HTTPStatus.BAD_REQUEST)
            return
        with connect_db() as conn:
            conn.execute(
                "INSERT INTO ngo_interests (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)",
                (name, email, phone, message, now_iso()),
            )
        self.write_json({"message": "Interest received"}, HTTPStatus.CREATED)

    def serve_static(self, path: str) -> None:
        if path == "/":
            path = "/index.html"

        requested = urllib.parse.unquote(path.lstrip("/"))
        candidates = [BASE_DIR / requested, PUBLIC_DIR / requested]
        if requested.startswith("assets/"):
            candidates.insert(0, PUBLIC_DIR / requested)

        for candidate in candidates:
            try:
                resolved = candidate.resolve()
            except FileNotFoundError:
                continue
            if not self.path_allowed(resolved) or not resolved.is_file():
                continue
            content_type = mimetypes.guess_type(resolved.name)[0] or "application/octet-stream"
            self.send_response(HTTPStatus.OK)
            self.send_common_headers(content_type)
            self.end_headers()
            self.wfile.write(resolved.read_bytes())
            return

        if path == "/index.html":
            self.write_html(
                "<!doctype html><title>Shiv Shakti</title><h1>Shiv Shakti server is running</h1>"
                "<p>No index.html build artifact was found. Use the Next.js frontend for the full app.</p>"
            )
            return

        self.write_json({"error": "not_found"}, HTTPStatus.NOT_FOUND)

    def path_allowed(self, path: Path) -> bool:
        roots = [BASE_DIR, PUBLIC_DIR]
        return any(path == root or root in path.parents for root in roots)

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length == 0:
            return {}
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def clean_path(self) -> str:
        return urllib.parse.urlparse(self.path).path

    def write_html(self, html: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_common_headers("text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))

    def write_json(
        self,
        payload: dict | list,
        status: HTTPStatus = HTTPStatus.OK,
        cookies: list[str] | None = None,
    ) -> None:
        self.send_response(status)
        self.send_common_headers("application/json; charset=utf-8")
        for cookie in cookies or []:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode("utf-8"))

    def send_common_headers(self, content_type: str = "application/json; charset=utf-8") -> None:
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", "*"))
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")

    def session_cookie(self, token: str) -> str:
        return f"shiv_session={token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400"

    def cookie_value(self, key: str) -> str | None:
        cookies = self.headers.get("Cookie", "")
        for part in cookies.split(";"):
            name, _, value = part.strip().partition("=")
            if name == key:
                return value
        return None

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[{now_iso()}] {self.address_string()} {fmt % args}")


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), ShivShaktiHandler)
    print(f"SHIV SHAKTI zero-dependency server running at http://{HOST}:{PORT}")
    print(f"Database: {DB_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
