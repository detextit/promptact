import { useState } from 'react';
import { Level } from '@/types';

interface GameLevelProps {
  level: Level;
  onComplete: () => void;
}

export default function GameLevel({ level, onComplete }: GameLevelProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [result, setResult] = useState<null | { 
    score: number;
    response: string;
    passed?: boolean;
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
    const passed = data.score >= 0.5;
    setResult({ ...data, passed });
  };

  const ChatMessage = ({ role, content }: { role: string; content: string }) => (
    <div className={`rounded-lg p-4 ${role === 'AI' ? 'bg-white' : 'bg-green-50'}`}>
      <div className="text-gray-600 text-sm font-medium mb-1">{role}</div>
      <div className="text-gray-800">{content}</div>
    </div>
  );

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Target Side */}
      <div className="bg-amber-400 p-8 relative">
        <div className="absolute top-8 right-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span className="text-xl">💡</span>
            Show Hint
          </button>
        </div>

        <div className="bg-black text-white py-2 px-4 rounded-lg inline-block mb-8">
          <h2 className="text-xl font-bold">Target Conversation</h2>
        </div>

        <div className="space-y-6">
          <div className="bg-cream-50 rounded-lg p-4">
            <div className="text-gray-700 font-medium mb-2">System Prompt:</div>
            <div className="text-gray-600 min-h-[60px] flex items-center">
              {result?.score && result.score >= 0.5 
                ? level.targetConversation[0].content 
                : '🔒 Get 50% similarity score to reveal the system prompt'}
            </div>
          </div>

          <div className="space-y-4">
            <ChatMessage 
              role="User" 
              content={level.targetConversation[1].content} 
            />
            <ChatMessage 
              role="AI" 
              content={level.targetConversation[2].content} 
            />
          </div>

          {showHint && (
            <div className="bg-white/90 rounded-lg p-4 mt-8">
              <div className="font-medium mb-1">Hint:</div>
              <div className="text-gray-700">{level.hint}</div>
            </div>
          )}
        </div>
      </div>

      {/* User Side */}
      <div className="bg-blue-400 p-8">
        <div className="bg-black text-white py-2 px-4 rounded-lg inline-block mb-8">
          <h2 className="text-xl font-bold">
            {result 
              ? `${(result.score * 100).toFixed(1)}% match!`
              : 'Your Attempt'
            }
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4">
            <div className="text-gray-700 font-medium mb-2">Your System Prompt:</div>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Write your system prompt here..."
              className="w-full h-[60px] text-gray-800 resize-none focus:outline-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Test Prompt
          </button>

          {result && (
            <div className="space-y-4">
              {result.score < 0.5 && (
                <div className="bg-white/90 rounded-lg p-4">
                  <div className="text-sm">
                    💡 {result.score < 0.3 
                      ? "Focus on the role and style"
                      : "Consider the response structure"
                    }
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <ChatMessage 
                  role="User" 
                  content={level.targetConversation[1].content} 
                />
                <ChatMessage 
                  role="AI" 
                  content={result.response} 
                />
              </div>

              {result.passed && (
                <button
                  onClick={onComplete}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg mt-4"
                >
                  Next Level →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 