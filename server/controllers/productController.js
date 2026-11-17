import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { uploadBuffer, isCloudinaryReady } from '../config/cloudinary.js';

export const CATEGORIES = ['Woman', 'Man', 'Accessories', 'Jewelry', 'Bags'];

// GET /api/products?category=&q=
export async function list(req, res) {
  const filter = {};
  if (req.query.category && CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
  if (req.query.q) filter.name = { $regex: String(req.query.q).slice(0, 60), $options: 'i' };

  const products = await Product.find(filter).sort({ createdAt: 1 }).lean({ virtuals: true });
  // Stock and prices change from the admin panel, so never let a CDN hold this.
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, products });
}

// GET /api/products/:id
export async function byId(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const product = await Product.findById(req.params.id).lean({ virtuals: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, product });
}

function parseSizes(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((s) => s && s.size)
    .slice(0, 12)
    .map((s) => ({ size: String(s.size).slice(0, 20), stock: Math.max(0, Math.floor(Number(s.stock)) || 0) }));
}

// POST /api/admin/products   (multipart: data JSON + images[])
export async function create(req, res) {
  let data;
  try {
    data = JSON.parse(req.body.data || '{}');
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid product data' });
  }
  const price = Number(data.price);
  if (!data.name?.trim()) return res.status(400).json({ success: false, message: 'Name is required' });
  if (!CATEGORIES.includes(data.category)) return res.status(400).json({ success: false, message: 'Pick a category' });
  if (!(price > 0)) return res.status(400).json({ success: false, message: 'Enter a price above zero' });
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'Add at least one image' });
  if (!isCloudinaryReady()) {
    return res.status(500).json({ success: false, message: 'Image storage (Cloudinary) is not configured on the server' });
  }

  const images = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer)));
  const product = await Product.create({
    name: data.name.trim(),
    category: data.category,
    price,
    description: String(data.description || '').slice(0, 2000),
    sku: String(data.sku || '').slice(0, 40),
    sizes: parseSizes(data.sizes),
    isTrending: Boolean(data.isTrending),
    images,
  });
  res.status(201).json({ success: true, message: 'Product added', product });
}

// PATCH /api/admin/products/:id   { price?, sizes?, isTrending?, name?, description? }
export async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid product' });
  }
  const patch = {};
  const b = req.body || {};
  if (b.name !== undefined) patch.name = String(b.name).trim().slice(0, 150);
  if (b.description !== undefined) patch.description = String(b.description).slice(0, 2000);
  if (b.price !== undefined) {
    const p = Number(b.price);
    if (!(p > 0)) return res.status(400).json({ success: false, message: 'Enter a price above zero' });
    patch.price = p;
  }
  if (b.sizes !== undefined) patch.sizes = parseSizes(b.sizes);
  if (b.isTrending !== undefined) patch.isTrending = Boolean(b.isTrending);

  const product = await Product.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, message: 'Product updated', product });
}

// POST /api/admin/products/:id/stock   { size, delta } or { size, stock }
export async function setStock(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid product' });
  }
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const row = product.sizes.find((s) => s.size === req.body?.size);
  if (!row) return res.status(400).json({ success: false, message: 'That size is not on this product' });

  if (req.body.stock !== undefined) row.stock = Math.max(0, Math.floor(Number(req.body.stock)) || 0);
  else row.stock = Math.max(0, row.stock + (Math.floor(Number(req.body.delta)) || 0));

  await product.save();
  res.json({ success: true, message: 'Stock updated', product });
}

// DELETE /api/admin/products/:id
export async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid product' });
  }
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
}
