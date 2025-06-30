import { ElectronAPI } from '@electron-toolkit/preload'

// --- Generic & Utility Types ---
export interface ResponseMessage {
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any // For responses that might include additional data
}

// --- Patient Related Types ---
export interface Patient {
  id: number
  name: string
  lastSessionDate?: string; // Added optional lastSessionDate
  // Add other patient fields if necessary
}

export interface AddPatientResponse extends ResponseMessage {
  patient: Patient // Changed from patients: Patient[] to match backend
}

export interface RenamePatientResponse extends ResponseMessage {
  patients: Patient[]
}

// --- Chat Related Types ---
export interface ChatHistoryEntry {
  id: number
  patient_id: number
  user_message: string | null // User's message
  model_response: string | null // AI's response
  timestamp: string
}

export interface ChatResponse {
  model_response?: string
  error?: string
}

// --- Insights Related Types ---
export interface UIMessage { // Defining UIMessage as it's used by generateInsights
  id: string
  type: 'user' | 'ai' | 'system' // Assuming these are the possible types
  text: string
  timestamp?: string // Optional timestamp
}

// --- Stream Related Types ---
export interface StreamCallbacks {
  onData: (chunk: string) => void
  onEnd: () => void
  onError: (error: string) => void // Error is simplified to string for IPC
}

// For non-streaming LLM responses from Flask
export interface LlmFullResponse {
  // For /generate_note, the backend now returns { model_response: string, error?: string }
  model_response?: string
  error?: string
  // Optionally, keep full_response/context_used for legacy endpoints
  full_response?: string | Record<string, unknown>
  context_used?: string
}

// --- Note Related Types ---
export interface Note {
  id: number
  patient_id: number
  note_type: string
  content: string // Assuming JSON string, or could be parsed object
  created_at: string
}

// --- Other Data Types (Surveys, Keywords, etc.) ---
// Define interfaces for Survey, Keyword, Diagnosis, Goal, Resource as needed
// For example:
// export interface Survey { id: number; patient_id: number; data: any; }

export interface ICustomAPI {
  // Chat
  postChatMessage: (patientId: number, message: string) => Promise<ChatResponse>
  getChatHistory: (patientId: number) => Promise<ChatHistoryEntry[]>
  // Patients
  getAllPatients: () => Promise<Patient[]>
  addPatient: (name: string) => Promise<Patient> // Changed return type to Patient
  renamePatient: (patientId: number, newName: string) => Promise<RenamePatientResponse>
  // Notes
  generateNote: (patientId: number, noteType: string) => Promise<LlmFullResponse> // Non-streaming for now
  saveNote: (patientId: number, noteType: string, content: Record<string, unknown>) => Promise<ResponseMessage>
  getNotesForPatient: (patientId: number) => Promise<Note[]>
  getNoteById: (noteId: number) => Promise<string> // Expecting HTML string from Flask
  // Insights
  generateInsights: (clientId: string, messages: UIMessage[]) => Promise<string>
  // Add more functions for surveys, keywords, diagnoses, goals, resources here
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ICustomAPI
  }
}
