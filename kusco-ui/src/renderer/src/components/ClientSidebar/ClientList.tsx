import React from 'react'
import ClientListItem from './ClientListItem'
import type { Patient } from '../../../../preload/index.d' // Adjust path

interface ClientListProps {
  clients: Patient[]
  selectedClient: Patient | null
  onSelectClient: (client: Patient) => void
}

const ClientList: React.FC<ClientListProps> = ({ clients, selectedClient, onSelectClient }) => {
  if (clients.length === 0) {
    return <p className="client-list-empty">No clients found.</p>
  }

  return (
    <ul className="client-list">
      {clients.map((client) => (
        <ClientListItem
          key={client.id}
          clientName={client.name}
          // lastSessionDate might come from client object or be fetched separately
          lastSessionDate={'N/A'}
          // avatarUrl={client.avatarUrl} // Removed because Patient does not have avatarUrl
          isSelected={selectedClient?.id === client.id}
          onClick={(): void => onSelectClient(client)}
        />
      ))}
    </ul>
  )
}

export default ClientList