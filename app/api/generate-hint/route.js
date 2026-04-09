// route.js
import { runHintwisePipeline } from "@/lib/hintwise-v2/orchestrator";
import connectDB from "@/lib/connectDB";
import Session from "@/models/session";

export async function POST(req) {
  await connectDB();

const { query, action, sessionId, userAttempt } = await req.json();
  // 🔍 Load existing session
  let session = await Session.findOne({ sessionId });

  let state = session?.state || {};
  let userProfile = session?.userProfile || {};

const input = userAttempt && userAttempt.trim() !== "" 
  ? userAttempt 
  : query;

const response = await runHintwisePipeline(
  input,
  action,
  state,
  userProfile
);

  // 💾 Save updated state
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