import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";

import Session from "@/models/session";
import UserProfile from "@/models/userProfile";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // =====================
    // FETCH DATA
    // =====================
    const userProfile = await UserProfile.findOne({ userId }).lean();

    const sessions = await Session.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    // =====================
    // SAFE DEFAULTS
    // =====================
    const patternScores = userProfile?.pattern_scores || {};
    const mistakeStats = userProfile?.mistake_stats || {};
    const hintDependency = userProfile?.hint_dependency || 0;

    // =====================
    // 🔥 WEAKEST PATTERN
    // =====================
    let weakestPattern = null;
    let minScore = Infinity;

    for (const [pattern, score] of Object.entries(patternScores)) {
      if (score < minScore) {
        minScore = score;
        weakestPattern = pattern;
      }
    }

    // =====================
    // 🔥 RECOMMENDATION
    // =====================
    let recommendation = "Keep practicing consistently.";

    if (weakestPattern) {
      recommendation = `Practice more ${weakestPattern.replace(
        "_",
        " "
      )} problems.`;
    }

    // =====================
    // 🔥 SESSION ANALYTICS
    // =====================
    const sessionAnalytics = sessions.map((s) => {
      const timeSpent =
        new Date(s.updatedAt).getTime() -
        new Date(s.createdAt).getTime();

      return {
        sessionId: s.sessionId,
        problem: s.problemQuery,
        timeSpent, // ms
        hintsUsed: s.state?.hint_usage_count || 0,
        attempts: s.state?.attempt_history?.length || 0,
        struggleScore: s.state?.struggle_score || 0,
      };
    });

    // =====================
    // FINAL RESPONSE
    // =====================
    return NextResponse.json({
      success: true,

      data: {
        // RAW
        patternScores,
        mistakeStats,
        hintDependency,

        // ANALYTICS
        weakestPattern,
        recommendation,
        sessionAnalytics,
      },
    });

  } catch (err) {
    console.error("Dashboard API Error:", err);

    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}