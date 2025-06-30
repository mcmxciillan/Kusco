import React from 'react'
import type { TabName } from '../AppShell'

interface TabNavigationProps {
  tabs: TabName[]
  activeTab: TabName
  onTabChange: (tab: TabName) => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <nav className="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={(): void => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  )
}

export default TabNavigation