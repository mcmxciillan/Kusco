import React, { useEffect, useState } from 'react'
import type { Patient, Note } from '../../../../preload/index.d' // Adjust path

interface NotesViewProps {
  client: Patient
  generatedNote?: { noteType: string; note: string } | null
  clearGeneratedNote?: () => void
}

const NotesView: React.FC<NotesViewProps> = ({ client, generatedNote, clearGeneratedNote }) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showGenerated, setShowGenerated] = useState<boolean>(!!generatedNote)

  useEffect(() => {
    if (generatedNote) {
      setShowGenerated(true)
    } else {
      setShowGenerated(false)
    }
  }, [generatedNote])

  useEffect(() => {
    const fetchNotes = async (): Promise<void> => {
      if (!client) return
      setIsLoading(true)
      try {
        const fetchedNotes = await window.api.getNotesForPatient(client.id)
        setNotes(fetchedNotes)
      } catch (error) {
        console.error(`Failed to fetch notes for ${client.name}:`, error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotes()
  }, [client])

  if (isLoading) return <p>Loading notes for {client.name}...</p>

  return (
    <div className="notes-view">
      <h2>Notes for {client.name}</h2>
      {showGenerated && generatedNote && (
        <div
          className="note-item generated-note"
          style={{ border: '2px solid #4caf50', background: '#f6fff6', marginBottom: 16 }}
        >
          <div dangerouslySetInnerHTML={{ __html: generatedNote.note }} />
          <button
            onClick={() => {
              setShowGenerated(false)
              clearGeneratedNote && clearGeneratedNote()
            }}
            style={{ marginTop: 8 }}
          >
            Dismiss
          </button>
        </div>
      )}
      {notes.length === 0 && <p>No notes found for this client.</p>}
      {notes.map((note) => (
        <div
          key={note.id}
          className="note-item"
          dangerouslySetInnerHTML={{ __html: note.content }}
        ></div>
      ))}
      <p>
        Note-taking functionality (create, edit, view formatted notes) will be implemented here.
      </p>
    </div>
  )
}

export default NotesView