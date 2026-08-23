import { gemini } from "../llm/gemini.js";
import { embedDocument, embedQuery } from "../llm/embeddings.js";
import { saveInteraction } from "../db/mongo.js";
import { semanticSearch } from "../db/vector-search.js";
import { GraphState } from "../types.js";
import { classifyRequest } from "./classifier.js";

export async function classifyNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  return {
    category: await classifyRequest(state.message)
  };
}

export async function memoryNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const queryVector = await embedQuery(state.message);
  const memories = await semanticSearch(state.userId, queryVector, 5);

  return { memories };
}

export async function responseNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const memories = (state.memories ?? [])
    .map(
      (m, index) =>
        `Memory ${index + 1} (similarity ${m.score?.toFixed(3) ?? "n/a"}):\n` +
        `Previous request: ${m.message}\nPrevious response: ${m.response}`
    )
    .join("\n\n");

  const prompt = `You are Skill Twin, an AI assistant that learns from previous interactions.

Current request category: ${state.category ?? "general"}

Semantically relevant previous interactions:
${memories || "No relevant previous interactions found."}

Current request:
${state.message}

Use previous interactions only when relevant. Do not mention the internal memory/vector-search mechanism unless the user asks about it. Give a clear, useful answer.`;

  const result = await gemini.invoke(prompt);
  const response = String(result.content);

  // Store the current interaction as a vector memory for future semantic retrieval.
  const memoryText = `User request: ${state.message}\nAssistant response: ${response}`;
  const embedding = await embedDocument(memoryText);

  await saveInteraction(
    state.userId,
    state.message,
    state.category ?? "general",
    response,
    embedding
  );

  return { response };
}
