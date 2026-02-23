export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  created_at: string;
  preview: string | null;
}
