import { Message } from '@/types'

interface ChatHistoryProps {
  conversation: Message[]
}

export default function ChatHistory({ conversation }: ChatHistoryProps) {
  return (
    <div className="space-y-4">
      {conversation.map((message, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg ${
            message.role === 'assistant'
              ? 'bg-white ml-4'
              : message.role === 'user'
              ? 'bg-green-50'
              : 'bg-gray-50'
          }`}
        >
          <div className="font-semibold text-sm text-gray-600 mb-1">
            {message.role === 'assistant' ? 'AI' : 'User'}
          </div>
          <div className="text-gray-800">{message.content}</div>
        </div>
      ))}
    </div>
  )
} 