import React from 'react'
import type { Patient } from '../../../../preload/index.d' // Adjust path

interface StatisticsViewProps {
  client: Patient
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ client }) => {
  return (
    <div className="statistics-view">
      <h2>Statistics for {client.name}</h2>
      <p>Relevant statistics and charts for {client.name} will be displayed here. (TBD)</p>
    </div>
  )
}
export default StatisticsView