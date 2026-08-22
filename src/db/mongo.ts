import mongoose, { Schema, Document } from "mongoose";
import { config } from "../config.js";
import { Memory, RequestCategory } from "../types.js";

interface InteractionDocument extends Document {
  userId: string;
  message: string;
  response: string;
  category: RequestCategory;
  createdAt: Date;
}

const interactionSchema = new Schema<InteractionDocument>({
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Interaction = mongoose.model<InteractionDocument>(
  "Interaction",
  interactionSchema
);

export async function connectMongo(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");
}

export async function getMemories(
  userId: string,
  limit = 5
): Promise<Memory[]> {
  const docs = await Interaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return docs.map((doc) => ({
    message: doc.message,
    response: doc.response,
    category: doc.category,
    createdAt: doc.createdAt
  }));
}

export async function saveInteraction(
  userId: string,
  message: string,
  category: RequestCategory,
  response: string
): Promise<void> {
  await Interaction.create({
    userId,
    message,
    category,
    response
  });
}
