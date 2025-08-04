// app/api/generate-hint/route.js
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { query, type } = await request.json();
    console.log(`Query: ${query}, HintType: ${type}`);

    if (!query || !type) {
      return NextResponse.json({ response: "Enter query and type" });
    }

    const promt = [
      {
        role: "system",
        content: `
          You are an expert AI assistant specializing in Data Structures and Algorithms (DSA). Your role is to provide a single, concise hint for a given problem based on the requested hint type.

          **Hint Type Definitions:**
          - **slight**: Focus on the absolute first step. Ask a sharp, leading question about the problem's core requirement or constraints. Do NOT mention any specific data structure or algorithm. Example for "Two Sum": "For each number you inspect, how do you know what number you're looking for?"
          - **medium**: Name the key data structure or algorithm needed. Briefly explain *why* it is useful for this problem to guide the user's thinking. Example for "Two Sum": "Use a hash map. This allows you to store numbers you've already seen and check for the existence of their complement in constant O(1) time."
          - **full**: Provide a detailed, step-by-step explanation of the optimal algorithm. Conclude with clear, language-agnostic pseudocode that outlines the logic, variables, and control flow. Example for "Two Sum": "We iterate through the array once, using a hash map to store elements we've seen. For each element, we calculate the required complement. If the complement is already in our map, we've found our pair. If not, we add the current element and its index to the map.

          **Pseudocode:**
          function findTwoSum(nums, target):
            map = new HashMap()
            for i from 0 to length(nums) - 1:
              complement = target - nums[i]
              if map.contains(complement):
                return [map.get(complement), i]
              map.put(nums[i], i)
            // Return an indication of no solution found
            return []
          end function
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

    console.log(`Result: ${result}`);

    return NextResponse.json({ hintResponse: result });
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
