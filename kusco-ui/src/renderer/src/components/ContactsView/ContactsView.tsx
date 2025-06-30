import React from 'react'
import type { Patient } from '../../../../preload/index.d' // Adjust path

interface ContactsViewProps {
  client: Patient
}

const ContactsView: React.FC<ContactsViewProps> = ({ client }) => {
  return (
    <div className="contacts-view">
      <h2>Contacts for {client.name}</h2>
      <p>Contact management details for {client.name} will be displayed here. (TBD)</p>
    </div>
  )
}
export default ContactsView