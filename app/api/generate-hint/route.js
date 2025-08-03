// app/api/generate-hint/route.js
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Enable CORS 
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // or restrict to http://localhost:3000
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request) {
  try {
    const { query, type } = await request.json();

    if (!query || !type) {
      return NextResponse.json({ message: 'Missing query or type' }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant that provides hints for Data Structures and Algorithms problems. Provide clear, concise, and progressive hints. A 'slight' hint should give a small nudge, a 'medium' hint should provide a clearer direction, and a 'full' hint should almost reveal the core idea or algorithm. Ensure the hint is directly relevant to the problem and the requested hint type. Keep it concise and to the point."
      },
      {
        role: "user",
        content: `Problem: "${query}"\n\nProvide a "${type}" hint.`
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedHint = chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't generate a hint.";

    return new NextResponse(JSON.stringify({ hint: generatedHint }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // You can use "http://localhost:3000" if you want to restrict
      },
    });
  } catch (error) {
    console.log(error)
    console.error('Error generating hint:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error', error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
