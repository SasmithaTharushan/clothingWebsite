import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 80, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    cart: { type: Array, default: [] },
    // Password reset: we store only a hash of the one-time code.
    resetCodeHash: { type: String, default: null },
    resetExpires: { type: Date, default: null },
    resetAttempts: { type: Number, default: 0 },
  },
  { minimize: false, timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
