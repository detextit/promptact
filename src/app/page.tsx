'use client'

import { useState } from 'react'
import GameLevel from '@/components/GameLevel'
import { levels } from '@/data/levels'

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  const handleLevelComplete = () => {
    if (currentLevel === levels.length - 1) {
      setGameCompleted(true)
    } else {
      setCurrentLevel(prev => prev + 1)
    }
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
      <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-8">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h1 className="text-5xl font-bold mb-6">De Prompt - Fun meets AI</h1>
          <p className="text-xl mb-8">Guess, test, and level up your AI skills - one prompt at a time!</p>
          <button
            onClick={() => setGameStarted(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-xl"
          >
            Start Level 1
          </button>
        </div>
      </div>
    )
  }

  return (
    <GameLevel
      level={levels[currentLevel]}
      onComplete={handleLevelComplete}
    />
  )
} 