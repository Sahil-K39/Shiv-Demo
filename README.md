# SHIV SHAKTI PROJECT

Avant-garde e-commerce platform for the post-apocalyptic era.

## Architecture

- **Frontend**: Next.js 16 with React 18, Tailwind CSS, and Framer Motion.
- **Backend**: Go (Gin Gonic) with SQLite locally and optional PostgreSQL via `DATABASE_URL`.
- **Authentication**: JWT with HttpOnly cookies.
- **Security**: CSRF protection, Rate limiting, and Secure headers.

## Getting Started

### Prerequisites

- Go 1.26.3+
- Node.js 20+
- npm

### Running the Stack

To start both the backend and frontend simultaneously:

```bash
./START_SERVER.command
```

Alternatively, you can start them manually:

#### Backend
```bash
cd backend
go run ./cmd/server/main.go
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Project Structure

- `backend/`: Go source code and database logic.
- `frontend/`: Next.js application.
- `assets/`: Static assets shared by the stack.
- `Shiv Sakti UI & Logo/`: Brand assets and design files.

## Production Upload Storage

Admin product image uploads use Supabase Storage in production. Create a public Supabase Storage bucket named `product-images`, then set these on Render:

```bash
SUPABASE_URL=https://bmyghobfovkzchhuhnss.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_STORAGE_BUCKET=product-images
SUPABASE_STORAGE_PREFIX=admin-products
```

Set these on Vercel so Next.js can render uploaded product images:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bmyghobfovkzchhuhnss.supabase.co
NEXT_PUBLIC_SUPABASE_IMAGE_HOSTNAME=bmyghobfovkzchhuhnss.supabase.co
```

For local development only, uploads can fall back to the backend asset folder:

```bash
ASSETS_DIR=/app/assets
UPLOAD_DIR=/app/assets/uploads
UPLOAD_PUBLIC_PATH=/assets/uploads
```
