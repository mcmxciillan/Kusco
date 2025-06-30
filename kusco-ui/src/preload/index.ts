import { contextBridge, ipcRenderer } from 'electron'
import type {
  Patient,
  Note,
  AddPatientResponse,
  UIMessage,
  ChatHistoryEntry, // Added import
  RenamePatientResponse, // Added import
  LlmFullResponse, // Added import
  ResponseMessage, // Added import
  ChatResponse // Added import
} from './index.d'

const electronAPI = {
  // Define electronAPI if it's used, otherwise remove its usage below
  // For example: send: (channel, data) => ipcRenderer.send(channel, data)
}

// Custom APIs for renderer
const api = {
  // Chat
  postChatMessage: async (
    patientId: number,
    message: string
  ): Promise<ChatResponse> => {
    const invokeArgs = {
      method: 'POST',
      path: `/chat`,
      body: {
        message,
        patient_id: patientId
      },
      responseType: 'json'
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for postChatMessage with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },
  getChatHistory: (patientId: number): Promise<ChatHistoryEntry[]> => {
    const invokeArgs = {
      method: 'GET',
      path: `/history/${patientId}`
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for getChatHistory with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },

  // Patients
  getAllPatients: (): Promise<Patient[]> => {
    const invokeArgs = {
      method: 'GET',
      path: '/patients'
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for getAllPatients with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },
  addPatient: async (name: string): Promise<Patient> => {
    const invokeArgs = {
      method: 'POST',
      path: '/patients',
      body: { name }
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for addPatient with:',
      JSON.stringify(invokeArgs)
    )
    const response: AddPatientResponse = await ipcRenderer.invoke('flask-api-request', invokeArgs)
    return response.patient
  },
  renamePatient: (patientId: number, newName: string): Promise<RenamePatientResponse> => {
    const invokeArgs = {
      method: 'PUT',
      path: `/patients/${patientId}`,
      body: { name: newName }
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for renamePatient with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },

  // Notes
  generateNote: (patientId: number, noteType: string): Promise<LlmFullResponse> => {
    const invokeArgs = {
      method: 'POST',
      path: '/generate_note',
      body: { patient_id: patientId, note_type: noteType }
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for generateNote with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },
  saveNote: (
    patientId: number,
    noteType: string,
    content: Record<string, unknown>
  ): Promise<ResponseMessage> => {
    const invokeArgs = {
      method: 'POST',
      path: '/notes',
      body: { patient_id: patientId, note_type: noteType, content }
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for saveNote with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },
  getNotesForPatient: (patientId: number): Promise<Note[]> => {
    const invokeArgs = {
      method: 'GET',
      path: `/patients/${patientId}/notes`
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for getNotesForPatient with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },
  getNoteById: (noteId: number): Promise<string> => {
    const invokeArgs = {
      method: 'GET',
      path: `/notes/${noteId}`
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for getNoteById with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  },

  // Insights
  generateInsights: (clientId: string, messages: UIMessage[]): Promise<string> => {
    const invokeArgs = {
      method: 'POST',
      path: '/generate_insights',
      body: { client_id: clientId, messages: messages }
    } as FlaskApiRequestArgs
    console.log(
      '[Preload] Invoking flask-api-request for generateInsights with:',
      JSON.stringify(invokeArgs)
    )
    return ipcRenderer.invoke('flask-api-request', invokeArgs)
  }
  // Add more functions for surveys, keywords, diagnoses, goals, resources here
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if contextIsolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in d.ts if actually used)
  window.electron = electronAPI
  // @ts-ignore (define in d.ts if actually used)
  window.api = api
}

// Type definition for FlaskApiRequestArgs to be used with invoke
interface FlaskApiRequestArgs {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
  responseType?: 'json' | 'text' | 'stream'
  streamId?: string // Added streamId for stream differentiation
}
