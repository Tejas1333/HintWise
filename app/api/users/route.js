// api/users/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import SessionHistory from '@/models/hintHistory';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { sessionId, problemQuery, hintResponse } = body;

    if (!sessionId || !problemQuery || !hintResponse || !Array.isArray(hintResponse)) {
      return NextResponse.json({ success: false, error: "Missing or invalid data." }, { status: 400 });
    }

    // UPDATED: Use findOneAndUpdate to "update-or-create" (upsert)
    const updatedSession = await SessionHistory.findOneAndUpdate(
      { sessionId: sessionId }, // The filter to find the document
      { // The data to set or update
        $set: {
          problemQuery: problemQuery,
          hints: hintResponse
        }
      },
      {
        new: true,      // Return the modified document instead of the original
        upsert: true    // Create a new document if one does not exist
      }
    );

    return NextResponse.json({ success: true, data: updatedSession }, { status: 200 });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
