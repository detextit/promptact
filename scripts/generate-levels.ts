import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { CSVPrompt, Level, Message } from './types';

// Read and parse CSV
const csvPath = path.join(process.cwd(), 'src/data/prompts.csv');
const fileContent = fs.readFileSync(csvPath, 'utf-8');
const prompts = parse(fileContent, {
  columns: true,
  skip_empty_lines: true
}) as CSVPrompt[];

// Sort prompts by difficulty
const sortedPrompts = [...prompts].sort((a, b) => 
  parseInt(a.difficulty) - parseInt(b.difficulty)
);

// Convert prompts to levels
const levels: Level[] = sortedPrompts.map((prompt, index) => ({
  number: index + 1,
  targetConversation: [
    { role: 'system' as const, content: prompt.prompt },
    { role: 'user' as const, content: prompt.user },
    { role: 'assistant' as const, content: prompt.assistant }
  ] as Message[],
  hint: JSON.parse(prompt.hints),
  minimumScore: Math.max(0.3, 0.8 - (parseInt(prompt.difficulty) * 0.1))
}));

// Write the generated levels to a JSON file
const outputPath = path.join(process.cwd(), 'src/data/generated-levels.json');
fs.writeFileSync(outputPath, JSON.stringify(levels, null, 2));

console.log(`Generated ${levels.length} levels`); 