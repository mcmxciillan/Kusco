import React from 'react'

interface NoteInputAreaProps {
  value: string
  onChange: (text: string) => void
  onSend?: () => void
  disabled?: boolean
}

const NoteInputArea: React.FC<NoteInputAreaProps> = ({ value, onChange, onSend, disabled }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey && onSend && !disabled) {
      event.preventDefault()
      onSend()
    }
  }

  return (
    <div className="note-input-area">
      <textarea
        placeholder="Type your note or message here... (Enter to send, Shift+Enter for new line)"
        value={value}
        onChange={(e): void => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={disabled}
        aria-label="Note input area"
      />
      {onSend && <button onClick={onSend} disabled={disabled || !value.trim()}>Send</button>}
    </div>
  )
}

export default NoteInputArea