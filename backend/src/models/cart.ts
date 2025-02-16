import mongoose, { Schema, Document, Types } from 'mongoose';
interface ICartItem extends Document {
    userId: Types.ObjectId;
    itemId: Types.ObjectId;
    itemName: string;
    price: number;
    date: Date;
    timeSlot: string;
    pincode: string;
    imageUrl?: string;
    city: string;
    createdAt: Date;
  }
  
  const cartItemSchema: Schema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    imageUrl: String,
    city: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  
  export const Cart = mongoose.model<ICartItem>('Cart', cartItemSchema);