import { Level, Message } from '../src/types';

export interface CSVPrompt {
  prompt: string;
  difficulty: string;
  hints: string;
  user: string;
  assistant: string;
}

// Re-export the types we imported
export type { Level, Message }; 