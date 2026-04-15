import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";

import Session from "@/models/session";
import UserProfile from "@/models/userProfile";

import { runHintwisePipeline } from "@/lib/hintwise-v2/orchestrator";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      sessionId,
      userId,
      problemQuery,
      userAttempt,
      action,
    } = body;

    let session = await Session.findOne({ sessionId });

    if (!session) {
      session = new Session({
        sessionId,
        userId,
        problemQuery,
        state: {},
      });
    }

    let userProfile = await UserProfile.findOne({ userId });

    if (!userProfile) {
      userProfile = new UserProfile({ userId });
    }

    const result = await runHintwisePipeline(
      { problemQuery, userAttempt, action },
      session.state,
      userProfile
    );

    await session.save();
    await userProfile.save();

    return NextResponse.json({
      success: true,
      data: result,
      history: session.state.hint_history, // 🔥 NEW
      sessionId: session.sessionId,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}