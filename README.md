# E-commerce WebApplication

This repository now uses a clean monorepo structure:

- `frontend/` contains the React + Vite storefront
- `backend/` contains the Express + MongoDB API

The old broken nested project structure was replaced to make local development and Render deployment simpler.

## Features

- Customer login and registration
- Admin login with seeded admin credentials from environment variables
- Product catalog and cart flow
- Checkout with order history
- Admin dashboard for products and metrics

## Local Development

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Render Deployment

This repo includes a root `render.yaml` blueprint that creates:

- one static site for `frontend/`
- one web service for `backend/`

Before deploying, set real values for:

- `backend` `MONGODB_URI`
- `backend` `JWT_SECRET`
- `backend` admin credentials
- `frontend` `VITE_API_URL`

## Recommended GitHub Owner

- `omvs54`
