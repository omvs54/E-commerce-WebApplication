import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const allowedStatuses = new Set(['placed', 'confirmed', 'paid', 'packed', 'shipped', 'delivered', 'cancelled']);

function normalizeOrderItems(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      productId: String(item.productId || item._id || item.id || '').trim(),
      name: String(item.name || '').trim(),
      price: toNumber(item.price, 0),
      quantity: Math.max(1, Math.floor(toNumber(item.quantity, 1))),
      image: String(item.image || '').trim(),
    }))
    .filter((item) => item.productId);
}

async function createCheckoutOrder(req, res) {
  try {
    const rawItems = Array.isArray(req.body.items) ? req.body.items : [];
    const items = normalizeOrderItems(rawItems);

    if (!items.length) {
      return res.status(400).json({ message: 'At least one item is required to place an order' });
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const orderItems = [];

    for (const item of items) {
      const product = productMap.get(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product not found for item ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} does not have enough stock available` });
      }

      orderItems.push({
        productId: product._id.toString(),
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity,
      });
    }

    for (const item of orderItems) {
      const product = productMap.get(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    const requestedStatus = String(req.body.status || 'placed').trim().toLowerCase();
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : 'placed';
    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      userId: req.user?.userId || 'guest',
      items: orderItems,
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
}

async function getMyOrders(req, res) {
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
}

router.get('/me', auth, getMyOrders);
router.post('/checkout', createCheckoutOrder);

export default router;
