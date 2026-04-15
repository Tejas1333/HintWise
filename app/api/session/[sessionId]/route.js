import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Session from "@/models/session";

export async function GET(req, context) {
  try {
    await connectDB();

    const { sessionId } = await context.params; // ✅ FIX

    const session = await Session.findOne({
      sessionId,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
      history: session.state?.hint_history || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}