import React from 'react'
import ConversationView from '../ConversationView/ConversationView'
import TabNavigation from './TabNavigation' // Import TabNavigation
import NotesView from '../NotesView/NotesView' // Import NotesView
import type { Patient } from '../../../../preload/index.d'
import type { TabName } from '../AppShell'

interface MainContentAreaProps {
  activeTab: TabName
  onTabChange: (tab: TabName) => void // Assuming this might be used for tab navigation UI within MainContentArea
  selectedClient: Patient | null
  onClientInteracted: (clientId: string) => void
  generatedNote?: { noteType: string; note: string } | null
  clearGeneratedNote?: () => void
}

// Define the tabs available in the MainContentArea
const TABS: TabName[] = ['Conversation', 'Notes', 'Contacts', 'Insights', 'Statistics']

const MainContentArea: React.FC<MainContentAreaProps> = ({
  activeTab,
  onTabChange,
  selectedClient,
  onClientInteracted,
  generatedNote,
  clearGeneratedNote
}) => {
  if (!selectedClient) {
    return (
      <div
        className="main-content-area placeholder"
        style={{ padding: '20px', textAlign: 'center', flexGrow: 1 }}
      >
        <p>Please select a patient to see their details.</p>
      </div>
    )
  }

  const renderTabContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'Conversation':
        return <ConversationView client={selectedClient} onClientInteracted={onClientInteracted} />
      case 'Notes':
        return (
          <NotesView
            client={selectedClient}
            generatedNote={generatedNote}
            clearGeneratedNote={clearGeneratedNote}
          />
        )
      case 'Contacts':
        return (
          <div style={{ padding: '20px' }}>
            Contact Info for {selectedClient.name} (Content TBD)
          </div>
        )
      case 'Insights':
        return (
          <div style={{ padding: '20px' }}>Insights for {selectedClient.name} (Content TBD)</div>
        )
      case 'Statistics':
        return (
          <div style={{ padding: '20px' }}>Statistics for {selectedClient.name} (Content TBD)</div>
        )
      default:
        return <div style={{ padding: '20px' }}>Select a tab</div>
    }
  }

  return (
    <main
      className="main-content-area"
      style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
    >
      <TabNavigation tabs={TABS} activeTab={activeTab} onTabChange={onTabChange} />
      <div className="tab-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
        {renderTabContent()}
      </div>
    </main>
  )
}

export default MainContentArea