import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number; // İndirimden önceki fiyat
  stock: number;
  category: mongoose.Types.ObjectId;
  tags: string[];
  isActive: boolean;
  sku?: string;
  barcode?: string;
  weight?: number; // gram
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    sku: { type: String },
    barcode: { type: String },
    weight: { type: Number },
  },
  { timestamps: true }
);

// Tam metin arama için index
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
