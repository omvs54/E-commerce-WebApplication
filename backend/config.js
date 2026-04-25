import dotenv from 'dotenv';

dotenv.config();

export const PORT = Number(process.env.PORT) || 4000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omvs54_db_user:9850780278omss@omvs54.dx8zzba.mongodb.net/om_satarkar_store?retryWrites=true&w=majority&appName=omvs54';
export const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-deployment';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'https://e-commerce-web-application-psi.vercel.app';
export const ADMIN_NAME = process.env.ADMIN_NAME || 'Om Satarkar';
export const ADMIN_LOGIN = (process.env.ADMIN_LOGIN || 'om').trim().toLowerCase();
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'om@gmail.com').trim().toLowerCase();
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password@123';
