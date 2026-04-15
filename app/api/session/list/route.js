import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import Session from "@/models/session";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      );
    }

    const sessions = await Session.find({ userId })
      .sort({ updatedAt: -1 })
      .select("sessionId problemQuery state.current_step_index updatedAt");

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}