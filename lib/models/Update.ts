import mongoose, { Schema, Document } from "mongoose";

export interface IUpdate extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  title: string;
  content: string;
  status: "pending" | "completed" | "in-progress";
  updatedAt: Date;
  createdAt: Date;
}

const UpdateSchema = new Schema<IUpdate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    username: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "in-progress"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.models.Update ||
  mongoose.model<IUpdate>("Update", UpdateSchema);
