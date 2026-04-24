import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-commerce'

const products = [
  {
    name: 'Horizon Storefront Theme',
    description: 'A bold ecommerce theme built for online shops, featuring product galleries and conversion-first layouts.',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Premium Cart Experience',
    description: 'A seamless checkout flow with express payment options and cross-sell recommendations.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Branding Essentials Kit',
    description: 'Logo, color palette, and typography bundle for a polished online store identity.',
    price: 34.95,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Mobile Shop Dashboard',
    description: 'A smart admin dashboard for orders, inventory, and sales analytics on the go.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'SEO Growth Toolkit',
    description: 'Tools and templates to boost search rankings, traffic, and product visibility.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Product Launch Pack',
    description: 'Launch-ready landing pages, banners, and email templates for your next product drop.',
    price: 74.95,
    image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Subscription Commerce Suite',
    description: 'Recurring billing and membership tools designed for subscription-based brands.',
    price: 84.99,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Conversion Booster Ad Kit',
    description: 'High-impact ad creatives and campaign templates for ecommerce growth.',
    price: 39.95,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80'
  }
]

async function reset() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB for reset')
    await Product.deleteMany({})
    await Product.create(products)
    console.log('Reset products successfully')
  } catch (err) {
    console.error('Reset failed:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

reset()
