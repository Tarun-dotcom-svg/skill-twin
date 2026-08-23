import mongoose, { Schema, Document } from "mongoose";
import { config } from "../config.js";
import { Memory, RequestCategory } from "../types.js";
import { EMBEDDING_DIMENSIONS } from "../llm/embeddings.js";

interface InteractionDocument extends Document {
  userId: string;
  message: string;
  response: string;
  category: RequestCategory;
  embedding: number[];
  createdAt: Date;
}

const interactionSchema = new Schema<InteractionDocument>({
  userId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  response: { type: String, required: true },
  category: { type: String, required: true },
  embedding: {
    type: [Number],
    required: true,
    validate: {
      validator: (value: number[]) => value.length === EMBEDDING_DIMENSIONS,
      message: `embedding must contain exactly ${EMBEDDING_DIMENSIONS} dimensions`
    }
  },
  createdAt: { type: Date, default: Date.now }
});

const Interaction = mongoose.model<InteractionDocument>(
  "Interaction",
  interactionSchema,
  config.mongoCollection
);

export async function connectMongo(): Promise<void> {
  await mongoose.connect(config.mongoUri, {
    dbName: config.mongoDb
  });
  console.log(`MongoDB connected: ${config.mongoDb}.${config.mongoCollection}`);
}

export function getInteractionCollection() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection is not ready");
  return db.collection(config.mongoCollection);
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
  response: string,
  embedding: number[]
): Promise<void> {
  await Interaction.create({
    userId,
    message,
    category,
    response,
    embedding
  });
}
