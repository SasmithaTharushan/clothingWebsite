import mongoose from 'mongoose';

const sizeSchema = new mongoose.Schema(
  { size: { type: String, required: true }, stock: { type: Number, default: 0, min: 0 } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true },
    category: { type: String, required: true },
    sizes: { type: [sizeSchema], default: [] },
    isTrending: { type: Boolean, default: false },
    sku: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.virtual('inStock').get(function () {
  return this.sizes.some((s) => s.stock > 0);
});
productSchema.set('toJSON', { virtuals: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);
