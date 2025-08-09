// app/api/generate-hint/route.js
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function generateHint(query, type) {
if (!query || !type) {
      return NextResponse.json({ response: "Enter query and type" });
    }

    const promt = [
      {
        role: "system",
        content: `
          You are an expert AI assistant specializing in Data Structures and Algorithms.  
          Your job is to generate a single, concise hint for a given problem statement based on a requested hint type: slight, medium, or full.  

          Definitions & Output Rules:  

          1. slight  
            - Goal: Trigger the user's thinking toward the very first step.  
            - Method: Ask one sharp, focused, leading question about the problem’s core requirement, constraints, or a key observation they must notice before proceeding.  
            - Restrictions:  
              - Do NOT mention any specific algorithm, data structure, or optimization.  
              - Do NOT explain the solution.  
              - Must be a question, not a statement.  

          2. medium  
            - Goal: Reveal the key approach without giving the full implementation.  
            - Method: State the essential data structure or algorithm and briefly explain *why* it is relevant to solving the problem.  
            - Restrictions:  
              - No full solution steps or pseudocode.  
              - Keep the explanation short (1–2 sentences).  

          3. full  
            - Goal: Provide a complete, optimal solution explanation.  
            - Method:  
              1. Outline the logical thought process and how to approach the problem.  
              2. Break the solution into clear, ordered steps.  
              3. End with concise, language-agnostic pseudocode that includes variables, control flow, and main operations.  
            - Restrictions:  
              - Pseudocode must be compact but complete enough to implement.  
              - Avoid unnecessary commentary or repetition.  

          General Output Rules:  
          - The output must contain only the hint — no labels like "Here’s your hint" or extra text.  
          - Always follow the format and restrictions for the chosen hint type exactly.  
          - Be direct, precise, and minimal in wording.

          `,
      },
      {
        role: "user",
        content: `Generate a ${type} , for problem ${query}`,
      },
    ];

    console.log(`Promt: ${promt}`);
    const chatCompletion = await groq.chat.completions.create({
      messages: promt,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log(`chatCompletion: ${chatCompletion}`);

    const result = chatCompletion.choices[0]?.message?.content;

    return result
}

async function handleDuplicate(query, type, hints) {
    const maxRetries = 5
    let uniqueHint = ""

    for(let i = 0; i<maxRetries; i++){
      const generatedHint = await generateHint(query, type)

      console.log(`generatedHint: ${generatedHint}`)

      if(!hints.some(hint => hint.content === generatedHint))
      {
        uniqueHint = generatedHint
        break
      }
    }

    if(uniqueHint)
    {
      return uniqueHint
    }else{
     await handleDuplicate(query, type, hints)
    }
}

export async function POST(request) {
  try {
    const { query, type, hints } = await request.json();
    console.log(`Query: ${query}, HintType: ${type}, `);

    const result = await handleDuplicate(query, type, hints)
    return NextResponse.json({ hintResponse : result });

  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
