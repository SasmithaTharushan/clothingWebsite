import mongoose from 'mongoose';

export const REFUND_STATUSES = ['Requested', 'Approved', 'Rejected', 'Refunded'];

const refundSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    orderNo: String,
    reason: { type: String, required: true, maxlength: 1000 },
    amount: { type: Number, required: true },
    status: { type: String, enum: REFUND_STATUSES, default: 'Requested' },
  },
  { timestamps: true }
);

export default mongoose.models.Refund || mongoose.model('Refund', refundSchema);
