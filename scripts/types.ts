import { Level, Message } from '../src/types';

export interface CSVPrompt {
  category: string;
  name: string;
  prompt: string;
  difficulty: string;
  hint: string;
  user: string;
  assistant: string;
}

// Re-export the types we imported
export type { Level, Message }; 