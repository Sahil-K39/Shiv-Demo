# Shiv Shakti Platform Overview

Shiv Shakti is a modern spiritual commerce and community platform built to combine product discovery, secure account flows, order processing, and community participation in one digital experience.

The platform is split into two focused systems:

- A fast, SEO-ready storefront built with Next.js.
- A secure Go backend that manages authentication, products, carts, orders, community posts, and email notifications.

## What Is Already Built

- Product catalogue with collection and category browsing.
- Optimized product imagery for faster page loads.
- User registration, login, email verification, and secure sessions.
- Authenticated cart management.
- Checkout order creation with shipping details.
- Order confirmation emails.
- Community posts and likes.
- NGO and council-facing frontend pages.
- Backend health checks, CORS protection, rate limiting, secure headers, and CSRF protection.

## Production Setup

The frontend is designed for Vercel. The backend is Dockerized and suitable for Render. Environment variables connect the two systems so production traffic flows from the public frontend to the secure backend API.

For launch, the most important configuration items are:

- `NEXT_PUBLIC_API_URL` in Vercel.
- `CORS_ORIGIN` and `FRONTEND_URL` in Render.
- `JWT_SECRET` in Render.
- SMTP credentials in Render for live email delivery.
- Persistent database storage.

## Recommended Next Phase

The strongest next phase is to move from MVP checkout to production checkout:

1. Create orders in a pending state.
2. Send the cart total to Stripe or Razorpay.
3. Verify the payment callback or webhook on the backend.
4. Mark the order confirmed only after payment succeeds.
5. Send the order confirmation email after payment confirmation.

Database durability is now handled through PostgreSQL in production. SQLite remains useful for local development, while Render, Supabase, Neon, or another managed PostgreSQL provider should supply the production `DATABASE_URL`.

## Current Assessment

The foundation is strong for an MVP: the system has a real backend, secure session handling, a structured data model, production-oriented deployment files, and a polished frontend. The remaining work is less about rebuilding and more about hardening the platform for real users, payments, persistent data, and operational scale.
