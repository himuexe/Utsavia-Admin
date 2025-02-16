import mongoose, { Schema, Document, Types } from 'mongoose';
  export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    parentId?: Types.ObjectId;
    level: number;
    path: Types.ObjectId[];
    isActive: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  const categorySchema: Schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      slug: {
        type: String,
        required: true,
        unique: true,
      },
      description: String,
      parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
      },
      level: {
        type: Number,
        required: true,
        default: 0,
      },
      path: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      isActive: {
        type: Boolean,
        default: true,
      },
      image: {
        type: String,
        required: false,
      },
    },
    { timestamps: true }
  );
  
  categorySchema.index({ parentId: 1 });
  categorySchema.index({ path: 1 });
  
  export const Category = mongoose.model<ICategory>('Category', categorySchema);