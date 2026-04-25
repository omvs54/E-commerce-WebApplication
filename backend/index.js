import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import {
  ADMIN_EMAIL,
  ADMIN_LOGIN,
  ADMIN_NAME,
  ADMIN_PASSWORD,
  FRONTEND_URL,
  MONGODB_URI,
  PORT,
} from './config.js';
import authRoutes, { hashPassword } from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import User from './models/User.js';
import seedProducts from './resetProducts.js';

const app = express();

const allowedOrigins = new Set([
  FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://e-commerce-web-application-psi.vercel.app',
  'https://e-commerce-webapplication-production.up.railway.app',
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'om-satarkar-store-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);
  res.status(error?.status || 500).json({
    message: error?.message || 'Internal server error',
  });
});

async function seedAdminAccount() {
  await User.findOneAndUpdate(
    { role: 'admin' },
    {
      $set: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        username: ADMIN_LOGIN,
        passwordHash: hashPassword(ADMIN_PASSWORD),
        role: 'admin',
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );
}

async function bootstrap() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await seedAdminAccount();
    await seedProducts();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

void bootstrap();

export default app;
