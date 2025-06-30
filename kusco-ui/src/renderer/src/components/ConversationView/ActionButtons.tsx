import React, { useState } from 'react'

interface ActionButtonsProps {
  onClear: () => void
  onGenerateNote: (noteType: string) => void
  disabled?: boolean
  onSwitchToNotesTab?: () => void // Add optional callback for tab switch
}

const NOTE_TYPES = ['SOAP', 'DAP', 'BIRP', 'Basic']

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onClear,
  onGenerateNote,
  disabled,
  onSwitchToNotesTab
}) => {
  const [selectedType, setSelectedType] = useState<string>(NOTE_TYPES[0])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedType(e.target.value)
  }

  const handleGenerateClick = (): void => {
    if (onSwitchToNotesTab) onSwitchToNotesTab() // Switch to notes tab immediately
    onGenerateNote(selectedType)
  }

  return (
    <div className="action-buttons" style={{ position: 'relative' }}>
      <button onClick={onClear} disabled={disabled}>
        Clear Input
      </button>
      <select
        className="note-type-select"
        value={selectedType}
        onChange={handleTypeChange}
        disabled={disabled}
        style={{ marginLeft: 8, marginRight: 8 }}
      >
        {NOTE_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <button onClick={handleGenerateClick} disabled={disabled}>
        Generate Note
      </button>
    </div>
  )
}

export default ActionButtons
