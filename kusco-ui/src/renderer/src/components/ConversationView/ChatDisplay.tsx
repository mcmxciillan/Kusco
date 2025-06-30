import React from 'react'

// Renamed 'sender' to 'type' to avoid conflict with Electron's event.sender
// and to be more generic for UI message types.
export interface UIMessage {
  id: string
  type: 'user' | 'ai' | 'system' // 'system' for info/error messages
  text: string
  timestamp?: string
}

interface ChatDisplayProps {
  messages: UIMessage[]
  isLoading?: boolean
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({ messages, isLoading }) => {
  const chatRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  if (isLoading) {
    return <div className="chat-display-loading">Loading conversation...</div>
  }
  if (!messages.length) {
    return <div className="chat-display-empty">No messages yet. Start the conversation!</div>
  }
  return (
    <div className="chat-display" ref={chatRef} style={{ overflowY: 'auto', maxHeight: '100%' }}>
      {messages.map((msg) => (
        <div key={msg.id} className={`message-bubble message-${msg.type}`}>
          {/* Display placeholder if text is falsy (empty, null, undefined) */}
          {/* This helps identify if the message content is actually missing from the data */}
          <p>{msg.text || '[Message content not available]'}</p>
          {msg.timestamp && (
            <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChatDisplay