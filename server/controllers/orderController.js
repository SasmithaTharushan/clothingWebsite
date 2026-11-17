import crypto from 'crypto';
import mongoose from 'mongoose';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Refund, { REFUND_STATUSES } from '../models/Refund.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const SHIPPING = 70;
const round2 = (n) => Math.round(n * 100) / 100;

const ADDRESS_FIELDS = ['fullName', 'email', 'phone', 'street', 'city', 'postcode', 'country'];

// POST /api/orders  { items: [{productId, size, quantity}], address }
export async function place(req, res) {
  const { items, address: input } = req.body || {};
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ success: false, message: 'Your bag is empty' });
  }

  const address = {};
  for (const f of ADDRESS_FIELDS) {
    const v = String(input?.[f] ?? '').trim();
    if (!v) return res.status(400).json({ success: false, message: `Please fill in your ${f.replace(/([A-Z])/g, ' $1').toLowerCase()}` });
    address[f] = v.slice(0, 200);
  }

  const ids = items.map((i) => i.productId).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids } });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  // Prices and stock always come from the database, never from the browser.
  const lines = [];
  for (const i of items) {
    const p = byId.get(String(i.productId));
    if (!p) continue;
    const qty = Math.max(1, Math.floor(Number(i.quantity)) || 1);
    const row = p.sizes.find((s) => s.size === i.size) || (p.sizes.length === 0 ? null : undefined);
    if (row === undefined) {
      return res.status(400).json({ success: false, message: `Choose a size for ${p.name}` });
    }
    if (row && row.stock < qty) {
      return res.status(409).json({
        success: false,
        message: row.stock === 0
          ? `${p.name} (${row.size}) just sold out`
          : `Only ${row.stock} left of ${p.name} (${row.size})`,
      });
    }
    lines.push({ product: p, row, qty });
  }
  if (!lines.length) return res.status(400).json({ success: false, message: 'No valid items in your bag' });

  const orderItems = lines.map(({ product, row, qty }) => ({
    product: product._id,
    name: product.name,
    image: product.images[0],
    size: row ? row.size : 'One Size',
    price: product.price,
    quantity: qty,
  }));

  const subtotal = round2(orderItems.reduce((s, i) => s + i.price * i.quantity, 0));
  const total = round2(subtotal + SHIPPING);

  const order = await Order.create({
    userId: req.userId,
    orderNo: 'ORD-' + crypto.randomBytes(3).toString('hex').toUpperCase(),
    items: orderItems,
    subtotal,
    shipping: SHIPPING,
    total,
    address,
  });

  // Decrement stock only once the order is safely written.
  await Promise.all(
    lines.filter((l) => l.row).map(({ product, row, qty }) =>
      Product.updateOne(
        { _id: product._id, 'sizes.size': row.size },
        { $inc: { 'sizes.$.stock': -qty } }
      )
    )
  );
  await User.findByIdAndUpdate(req.userId, { cart: [] });

  res.status(201).json({ success: true, order });
}

// GET /api/orders
export async function myOrders(req, res) {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders });
}

// GET /api/orders/:id
export async function myOrder(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  const order = await Order.findOne({ _id: req.params.id, userId: req.userId }).lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
}

// GET /api/admin/orders
export async function allOrders(req, res) {
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, orders });
}

// PATCH /api/admin/orders/:id  { status }
export async function setStatus(req, res) {
  const { status } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id) || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order or status' });
  }
  await Order.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true, message: 'Order updated' });
}

/* ---------------- Refunds ---------------- */

// POST /api/refunds  { orderId, reason }
export async function requestRefund(req, res) {
  const { orderId, reason } = req.body || {};
  if (!mongoose.isValidObjectId(orderId)) {
    return res.status(400).json({ success: false, message: 'Pick an order' });
  }
  if (!String(reason || '').trim()) {
    return res.status(400).json({ success: false, message: 'Tell us why you want to return this' });
  }
  const order = await Order.findOne({ _id: orderId, userId: req.userId });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (await Refund.findOne({ orderId, status: { $ne: 'Rejected' } })) {
    return res.status(409).json({ success: false, message: 'A refund for this order is already in progress' });
  }

  const refund = await Refund.create({
    userId: req.userId,
    orderId,
    orderNo: order.orderNo,
    reason: String(reason).trim().slice(0, 1000),
    amount: order.total,
  });
  res.status(201).json({ success: true, message: 'Refund requested', refund });
}

// GET /api/refunds
export async function myRefunds(req, res) {
  const refunds = await Refund.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, refunds });
}

// GET /api/admin/refunds
export async function allRefunds(req, res) {
  const refunds = await Refund.find({}).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, refunds });
}

// PATCH /api/admin/refunds/:id  { status }
export async function setRefundStatus(req, res) {
  const { status } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id) || !REFUND_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid refund or status' });
  }
  await Refund.findByIdAndUpdate(req.params.id, { status });
  res.json({ success: true, message: 'Refund updated' });
}

// GET /api/admin/stats
export async function stats(req, res) {
  const [orders, products, users, refunds] = await Promise.all([
    Order.find({ status: { $ne: 'Cancelled' } }, { total: 1, createdAt: 1 }).lean(),
    Product.countDocuments(),
    User.countDocuments({ role: 'customer' }),
    Refund.countDocuments({ status: 'Requested' }),
  ]);
  const lowStock = await Product.find({ 'sizes.stock': { $lte: 2 } }, { name: 1, sizes: 1 }).limit(20).lean();
  res.json({
    success: true,
    stats: {
      orders: orders.length,
      revenue: round2(orders.reduce((s, o) => s + o.total, 0)),
      products,
      customers: users,
      pendingRefunds: refunds,
      lowStock: lowStock.map((p) => ({
        name: p.name,
        sizes: p.sizes.filter((s) => s.stock <= 2).map((s) => `${s.size}: ${s.stock}`),
      })),
    },
  });
}
