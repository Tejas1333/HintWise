import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB";
import SessionHistory from "@/models/hintHistory"; // Make sure to import your model

export async function GET() {
  try {
    await connectDB();

    // This now fetches ALL documents from the collection and sorts them.
    // The sort({ createdAt: -1 }) ensures the most recent sessions appear at the top of the page.
    const allSessions = await SessionHistory.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: allSessions }, { status: 200 });

  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
