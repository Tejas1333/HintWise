import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import hintHistory from '@/models/hintHistory';

// export async function GET(request) {
//   try {
//     await connectDB(); // Connect to the database
//     const users = await User.find({}); // Find all users
//     return NextResponse.json({ success: true, data: users }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: error.message }, { status: 400 });
//   }
// }

export async function POST(request) {
  try {
    await connectDB(); // Connect to the database

    const { initialHintType, hintResponse } = await request.json();

    // ✅ Capture the newly created document in a variable
    const newHintEntry = await hintHistory.create({ initialHintType, hintResponse });

    // ✅ Return the new document
    return NextResponse.json({ success: true, data: newHintEntry }, { status: 201 });

  } catch (error) {
    // This part is good!
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}