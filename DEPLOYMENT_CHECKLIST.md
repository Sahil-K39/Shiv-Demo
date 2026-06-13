# Shiv Shakti Deployment Checklist

## 1. Repository Readiness

- Confirm production backend uses either the root `Dockerfile` from repository root or `backend/Dockerfile` from the `backend` directory.
- Run `git status --short` and review all pending changes.
- Confirm `frontend/package-lock.json` matches `frontend/package.json`.
- Confirm no secrets are committed.

## 2. Backend on Render

- Service type: Web Service.
- Root directory: repository root with the root `Dockerfile`, or `backend` with `backend/Dockerfile`.
- Health check path: `/health`.
- Port: use Render-provided `PORT`; the app defaults to `8080` locally.
- Provision PostgreSQL through Render Postgres, Supabase, Neon, or another managed provider.
- Supabase project URL: `https://bmyghobfovkzchhuhnss.supabase.co`.
- Set `DATABASE_URL` to the managed PostgreSQL connection string. For this Supabase project, use the direct connection format below and replace only the password:

Required environment variables:

```bash
APP_ENV=production
JWT_SECRET=long-random-production-secret
CORS_ORIGIN=https://your-vercel-domain
FRONTEND_URL=https://your-vercel-domain
BASE_URL=https://your-vercel-domain
DATABASE_URL=postgresql://postgres:[YOUR-SUPABASE-DATABASE-PASSWORD]@db.bmyghobfovkzchhuhnss.supabase.co:5432/postgres?sslmode=require
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=shivshaktiproject.support@gmail.com
SMTP_USER=shivshaktiproject.support@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Shiv Shakti <shivshaktiproject.support@gmail.com>"
SUPPORT_EMAIL=shivshaktiproject.support@gmail.com
CART_TO_EMAIL=shivshaktiproject.support@gmail.com
ORDER_TO_EMAIL=shivshaktiproject.support@gmail.com
QUOTE_TO_EMAIL=shivshaktiproject.support@gmail.com
REQUIRE_SMTP=true
PAYMENT_PROVIDER=manual_wholesale
```

Validation:

- `GET /health` returns `{ "status": "ok" }`.
- `GET /api/products` returns seeded products or production products.
- Registering a user sends a real verification email and does not set the `shiv_session` cookie before verification.
- Opening the `/verify?token=...` link verifies the account and sets the `shiv_session` cookie.
- Login works only after email verification and sets the `shiv_session` cookie.
- Admin login is rate-limited and admin routes reject normal users on the backend.
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

Frontend:

- Open the Vercel URL in a clean browser session.
- Check homepage loads.
- Check all primary buttons and links.
- Check mobile layout.
- Check login/register pages.

Auth:

- Register a new user.
- Confirm email is received.
- Check email links do not contain localhost.
- Click verification link.
- Login after verification.
- Try wrong password and confirm it is rejected.
- Try a protected page without login and confirm redirect/rejection.
- Logout.

Admin:

- Login as a normal user and confirm admin pages/API are blocked.
- Login as admin and confirm admin dashboard works.
- Create product/item.
- Update product/item.
- Delete product/item.
- Export CSV if available.

Production:

- Add a product to cart.
- Update item quantity.
- Submit a wholesale enquiry with delivery details.
- Confirm wholesale enquiry email dispatch.
- Create and like a community post.
- Check browser console has no errors.
- Check backend logs have no errors.
- Check database records are created correctly.
- Check deployed frontend talks to deployed backend.
- Re-enable and test NGO interest after the planned post-launch NGO phase.

## 5. Go-Live Risks

- `APP_ENV=production` now requires `DATABASE_URL`, so production uses PostgreSQL instead of local SQLite.
- The launch flow is manual wholesale enquiry: payment and delivery instructions are shared after your review.
- CSRF tokens are process-local.
- If importing old SQLite data, run a one-time data migration before launch.
