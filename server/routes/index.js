import { Router } from 'express';
import multer from 'multer';
import { authUser, authAdmin } from '../middleware/auth.js';
import * as user from '../controllers/userController.js';
import * as product from '../controllers/productController.js';
import * as order from '../controllers/orderController.js';
import { bootstrap } from '../controllers/bootstrapController.js';

// Vercel caps request bodies near 4.5 MB, so the admin UI shrinks images first.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 4 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

const r = Router();

// First-run setup (refuses once an admin exists)
r.post('/bootstrap', bootstrap);

// Auth
r.post('/auth/register', user.register);
r.post('/auth/login', user.login);
r.get('/auth/me', user.me);
r.post('/auth/logout', user.logout);
r.post('/auth/forgot', user.forgotPassword);
r.post('/auth/verify-otp', user.verifyOtp);
r.post('/auth/reset', user.resetPassword);

// Cart
r.get('/cart', authUser, user.getCart);
r.post('/cart', authUser, user.saveCart);

// Catalogue
r.get('/products', product.list);
r.get('/products/:id', product.byId);

// Orders + refunds
r.post('/orders', authUser, order.place);
r.get('/orders', authUser, order.myOrders);
r.get('/orders/:id', authUser, order.myOrder);
r.post('/refunds', authUser, order.requestRefund);
r.get('/refunds', authUser, order.myRefunds);

// Admin
r.get('/admin/stats', authAdmin, order.stats);
r.post('/admin/products', authAdmin, upload.array('images', 4), product.create);
r.patch('/admin/products/:id', authAdmin, product.update);
r.post('/admin/products/:id/stock', authAdmin, product.setStock);
r.delete('/admin/products/:id', authAdmin, product.remove);
r.get('/admin/orders', authAdmin, order.allOrders);
r.patch('/admin/orders/:id', authAdmin, order.setStatus);
r.get('/admin/refunds', authAdmin, order.allRefunds);
r.patch('/admin/refunds/:id', authAdmin, order.setRefundStatus);

export default r;
