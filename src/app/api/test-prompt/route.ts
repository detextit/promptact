import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { Message } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Simple cosine similarity function
function calculateSimilarity(str1: string, str2: string): number {
  // This is a basic implementation - you might want to use a more sophisticated approach
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '')
  const s1 = normalize(str1)
  const s2 = normalize(str2)
  
  // Calculate word overlap as a simple similarity metric
  const words1 = Array.from(new Set(s1.split(/\s+/)))
  const words2 = new Set(s2.split(/\s+/))
  const intersection = words1.filter(x => words2.has(x))
  
  return intersection.length / Math.max(words1.length, words2.size)
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

    if (!userMessage || !userMessage.content) {
      throw new Error('Invalid user message')
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: 'system', content: userPrompt },
        { role: 'user', content: userMessage.content }
      ]
    })

    if (!completion.choices[0].message.content) {
      throw new Error('Invalid response')
    }

    const similarityScore = calculateSimilarity(systemMessage.content, userPrompt)

    return NextResponse.json({
      score: similarityScore,
      response: completion.choices[0].message.content
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error processing prompt' },
      { status: 500 }
    )
  }
} 