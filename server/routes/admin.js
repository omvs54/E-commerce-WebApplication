import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import auth, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(auth, requireAdmin);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildRecentOrder = (order) => {
  const populatedUser = order.userId && typeof order.userId === 'object' ? order.userId : null;
  const userId = populatedUser ? populatedUser._id?.toString?.() || populatedUser.toString() : String(order.userId || '');

  return {
    id: order._id.toString(),
    userId,
    userName: populatedUser?.name || '',
    userEmail: populatedUser?.email || '',
    total: order.total,
    status: order.status,
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
    createdAt: order.createdAt,
  };
};

const getMetrics = async (req, res) => {
  try {
    const [productCount, userCount, adminCount, orderCount, revenueResult, recentOrders] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
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

    const totalRevenue = revenueResult?.[0]?.revenue || 0;

    return res.json({
      productCount,
      userCount,
      adminCount,
      orderCount,
      totalRevenue,
      counts: {
        productCount,
        userCount,
        adminCount,
        orderCount,
        totalRevenue,
      },
      recentOrders: recentOrders.map(buildRecentOrder),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load admin metrics',
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      price: toNumber(req.body.price, 0),
    };

    if (payload.stock !== undefined) {
      payload.stock = toNumber(payload.stock, 0);
    }

    const product = await Product.create(payload);

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id || req.params.productId || req.body.id || req.body.productId;

    if (!productId) {
      return res.status(400).json({ message: 'Product id is required' });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    if (error?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    return res.status(500).json({
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

router.get(['/metrics', '/stats', '/dashboard'], getMetrics);
router.get('/', getMetrics);

router.post(['/products', '/products/create', '/add-product', '/create-product'], createProduct);
router.delete(['/products/:id', '/products/remove/:id', '/product/:id'], deleteProduct);
router.delete(['/products', '/product'], deleteProduct);

export default router;