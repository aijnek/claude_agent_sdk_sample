"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageList } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { streamChat } from "@/lib/stream-chat";
import { Message } from "@/types/chat";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSend = useCallback(async (content: string) => {
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

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    try {
      await streamChat(
        content,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          );
        },
        (result) => {
          if (result.sessionId) {
            setSessionId(result.sessionId);
          }
          setIsStreaming(false);
        },
        sessionId,
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "エラーが発生しました。もう一度お試しください。" }
            : msg,
        ),
      );
      setIsStreaming(false);
    }
  }, [sessionId]);

  return (
    <Card className="flex h-[600px] w-full max-w-2xl flex-col">
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
