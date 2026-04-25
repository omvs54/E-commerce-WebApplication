import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import auth, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, requireAdmin);

const buildRecentOrder = (order) => ({
  id: order._id.toString(),
  userId: order.userId?._id?.toString?.() || String(order.userId || ''),
  userName: order.userId?.name || '',
  userEmail: order.userId?.email || '',
  total: order.total,
  status: order.status,
  itemCount: Array.isArray(order.items) ? order.items.length : 0,
  items: Array.isArray(order.items) ? order.items : [],
  createdAt: order.createdAt,
});

router.get('/metrics', async (req, res) => {
  try {
    const [productCount, userCount, orderCount, revenueResult, recentOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email'),
    ]);

    return res.json({
      productCount,
      userCount,
      orderCount,
      revenue: revenueResult?.[0]?.revenue || 0,
      recentOrders: recentOrders.map(buildRecentOrder),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load admin metrics',
      error: error.message,
    });
  }
});

export default router;
