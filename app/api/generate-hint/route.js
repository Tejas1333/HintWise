// ===============================
// ✅ route.js (FINAL)
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

  const response = await runHintwisePipeline(
    {
      problemQuery: query,
      userAttempt,
      action,
    },
    state,
    userProfile
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