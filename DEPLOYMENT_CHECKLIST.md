# Shiv Shakti Deployment Checklist

## 1. Repository Readiness

- Confirm production backend uses `backend/Dockerfile`, not the root placeholder Dockerfile.
- Run `git status --short` and review all pending changes.
- Confirm `frontend/package-lock.json` matches `frontend/package.json`.
- Confirm no secrets are committed.

## 2. Backend on Render

- Service type: Web Service.
- Root directory: repository root with the root `Dockerfile`, or `backend` with `backend/Dockerfile`.
- Health check path: `/health`.
- Port: use Render-provided `PORT`; the app defaults to `8080` locally.
- Provision PostgreSQL through Render Postgres, Supabase, Neon, or another managed provider.
- Set `DATABASE_URL` to the managed PostgreSQL connection string.

Required environment variables:

```bash
APP_ENV=production
JWT_SECRET=long-random-production-secret
CORS_ORIGIN=https://your-vercel-domain
FRONTEND_URL=https://your-vercel-domain
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_FROM="Shiv Shakti <orders@your-domain>"
REQUIRE_SMTP=true
PAYMENT_PROVIDER=manual_wholesale
```

Validation:

- `GET /health` returns status `operational`.
- `GET /api/products` returns seeded products or production products.
- Registering a user sends or logs a verification email.
- Login sets the `shiv_session` cookie.
- NGO is hidden from public navigation until the post-launch NGO phase.
- Wholesale enquiry creates a `payment_pending` record for manual review, not an online payment.

## 3. Frontend on Vercel

Project directory: `frontend`.

Required environment variables:

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend
INTERNAL_BACKEND_URL=https://your-render-backend
NEXT_PUBLIC_IMAGE_HOSTNAME=your-render-backend-hostname
```

Validation:

- Home page loads without hydration warnings.
- Product images render through Next image optimization.
- Product catalogue calls the live backend.
- Login and authenticated cart requests include cookies.
- CSRF-protected cart and wholesale enquiry actions include `X-CSRF-Token`.

## 4. Production Smoke Test

- Open the Vercel URL in a clean browser session.
- Register a new account.
- Verify email through the generated verification link.
- Log in.
- Add a product to cart.
- Update item quantity.
- Submit a wholesale enquiry with delivery details.
- Confirm wholesale enquiry email dispatch or mock-mode log output.
- Create and like a community post.
- Re-enable and test NGO interest after the planned post-launch NGO phase.

## 5. Go-Live Risks

- `APP_ENV=production` now requires `DATABASE_URL`, so production uses PostgreSQL instead of local SQLite.
- The launch flow is manual wholesale enquiry: payment and delivery instructions are shared after your review.
- CSRF tokens are process-local.
- If importing old SQLite data, run a one-time data migration before launch.
