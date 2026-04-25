import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/om_satarkar_store';

const products = [
  {
    name: 'Signature Hoodie',
    description: 'A clean heavyweight hoodie built for everyday wear with a soft brushed inner finish.',
    category: 'Fashion',
    price: 2499,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Minimal Sneaker',
    description: 'Low-profile sneakers with a versatile silhouette for daily streetwear styling.',
    category: 'Footwear',
    price: 3199,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Urban Backpack',
    description: 'A structured backpack with smart compartments for laptop, cables, and essentials.',
    category: 'Accessories',
    price: 1899,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Desk Lamp Pro',
    description: 'Warm modern lighting for workspaces with adjustable angle and focused glow.',
    category: 'Home',
    price: 1599,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Wireless Headphones',
    description: 'Balanced sound, comfortable ear cushions, and all-day battery backup.',
    category: 'Electronics',
    price: 4299,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Classic Watch',
    description: 'A refined everyday watch with a clean dial and premium strap finish.',
    category: 'Accessories',
    price: 2799,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
  },
];

async function reset() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for reset');
    await Product.deleteMany({});
    await Product.create(products);
    console.log('Reset products successfully');
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

export default async function seedProducts() {
  const existingProducts = await Product.countDocuments();

  if (existingProducts > 0) {
    return;
  }

  await Product.create(products);
}

if (process.argv[1] && process.argv[1].includes('resetProducts.js')) {
  void reset();
}
