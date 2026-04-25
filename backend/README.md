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

## Deployment

### Railway (Recommended)

1. Go to [railway.app](https://railway.app) and create a new project from your GitHub repo.
2. Set the **Root Directory** to `backend`.
3. Set the environment variables above in the Railway dashboard.
4. Railway auto-detects Node.js and will run `npm start`.

