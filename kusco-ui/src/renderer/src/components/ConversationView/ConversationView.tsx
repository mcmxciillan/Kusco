import React, { useState, useEffect, useCallback } from 'react'
import ChatDisplay, { type UIMessage } from './ChatDisplay'
import LLMAssistantOutput from './LLMAssistantOutput'
import NoteInputArea from './NoteInputArea'
import ActionButtons from './ActionButtons'
import type { Patient, ChatHistoryEntry } from '../../../../preload/index.d' // Adjust path

interface ConversationViewProps {
  client: Patient
  onClientInteracted: (clientId: string) => void
}

const ConversationView: React.FC<ConversationViewProps> = ({ client, onClientInteracted }) => {
  const [messages, setMessages] = useState<UIMessage[]>([])
  const [assistantText, setAssistantText] = useState<string>('') // For dedicated LLM output area
  const [noteInputValue, setNoteInputValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showNoteLoading, setShowNoteLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async (): Promise<void> => {
      if (!client) return
      setIsLoading(true)
      try {
        const history: ChatHistoryEntry[] = await window.api.getChatHistory(client.id)
        const formattedMessages: UIMessage[] = []
        history.forEach((h) => {
          if (h.user_message) {
            formattedMessages.push({
              id: `${h.id}_user`,
              type: 'user',
              text: h.user_message,
              timestamp: h.timestamp
            })
          }
          if (h.model_response) {
            formattedMessages.push({
              id: `${h.id}_ai`,
              type: 'ai',
              text: h.model_response,
              timestamp: h.timestamp
            })
          }
        })
        setMessages(formattedMessages)
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
        setMessages([{ id: 'error', type: 'system', text: 'Failed to load chat history.' }])
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
    setAssistantText('') // Clear assistant text when client changes
    setNoteInputValue('') // Clear input
  }, [client])

  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!noteInputValue.trim() || !client) return
    const userMessageText = noteInputValue
    const userMessage: UIMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      text: userMessageText
    }

    setMessages((prev) => [...prev, userMessage])
    setNoteInputValue('')
    setIsLoading(true)
    setAssistantText('AI is typing...')

    const newAiMessageId = Date.now().toString() + '_ai_streaming'
    setMessages((prev) => [...prev, { id: newAiMessageId, type: 'ai', text: '' }])

    try {
      // Call the chat endpoint and expect a JSON response
      const response: { model_response?: string; error?: string } = await window.api.postChatMessage(client.id, userMessageText)
      if (response && typeof response === 'object' && 'model_response' in response) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newAiMessageId ? { ...msg, text: response.model_response ?? '' } : msg
          )
        )
        setAssistantText('')
      } else if (response && typeof response === 'object' && 'error' in response) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newAiMessageId ? { ...msg, text: `Error: ${response.error}` } : msg
          )
        )
        setAssistantText('Error receiving response.')
      } else {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === newAiMessageId ? { ...msg, text: 'Unknown error from server.' } : msg
          )
        )
        setAssistantText('Error receiving response.')
      }
      setIsLoading(false)
    } catch (error) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newAiMessageId ? { ...msg, text: (msg.text ?? '') + `\nError: ${error}` } : msg
        )
      )
      setIsLoading(false)
      setAssistantText('Error receiving response.')
    }
    onClientInteracted(String(client.id))
  }, [noteInputValue, client, onClientInteracted])

  const handleClear = (): void => {
    setNoteInputValue('')
    // setAssistantText(''); // Optionally clear assistant text too
  }

  // Add a callback to switch to notes tab and show loading
  const handleSwitchToNotesTab = () => {
    setShowNoteLoading(true)
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('switchToNotesTab'))
    }
  }

  // Replace handleGenerateNote with loading spinner logic
  const handleGenerateNote = async (noteType: string): Promise<void> => {
    if (!client || messages.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_note_info',
          type: 'system',
          text: 'Cannot generate note without a client or messages.'
        }
      ])
      return
    }
    setIsLoading(true)
    setShowNoteLoading(true)
    setAssistantText(`Generating ${noteType} note for ${client.name}...`)
    try {
      // Call the backend to generate the note
      const response = await window.api.generateNote(client.id, noteType)
      setShowNoteLoading(false)
      // Switch to Notes tab and pass the generated note
      if (response?.model_response) {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('noteGenerated', {
              detail: { noteType, note: response.model_response }
            })
          )
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString() + '_note_error',
            type: 'system',
            text: 'Error: Could not generate note.'
          }
        ])
      }
    } catch {
      setShowNoteLoading(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '_note_error',
          type: 'system',
          text: 'Error: Could not generate note.'
        }
      ])
    } finally {
      setIsLoading(false)
      setAssistantText('')
    }
  }

  return (
    <div className="conversation-view">
      <ChatDisplay messages={messages} isLoading={isLoading && messages.length === 0} />
      {assistantText && <LLMAssistantOutput assistantText={assistantText} />}
      <NoteInputArea
        value={noteInputValue}
        onChange={setNoteInputValue}
        onSend={handleSendMessage}
        disabled={isLoading}
      />
      <ActionButtons
        onClear={handleClear}
        onGenerateNote={handleGenerateNote}
        onSwitchToNotesTab={handleSwitchToNotesTab}
        disabled={isLoading}
      />
      {showNoteLoading && (
        <div className="note-loading-spinner" style={{ textAlign: 'center', marginTop: 16 }}>
          <span className="spinner" /> Generating note...
        </div>
      )}
    </div>
  )
}

export default ConversationView
