"use client";

import { Session } from "@/types";
import { Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SessionSidebarProps {
  sessions: Session[];
  currentSession: Session | null;
  onSessionSelect: (session: Session) => void;
}

export default function SessionSidebar({ sessions, currentSession, onSessionSelect }: SessionSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-card border-r border-border flex flex-col">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 hover:bg-secondary transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Sessions</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-secondary rounded transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-auto p-2">
        {sessions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No sessions yet</p>
            <p className="text-xs mt-1">Start by searching for products</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentSession?.id === session.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <div className="font-medium text-sm line-clamp-2 mb-1">
                  {session.query}
                </div>
                <div className="text-xs opacity-75">
                  {session.timestamp.toLocaleDateString()} {session.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {session.results && session.results.products && (
                  <div className="text-xs opacity-75 mt-1">
                    {session.results.products.length} products found
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Sessions are stored locally in your browser
        </p>
      </div>
    </div>
  );
}
