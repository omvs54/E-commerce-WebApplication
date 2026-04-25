import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/om_satarkar_store';
export const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deployment';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const ADMIN_NAME = process.env.ADMIN_NAME || 'Om Satarkar';
export const ADMIN_LOGIN = (process.env.ADMIN_LOGIN || 'om').trim().toLowerCase();
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@omsatarkar.store').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
