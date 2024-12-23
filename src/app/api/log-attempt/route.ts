import { NextResponse } from 'next/server';

interface AttemptLog {
  levelNumber: number;
  userPrompt: string;
  targetPrompt: string;
  score: number;
  passed: boolean;
  timestamp: string;
}

export async function POST(request: Request) {
  try {
    const data: AttemptLog = await request.json();
    
    console.log('ATTEMPT:', JSON.stringify({
      ...data,
    }));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging attempt:', error);
    return NextResponse.json(
      { error: 'Failed to log attempt' },
      { status: 500 }
    );
  }
} 
