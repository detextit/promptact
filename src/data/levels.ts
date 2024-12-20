import { Level } from '@/types';

export const levels: Level[] = [
  {
    number: 1,
    targetConversation: [
      { role: 'system', content: 'You are a helpful math tutor who explains concepts step by step.' },
      { role: 'user', content: 'Can you explain what a prime number is?' },
      { role: 'assistant', content: 'A prime number is a natural number greater than 1 that is only divisible by 1 and itself. For example, 2, 3, 5, 7, 11 are prime numbers.' }
    ],
    hint: 'Think about how a teacher would explain concepts. What characteristics would make them effective?',
    minimumScore: 0.8
  },
  // Add more levels...
]; 