import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",
  mongoUri: process.env.MONGODB_URI ?? "",
};

if (!config.googleApiKey) {
  throw new Error("GOOGLE_API_KEY is missing");
}

if (!config.mongoUri) {
  throw new Error("MONGODB_URI is missing");
}
