'use client'

import { useState } from 'react'
import GameLevel from '@/components/GameLevel'
import { levels } from '@/data/levels'

export default function Home() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

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
      onComplete={() => setCurrentLevel(prev => prev + 1)}
    />
  )
} 