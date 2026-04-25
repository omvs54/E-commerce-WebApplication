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
  {
    name: 'Classic Denim Jacket',
    description: 'Timeless denim jacket with a tailored fit and durable stitching for all-season layering.',
    category: 'Fashion',
    price: 3499,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1551028919-ac76c9028d1e?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Cotton T-Shirt Pack',
    description: 'Soft breathable cotton tees in neutral tones, perfect for daily casual wear.',
    category: 'Fashion',
    price: 1299,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Slim Fit Chinos',
    description: 'Versatile slim-fit chinos with a slight stretch for comfort at work or weekends.',
    category: 'Fashion',
    price: 1899,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bomber Jacket',
    description: 'Lightweight bomber jacket with ribbed cuffs and a modern athletic cut.',
    category: 'Fashion',
    price: 2999,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Bluetooth Speaker',
    description: 'Portable wireless speaker with deep bass and 12-hour playtime for outdoor parties.',
    category: 'Electronics',
    price: 2499,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Smart Fitness Band',
    description: 'Track steps, heart rate, and sleep with a lightweight waterproof fitness band.',
    category: 'Electronics',
    price: 1999,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking and silent click buttons.',
    category: 'Electronics',
    price: 999,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI, USB-A, SD card reader, and 100W power delivery.',
    category: 'Electronics',
    price: 1799,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Tactile mechanical keyboard with RGB backlighting and hot-swappable switches.',
    category: 'Electronics',
    price: 4999,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Running Shoes',
    description: 'Breathable mesh running shoes with cushioned soles for long-distance comfort.',
    category: 'Footwear',
    price: 3499,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Leather Boots',
    description: 'Handcrafted leather boots with a rugged sole and polished finish for formal or casual wear.',
    category: 'Footwear',
    price: 4499,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Canvas Slip-Ons',
    description: 'Easygoing canvas slip-ons with a cushioned insole for everyday comfort.',
    category: 'Footwear',
    price: 1499,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Leather Wallet',
    description: 'Premium leather wallet with multiple card slots and a slim minimalist profile.',
    category: 'Accessories',
    price: 1299,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Classic aviator frames with UV400 polarized lenses for sharp outdoor vision.',
    category: 'Accessories',
    price: 1999,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Baseball Cap',
    description: 'Adjustable cotton baseball cap with embroidered logo detail and curved brim.',
    category: 'Accessories',
    price: 799,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Ceramic Vase Set',
    description: 'Minimalist ceramic vases in muted tones, perfect for modern home decor.',
    category: 'Home',
    price: 1599,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5bbae?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Aromatherapy Candle',
    description: 'Soy wax candle with calming lavender scent and 40-hour burn time.',
    category: 'Home',
    price: 899,
    stock: 32,
    image: 'https://images.unsplash.com/photo-1602825166860-2f8f0e7c8e4a?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Throw Blanket',
    description: 'Cozy knitted throw blanket in earth tones for sofa or bed layering.',
    category: 'Home',
    price: 1199,
    stock: 24,
    image: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Yoga Mat',
    description: 'Non-slip yoga mat with extra cushioning for home workouts and studio sessions.',
    category: 'Sports',
    price: 1499,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Resistance Bands Set',
    description: 'Set of 5 resistance bands with varying tension levels for strength training.',
    category: 'Sports',
    price: 699,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    category: 'Sports',
    price: 999,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Phone Stand',
    description: 'Adjustable aluminum phone stand for desk use with cable management slot.',
    category: 'Gadgets',
    price: 599,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Portable Charger',
    description: '20000mAh power bank with fast charging support for phones and tablets.',
    category: 'Gadgets',
    price: 1799,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1609592424303-5658691a4135?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Noise Cancelling Earbuds',
    description: 'True wireless earbuds with active noise cancellation and deep bass response.',
    category: 'Gadgets',
    price: 3499,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf1e9f06574?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Polarized Sunglasses',
    description: 'Modern square-frame sunglasses with polarized lenses and lightweight build.',
    category: 'Accessories',
    price: 2299,
    stock: 17,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80',
  },
  {
    name: 'Laptop Sleeve',
    description: 'Padded laptop sleeve with water-resistant fabric and secure zipper closure.',
    category: 'Accessories',
    price: 1099,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
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

