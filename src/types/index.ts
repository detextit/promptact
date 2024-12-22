export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface Level {
  number: number;
  targetConversation: Message[];
  hint: string[];
  minimumScore: number;
} 