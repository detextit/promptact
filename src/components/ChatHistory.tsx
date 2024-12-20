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
              ? 'bg-blue-100 ml-4'
              : message.role === 'user'
              ? 'bg-green-100'
              : 'bg-gray-100'
          }`}
        >
          <div className="font-semibold text-sm text-gray-600">
            {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
          </div>
          <div className="mt-1">{message.content}</div>
        </div>
      ))}
    </div>
  )
} 