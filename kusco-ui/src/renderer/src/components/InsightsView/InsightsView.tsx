import React from 'react'
import type { Patient } from '../../../../preload/index.d' // Adjust path

interface InsightsViewProps {
  client: Patient
}

const InsightsView: React.FC<InsightsViewProps> = ({ client }) => {
  return (
    <div className="insights-view">
      <h2>Insights for {client.name}</h2>
      <p>Generated insights and visualizations for {client.name} will be displayed here. (TBD)</p>
    </div>
  )
}
export default InsightsView