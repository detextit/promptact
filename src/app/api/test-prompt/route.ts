import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Message } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

async function calculateSimilarityWithEmbeddings(text1: string, text2: string): Promise<number> {
  try {
    const [embedding1, embedding2] = await Promise.all([
      openai.embeddings.create({ input: text1, model: "text-embedding-3-small" }),
      openai.embeddings.create({ input: text2, model: "text-embedding-3-small" })
    ]);

    const vector1 = embedding1.data[0].embedding;
    const vector2 = embedding2.data[0].embedding;

    // Calculate cosine similarity
    const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitude1 * magnitude2);
  } catch (error) {
    console.error('Error calculating similarity:', error);
    return 0;
  }
}

async function generateHint(targetPrompt: string, userPrompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a hint generator. Analyze the target prompt and user's attempt, then provide a SINGLE short hint (max 6 words) that subtly guides them toward the correct prompt. Be cryptic but helpful. Never directly reveal the answer."
        },
        {
          role: "user",
          content: `Target prompt: "${targetPrompt}"\nUser's attempt: "${userPrompt}"\nProvide a short hint.`
        }
      ],
      temperature: 0.7,
      max_tokens: 50
    });

    return completion.choices[0].message.content || "Consider a different approach.";
  } catch (error) {
    console.error('Error generating hint:', error);
    return "Rethink your strategy.";
  }
}

export async function POST(request: Request) {
  try {
    const { userPrompt, targetConversation } = await request.json()
    const systemMessage = targetConversation.find(
      (msg: Message) => msg.role === 'system'
    )

    const userMessage = targetConversation.find(
      (msg: Message) => msg.role === 'user'
    )

    if (!systemMessage || !userMessage || !userMessage.content) {
      throw new Error('Invalid messages')
    }

    // Calculate similarity using embeddings
    const similarityScore = await calculateSimilarityWithEmbeddings(
      systemMessage.content,
      userPrompt
    )

    // Generate a hint based on the comparison
    const hint = await generateHint(systemMessage.content, userPrompt)

    // Test the user's prompt with the conversation
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: 'system', content: userPrompt },
        { role: 'user', content: userMessage.content }
      ]
    })

    return NextResponse.json({
      score: similarityScore,
      hint: hint,
      response: completion.choices[0].message.content
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error processing prompt' },
      { status: 500 }
    )
  }
} 