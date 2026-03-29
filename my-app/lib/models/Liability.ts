import mongoose, { Schema, Document } from "mongoose";

export interface ILiability extends Document {
  userId: mongoose.Types.ObjectId;
  personName: string;
  amount: number;
  dateGiven: Date;
  daysToReturn: number;
  description: string;
  status: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const LiabilitySchema = new Schema<ILiability>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    personName: {
      type: String,
      required: [true, "Please provide person name"],
    },
    amount: {
      type: Number,
      required: [true, "Please provide amount"],
      min: 0,
    },
    dateGiven: {
      type: Date,
      required: [true, "Please provide date given"],
    },
    daysToReturn: {
      type: Number,
      required: [true, "Please provide days to return"],
      min: 1,
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Liability ||
  mongoose.model<ILiability>("Liability", LiabilitySchema);
