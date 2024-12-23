# Prompt Ops - AI Prompt Engineering Game

Prompt Ops is an interactive game designed to help users learn and master the art of prompt engineering. Players are challenged to reverse-engineer system prompts by observing AI conversations and crafting their own prompts to match the target behavior.

## Features

- 🎮 Interactive learning experience
- 🎯 Multiple levels with increasing complexity
- 💡 Helpful hints and feedback
- 📊 Real-time similarity scoring
- 🔄 Instant AI response testing
- 🎉 Progress tracking and completion rewards

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/detextit/promptops.git
cd promptops
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```env
OPENAI_API_KEY=your_api_key_here
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## How to Play

1. Each level presents you with a target conversation between a user and an AI
2. Your goal is to figure out the system prompt that generated the AI's response
3. Write your system prompt and test it
4. Get a similarity score of 50% or higher to reveal the target prompt
5. Progress through levels to master different prompt engineering techniques

## Technology Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- React Markdown

## Project Structure

```
promptops/
├── src/
│ ├── app/ # Next.js app router
│ ├── components/ # React components
│ ├── data/ # Game levels and prompts
│ └── types/ # TypeScript definitions
├── public/ # Static assets
└── scripts/ # Level generation scripts
```

## Acknowledgments

- Google Arts & Culture for UI/UX inspiration
