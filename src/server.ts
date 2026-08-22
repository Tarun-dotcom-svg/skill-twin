import express from "express";
import { connectMongo } from "./db/mongo.js";
import { config } from "./config.js";
import { skillTwinGraph } from "./graph/workflow.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", async (req, res) => {
  try {
    const { userId = "default", message } = req.body;

    console.log("Incoming request:", {
      userId,
      message
    });

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "message is required"
      });
    }

    console.log("Invoking LangGraph...");

    const result = await skillTwinGraph.invoke({
      userId,
      message
    });

    console.log("LangGraph result:", result);

    return res.json({
      category: result.category,
      response: result.response
    });

  } catch (error) {
    console.error("CHAT ERROR:");
    console.error(error);

    return res.status(500).json({
      error: error instanceof Error
        ? error.message
        : String(error)
    });
  }
});

async function bootstrap() {
  try {
    await connectMongo();

    app.listen(config.port, () => {
      console.log(`Skill Twin running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start Skill Twin:", error);
    process.exit(1);
  }
}

bootstrap();