import { useState } from 'react';
import { Level } from '@/types';
import ChatHistory from './ChatHistory';

interface GameLevelProps {
  level: Level;
  onComplete: () => void;
}

export default function GameLevel({ level, onComplete }: GameLevelProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [result, setResult] = useState<null | { score: number; response: string }>(null);

  const handleSubmit = async () => {
    // Here you would implement the logic to test the user's prompt
    // against the target conversation using your AI service
    const response = await fetch('/api/test-prompt', {
      method: 'POST',
      body: JSON.stringify({
        userPrompt,
        targetConversation: level.targetConversation,
      }),
    });
    
    const data = await response.json();
    setResult(data);
    
    if (data.score >= 0.8) { // 80% similarity threshold
      onComplete();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="bg-amber-400 p-8">
        <h2 className="text-2xl font-bold mb-4">Level {level.number}</h2>
        <ChatHistory conversation={level.targetConversation} />
      </div>
      
      <div className="bg-blue-400 p-8">
        <div className="mb-4">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Write your system prompt here..."
            className="w-full h-32 p-4 rounded"
          />
        </div>
        
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Test Prompt
        </button>

        {result && (
          <div className="mt-4">
            <p>Similarity Score: {result.score * 100}%</p>
            <p>AI Response: {result.response}</p>
          </div>
        )}
      </div>
    </div>
  );
} 