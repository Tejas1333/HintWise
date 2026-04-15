"use client";

import { useState, useEffect } from "react";
import FlashCards from "@/components/FlashCards";

const HintAccordion = ({ hint, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
      >
        <span className="font-semibold">
          {hint.type} #{index + 1}
        </span>

        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-4 bg-white">
          <FlashCards
            title={hint.type}
            content={
              hint.type === "SOLUTION"
                ? JSON.stringify(hint.content, null, 2)
                : hint.content
            }
          />
        </div>
      )}
    </div>
  );
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = "user_123"; // 🔥 replace later

  // =====================
  // LOAD ALL SESSIONS
  // =====================
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(
          `/api/session/list?userId=${userId}`
        );
        const data = await res.json();

        setSessions(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // =====================
  // LOAD SINGLE SESSION
  // =====================
  const loadSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/session/${sessionId}`);
      const data = await res.json();

      setSelectedSession(data.data);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================
  // UI
  // =====================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-3xl font-bold text-center mb-6">
        Session History
      </h1>

      {/* ===================== */}
      {/* SESSION LIST */}
      {/* ===================== */}
      {!selectedSession && (
        <div className="space-y-4 max-w-3xl mx-auto">
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center">No sessions found</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.sessionId}
                onClick={() => loadSession(s.sessionId)}
                className="p-4 bg-white rounded-lg shadow cursor-pointer hover:bg-gray-50"
              >
                <h2 className="font-semibold text-lg">
                  {s.problemQuery}
                </h2>

                <p className="text-sm text-gray-500">
                  Step: {s.state?.current_step_index}
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(s.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===================== */}
      {/* SESSION DETAILS */}
      {/* ===================== */}
      {selectedSession && (
        <div className="max-w-3xl mx-auto">

          <button
            onClick={() => {
              setSelectedSession(null);
              setHistory([]);
            }}
            className="mb-4 text-blue-600"
          >
            ← Back
          </button>

          <h2 className="text-2xl font-bold mb-4">
            {selectedSession.problemQuery}
          </h2>

          <div className="space-y-3">
            {history.map((h, i) => (
              <HintAccordion key={i} hint={h} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}