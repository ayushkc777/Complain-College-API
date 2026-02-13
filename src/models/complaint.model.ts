import mongoose, { Document, Schema } from "mongoose";
import { ComplaintType } from "../types/complaint.type";

const ComplaintSchema: Schema = new Schema<ComplaintType>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String },
    description: { type: String, required: true },
    image: { type: String },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved"],
      default: "open",
    },
    userId: { type: String },
  },
  { timestamps: true }
);

export interface IComplaint extends ComplaintType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ComplaintModel = mongoose.model<IComplaint>(
  "Complaint",
  ComplaintSchema
);
