'use client'

import { useState, useEffect } from 'react'
import GameLevel from '@/components/GameLevel'
import { levels } from '@/data/levels'
import { Righteous } from 'next/font/google'
import Cookies from 'js-cookie'
const righteous = Righteous({ weight: '400', subsets: ['latin'] })

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [showSystemPromptModal, setShowSystemPromptModal] = useState(false)

  const handleLevelComplete = () => {
    if (currentLevel === levels.length - 1) {
      setGameCompleted(true)
    } else {
      setCurrentLevel(prev => prev + 1)
    }
  }

  const handleStartGame = () => {
    const hasSeenPromptInfo = Cookies.get('hasSeenPromptInfo')
    if (!hasSeenPromptInfo) {
      setShowSystemPromptModal(true)
    } else {
      setGameStarted(true)
    }
  }

  const handleCloseModal = (doNotShowAgain: boolean) => {
    if (doNotShowAgain) {
      Cookies.set('hasSeenPromptInfo', 'true', { expires: 365 })
    }
    setShowSystemPromptModal(false)
    setGameStarted(true)
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 p-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">🎉 Congratulations!</h1>
          <p className="text-xl mb-8">
            You've completed all levels and mastered the art of prompt engineering!
          </p>
          <div className="space-y-4">
            <p className="text-lg">
              You've learned how to craft effective prompts and understand the nuances of AI communication.
            </p>
            <p className="text-lg">
              Keep practicing and experimenting with different prompts to become even better!
            </p>
          </div>
          <button
            onClick={() => {
              setGameCompleted(false)
              setGameStarted(false)
              setCurrentLevel(0)
            }}
            className="mt-8 bg-white text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg text-xl font-medium transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        {showSystemPromptModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl">
              <h3 className={`${righteous.className} text-2xl text-blue-900 mb-4`}>
                Understanding System Prompts 🤖
              </h3>
              <div className="prose prose-sm text-gray-700 mb-6">
                <p>
                  A system prompt is a set of instructions given to an AI that defines how it should behave and respond.
                  Think of it as setting the AI's personality and rules of engagement.
                </p>
                <p>
                  For example, a system prompt might tell the AI to:
                </p>
                <ul>
                  <li>Act as a helpful coding tutor</li>
                  <li>Respond in the style of Shakespeare</li>
                  <li>Always provide step-by-step explanations</li>
                </ul>
                <p className="font-bold text-lg text-blue-600 border-l-4 border-blue-600 pl-4 my-4">
                  Your mission is to figure out what system prompt was used to generate the AI's responses in each level.
                </p>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    onChange={(e) => handleCloseModal(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Don't show this again
                </label>
                <button
                  onClick={() => handleCloseModal(false)}
                  className={`${righteous.className} bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors`}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl w-full text-center space-y-8">
          <div className={righteous.className}>
            <h1 className="text-5xl font-bold text-amber-400 mb-4 tracking-wider">
              PROMPTACT
            </h1>
            <p className="text-blue-400 text-xl mb-8">
              TACTICAL PROMPT ENGINEERING SIMULATOR
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur">
            <p className="text-gray-300 mb-6">
              Your mission: Reverse engineer AI system prompts through tactical observation and analysis.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-amber-400 text-2xl mb-2">🎯</div>
                <div className="text-gray-300 text-sm">
                  Analyze Target Behavior
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-amber-400 text-2xl mb-2">💡</div>
                <div className="text-gray-300 text-sm">
                  Deploy Strategic Prompts
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-amber-400 text-2xl mb-2">⚡</div>
                <div className="text-gray-300 text-sm">
                  Master AI Response Patterns
                </div>
              </div>
            </div>

            <button
              onClick={handleStartGame}
              className={`${righteous.className} inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 px-8 py-3 rounded-lg text-lg font-bold shadow-lg transition-all hover:scale-105`}
            >
              <span>▶️</span>
              BEGIN MISSION
            </button>
          </div>

          <div className="text-gray-500 text-sm">
            {levels.length} missions available • Difficulty increases with each level
          </div>
        </div>
      </main>
    )
  }

  return (
    <GameLevel
      level={levels[currentLevel]}
      onComplete={handleLevelComplete}
    />
  )
} 