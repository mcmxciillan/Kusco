import React, { useState, useEffect } from 'react'
import HeaderBar from './HeaderBar'
import ClientSidebar from './ClientSidebar/ClientSidebar'
import MainContentArea from './MainContentArea/MainContentArea'
import type { Patient } from '../../../preload/index.d' // Adjust path as necessary

export type TabName = 'Conversation' | 'Notes' | 'Contacts' | 'Insights' | 'Statistics'

// Define a type for the user profile
interface UserProfile {
  name: string
  avatarUrl: string
}

const AppShell: React.FC = () => {
  // Example user data - replace with actual authentication logic if needed
  const [currentUser] = useState<UserProfile>({
    name: 'Dr. Smith',
    avatarUrl: './assets/default-avatar.png'
  }) // Ensure avatar path is correct
  const [clients, setClients] = useState<Patient[]>([])
  const [selectedClient, setSelectedClient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<TabName>('Conversation')
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(true)
  const [fetchClientsError, setFetchClientsError] = useState<string | null>(null) // New state for fetch error
  const [generatedNote, setGeneratedNote] = useState<{ noteType: string; note: string } | null>(
    null
  )

  useEffect(() => {
    const fetchClientsData = async (): Promise<void> => { // Renamed for clarity and added return type
      setIsLoadingClients(true)
      setFetchClientsError(null) // Reset error before a new fetch attempt
      try {
        const fetchedClients = await window.api.getAllPatients()
        // Assuming 'lastSessionDate' might not be directly on the Patient object from backend
        // or you might want to format it. This map ensures it's a displayable string.
        setClients(
          fetchedClients.map((c) => ({ ...c, lastSessionDate: c.lastSessionDate ?? 'N/A' }))
        )
        // Optionally select the first client by default
        // if (fetchedClients.length > 0 && !selectedClient) {
        //   setSelectedClient(fetchedClients[0]);
        // }
        // setSelectedClient(null) // Ensure no client is selected initially or after refetch if desired
      } catch (error) {
        console.error('Failed to fetch clients:', error)
        setFetchClientsError(
          'Failed to load client data. Please check your connection or try again.'
        )
      } finally {
        setIsLoadingClients(false)
      }
    }
    fetchClientsData()
  }, [])

  const handleConfirmAddPatient = async (patientName: string): Promise<void> => {
    if (patientName && patientName.trim() !== '') {
      setIsLoadingClients(true) // Indicate loading state while adding
      try {
        const trimmedName = patientName.trim()
        const newPatient = await window.api.addPatient(trimmedName)
        // Ensure newPatient has lastSessionDate, defaulting if undefined from API
        const newPatientWithDefaults: Patient = {
          ...newPatient,
          lastSessionDate: newPatient.lastSessionDate ?? new Date().toISOString() // Default to now if not present
        }
        setClients((prevClients) => [newPatientWithDefaults, ...prevClients])
        setSelectedClient(newPatientWithDefaults)
        setFetchClientsError(null) // Clear previous errors
      } catch (error) {
        console.error('Failed to add new patient:', error)
        setFetchClientsError('Failed to add new patient. Please try again.') // Show error
        // alert('Failed to add new patient. Please try again.'); // Alternative error display
      } finally {
        setIsLoadingClients(false)
      }
    }
  }

  const handleClientInteracted = (clientId: string): void => {
    setClients((prevClients) => {
      const clientIndex = prevClients.findIndex((c) => String(c.id) === clientId)
      if (clientIndex === -1) return prevClients

      const interactedClient = {
        ...prevClients[clientIndex],
        lastSessionDate: new Date().toISOString() // Update interaction timestamp
      }

      const updatedClients = [
        interactedClient,
        ...prevClients.slice(0, clientIndex),
        ...prevClients.slice(clientIndex + 1)
      ]
      return updatedClients
    })
  }

  useEffect(() => {
    const handleNoteGenerated = (e: Event): void => {
      const customEvent = e as CustomEvent<{ noteType: string; note: string }>
      setGeneratedNote(customEvent.detail)
      setActiveTab('Notes')
    }
    window.addEventListener('noteGenerated', handleNoteGenerated)
    return () => {
      window.removeEventListener('noteGenerated', handleNoteGenerated)
    }
  }, [])

  // Display a full-page error if loading failed and no clients are available
  if (!isLoadingClients && fetchClientsError && clients.length === 0) {
    return (
      <div className="app-shell">
        <HeaderBar title="Mindful Notes" userAvatarUrl={currentUser.avatarUrl} />
        <div
          className="app-body"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 60px)',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <div>
            <p style={{ color: 'red', marginBottom: '10px' }}>{fetchClientsError}</p>
            {/* Optional: Add a retry button here
            <button onClick={fetchClientsData}>Retry</button>
            */}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <HeaderBar title="Mindful Notes" userAvatarUrl={currentUser.avatarUrl} />
      <div className="app-body">
        <ClientSidebar
          clients={clients}
          selectedClient={selectedClient}
          onSelectClient={setSelectedClient}
          isLoading={isLoadingClients}
          onConfirmAddPatient={handleConfirmAddPatient}
        />
        <MainContentArea
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedClient={selectedClient}
          onClientInteracted={handleClientInteracted}
          generatedNote={generatedNote}
          clearGeneratedNote={() => setGeneratedNote(null)}
        />
      </div>
    </div>
  )
}

export default AppShell