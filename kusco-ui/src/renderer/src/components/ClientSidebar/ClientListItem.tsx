import React from 'react'

interface ClientListItemProps {
  clientName: string
  lastSessionDate: string
  avatarUrl?: string
  isSelected: boolean
  onClick: () => void
}

const ClientListItem: React.FC<ClientListItemProps> = ({
  clientName,
  lastSessionDate,
  avatarUrl,
  isSelected,
  onClick
}) => {
  const itemClassName = `client-list-item ${isSelected ? 'selected' : ''}`
  return (
    <button
      type="button"
      className={itemClassName}
      onClick={onClick}
      onKeyDown={(e): void => {
        if (e.key === 'Enter') {
          onClick();
        }
      }}
    >
      {avatarUrl && <img src={avatarUrl} alt={`${clientName} avatar`} className="client-avatar" />}
      <div className="client-info">
        <span className="client-name">{clientName}</span>
        <span className="last-session">Last session: {lastSessionDate}</span>
      </div>
    </button>
  )
}

export default ClientListItem