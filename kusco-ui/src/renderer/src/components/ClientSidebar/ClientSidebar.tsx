import React, { useState } from 'react'
import ClientSearchInput from './ClientSearchInput'
import ClientList from './ClientList'
import type { Patient } from '../../../../preload/index.d' // Adjust path

interface ClientSidebarProps {
  clients: Patient[]
  selectedClient: Patient | null
  onSelectClient: (client: Patient) => void
  isLoading: boolean
  onConfirmAddPatient: (name: string) => Promise<void> // Modified prop
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({
  clients,
  selectedClient,
  onSelectClient,
  isLoading,
  onConfirmAddPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddNewPatientClick = (): void => {
    setIsAddingPatient(true)
    setNewPatientName('') // Clear previous input
  }

  const handleConfirm = async (): Promise<void> => {
    if (newPatientName.trim()) {
      await onConfirmAddPatient(newPatientName.trim())
      setIsAddingPatient(false)
      setNewPatientName('')
    }
  }

  const handleCancel = (): void => {
    setIsAddingPatient(false)
    setNewPatientName('')
  }

  // Show loading indicator only if isLoading is true AND there are no clients yet to display.
  // If clients are already loaded, we show them even if a background refresh might be happening.
  if (isLoading && clients.length === 0) {
    return (
      <aside className="client-sidebar">
        <button type="button" onClick={handleAddNewPatientClick} className="add-client-button" style={{ marginBottom: '10px', width: '100%' }}>
          Add New Patient
        </button>
        <ClientSearchInput value={searchTerm} onChange={setSearchTerm} />
        <div className="loading-indicator" style={{ textAlign: 'center', padding: '20px' }}>
          Loading clients...
        </div>
      </aside>
    )
  }
  return (
    <aside className="client-sidebar">
      {!isAddingPatient ? (
        <button type="button" onClick={handleAddNewPatientClick} className="add-client-button" style={{ margin: '0 0 10px 0', width: '100%', padding: '8px', boxSizing: 'border-box' }}>
          Add New Patient
        </button>
      ) : (
        <div className="add-patient-input-container" style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '5px' }}>
          <input
            type="text"
            value={newPatientName}
            onChange={(e):void => setNewPatientName(e.target.value)}
            placeholder="New Patient Name"
            autoFocus
            style={{ flexGrow: 1, padding: '8px', boxSizing: 'border-box' }}
          />
          <button onClick={handleConfirm} style={{ padding: '8px', minWidth: 'auto' }} aria-label="Confirm add patient">✓</button>
          <button onClick={handleCancel} style={{ padding: '8px', minWidth: 'auto' }} aria-label="Cancel add patient">✗</button>
        </div>
      )}
      <ClientSearchInput value={searchTerm} onChange={setSearchTerm} />
      <ClientList
        clients={filteredClients}
        selectedClient={selectedClient}
        onSelectClient={onSelectClient}
      />
    </aside>
  )
}

export default ClientSidebar