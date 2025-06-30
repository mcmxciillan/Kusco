import React from 'react'

interface LLMAssistantOutputProps {
  assistantText: string
}

const LLMAssistantOutput: React.FC<LLMAssistantOutputProps> = ({ assistantText }) => {
  if (!assistantText) {
    return null
  }
  return (
    <div className="llm-assistant-output">
      <h4>Assistant&apos;s Note:</h4>
      <p>{assistantText}</p>
    </div>
  )
}

export default LLMAssistantOutput