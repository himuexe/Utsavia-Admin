import mongoose, { Schema, Document, Types } from 'mongoose';
interface IPrice {
    city: string;
    price: number;
  }
  
  export interface IItem extends Document {
    name: string;
    description?: string;
    prices: IPrice[];
    category: Types.ObjectId;
    image?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const itemSchema: Schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: String,
      prices: [
        {
          city: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
      image: {
        type: String,
        required: false,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );
  
  itemSchema.index({ category: 1 });
  
  export const Item = mongoose.model<IItem>('Item', itemSchema);