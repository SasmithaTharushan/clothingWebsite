import mongoose from 'mongoose';

export const ORDER_STATUSES = ['Placed', 'Packing', 'Shipped', 'Delivered', 'Cancelled'];

const itemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    // Snapshot, so past orders still render if the product changes later.
    name: String,
    image: String,
    size: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderNo: { type: String, required: true, unique: true },
    items: { type: [itemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'Placed' },
    paymentType: { type: String, default: 'COD' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
