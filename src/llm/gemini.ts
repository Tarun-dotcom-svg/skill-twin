import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config.js";

export const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  apiKey: config.googleApiKey,
  temperature: 0.2
});
