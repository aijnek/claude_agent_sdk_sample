"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { streamChat } from "@/lib/stream-chat";
import { Message } from "@/types/chat";

interface ChatProps {
  sessionId: string | null;
  messages: Message[];
  onMessagesChange: (updater: (prev: Message[]) => Message[]) => void;
  onSessionCreated: (sessionId: string) => void;
}

export function Chat({
  sessionId,
  messages,
  onMessagesChange,
  onSessionCreated,
}: ChatProps) {
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

      const assistantId = crypto.randomUUID();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      onMessagesChange((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      try {
        await streamChat(
          content,
          (chunk) => {
            onMessagesChange((prev) =>
              prev.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: msg.content + chunk }
                  : msg,
              ),
            );
          },
          (result) => {
            if (result.sessionId) {
              onSessionCreated(result.sessionId);
            }
            setIsStreaming(false);
          },
          sessionId,
        );
      } catch {
        onMessagesChange((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: "エラーが発生しました。もう一度お試しください。",
                }
              : msg,
          ),
        );
        setIsStreaming(false);
      }
    },
    [sessionId, onMessagesChange, onSessionCreated],
  );

  return (
    <Card className="flex h-full w-full flex-col border-0 rounded-none">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <MessageList messages={messages} />
        <MessageInput onSend={handleSend} disabled={isStreaming} />
      </CardContent>
    </Card>
  );
}
