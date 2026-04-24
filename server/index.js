import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import { ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI, PORT } from './config.js';
import authRoutes, { hashPassword } from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import productsRoutes from './routes/products.js';
import ordersRoutes, { createCheckoutOrder } from './routes/orders.js';
import auth from './middleware/auth.js';
import User from './models/User.js';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'major-project-api',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);

app.post('/api/checkout', auth, createCheckoutOrder);

app.use((error, req, res, next) => {
  console.error('Unhandled server error:', error);
  res.status(error?.status || 500).json({
    message: error?.message || 'Internal server error',
  });
});

const seedAdminAccount = async () => {
  const passwordHash = hashPassword(ADMIN_PASSWORD);

  const adminUser = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: 'om',
        email: ADMIN_EMAIL,
        passwordHash,
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

  return adminUser;
};

const runProductSeed = async () => {
  try {
    const seedModule = await import('./resetProducts.js');
    const seedFn = seedModule?.default || seedModule?.resetProducts || seedModule?.seedProducts;

    if (typeof seedFn === 'function') {
      await seedFn();
    }
  } catch (seedError) {
    console.warn('Product seed import skipped:', seedError.message);
  }
};

const bootstrap = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await seedAdminAccount();
    await runProductSeed();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

bootstrap();

export default app;