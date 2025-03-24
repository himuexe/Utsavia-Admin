import mongoose, { Schema, Document, Types } from 'mongoose';

// Booking Model
interface IVendor {
  _id: Types.ObjectId;
  name: string;
  companyName?: string;
}

interface IBookingItem {
  itemId: Types.ObjectId;
  itemName: string;
  price: number;
  date: Date;
  timeSlot: string;
  vendorId?: Types.ObjectId | IVendor; 
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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
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
        itemId: { type: Schema.Types.ObjectId, ref: 'Item' },
        itemName: { type: String, required: true },
        price: { type: Number, required: true },
        date: { type: Date, required: true },
        timeSlot: { type: String, required: true },
        vendorId: { type: Schema.Types.ObjectId, ref: 'vendors' },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
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