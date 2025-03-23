import mongoose, { Schema, Document, Types } from 'mongoose';

// Booking Model
interface IBookingItem {
  itemName: string;
  price: number;
  date: Date;
  timeSlot: string;
  vendorName?: string;
}

interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isPrimary?: boolean;
}

export interface IBooking extends Document {
  userId: Types.ObjectId;
  items: IBookingItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId?: string;
  address: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    items: [
      {
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled','completed'],
      default: 'pending',
    },
    paymentIntentId: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
      isPrimary: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);