# Execution TODO — Remove Login, Direct Shop, Guest Checkout

- [x] 1. Edit `backend/models/Order.js` — make userId optional String for guest orders
- [x] 2. Edit `backend/routes/orders.js` — allow POST /checkout without auth token
- [x] 3. Edit `backend/index.js` — add new Vercel preview URLs to CORS allowedOrigins
- [x] 4. Edit `frontend/src/App.jsx` — remove Login, AuthGate, auth state; direct shop
- [x] 5. Edit `frontend/src/pages/Shop.jsx` — remove auth UI, order history, enable guest checkout
- [x] 6. Edit `frontend/src/App.css` — responsive polish
- [x] 7. Verify frontend build passes
- [x] 8. Commit & push

