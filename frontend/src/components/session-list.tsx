"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Session } from "@/types/chat";

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
  onDelete: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
}: SessionListProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-zinc-50 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b p-3">
        <span className="text-sm font-semibold">Sessions</span>
        <Button variant="ghost" size="icon" onClick={onNew} className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800 ${
                session.id === activeSessionId
                  ? "bg-zinc-200 dark:bg-zinc-800"
                  : ""
              }`}
              onClick={() => onSelect(session.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate">
                  {session.preview || "New conversation"}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(session.created_at + "Z").toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
