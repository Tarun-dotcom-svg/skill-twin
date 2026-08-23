import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSIONS = 768;

async function embed(text: string, taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const result = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: {
      outputDimensionality: EMBEDDING_DIMENSIONS,
      taskType
    }
  });

  const values = result.embeddings?.[0]?.values;
  if (!values || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Gemini embedding dimension mismatch. Expected ${EMBEDDING_DIMENSIONS}, received ${values?.length ?? 0}.`
    );
  }

  return values;
}

export function embedDocument(text: string): Promise<number[]> {
  return embed(text, "RETRIEVAL_DOCUMENT");
}

export function embedQuery(text: string): Promise<number[]> {
  return embed(text, "RETRIEVAL_QUERY");
}
