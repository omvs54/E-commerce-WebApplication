import express from 'express';
import Order from '../models/Order.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringId = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return String(value);
};

const allowedStatuses = new Set(['placed', 'confirmed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']);

export const normalizeOrderItems = (items = []) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const price = toNumber(item.price, 0);
      const quantity = Math.max(1, Math.floor(toNumber(item.quantity, 1)));

      return {
        productId: toStringId(item.productId || item._id || item.id),
        name: String(item.name || item.title || 'Item').trim(),
        price,
        quantity,
        image: String(item.image || item.imageUrl || item.thumbnail || ''),
      };
    })
    .filter((item) => item.name);
};

export const calculateOrderTotal = (items = []) =>
  items.reduce((sum, item) => sum + toNumber(item.price, 0) * Math.max(1, toNumber(item.quantity, 1)), 0);

export const createCheckoutOrder = async (req, res) => {
  try {
    const rawItems = Array.isArray(req.body.items)
      ? req.body.items
      : Array.isArray(req.body.cartItems)
        ? req.body.cartItems
        : Array.isArray(req.body.cart)
          ? req.body.cart
          : Array.isArray(req.body.products)
            ? req.body.products
            : [];

    const items = normalizeOrderItems(rawItems);

    if (!items.length) {
      return res.status(400).json({ message: 'At least one item is required to place an order' });
    }

    const providedTotal = toNumber(req.body.total, NaN);
    const total = Number.isFinite(providedTotal) && providedTotal >= 0 ? providedTotal : calculateOrderTotal(items);
    const requestedStatus = String(req.body.status || 'placed').trim().toLowerCase();
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : 'placed';

    const order = await Order.create({
      userId: req.user.userId,
      items,
      total,
      status,
    });

    return res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    return res.json({
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load order history',
      error: error.message,
    });
  }
};

router.get('/', auth, getMyOrders);
router.get('/me', auth, getMyOrders);
router.get('/history', auth, getMyOrders);
router.get('/mine', auth, getMyOrders);

router.post('/', auth, createCheckoutOrder);
router.post('/checkout', auth, createCheckoutOrder);
router.post('/place', auth, createCheckoutOrder);

export default router;