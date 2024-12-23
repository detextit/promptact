import { useState, useEffect } from 'react';
import { Level } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Righteous } from 'next/font/google';
const righteous = Righteous({ weight: '400', subsets: ['latin'] });

interface GameLevelProps {
  level: Level;
  onComplete: () => void;
  maxTries?: number;
}

export default function GameLevel({ level, onComplete, maxTries = 3 }: GameLevelProps) {
  const [userPrompt, setUserPrompt] = useState('');
  const [result, setResult] = useState<null | { 
    score: number;
    response: string;
    hint: string;
    passed?: boolean;
  }>(null);
  const [showHint, setShowHint] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    setUserPrompt('');
    setResult(null);
    setShowHint(false);
    setCurrentHintIndex(0);
    setAttempts(0);
  }, [level.number]);

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        body: JSON.stringify({
          userPrompt,
          targetConversation: level.targetConversation,
        }),
      });
      
      const data = await response.json();
      const passed = data.score >= level.minimumScore;
      setResult({ ...data, passed });
      setAttempts(prev => prev + 1);

      await fetch('/api/log-attempt', {
        method: 'POST',
        body: JSON.stringify({
          levelNumber: level.number,
          userPrompt,
          targetPrompt: level.targetConversation[0].content,
          score: data.score,
          passed,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Error processing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const hasReachedMaxTries = attempts >= maxTries;

  const ChatMessage = ({ role, content }: { role: string; content: string }) => (
    <div className={`rounded-lg p-4 ${role === 'User' ? 'bg-green-50' : 'bg-white/90' } shadow-lg group relative`}>
      <div className={`${righteous.className} text-blue-800 text-sm font-medium mb-1 flex items-center gap-2`}>
        {role}
        {role === 'Your AI' && (
          <div className="invisible group-hover:visible absolute right-0 top-0 transform -translate-y-full bg-blue-900 text-white text-xs px-3 py-1 rounded-md shadow-lg whitespace-nowrap">
            Response generated with your input as AI Instructions
          </div>
        )}
      </div>
      <div className="text-gray-800 prose prose-sm max-h-[30vh] overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );

  const toggleHint = () => {
    if (showHint) {
      setCurrentHintIndex(0);
    }
    setShowHint(!showHint);
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Target Side */}
      <div className="bg-amber-400 p-8 relative">
        <div className="absolute top-6 right-8">
          <button
            onClick={toggleHint}
            className={`${righteous.className} text-amber-900 hover:text-amber-700 flex items-center gap-2 text-sm bg-amber-100/50 px-4 py-2 rounded-full transition-all hover:bg-amber-100`}
          >
            <span>🔎</span>
            {showHint ? "CLOSE INTEL" : "REQUEST INTEL"}
          </button>
        </div>

        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-amber-900 inline-flex items-center gap-2">
            <span>🎯</span>
            Target Conversation
          </h2>
        </div>

        <div className="max-w-2xl space-y-6">
          <div>
            <div className="text-amber-900 text-sm font-bold mb-1 uppercase tracking-wide">
              AI INSTRUCTIONS:
            </div>
            <div className={`bg-cream-50/80 rounded-lg p-4 shadow-xl transition-all ${
              ((result?.score && result.score >= level.minimumScore) || hasReachedMaxTries) 
                ? 'animate-glow bg-cream-50' 
                : ''
            }`}>
              <div className="text-gray-600 prose prose-sm">
                {(result?.score && result.score >= level.minimumScore) || hasReachedMaxTries ? (
                  <ReactMarkdown>{level.targetConversation[0].content}</ReactMarkdown>
                ) : (
                  <div className={`${righteous.className} text-amber-800 text-center py-2`}>
                    🔒 ACHIEVE {(level.minimumScore * 100).toFixed(0)}% MATCH TO DECRYPT SYSTEM PROMPT 🔒
                  </div>
                )}
              </div>
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
            <div className="bg-white/90 rounded-lg p-4">
              <div className="text-gray-700 prose prose-sm">
                <ReactMarkdown>{level.hint[currentHintIndex]}</ReactMarkdown>
                {level.hint.length > 1 && (
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={() => setCurrentHintIndex(i => Math.max(0, i - 1))}
                      disabled={currentHintIndex === 0}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      ← Previous Intel
                    </button>
                    <span className="text-sm text-gray-500">
                      {currentHintIndex + 1} / {level.hint.length}
                    </span>
                    <button
                      onClick={() => setCurrentHintIndex(i => Math.min(level.hint.length - 1, i + 1))}
                      disabled={currentHintIndex === level.hint.length - 1}
                      className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Next Intel →
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Side */}
      <div className="bg-blue-400 p-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-blue-900 inline-flex items-center gap-2">
            {result 
              ? <>
                  <span>📊</span>
                  Score: {(result.score * 100).toFixed(1)}% / Required: {(level.minimumScore * 100).toFixed(1)}%
                </>
              : <>
                  <span>🎮</span>
                  Guess the Prompt!
                </>
            }
          </h2>
          
          <div className={`${righteous.className} mt-4 flex items-center justify-center gap-2`}>
            <div className="bg-blue-900/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-flex items-center gap-3">
              <span className="text-blue-900 tracking-wide">SYSTEM ACCESS:</span>
              {[...Array(maxTries)].map((_, i) => (
                <span 
                  key={i} 
                  className={`inline-block w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                    i < maxTries - attempts 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <div>
            <div className={`${righteous.className} text-blue-900 text-sm font-bold mb-1 uppercase tracking-wide`}>
              YOUR INPUT:
            </div>
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your system prompt..."
                className="w-full h-24 text-gray-800 resize-none focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !userPrompt.trim() || hasReachedMaxTries}
                className={`${righteous.className} relative bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg text-base shadow-lg transition-all ${
                  !isProcessing && !hasReachedMaxTries && userPrompt.trim() 
                    ? 'hover:scale-105 border-2 border-white/80' 
                    : ''
                } w-40`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>PROCESSING</span>
                  </div>
                ) : hasReachedMaxTries ? (
                  <span className="flex items-center justify-center gap-2">
                    LOCKED 🔒
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    DEPLOY 🚀
                  </span>
                )}
              </button>

              <button
                onClick={onComplete}
                className={`${righteous.className} bg-transparent border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-6 py-3 rounded-lg text-base shadow-lg transition-all hover:scale-105`}
              >
                {hasReachedMaxTries ? 'NEXT MISSION ▶︎' : 'SKIP MISSION ▶︎▶︎'}
              </button>
            </div>
          </div>

          {hasReachedMaxTries && !result?.passed && (
            <div className="bg-white/90 rounded-lg p-4 mt-4">
              <div className="text-sm space-y-3">
                <div className="text-red-600 font-bold">
                  Maximum attempts reached! AI Instructions revealed.
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-4 animate-pulse">
              <div className="bg-white/90 rounded-lg p-4">
                <div className="flex space-x-4 items-center">
                  <div className="h-4 w-4 bg-blue-200 rounded-full animate-pulse" />
                  <div className="h-4 bg-blue-200 rounded w-3/4" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="h-4 w-24 bg-green-100 rounded mb-2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-green-100 rounded w-full" />
                    <div className="h-4 bg-green-100 rounded w-5/6" />
                  </div>
                </div>
                <div className="bg-white/90 rounded-lg p-4">
                  <div className="h-4 w-24 bg-blue-100 rounded mb-2" />
                  <div className="space-y-2">
                    <div className="h-4 bg-blue-100 rounded w-full" />
                    <div className="h-4 bg-blue-100 rounded w-4/6" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {result && !isProcessing && (
            <div className="space-y-4">
              {result.score < level.minimumScore && (
                <div className="bg-white/90 rounded-lg p-4">
                  <div className="text-sm space-y-3">
                    <div>
                      {result.score < level.minimumScore * 0.6 
                        ? "SIGNAL DETECTED: Adjust tactical approach for better target match"
                        : "NEAR MATCH: Fine-tune parameters for mission success"
                      }
                    </div>
                    <div className="text-gray-600 italic">
                      {result.hint}
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(result.score / level.minimumScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <ChatMessage 
                  role="User" 
                  content={level.targetConversation[1].content} 
                />
                <ChatMessage 
                  role="Your AI" 
                  content={result.response} 
                />
              </div>

              {result.passed && (
                <button
                  onClick={onComplete}
                  className={`${righteous.className} w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-base mt-8 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2`}
                >
                  <span>🌟</span>
                  MISSION COMPLETE! PROCEED TO NEXT OBJECTIVE →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 