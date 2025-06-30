import React from 'react'

interface ClientSearchInputProps {
  value: string
  onChange: (searchTerm: string) => void
}

const ClientSearchInput: React.FC<ClientSearchInputProps> = ({ value, onChange }) => {
  return (
    <div className="client-search-input">
      <input
        type="text"
        placeholder="Search clients..."
        value={value}
        onChange={(e): void => onChange(e.target.value)}
        aria-label="Search clients"
      />
    </div>
  )
}

export default ClientSearchInput