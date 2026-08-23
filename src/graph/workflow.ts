import {
  StateGraph,
  START,
  END,
  Annotation,
} from "@langchain/langgraph";

import {
  classifyNode,
  memoryNode,
  responseNode,
} from "./nodes.js";

const State = Annotation.Root({
  userId: Annotation<string>(),
  message: Annotation<string>(),
  category: Annotation<string>(),
  memories: Annotation<any[]>(),
  response: Annotation<string>(),
});

export const workflow = new StateGraph(State)
  // Nodes
  .addNode("classify", classifyNode)
  .addNode("memory", memoryNode)
  .addNode("generateResponse", responseNode)

  // Flow
  .addEdge(START, "classify")
  .addEdge("classify", "memory")
  .addEdge("memory", "generateResponse")
  .addEdge("generateResponse", END)

  .compile();