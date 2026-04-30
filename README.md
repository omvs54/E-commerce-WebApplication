# Om Satarkar Store 🛒

A modern full-stack e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js). Features a clean storefront with product browsing, shopping cart, and instant checkout — no account required.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + React Router |
| Styling | Custom CSS (design system) |
| Backend | Express.js + Node.js |
| Database | MongoDB (MongoDB Atlas) |
| Auth | JWT + bcrypt password hashing |

---

## Features

### Customer Features
- **Product Catalog** — Browse 32 products across categories (Fashion, Footwear, Electronics, Home, Sports, Accessories)
- **Shopping Cart** — Add/remove items, adjust quantities, persistent cart storage (localStorage)
- **Instant Checkout** — No login required, checkout in seconds
- **User Accounts** — Registration and login with local database backup

### Admin Features
- **Admin Dashboard** — Manage products and view metrics
- **Protected Routes** — Admin-only access

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier)

### Local Development

#### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/omvs54/e-commerce-web-application.git
cd e-commerce-web-application

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### 2. Configure Environment Variables

Create `backend/.env`:

```env
MONGODB_URI=mongodb+srv://your_db_connection_string
JWT_SECRET=your_secure_random_string
FRONTEND_URL=http://localhost:5173
ADMIN_NAME=Om Satarkar
ADMIN_LOGIN=om
ADMIN_EMAIL=om@gmail.com
ADMIN_PASSWORD=your_admin_password
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
```

#### 3. Run Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

---

## Deployment

### Recommended Stack

| Service | Purpose | Free Tier |
|---------|---------|----------|
| Vercel | Frontend hosting | ✅ Yes |
| Railway | Backend hosting | ~$5 credit/month |
| MongoDB Atlas | Database | ✅ 512MB free |

### Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set **Root Directory** to `backend`
3. Add environment variables in dashboard
4. Deploy and copy Railway URL

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Add Project → Import repo
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`
4. Add `VITE_API_URL` = your Railway backend URL
5. Deploy

---

## Project Structure

```
repo-sync/
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # Shop, Login, Register pages
│   │   ├── lib/         # API, session, userDb utilities
│   │   ├── data/        # Static products data
│   │   └── App.jsx      # Main app with routing
│   ├── vite.config.js
│   └── package.json
│
├── backend/              # Express + MongoDB backend
│   ├── routes/          # auth, products, orders, admin
│   ├── models/          # User, Product, Order schemas
│   ├── middleware/      # Auth verification
│   ├── config.js        # Environment config
│   └── index.js         # Express server entry
│
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User/admin login |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/orders` | Create new order |
| GET | `/api/orders/:userId` | Get user orders |
| GET | `/api/admin/metrics` | Admin dashboard data |

---

## Screenshots

<img width="1920" height="1080" alt="Screenshot (114)" src="https://github.com/user-attachments/assets/7a06a048-f36f-4d95-80a6-d9bd48ed2e44" />
<img width="1920" height="1080" alt="Screenshot (115)" src="https://github.com/user-attachments/assets/5e2039d8-17d8-4bf8-b53f-c1fe20374d5c" />
<img width="1920" height="1080" alt="Screenshot (116)" src="https://github.com/user-attachments/assets/5de271aa-2929-41fe-afc0-7cb2b63bcc0f" />
<img width="1920" height="1080" alt="Screenshot (117)" src="https://github.com/user-attachments/assets/34fc599c-1daa-4114-8397-4a07fec92a50" />
<img width="1920" height="1080" alt="Screenshot (118)" src="https://github.com/user-attachments/assets/f056c791-9c04-48f2-bb67-0b40c3e0c3ee" />
<img width="1920" height="1080" alt="Screenshot (119)" src="https://github.com/user-attachments/assets/6125df7d-9eb4-48b8-b6a0-979138732d65" />
<img width="1920" height="1080" alt="Screenshot (120)" src="https://github.com/user-attachments/assets/a0ab6340-4029-44ee-8339-52ada32e8a78" />
<img width="1920" height="1080" alt="Screenshot (121)" src="https://github.com/user-attachments/assets/5b558d41-0125-4c51-8c25-2c876e17c04d" />




---

## License

MIT License

---

## Contact

**Om Satarkar**
- GitHub: [@omvs54](https://github.com/omvs54)
- LinkedIN:[@omvs54](https://www.linkedin.com/in/om-satarkar-2579392b8/)

---

*Built with React + Express — Deploy to Vercel + Railway for free hosting*
