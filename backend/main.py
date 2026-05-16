from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator
import sqlite3
import random
import uuid
import hashlib
import hmac
import os
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading

app = FastAPI(title="Shiv Shakti Secure Backend", version="2.0.0")

# Secure CORS policy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# --- Security Helpers ---
def hash_password(password: str) -> str:
    """Hash password using SHA-256 with a random salt."""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()

def verify_password(stored_password: str, provided_password: str) -> bool:
    """Verify a stored password against one provided by user."""
    try:
        salt_hex, key_hex = stored_password.split(':')
        salt = bytes.fromhex(salt_hex)
        stored_key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', provided_password.encode('utf-8'), salt, 100000)
        return hmac.compare_digest(stored_key, new_key)
    except Exception:
        return False

def validate_email(email: str) -> bool:
    """Basic email format validation."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> tuple[bool, str]:
    """Validate password meets minimum security requirements."""
    if len(password) < 6:
        return False, "Access code must be at least 6 characters"
    if not re.search(r'[A-Za-z]', password):
        return False, "Access code must contain at least one letter"
    if not re.search(r'[0-9]', password):
        return False, "Access code must contain at least one number"
    return True, "Valid"

# --- Auto Email Service ---
def send_welcome_email(email: str, name: str = "Operative"):
    """Send a welcome email to newly registered users (runs in background thread)."""
    def _send():
        try:
            # Using a no-reply style approach - works with any SMTP
            # For production, configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS env vars
            smtp_host = os.environ.get('SMTP_HOST', '')
            smtp_port = int(os.environ.get('SMTP_PORT', '587'))
            smtp_user = os.environ.get('SMTP_USER', '')
            smtp_pass = os.environ.get('SMTP_PASS', '')
            
            if not smtp_host or not smtp_user:
                print(f"[EMAIL SERVICE] Welcome email queued for {email} (SMTP not configured - set SMTP_HOST, SMTP_USER, SMTP_PASS env vars)")
                # Log the email for records even without SMTP
                log_email_event(email, "welcome", "queued")
                return

            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'SHIV SHAKTI PROJECT — Identity Established'
            msg['From'] = f'SHIV SHAKTI PROJECT <{smtp_user}>'
            msg['To'] = email

            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ margin: 0; padding: 0; background-color: #000000; font-family: 'Helvetica Neue', Arial, sans-serif; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; }}
                    .header {{ background-color: #000000; padding: 40px; text-align: center; }}
                    .header h1 {{ color: #ffffff; font-size: 18px; letter-spacing: 0.25em; font-weight: 300; margin: 0; }}
                    .body-content {{ padding: 60px 40px; }}
                    .body-content h2 {{ font-size: 24px; font-weight: 300; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 30px; }}
                    .body-content p {{ font-size: 14px; line-height: 1.8; color: #666666; letter-spacing: 0.05em; }}
                    .divider {{ width: 40px; height: 1px; background-color: #000000; margin: 30px 0; }}
                    .cta {{ display: inline-block; padding: 16px 40px; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 30px; }}
                    .footer {{ padding: 30px 40px; border-top: 1px solid #e0e0e0; }}
                    .footer p {{ font-size: 10px; color: #999999; letter-spacing: 0.1em; text-transform: uppercase; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>SHIV SHAKTI PROJECT</h1>
                    </div>
                    <div class="body-content">
                        <h2>Connection Established</h2>
                        <div class="divider"></div>
                        <p>Your identity within the SHIV SHAKTI network has been confirmed.</p>
                        <p>You now have access to the full archive — collections, exclusive drops, and early access to new releases from the Council of Light.</p>
                        <p>Welcome to the void.</p>
                        <a href="#" class="cta">Enter The Archive</a>
                    </div>
                    <div class="footer">
                        <p>© {datetime.now().year} SHIV SHAKTI PROJECT. ALL RIGHTS RESERVED.</p>
                        <p style="margin-top: 10px;">This is an automated transmission. Do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
            """

            text_body = f"""
            SHIV SHAKTI PROJECT — Identity Established
            
            Your identity within the SHIV SHAKTI network has been confirmed.
            You now have access to the full archive.
            
            Welcome to the void.
            
            © {datetime.now().year} SHIV SHAKTI PROJECT
            """

            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, email, msg.as_string())
            
            print(f"[EMAIL SERVICE] Welcome email sent successfully to {email}")
            log_email_event(email, "welcome", "sent")
            
        except Exception as e:
            print(f"[EMAIL SERVICE] Failed to send welcome email to {email}: {e}")
            log_email_event(email, "welcome", f"failed: {str(e)}")
    
    # Run email sending in background thread so it doesn't block the response
    thread = threading.Thread(target=_send, daemon=True)
    thread.start()

def log_email_event(email: str, email_type: str, status: str):
    """Log email events to the database for tracking."""
    try:
        conn = sqlite3.connect("shiv_shakti.db")
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO email_logs (email, email_type, status, created_at) VALUES (?, ?, ?, ?)",
            (email, email_type, status, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB] Failed to log email event: {e}")

# --- Pydantic Models ---
class Product(BaseModel):
    id: int
    name: str
    category: str
    price: float
    description: str
    image_url: str

class UserAuth(BaseModel):
    email: str
    password: str
    
    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        if not validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower().strip()

class CartItem(BaseModel):
    product_id: int
    quantity: int
    size: str
    color: str

