export type RequestCategory =
  | "coding"
  | "learning"
  | "career"
  | "general";

export interface GraphState {
  userId: string;
  message: string;
  category?: RequestCategory;
  memories?: Memory[];
  response?: string;
}

export interface Memory {
  message: string;
  response: string;
  category: RequestCategory;
  createdAt: Date;
}
