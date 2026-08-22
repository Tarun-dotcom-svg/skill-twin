import { gemini } from "../llm/gemini.js";
import { getMemories, saveInteraction } from "../db/mongo.js";
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
  return {
    memories: await getMemories(state.userId)
  };
}

export async function responseNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  const memories = (state.memories ?? [])
    .map(
      (m) =>
        `Previous request: ${m.message}\nPrevious response: ${m.response}`
    )
    .join("\n\n");

  const prompt = `You are Skill Twin, an AI assistant that learns from previous interactions.

Current request category: ${state.category ?? "general"}

Previous relevant interactions:
${memories || "No previous interactions found."}

Current request:
${state.message}

Use previous interactions only when relevant. Give a clear, useful answer.`;

  const result = await gemini.invoke(prompt);
  const response = String(result.content);

  await saveInteraction(
    state.userId,
    state.message,
    state.category ?? "general",
    response
  );

  return { response };
}
