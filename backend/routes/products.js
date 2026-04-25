import express from 'express';
import Product from '../models/Product.js';
import auth, { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

router.get('/', async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const product = await Product.create({
      name: String(req.body.name || '').trim(),
      description: String(req.body.description || '').trim(),
      category: String(req.body.category || 'General').trim(),
      image: String(req.body.image || '').trim(),
      price: toNumber(req.body.price, 0),
      stock: Math.max(0, Math.floor(toNumber(req.body.stock, 0))),
    });

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
});

router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      message: 'Product deleted successfully',
      product: deletedProduct,
    });
  } catch (error) {
    return res.status(400).json({
      message: 'Failed to delete product',
      error: error.message,
    });
  }
});

export default router;
