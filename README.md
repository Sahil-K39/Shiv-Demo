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
