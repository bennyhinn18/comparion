"use client";

import { useState, useEffect } from "react";
import SearchInterface from "@/components/SearchInterface";
import ComparisonResults from "@/components/ComparisonResults";
import SessionSidebar from "@/components/SessionSidebar";
import { Session, SearchResponse, Message } from "@/types";
import { User, Bot, Plus, Trash2 } from "lucide-react";

export default function Home() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("comparion_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        const revived = parsed.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        }));
        setSessions(revived);
        if (revived.length > 0) {
          setCurrentSession(revived[0]);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save sessions whenever they change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("comparion_sessions", JSON.stringify(sessions));
    }
  }, [sessions]);

  const processQuery = async (query: string, existingSession?: Session, isRetry = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const userMessage: Message = { role: "user", content: query };
      
      let sessionToUpdate: Session;
      
      if (existingSession) {
        if (isRetry) {
          sessionToUpdate = existingSession;
        } else {
          sessionToUpdate = {
            ...existingSession,
            messages: [...existingSession.messages, userMessage]
          };
        }
      } else {
        sessionToUpdate = {
          id: Date.now().toString(),
          query,
          timestamp: new Date(),
          messages: [userMessage],
        };
      }

      setCurrentSession(sessionToUpdate);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          history: sessionToUpdate.messages 
        }),
      });

      let resData: SearchResponse;
      try {
        resData = await response.json();
      } catch (e) {
        throw new Error("Failed to connect to the server.");
      }
      
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Failed to analyze request. Please try again.");
      }
      
      let updatedSession = { ...sessionToUpdate };

      if (resData.isClarifying && resData.clarificationQuestion) {
        // Add assistant clarification to messages
        updatedSession.messages = [
          ...updatedSession.messages,
          { role: "assistant", content: resData.clarificationQuestion, results: null }
        ];
      } else if (resData.data) {
        // Search is complete, attach results to an assistant message
        updatedSession.messages = [
          ...updatedSession.messages,
          { role: "assistant", content: "Here are the top products I found based on your request:", results: resData.data }
        ];
      }

      setCurrentSession(updatedSession);
      
      if (existingSession) {
        setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      } else {
        setSessions(prev => [updatedSession, ...prev]);
      }

    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    processQuery(query);
  };

  const handleFollowUp = (query: string) => {
    if (currentSession) {
      processQuery(query, currentSession);
    }
  };
  
  const handleRetry = () => {
    if (currentSession && currentSession.messages.length > 0) {
      const lastMsg = currentSession.messages[currentSession.messages.length - 1];
      if (lastMsg.role === 'user') {
        processQuery(lastMsg.content, currentSession, true);
      } else {
        processQuery(currentSession.query, currentSession, true);
      }
    }
  };

  const handleSessionSelect = (session: Session) => {
    setCurrentSession(session);
  };

  const startNewChat = () => {
    setCurrentSession(null);
  };

  const clearSessions = () => {
    setSessions([]);
    setCurrentSession(null);
    localStorage.removeItem("comparion_sessions");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Session Sidebar */}
        <SessionSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={handleSessionSelect}
          onNewChat={startNewChat}
          onClearSessions={clearSessions}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4 shrink-0 flex justify-between items-center">
            <div className="max-w-7xl">
              <h1 className="text-3xl font-bold text-foreground">
                Comparion
              </h1>
              <p className="text-muted-foreground mt-1">
                Smart product comparison powered by AI
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={startNewChat} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-muted/20">
            <div className="max-w-7xl mx-auto px-6 py-8 h-full flex flex-col">
              {!currentSession ? (
                <div className="text-center mt-20">
                  <h2 className="text-2xl font-semibold mb-4">
                    What would you like to compare?
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Search for any product and get instant AI-powered comparisons optimized for India
                  </p>
                  <SearchInterface onSearch={handleSearch} isLoading={isLoading} />
                </div>
              ) : (
                <div className="space-y-6 pb-40">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold">
                      {currentSession.query}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {currentSession.timestamp.toLocaleDateString()}
                    </span>
                  </div>

                  {/* Continuous Chat Flow */}
                  <div className="space-y-8">
                    {currentSession.messages.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-4`}>
                        {/* Chat Bubble */}
                        <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-1">
                              <Bot className="w-5 h-5" />
                            </div>
                          )}
                          <div className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                            msg.role === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm text-lg shadow-sm' 
                              : 'bg-card border shadow-sm text-foreground rounded-tl-sm text-lg'
                          }`}>
                            {msg.content}
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-primary-foreground mt-1">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>

                        {/* Embedded Results for this message */}
                        {msg.results && (
                          <div className="pl-11 pr-4 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2">
                            <ComparisonResults 
                              data={msg.results} 
                              onFollowUp={handleFollowUp}
                              isLoading={isLoading}
                              hideSearchInput={true}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Error State */}
                  {error && !isLoading && (
                    <div className="flex flex-col gap-3 pl-11 mb-6">
                      <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center justify-between shadow-sm">
                        <span>{error}</span>
                        <button 
                          onClick={handleRetry} 
                          className="px-4 py-1.5 bg-destructive text-destructive-foreground rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {isLoading && (
                    <div className="flex gap-3 justify-start items-center text-muted-foreground pl-11 py-4 mb-4">
                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                       <span>Analyzing request and searching the web...</span>
                    </div>
                  )}

                  {/* Always show input at the bottom if not loading and no error */}
                  {!isLoading && !error && (
                    <div className="pt-8 pl-11 border-t border-border/50">
                       <SearchInterface onSearch={handleFollowUp} isLoading={isLoading} hideExamples={true} />
                    </div>
                  )}

                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
