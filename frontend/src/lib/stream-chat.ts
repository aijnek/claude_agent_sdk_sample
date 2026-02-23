export interface StreamChatResult {
  sessionId: string | null;
}

export async function streamChat(
  message: string,
  onChunk: (text: string) => void,
  onDone: (result: StreamChatResult) => void,
  sessionId?: string | null,
) {
  const response = await fetch("http://localhost:8001/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: message,
      ...(sessionId && { session_id: sessionId }),
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let receivedSessionId: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6);
      try {
        const event = JSON.parse(json);
        if (event.type === "text") {
          onChunk(event.content);
        } else if (event.type === "done") {
          if (event.session_id) {
            receivedSessionId = event.session_id;
          }
          onDone({ sessionId: receivedSessionId });
          return;
        }
      } catch {
        // ignore malformed JSON
      }
    }
  }

  onDone({ sessionId: receivedSessionId });
}
