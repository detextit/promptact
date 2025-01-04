import { useState, useEffect } from 'react';
import { Level } from '@/types';
import ReactMarkdown from 'react-markdown';
import { Righteous } from 'next/font/google';
import { useSwipeable } from 'react-swipeable';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [activePanel, setActivePanel] = useState<'target' | 'user'>('target');
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [lastSubmittedPrompt, setLastSubmittedPrompt] = useState('');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  useEffect(() => {
    setUserPrompt('');
    setResult(null);
    setCurrentHintIndex(0);
    setAttempts(0);
    setActivePanel('target');
    setLastSubmittedPrompt('');
  }, [level.number]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    if (userPrompt === lastSubmittedPrompt) {
      setShowDuplicateWarning(true);
      setTimeout(() => setShowDuplicateWarning(false), 3000); // Hide warning after 3 seconds
      return;
    }

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
      setLastSubmittedPrompt(userPrompt);

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
        {role === "Your AI" && (
          <div className="invisible group-hover:visible absolute right-0 top-0 transform -translate-y-full bg-blue-900 text-white text-xs px-2 py-1 rounded-md shadow-lg max-w-[200px] md:max-w-none md:whitespace-nowrap">
            Response generated with Your AI Instructions
          </div>
        )}
      </div>
      <div className="text-gray-800 prose prose-sm max-h-[30vh] overflow-y-auto">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );

  // Add swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setActivePanel('user'),
    onSwipedRight: () => setActivePanel('target'),
    trackMouse: false
  });

  return (
    <div {...swipeHandlers} className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Mobile Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 md:hidden">
        <div className="flex justify-between items-center p-4">
          <button
            onClick={() => setActivePanel('target')}
            className={`${righteous.className} px-4 py-2 rounded-lg transition-all ${
              activePanel === 'target' 
                ? 'bg-amber-400 text-amber-900' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Target
          </button>
          <button
            onClick={() => setActivePanel('user')}
            className={`${righteous.className} px-4 py-2 rounded-lg transition-all ${
              activePanel === 'user' 
                ? 'bg-blue-400 text-blue-900' 
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            Your Input
          </button>
        </div>
      </div>

      {/* Target Side */}
      <div className={`bg-amber-400 p-8 relative transition-transform duration-300 md:translate-x-0 ${
        activePanel === 'target' || window.innerWidth >= 768 ? 'translate-x-0' : '-translate-x-full'
      } ${activePanel === 'target' ? 'min-h-screen' : 'hidden md:block'}`}>
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-amber-900 inline-flex items-center gap-2">
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

          {/* Intel section with navigation */}
          <div className="bg-white/90 rounded-lg p-4">
            <div className="text-gray-700 prose prose-sm">
              <div className={`${righteous.className} text-amber-800 text-sm font-medium mb-1 tracking-wide flex justify-between items-center gap-2`}>
                <span>MISSION INTEL</span>
                {level.hint.length > 1 && (
                  <span className="text-sm text-amber-700">
                    {currentHintIndex + 1} / {level.hint.length}
                  </span>
                )}
              </div>
              <ReactMarkdown>{level.hint[currentHintIndex]}</ReactMarkdown>
              {level.hint.length > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentHintIndex(i => Math.max(0, i - 1))}
                    disabled={currentHintIndex === 0}
                    className={`${righteous.className} text-amber-900 hover:text-amber-700 disabled:opacity-50 text-sm`}
                  >
                    ← Previous Intel
                  </button>
                  <button
                    onClick={() => setCurrentHintIndex(i => Math.min(level.hint.length - 1, i + 1))}
                    disabled={currentHintIndex === level.hint.length - 1}
                    className={`${righteous.className} text-amber-900 hover:text-amber-700 disabled:opacity-50 text-sm`}
                  >
                    Next Intel →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Side */}
      <div className={`bg-blue-400 p-8 relative transition-transform duration-300 md:translate-x-0 ${
        activePanel === 'user' || window.innerWidth >= 768 ? 'translate-x-0' : 'translate-x-full'
      } ${activePanel === 'user' ? 'min-h-screen' : 'hidden md:block'}`}>
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-blue-900 inline-flex items-center gap-2">
            {result 
              ? <>
                  <span>📊</span>
                  <span className="text-base md:text-2xl">
                    Score: {(result.score * 100).toFixed(1)}% / Required: {(level.minimumScore * 100).toFixed(1)}%
                  </span>
                </>
              : <>
                  <span>🎮</span>
                  Guess the Prompt!
                </>
            }
          </h2>
          
          <div className={`${righteous.className} mt-4 flex items-center justify-center gap-2`}>
            <div className="bg-blue-900/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-flex items-center gap-3">
              <span className="text-blue-900 tracking-wide">ATTEMPTS:</span>
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
              YOUR AI INSTRUCTIONS:
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

          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center relative">
            <button
              onClick={handleSubmit}
              disabled={isProcessing || !userPrompt.trim() || hasReachedMaxTries}
              className={`${righteous.className} relative bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 md:px-8 py-3 rounded-lg text-sm md:text-base shadow-lg transition-all ${
                !isProcessing && !hasReachedMaxTries && userPrompt.trim() 
                  ? 'hover:scale-105 border-2 border-white/80' 
                  : ''
              } flex-1 md:flex-none md:w-40`}
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

            {/* Duplicate Warning */}
            {showDuplicateWarning && (
              <div className="absolute -top-12 left-0 right-0 bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg text-sm text-center animate-fade-in">
                You've already tried this prompt. Update the prompt and try again.
              </div>
            )}

            <button
              onClick={onComplete}
              className={`${righteous.className} bg-transparent border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-4 md:px-6 py-3 rounded-lg text-sm md:text-base shadow-lg transition-all hover:scale-105 flex-1 md:flex-none`}
            >
              {hasReachedMaxTries ? 'NEXT MISSION ▶︎' : 'SKIP MISSION ▶︎▶︎'}
            </button>
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

          {result && !isProcessing && (
            <div className="space-y-4">
              {result.score < level.minimumScore && (
                <div className="bg-white/90 rounded-lg p-4">
                  <div className="text-sm space-y-3">
                    <div className={`${righteous.className} text-blue-900 text-sm font-medium mb-2 tracking-wide flex items-center gap-2`}>
                      <span>📡 Feedback to Improve Decryption</span>
                    </div>
                    <div className="text-gray-700">
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
                  className={`${righteous.className} w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-sm md:text-base mt-8 shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2`}
                >
                  <span>🌟</span>
                  <span className="text-sm md:text-base">
                    MISSION COMPLETE! PROCEED TO NEXT OBJECTIVE →
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Updated Mobile Swipe Hint */}
      {showSwipeHint && (
        <div className="fixed bottom-4 left-0 right-0 text-center md:hidden animate-fade-out">
          <div className={`${righteous.className} text-sm text-gray-600 bg-white/80 mx-auto inline-block px-4 py-2 rounded-full`}>
            Swipe left/right to switch views
          </div>
        </div>
      )}
    </div>
  );
} 