"use client";

import { useState, useEffect, useCallback } from "react";
import { Chat } from "@/components/chat";
import { SessionList } from "@/components/session-list";
import { fetchSessions, fetchSessionMessages, deleteSession } from "@/lib/api";
import { Message, Session } from "@/types/chat";

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const loadSessions = useCallback(async () => {
    const data = await fetchSessions();
    setSessions(data);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSelectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    const msgs = await fetchSessionMessages(sessionId);
    setMessages(msgs);
  }, []);

  const handleNewSession = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
  }, []);

  const handleDeleteSession = useCallback(
    async (sessionId: string) => {
      await deleteSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    },
    [activeSessionId, loadSessions],
  );

  const handleSessionCreated = useCallback(
    (sessionId: string) => {
      setActiveSessionId(sessionId);
      loadSessions();
    },
    [loadSessions],
  );

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-black">
      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewSession}
        onDelete={handleDeleteSession}
      />
      <div className="flex-1">
        <Chat
          sessionId={activeSessionId}
          messages={messages}
          onMessagesChange={setMessages}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
