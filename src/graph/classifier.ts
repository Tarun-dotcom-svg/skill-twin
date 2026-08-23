import { gemini } from "../llm/gemini.js";
import { RequestCategory } from "../types.js";

export async function classifyRequest(
  message: string
): Promise<RequestCategory> {
  const prompt = `Classify this user request into exactly one category:
coding, learning, career, general.

Return ONLY the category.

Request:
${message}`;

  const result = await gemini.invoke(prompt);
  const category = String(result.content).trim().toLowerCase();

  if (
    category === "coding" ||
    category === "learning" ||
    category === "career"
  ) {
    return category;
  }

  return "general";
}
