"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
  clinicianId: number;
  createdAt: Date | string;
};

type ChatMessage = {
  id: number;
  userMessage: string;
  modelResponse: string;
  timestamp: string;
};

type Note = {
  id: number;
  noteType: string;
  content: string;
  timestamp: string;
};

type Goal = {
  id: number;
  description: string;
  metric: string | null;
  targetValue: string | null;
  currentValue: string | null;
  deadline: string | null;
  completed: number;
};

type Survey = {
  id: number;
  surveyType: string;
  totalScore: number;
  notes: string | null;
  timestamp: string;
};

type Keyword = {
  id: number;
  keyword: string;
  frequency: number;
  category: string | null;
  contexts: string[] | null;
};

type Diagnosis = {
  id: number;
  diagnosis: string;
  likelihood: number | null;
  evidence: string | null;
};

type Props = {
  clinicianEmail: string;
  initialPatients: Patient[];
};

export default function Dashboard({ clinicianEmail, initialPatients }: Props) {
  const [patientsList, setPatientsList] = useState<Patient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "notes" | "surveys" | "goals" | "stats">(
    "chat",
  );

  // Input states
  const [newPatientName, setNewPatientName] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Detail lists
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [patientNotes, setPatientNotes] = useState<Note[]>([]);
  const [goalsList, setGoalsList] = useState<Goal[]>([]);
  const [surveysList, setSurveysList] = useState<Survey[]>([]);
  const [keywordsList, setKeywordsList] = useState<Keyword[]>([]);
  const [diagnosesList, setDiagnosesList] = useState<Diagnosis[]>([]);

  // Note generation states
  const [selectedNoteType, setSelectedNoteType] = useState("SOAP");
  const [generatingNote, setGeneratingNote] = useState(false);
  const [editableNoteContent, setEditableNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // New Survey/Goal states
  const [surveyType, setSurveyType] = useState("GAD-7");
  const [surveyScore, setSurveyScore] = useState(0);
  const [surveyNotes, setSurveyNotes] = useState("");
  const [goalDesc, setGoalDesc] = useState("");
  const [goalMetric, setGoalMetric] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");

  // Loading states
  const [loadingPatientData, setLoadingPatientData] = useState(false);

  const loadPatientDetails = useCallback(async (patientId: number) => {
    setLoadingPatientData(true);
    try {
      const [chatRes, noteRes, goalRes, surveyRes, statsRes] = await Promise.all([
        fetch(`/api/patients/${patientId}/chat`),
        fetch(`/api/patients/${patientId}/notes`),
        fetch(`/api/patients/${patientId}/goals`),
        fetch(`/api/patients/${patientId}/surveys`),
        fetch(`/api/patients/${patientId}/stats`),
      ]);

      if (chatRes.ok) setChats(await chatRes.json());
      if (noteRes.ok) setPatientNotes(await noteRes.json());
      if (goalRes.ok) setGoalsList(await goalRes.json());
      if (surveyRes.ok) setSurveysList(await surveyRes.json());
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setKeywordsList(statsData.keywords || []);
        setDiagnosesList(statsData.diagnoses || []);
      }
    } catch (err) {
      console.error("Error loading patient details:", err);
    } finally {
      setLoadingPatientData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      loadPatientDetails(selectedPatient.id);
    }
  }, [selectedPatient, loadPatientDetails]);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPatientName }),
      });

      if (response.ok) {
        const newPat = await response.json();
        setPatientsList([newPat, ...patientsList]);
        setSelectedPatient(newPat);
        setNewPatientName("");
      }
    } catch (err) {
      console.error("Failed to add patient:", err);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedPatient || sendingChat) return;

    const messageToSend = chatMessage.trim();
    setChatMessage("");
    setSendingChat(true);

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setChats([...chats, newMsg]);
        // Reload stats dynamically after chats since keywords change
        const statsRes = await fetch(`/api/patients/${selectedPatient.id}/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setKeywordsList(statsData.keywords || []);
        }
      }
    } catch (err) {
      console.error("Failed to send chat:", err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleGenerateNote = async () => {
    if (!selectedPatient) return;
    setGeneratingNote(true);
    setEditableNoteContent("");

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", noteType: selectedNoteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditableNoteContent(data.note);
      }
    } catch (err) {
      console.error("Failed to generate note:", err);
    } finally {
      setGeneratingNote(false);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedPatient || !editableNoteContent.trim() || savingNote) return;
    setSavingNote(true);

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          noteType: selectedNoteType,
          content: editableNoteContent,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setPatientNotes([saved, ...patientNotes]);
        setEditableNoteContent("");
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalDesc.trim() || !selectedPatient) return;

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: goalDesc,
          metric: goalMetric,
          targetValue: goalTarget,
          deadline: goalDeadline,
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setGoalsList([created, ...goalsList]);
        setGoalDesc("");
        setGoalMetric("");
        setGoalTarget("");
        setGoalDeadline("");
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  const handleAddSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const response = await fetch(`/api/patients/${selectedPatient.id}/surveys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyType,
          totalScore: surveyScore,
          notes: surveyNotes,
          responses: { loggedAt: new Date().toISOString() }, // Simple responses details
        }),
      });

      if (response.ok) {
        const created = await response.json();
        setSurveysList([created, ...surveysList]);
        setSurveyScore(0);
        setSurveyNotes("");
      }
    } catch (err) {
      console.error("Error saving survey:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      {/* Sidebar: Patients list */}
      <aside className="w-80 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-teal-800">Kusco</h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            Pro Plan
          </span>
        </div>

        {/* Add Patient form */}
        <form onSubmit={handleAddPatient} className="p-4 border-b border-slate-100 flex gap-2">
          <input
            type="text"
            required
            value={newPatientName}
            onChange={(e) => setNewPatientName(e.target.value)}
            placeholder="New patient name..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-600 hover:bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition"
          >
            Add
          </button>
        </form>

        {/* Patients list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <h3 className="text-xs font-bold text-slate-400 px-3 uppercase tracking-wider mb-2">
            Patients
          </h3>
          {patientsList.length === 0 ? (
            <p className="text-sm text-slate-400 px-3 py-4">No patients registered.</p>
          ) : (
            patientsList.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatient(p)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  selectedPatient?.id === p.id
                    ? "bg-teal-50 text-teal-800 border-l-4 border-teal-600"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p.name}
              </button>
            ))
          )}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-slate-500">Clinician</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{clinicianEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-600 hover:text-red-800 transition"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
        {selectedPatient ? (
          <>
            {/* Header: Patient summary & Tabs */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{selectedPatient.name}</h1>
                <p className="text-xs text-slate-500 mt-1">Patient Management Portal</p>
              </div>

              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-lg p-1 text-sm font-semibold">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeTab === "chat"
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  AI Chat
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeTab === "notes"
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Clinical Notes
                </button>
                <button
                  onClick={() => setActiveTab("surveys")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeTab === "surveys"
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Surveys
                </button>
                <button
                  onClick={() => setActiveTab("goals")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeTab === "goals"
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Goals
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeTab === "stats"
                      ? "bg-white text-teal-800 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Insights & Stats
                </button>
              </div>
            </header>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPatientData ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-slate-500 font-semibold animate-pulse">
                    Loading patient files...
                  </p>
                </div>
              ) : (
                <>
                  {/* CHAT TAB */}
                  {activeTab === "chat" && (
                    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* Messages scroll list */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chats.length === 0 ? (
                          <div className="text-center py-10">
                            <p className="text-slate-400 text-sm">
                              No conversation history. Send a message to start.
                            </p>
                          </div>
                        ) : (
                          chats.map((c) => (
                            <div key={c.id} className="space-y-2">
                              {/* Clinician message */}
                              <div className="flex justify-end">
                                <div className="max-w-xl bg-teal-600 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm shadow-sm font-medium">
                                  {c.userMessage}
                                </div>
                              </div>
                              {/* AI Response */}
                              <div className="flex justify-start">
                                <div className="max-w-xl bg-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm shadow-sm whitespace-pre-wrap font-medium border border-slate-200">
                                  {c.modelResponse}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Chat input box */}
                      <form
                        onSubmit={handleSendChat}
                        className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2"
                      >
                        <input
                          type="text"
                          required
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          placeholder="Ask AI assistant about this patient or type session transcripts..."
                          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-teal-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={sendingChat || !chatMessage.trim()}
                          className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold transition disabled:bg-slate-300"
                        >
                          {sendingChat ? "Thinking..." : "Send"}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* CLINICAL NOTES TAB */}
                  {activeTab === "notes" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
                      {/* Left: Note generator workspace */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Generate Clinical Note</h2>
                        <div className="flex gap-2">
                          <select
                            value={selectedNoteType}
                            onChange={(e) => setSelectedNoteType(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none font-semibold"
                          >
                            <option value="SOAP">SOAP Note template</option>
                            <option value="BIRP">BIRP Note template</option>
                            <option value="DAP">DAP Note template</option>
                            <option value="Basic">Basic Intake Note</option>
                          </select>
                          <button
                            onClick={handleGenerateNote}
                            disabled={generatingNote || chats.length === 0}
                            className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 text-sm font-bold transition disabled:bg-slate-300"
                          >
                            {generatingNote ? "Generating..." : "Generate AI Note"}
                          </button>
                        </div>
                        {chats.length === 0 && (
                          <p className="text-xs text-amber-600 font-semibold bg-amber-50 p-2 rounded border border-amber-100">
                            ⚠ Note generator requires at least one message in the AI Chat tab to
                            establish patient session context.
                          </p>
                        )}

                        {editableNoteContent && (
                          <div className="space-y-3 pt-2">
                            <label
                              htmlFor="noteContent"
                              className="block text-xs font-bold text-slate-500 uppercase tracking-wider"
                            >
                              Draft Workspace (Editable)
                            </label>
                            <textarea
                              id="noteContent"
                              rows={12}
                              value={editableNoteContent}
                              onChange={(e) => setEditableNoteContent(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-teal-500 focus:outline-none font-mono whitespace-pre-wrap leading-relaxed"
                            />
                            <button
                              onClick={handleSaveNote}
                              disabled={savingNote}
                              className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white py-2.5 text-sm font-bold transition"
                            >
                              {savingNote ? "Saving..." : "Save Note to Patient File"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Right: Saved notes history */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Saved Clinical Notes</h2>
                        {patientNotes.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No saved notes found for this patient.
                          </p>
                        ) : (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {patientNotes.map((note) => (
                              <div
                                key={note.id}
                                className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-2"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold bg-teal-100 px-2 py-0.5 rounded text-teal-800">
                                    {note.noteType}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    {new Date(note.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm text-slate-700 font-medium whitespace-pre-wrap font-mono leading-relaxed bg-white border border-slate-100 rounded p-2 max-h-36 overflow-y-auto">
                                  {note.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SURVEYS TAB */}
                  {activeTab === "surveys" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
                      {/* Add Survey form */}
                      <form
                        onSubmit={handleAddSurvey}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
                      >
                        <h2 className="text-lg font-bold text-slate-800">Log Survey Result</h2>
                        <div>
                          <label
                            htmlFor="surveyType"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Survey Type
                          </label>
                          <select
                            id="surveyType"
                            value={surveyType}
                            onChange={(e) => setSurveyType(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          >
                            <option value="GAD-7">GAD-7 (Generalized Anxiety)</option>
                            <option value="PHQ-9">PHQ-9 (Depression Severity)</option>
                            <option value="C-SSRS">C-SSRS (Suicidality Assessment)</option>
                          </select>
                        </div>
                        <div>
                          <label
                            htmlFor="totalScore"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Total Score
                          </label>
                          <input
                            id="totalScore"
                            type="number"
                            required
                            min={0}
                            max={50}
                            value={surveyScore}
                            onChange={(e) => setSurveyScore(Number.parseInt(e.target.value, 10))}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="surveyNotes"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Notes / Clinical Observations
                          </label>
                          <textarea
                            id="surveyNotes"
                            rows={3}
                            value={surveyNotes}
                            onChange={(e) => setSurveyNotes(e.target.value)}
                            placeholder="Patient showed signs of psychomotor agitation..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white py-2 text-sm font-bold transition"
                        >
                          Log Survey
                        </button>
                      </form>

                      {/* Survey history */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Logged Surveys</h2>
                        {surveysList.length === 0 ? (
                          <p className="text-sm text-slate-400">No surveys logged yet.</p>
                        ) : (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {surveysList.map((s) => (
                              <div
                                key={s.id}
                                className="border border-slate-100 rounded-lg p-4 bg-slate-50 flex justify-between items-start gap-4"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-slate-800">{s.surveyType}</p>
                                  {s.notes && (
                                    <p className="text-xs text-slate-500 italic font-medium">
                                      {s.notes}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-slate-400 font-semibold">
                                    {new Date(s.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-extrabold text-teal-700 bg-teal-50 border border-teal-100 rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
                                    {s.totalScore}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GOALS TAB */}
                  {activeTab === "goals" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
                      {/* Add Goal form */}
                      <form
                        onSubmit={handleAddGoal}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
                      >
                        <h2 className="text-lg font-bold text-slate-800">Add Treatment Goal</h2>
                        <div>
                          <label
                            htmlFor="goalDesc"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Goal Description
                          </label>
                          <input
                            id="goalDesc"
                            type="text"
                            required
                            value={goalDesc}
                            onChange={(e) => setGoalDesc(e.target.value)}
                            placeholder="Reduce daily anxiety attacks..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="goalMetric"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Metric (Optional)
                          </label>
                          <input
                            id="goalMetric"
                            type="text"
                            value={goalMetric}
                            onChange={(e) => setGoalMetric(e.target.value)}
                            placeholder="Number of attacks per week..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="goalTarget"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Target Value (Optional)
                          </label>
                          <input
                            id="goalTarget"
                            type="text"
                            value={goalTarget}
                            onChange={(e) => setGoalTarget(e.target.value)}
                            placeholder="Less than 2..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="goalDeadline"
                            className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"
                          >
                            Deadline (Optional)
                          </label>
                          <input
                            id="goalDeadline"
                            type="date"
                            value={goalDeadline}
                            onChange={(e) => setGoalDeadline(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white py-2 text-sm font-bold transition"
                        >
                          Add Goal
                        </button>
                      </form>

                      {/* Goals list */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">Treatment Plan Goals</h2>
                        {goalsList.length === 0 ? (
                          <p className="text-sm text-slate-400">No goals added yet.</p>
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {goalsList.map((g) => (
                              <div
                                key={g.id}
                                className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-1"
                              >
                                <p className="text-sm font-bold text-slate-800">{g.description}</p>
                                {g.metric && (
                                  <p className="text-xs text-slate-500">
                                    Metric: <span className="font-semibold">{g.metric}</span>{" "}
                                    (Target: {g.targetValue})
                                  </p>
                                )}
                                {g.deadline && (
                                  <p className="text-[10px] text-slate-400 font-semibold">
                                    Deadline: {new Date(g.deadline).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INSIGHTS TAB */}
                  {activeTab === "stats" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full items-start">
                      {/* Keywords Frequencies */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">
                          Extracted Session Keywords
                        </h2>
                        {keywordsList.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            No session keywords extracted yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {keywordsList.map((k) => (
                              <div key={k.id} className="space-y-1">
                                <div className="flex justify-between text-sm font-semibold">
                                  <span className="text-slate-700">{k.keyword}</span>
                                  <span className="text-teal-700 bg-teal-50 border border-teal-100 rounded px-1.5 py-0.5 text-xs font-extrabold">
                                    {k.frequency} mentions
                                  </span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                  <div
                                    className="bg-teal-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(100, k.frequency * 20)}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Clinical Diagnoses */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-800">
                          AI Clinical Diagnoses (Likelihood)
                        </h2>
                        {diagnosesList.length === 0 ? (
                          <p className="text-sm text-slate-400">No diagnoses registered.</p>
                        ) : (
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {diagnosesList.map((d) => (
                              <div
                                key={d.id}
                                className="border border-slate-100 rounded-lg p-4 bg-slate-50 space-y-2"
                              >
                                <div className="flex justify-between items-center">
                                  <p className="text-sm font-bold text-slate-800">{d.diagnosis}</p>
                                  {d.likelihood && (
                                    <span className="text-xs font-bold bg-teal-100 px-2 py-0.5 rounded text-teal-800">
                                      {Math.round(d.likelihood * 100)}% Match
                                    </span>
                                  )}
                                </div>
                                {d.evidence && (
                                  <p className="text-xs text-slate-500 font-medium bg-white border border-slate-100 rounded p-2 leading-relaxed">
                                    Evidence: {d.evidence}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-3xl font-extrabold text-slate-700">Welcome to Mindful Notes</h1>
            <p className="text-slate-500 mt-2 max-w-md">
              Select a patient from the sidebar or add a new patient to access clinician-AI
              assistant chat, notes, and treatment goals.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
