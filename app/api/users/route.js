import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import SessionHistory from '@/models/hintHistory';

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
  console.log("--- API ROUTE HIT ---");
  try {

    await connectDB(); // Connect to the database

    const body  = await request.json();
        console.log("Received Body:", JSON.stringify(body, null, 2));


    const { problemQuery , hintResponse } = body

    if(!problemQuery || !hintResponse || !Array.isArray(hintResponse)) {
      return NextResponse.json({ success: false, error: "Missing or invalid data." }, { status: 400 });
    }

    // ✅ Capture the newly created document in a variable
    const newHintEntry = await SessionHistory.create({ 
      problemQuery : problemQuery,
      hints : hintResponse
     });

         console.log("MongoDB Operation Result:", newHintEntry);


    // ✅ Return the new document
    return NextResponse.json({ success: true, data: newHintEntry }, { status: 201 });

  } catch (error) {
    // This part is good!
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}