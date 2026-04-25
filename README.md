# E-commerce WebApplication

This repository uses a clean monorepo structure:

- `frontend/` contains the React + Vite storefront
- `backend/` contains the Express + MongoDB API

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
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Deployment

### Recommended: Vercel (Frontend) + Railway (Backend)

This is the best free hosting stack for a MERN app. Vercel hosts the React frontend with no sleep/cold-start, and Railway hosts the Node.js backend with a $5/month free credit (enough for 24/7 uptime).

#### 1. Backend on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository, then set the **Root Directory** to `backend`.
4. Add environment variables in the Railway dashboard:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a long random string
   - `FRONTEND_URL` = your Vercel frontend URL (set this after Step 2)
   - `ADMIN_NAME` = Om Satarkar
   - `ADMIN_LOGIN` = om
   - `ADMIN_EMAIL` = admin@omsatarkar.store
   - `ADMIN_PASSWORD` = your chosen admin password
5. Railway will give you a public URL like `https://your-project.up.railway.app`.

#### 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New Project** → import this repository.
3. Set the **Root Directory** to `frontend`.
4. Set the **Framework Preset** to `Vite`.
5. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL from Step 1
6. Click **Deploy**.
7. Copy your Vercel URL (e.g., `https://your-project.vercel.app`) and paste it into the Railway `FRONTEND_URL` env var.

> A `vercel.json` is already included in `frontend/` to handle SPA routing.

### Alternative: Netlify (Frontend) + Railway (Backend)

- The `frontend/` folder includes a `netlify.toml` with build settings and SPA redirect rules.
- Deploy the frontend to [netlify.com](https://netlify.com) using the same steps as Vercel.
- Backend setup on Railway is identical.

### Database

You need a MongoDB database. [MongoDB Atlas](https://www.mongodb.com/atlas) offers a free forever tier (512MB).

1. Create a cluster, database user, and allow access from anywhere (`0.0.0.0/0`).
2. Copy the connection string and add your database name before the query params:
   ```
   mongodb+srv://user:password@cluster.mongodb.net/om_satarkar_store?retryWrites=true&w=majority
   ```
3. Use this full string as `MONGODB_URI` in your backend environment variables.

## Recommended GitHub Owner

- `omvs54`

