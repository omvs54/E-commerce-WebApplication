# Plan: Remove Login Page, Enable Direct Shop Access + Guest Checkout + Responsive Polish

## Information Gathered
- Project: MERN e-commerce with React (Vite) frontend + Express/MongoDB backend
- Frontend deployed on Vercel, Backend on Railway
- Shop already supports guest browsing & cart (localStorage); checkout requires JWT auth
- App.jsx has AuthGate, login redirect, auth state via localStorage
- Order schema requires `userId` as ObjectId — blocks guest checkout

## Plan

### Backend
1. `backend/models/Order.js` — Make `userId` optional String (default `'guest'`) for guest orders
2. `backend/routes/orders.js` — Allow checkout without auth token (guest checkout)
3. `backend/index.js` — Add new Vercel preview URLs to CORS allowedOrigins

### Frontend
4. `frontend/src/App.jsx` — Remove Login import & route, remove AuthGate, remove auth state management, render Shop directly
5. `frontend/src/pages/Shop.jsx` — Remove login/logout buttons, remove admin link, remove order history section, enable guest checkout without token
6. `frontend/src/App.css` — Polish responsive breakpoints for mobile

### Cleanup
7. Remove dead imports and unused code

