import mongoose, { Document, Schema } from 'mongoose';

// Define interfaces for the documents
export interface IBankDetails extends Document {
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  paymentMode?: string; 
}

export interface IVendor extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  companyName?: string;
  paymentMode: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: IBankDetails;
  location?: string;
  city?: string;
  isActive?: boolean;
  isDiscarded?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the bank details schema
const BankDetailsSchema = new Schema<IBankDetails>({
  accountNumber: {
    type: String,
    required: function(this: any) {
      return this.parent?.paymentMode === 'bank';
    }
  },
  ifscCode: {
    type: String,
    trim: true,
    required: function(this: any) {
      return this.parent?.paymentMode === 'bank';
    }
  },
  accountHolderName: {
    type: String,
    trim: true,
    required: function(this: any) {
      return this.parent?.paymentMode === 'bank';
    }
  }
});

// Define the vendor schema
const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, match: [/^\d{10}$/, 'Please enter a valid phone number'] },
    address: { type: String },
    companyName: { type: String, trim: true },
    paymentMode: { type: String, enum: ['upi', 'bank'], default: 'upi' },
    upiId: { type: String, trim: true },
    bankDetails: { type: BankDetailsSchema, default: {} },
    location: { type: String },
    city: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isDiscarded: { type: Boolean, default: false }
  },
  { collection: 'vendors', timestamps: true }
);

// Create and export the model
export const Vendor = mongoose.model<IVendor>('vendors', VendorSchema);