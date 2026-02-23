import { Message, Session } from "@/types/chat";

const API_BASE = "http://localhost:8001";

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchSessionMessages(
  sessionId: string,
): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: { role: string; content: string }[] = await res.json();
  return data.map((m) => ({
    id: crypto.randomUUID(),
    role: m.role as Message["role"],
    content: m.content,
  }));
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