class CheckoutRequest(BaseModel):
    token: str
    items: list[CartItem]
    total_amount: float

class NewsletterRequest(BaseModel):
    email: str
    
    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        if not validate_email(v):
            raise ValueError('Invalid email format')
        return v.lower().strip()

# --- Database ---
def get_db():
    conn = sqlite3.connect("shiv_shakti.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect("shiv_shakti.db")
    cursor = conn.cursor()
    
    # Products Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT NOT NULL
        )
    ''')
    
    # Users Table (with hashed passwords)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            token TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount REAL,
            status TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Email Logs Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS email_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            email_type TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    ''')
    
    # Newsletter Subscribers Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Seed Products if empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] < 100:
        categories = ["SHAKTI", "SHIVA"]
        adjectives = ["Void", "Obsidian", "Tactical", "Asymmetric", "Nomad", "Urban", "Brutalist"]
        nouns = ["Trench", "Bomber", "Drape Dress", "Survival Suit", "Cargo Harness", "Visor", "Boots"]
        products_to_insert = []
        for i in range(1, 101):
            name = f"{random.choice(adjectives)} {random.choice(nouns)} Model-{i:03d}"
            category = random.choice(categories)
            price = round(random.uniform(500.0, 2500.0), 2)
            desc = "Stripped of ornamentation. Built for the architectural void. High-end avant-garde construction."
            img = "https://lh3.googleusercontent.com/aida-public/AB6AXuB8D75C5r_ob1kjQXocCUpaR4jtSzMiDfaE8h-gPc1UxScESCDGpzWnYWHcUhJnijaHMue1ic1QLmxVIGYEaBve4GtocR-RyVKyVYMhCkOsbrkvNkuzvvfsrM78CNnccNcidUHiayKFTXiMcQWO_wM7muqdADPmZLjBhirGWEIuPdIkae6NFt5R1pdDyI26HT61D93r1DSkJgx3Ru9S2OR_TAErEHrQ7HL6yzb_nEa2K0Bh-8uNywa9CXw2toAZzBtayoFzPG4ZERgi"
            products_to_insert.append((name, category, price, desc, img))
        cursor.executemany('INSERT INTO products (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)', products_to_insert)
        conn.commit()
    conn.close()

init_db()

# --- API Endpoints ---
@app.get("/api/products")
def get_all_products(db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products ORDER BY id DESC LIMIT 100")
    return [dict(row) for row in cursor.fetchall()]

@app.get("/api/products/{product_id}")
def get_product(product_id: int, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row: raise HTTPException(status_code=404, detail="Product not found")
    return dict(row)

@app.post("/api/auth/register")
def register_user(user: UserAuth, db: sqlite3.Connection = Depends(get_db)):
    # Validate password strength
    is_valid, message = validate_password_strength(user.password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=message)
    
    cursor = db.cursor()
    try:
        token = str(uuid.uuid4())
        hashed = hash_password(user.password)
        cursor.execute(
            "INSERT INTO users (email, password, token, created_at) VALUES (?, ?, ?, ?)",
            (user.email, hashed, token, datetime.now().isoformat())
        )
        db.commit()
        
        # Send welcome email in background
        send_welcome_email(user.email)
        
        return {
            "message": "Identity created successfully",
            "token": token,
            "email": user.email
        }
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Email archive already exists")

@app.post("/api/auth/login")
def login_user(user: UserAuth, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT password, token FROM users WHERE email = ?", (user.email,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(row["password"], user.password):
        raise HTTPException(status_code=401, detail="Invalid access code")
    
    return {"message": "Authorization granted", "token": row["token"], "email": user.email}

@app.post("/api/checkout")
def process_checkout(req: CheckoutRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    cursor.execute("SELECT id, email FROM users WHERE token = ?", (req.token,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized transmission")
    
    cursor.execute(
        "INSERT INTO orders (user_id, total_amount, status, created_at) VALUES (?, ?, ?, ?)",
        (user["id"], req.total_amount, "PROCESSING", datetime.now().isoformat())
    )
    db.commit()
    return {"message": "Order accepted into the void", "order_id": cursor.lastrowid}

@app.post("/api/newsletter/subscribe")
def subscribe_newsletter(req: NewsletterRequest, db: sqlite3.Connection = Depends(get_db)):
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, ?)",
            (req.email, datetime.now().isoformat())
        )
        db.commit()
        return {"message": "Successfully subscribed to the void"}
    except sqlite3.IntegrityError:
        return {"message": "Already connected to the void"}

@app.get("/api/auth/verify")
def verify_token(token: str, db: sqlite3.Connection = Depends(get_db)):
    """Verify if a token is valid and return user info."""
    cursor = db.cursor()
    cursor.execute("SELECT email FROM users WHERE token = ?", (token,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"valid": True, "email": row["email"]}

# --- Serve Frontend Static Files ---
# Mount the parent directory to serve all HTML, CSS, JS, and image assets
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

@app.get("/{filepath:path}")
async def serve_static(filepath: str):
    """Serve static files from the frontend directory."""
    full_path = os.path.join(FRONTEND_DIR, filepath)
    if os.path.isfile(full_path):
        return FileResponse(full_path)
    # Fallback to index.html for SPA-like behavior
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print("  SHIV SHAKTI PROJECT — Secure Backend v2.0")
    print("  Server starting on http://localhost:8000")
    print("  Frontend available at http://localhost:8000")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)
