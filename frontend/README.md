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
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env`:

```bash
VITE_API_URL=http://localhost:4000
```

## Render

Create a Static Site on Render with:

- Build command: `npm install && npm run build`
- Publish directory: `dist`

Environment variables:

- `VITE_API_URL=https://your-backend-service.onrender.com`
