# Om Satarkar Store Frontend

React + Vite frontend for the ecommerce website.

## Features

- Customer login and registration
- Product catalog
- Cart with local persistence
- Checkout flow wired to the backend API
- Admin dashboard access for seeded admin users

## Local setup

```bash
npm install
npm run dev
```

Set `VITE_API_URL` in a `.env` file for local development:

```bash
VITE_API_URL=http://localhost:4000
```

## Deployment

### Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo.
2. Set **Root Directory** to `frontend` and **Framework Preset** to `Vite`.
3. Add environment variable `VITE_API_URL` pointing to your live backend URL.
4. Click **Deploy**.

> `vercel.json` is already included to handle SPA routing for React Router.

### Netlify (Alternative)

1. Go to [netlify.com](https://netlify.com) and import your repo.
2. Set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
3. Add environment variable `VITE_API_URL`.
4. Click **Deploy**.

> `netlify.toml` is already included with build settings and SPA redirect rules.

