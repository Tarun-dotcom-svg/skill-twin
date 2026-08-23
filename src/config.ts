import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  googleApiKey: process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY ?? "",
  mongoUri: process.env.MONGODB_URI ?? process.env.MONGO_URI ?? "",
  mongoDb: process.env.MONGODB_DB ?? "skill_twin",
  mongoCollection: process.env.MONGODB_COLLECTION ?? "interactions",
  vectorIndex: process.env.MONGODB_VECTOR_INDEX ?? "skill_twin_vector_index"
};

if (!config.googleApiKey) {
  throw new Error("GOOGLE_API_KEY (or GEMINI_API_KEY) is missing");
}

if (!config.mongoUri) {
  throw new Error("MONGODB_URI (or MONGO_URI) is missing");
}
