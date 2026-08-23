import express from "express";
import { connectMongo } from "./db/mongo.js";
import { ensureVectorIndex } from "./db/vector-search.js";
import { config } from "./config.js";
import { workflow } from "./graph/workflow.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    database: config.mongoDb,
    collection: config.mongoCollection,
    vectorDimensions: 768
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { userId = "default", message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required"
      });
    }

    console.log("Incoming request:", { userId, message });
    console.log("Invoking LangGraph...");

    const result = await workflow.invoke({
      userId,
      message
    });

    return res.json({
      category: result.category,
      response: result.response
    });
  } catch (error) {
    console.error("CHAT ERROR:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error"
    });
  }
});

await connectMongo();
await ensureVectorIndex();

app.listen(config.port, () => {
  console.log(`Skill Twin running on http://localhost:${config.port}`);
});
