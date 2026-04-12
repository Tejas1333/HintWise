// ===============================
// ✅ route.js (SAFE RESPONSE)
// ===============================

import { runHintwisePipeline } from "@/lib/hintwise-v2/orchestrator";
import connectDB from "@/lib/connectDB";
import Session from "@/models/session";

export async function POST(req) {
  await connectDB();

  const { query, action, userAttempt, sessionId } = await req.json();

  let session = await Session.findOne({ sessionId });

  let state = session?.state || {};
  let userProfile = session?.userProfile || {};

  const input = userAttempt?.trim()
    ? `${userAttempt}\n${query}\n${action}`
    : query;

  const response = await runHintwisePipeline(
    input,
    action,
    state,
    userProfile,
    query
  );

  await Session.findOneAndUpdate(
    { sessionId },
    {
      sessionId,
      problemQuery: query,
      state,
      userProfile,
    },
    { upsert: true, new: true }
  );

  return Response.json({ hintResponse: response });
}

