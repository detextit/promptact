import { useState } from 'react';
import { Level } from '@/types';
import ChatHistory from './ChatHistory';

interface GameLevelProps {
  level: Level;
  onComplete: () => void;
}

export default function GameLevel({ level, onComplete }: GameLevelProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [result, setResult] = useState<null | { 
    score: number
    response: string
    passed?: boolean 
  }>(null);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async () => {
    const response = await fetch('/api/test-prompt', {
      method: 'POST',
      body: JSON.stringify({
        userPrompt,
        targetConversation: level.targetConversation,
      }),
    });
    
    const data = await response.json();
    const passed = data.score >= 0.8;
    setResult({ ...data, passed });
    
    if (passed) {
      onComplete();
    }
  };

  const getScoreHint = () => {
    if (!result) return null;
    if (result.score >= 0.8) return null;
    
    const hints = [
      result.score < 0.3 ? "Your prompt seems quite different. Try focusing on the role and style of responses you want." : null,
      result.score < 0.5 ? "Look at how detailed and structured the response is. Your prompt might need to guide the AI more specifically." : null,
      result.score < 0.8 ? "You're getting closer! Consider what specific instructions would help generate this exact style of response." : null,
    ].filter(Boolean);

    return hints[0];
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="bg-amber-400 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Level {level.number}</h2>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-blue-700 hover:text-blue-900 flex items-center gap-2"
            >
              <span className="text-xl">💡</span>
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          </div>
          
          {showHint && (
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4 rounded-r">
              <h3 className="font-semibold mb-1">Hint:</h3>
              <p>{level.hint || "Think about the style and structure of the response you see below."}</p>
            </div>
          )}

          <div className="bg-white/80 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">System Prompt:</h3>
            <p className="text-gray-600">
              {result?.score && result.score >= 0.5 
                ? level.targetConversation[0].content 
                : '🔒 Get 50% similarity score to reveal the system prompt'}
            </p>
          </div>
        </div>
        <ChatHistory 
          conversation={level.targetConversation.filter(msg => msg.role !== 'system')} 
        />
      </div>
      
      <div className="bg-blue-400 p-8">
        <div className="mb-8">
          <div className="bg-white/80 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Your System Prompt:</h3>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Write your system prompt here..."
              className="w-full h-32 p-4 rounded-lg shadow-inner bg-white"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition-colors"
          >
            Test Prompt
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              result.score >= 0.8 
                ? 'bg-green-100 border-2 border-green-500' 
                : result.score >= 0.5 
                  ? 'bg-yellow-100 border-2 border-yellow-500'
                  : 'bg-red-100 border-2 border-red-500'
            }`}>
              <h3 className="font-bold text-lg mb-2">Similarity Score</h3>
              <p className="text-2xl font-bold">
                {(result.score * 100).toFixed(1)}%
              </p>
              {result.passed && (
                <p className="text-green-600 mt-2">
                  🎉 Great job! Proceed to the next level.
                </p>
              )}
              {getScoreHint() && (
                <p className="text-gray-700 mt-2 text-sm">
                  💡 {getScoreHint()}
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">Your Result:</h3>
              <ChatHistory 
                conversation={[
                  { role: 'user', content: level.targetConversation[1].content },
                  { role: 'assistant', content: result.response }
                ]} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 