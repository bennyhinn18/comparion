"use client";

import { useState } from "react";
import SearchInterface from "@/components/SearchInterface";
import ComparisonResults from "@/components/ComparisonResults";
import SessionSidebar from "@/components/SessionSidebar";
import { Session, ComparisonData } from "@/types";

export default function Home() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    
    try {
      // Create new session
      const newSession: Session = {
        id: Date.now().toString(),
        query,
        timestamp: new Date(),
        results: null,
      };

      // Make API call to backend
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: ComparisonData = await response.json();
      
      // Update session with results
      newSession.results = data;
      setCurrentSession(newSession);
      setSessions(prev => [newSession, ...prev]);

    } catch (error) {
      console.error("Search error:", error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionSelect = (session: Session) => {
    setCurrentSession(session);
  };

  const handleFollowUp = async (followUpQuery: string) => {
    if (!currentSession) return;

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          query: followUpQuery,
          context: currentSession.query,
          sessionId: currentSession.id 
        }),
      });

      if (!response.ok) {
        throw new Error("Follow-up search failed");
      }

      const data: ComparisonData = await response.json();
      
      // Update current session
      const updatedSession = {
        ...currentSession,
        results: data,
      };
      
      setCurrentSession(updatedSession);
      setSessions(prev => 
        prev.map(s => s.id === currentSession.id ? updatedSession : s)
      );

    } catch (error) {
      console.error("Follow-up search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Session Sidebar */}
        <SessionSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={handleSessionSelect}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-card px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-foreground">
                Comparion
              </h1>
              <p className="text-muted-foreground mt-1">
                Smart product comparison powered by AI
              </p>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {!currentSession ? (
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">
                    What would you like to compare?
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Search for any product and get instant AI-powered comparisons
                  </p>
                  <SearchInterface onSearch={handleSearch} isLoading={isLoading} />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                      {currentSession.query}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {currentSession.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  
                  {currentSession.results && (
                    <ComparisonResults 
                      data={currentSession.results} 
                      onFollowUp={handleFollowUp}
                      isLoading={isLoading}
                    />
                  )}
                  
                  {!currentSession.results && isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">
                        Searching and analyzing products...
                      </p>
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
