# E-commerce WebApplication

A full-stack MERN ecommerce web application built with React, Vite, Express, and MongoDB.

## Project overview

This repository contains:

- A React + Vite frontend in the project root
- An Express backend in `server/`
- MongoDB product data managed through Mongoose
- Admin login and product management endpoints
- Render deployment support via `render.yaml`

## Features

- Product catalog loaded from MongoDB
- Add to cart, cart totals, and checkout flow
- Admin sign-in and dashboard
- API endpoints for products, checkout, and admin operations
- Render-ready frontend and backend configuration

## Local setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# edit .env and set MONGODB_URI to your Atlas connection string
npm run dev
```

### 2. Frontend

```bash
cd ..
npm install
npm run dev -- --host
```

Then open the local frontend URL shown in the terminal.

## Environment variables

Copy `.env.example` to `.env` in the project root and fill in your values.

Required backend variables:

- `MONGODB_URI`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `JWT_SECRET`
- `FRONTEND_URL`

Required frontend variable:

- `VITE_API_URL`

## Admin credentials

Default admin login:

- Username: `om`
- Password: `password@123`

Use `/login` to sign in, then go to `/admin`.

## Render deployment

This project includes `render.yaml` for Render service creation.

### Backend service

- Root: `server`
- Environment: `node`
- Build command: `npm install`
- Start command: `npm run start`

Set these environment variables on Render:

- `MONGODB_URI`
- `ADMIN_EMAIL=om`
- `ADMIN_PASSWORD=password@123`
- `JWT_SECRET`
- `FRONTEND_URL=https://om-satarkar-commerce-frontend.onrender.com`

### Frontend service

- Root: `.`
- Environment: `static`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Set this environment variable:

- `VITE_API_URL=https://e-commerce-buoa.onrender.com`

### Notes

- Your Render backend URL is `https://e-commerce-buoa.onrender.com`
- The Render service ID is `srv-d7lr7l5ckfvc73e117q0`
- The service ID is only for Render dashboard/support and does not belong in the source code

## API endpoints

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/checkout`
- `POST /api/auth/login`

## GitHub setup

This repository is intended for GitHub as `omvs54/E-commerce-WebApplication`.

## License

This project is open source and can be deployed for production environments with a proper MongoDB Atlas connection.
