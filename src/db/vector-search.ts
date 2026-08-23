import { EMBEDDING_DIMENSIONS } from "../llm/embeddings.js";
import { config } from "../config.js";
import { getInteractionCollection } from "./mongo.js";
import { Memory } from "../types.js";

const VECTOR_INDEX_DEFINITION = {
  fields: [
    {
      type: "vector",
      path: "embedding",
      numDimensions: EMBEDDING_DIMENSIONS,
      similarity: "cosine"
    },
    {
      type: "filter",
      path: "userId"
    }
  ]
};

async function waitForVectorIndex(collection: any, timeoutMs = 60_000): Promise<void> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const indexes = await collection.listSearchIndexes(config.vectorIndex).toArray();
    const index = indexes.find((item: any) => item.name === config.vectorIndex);

    if (index?.status === "FAILED") {
      throw new Error(
        `MongoDB Vector Search index '${config.vectorIndex}' failed to build: ${index.message ?? "unknown error"}`
      );
    }

    if (index?.queryable === true) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }

  throw new Error(
    `MongoDB Vector Search index '${config.vectorIndex}' was not queryable within 60 seconds.`
  );
}

export async function ensureVectorIndex(): Promise<void> {
  const collection = getInteractionCollection() as any;
  const indexes = await collection.listSearchIndexes(config.vectorIndex).toArray();
  const existing = indexes.find((index: any) => index.name === config.vectorIndex);

  if (existing) {
    const vectorField = existing.latestDefinition?.fields?.find(
      (field: any) => field.type === "vector" && field.path === "embedding"
    );

    if (vectorField?.numDimensions !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `MongoDB Vector Search index '${config.vectorIndex}' is not ${EMBEDDING_DIMENSIONS}-dimensional. ` +
        `Recreate it with numDimensions=${EMBEDDING_DIMENSIONS}.`
      );
    }

    await waitForVectorIndex(collection);
    console.log(`MongoDB Vector Search index '${config.vectorIndex}' is ready`);
    return;
  }

  await collection.createSearchIndex({
    name: config.vectorIndex,
    type: "vectorSearch",
    definition: VECTOR_INDEX_DEFINITION
  });

  console.log(
    `MongoDB Vector Search index '${config.vectorIndex}' creation requested (${EMBEDDING_DIMENSIONS} dimensions)`
  );

  await waitForVectorIndex(collection);
  console.log(`MongoDB Vector Search index '${config.vectorIndex}' is ready`);
}

export async function semanticSearch(
  userId: string,
  queryVector: number[],
  limit = 5
): Promise<Memory[]> {
  if (queryVector.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Query embedding must contain ${EMBEDDING_DIMENSIONS} dimensions, received ${queryVector.length}.`
    );
  }

  const collection = getInteractionCollection();

  const documents = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: config.vectorIndex,
          path: "embedding",
          queryVector,
          numCandidates: Math.max(limit * 20, 100),
          limit,
          filter: { userId }
        }
      },
      {
        $project: {
          _id: 0,
          message: 1,
          response: 1,
          category: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ])
    .toArray();

  return documents.map((doc: any) => ({
    message: doc.message,
    response: doc.response,
    category: doc.category,
    createdAt: doc.createdAt,
    score: doc.score
  }));
}
