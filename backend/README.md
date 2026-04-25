# Om Satarkar Store Backend

Express + MongoDB backend for the ecommerce website.

## Features

- Admin and customer authentication
- Product listing and admin product management
- Checkout and order history
- Admin metrics endpoint
- Seeded starter products

## Local setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_NAME`
- `ADMIN_LOGIN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Render

Create a Web Service on Render with:

- Build command: `npm install`
- Start command: `npm start`

Set the environment variables from `.env.example`, especially:

- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-frontend-service.onrender.com`
