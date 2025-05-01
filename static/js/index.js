let selectedPatientId = null;
let isAddingPatient = false;
let isCreatingNote = false;
let isViewingNote = false;
let currentTab = 'chat';

function loadPatientList() {
    fetch('/patients')
    .then(response => response.json())
    .then(patients => {
        const patientListUl = document.getElementById('patient-list-ul');
        let listContent = '';
        if (isAddingPatient) {
            listContent += '<li><input type="text" class="add-patient-input" id="new-patient-input" placeholder="Enter patient name"></li>';
        }
        listContent += patients.map(patient => 
            `<li onclick="selectPatient('${patient.id}')" class="${Number(patient.id) === Number(selectedPatientId) ? 'selected' : ''}">
                ${patient.name}
                <button class="rename-btn" onclick="event.stopPropagation(); renamePatient('${patient.id}', '${patient.name}')">Rename</button>
            </li>`
        ).join('');
        patientListUl.innerHTML = listContent;

        if (isAddingPatient) {
            const input = document.getElementById('new-patient-input');
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addPatient(e);
            });
        }
    })
    .catch(error => console.error("Error loading patients:", error));
}

function showAddPatientInput() {
    if (!isAddingPatient) {
        isAddingPatient = true;
        loadPatientList();
    }
}

function addPatient(event) {
    const name = event.target.value.trim();
    if (!name) {
        isAddingPatient = false;
        loadPatientList();
        return;
    }
    fetch('/add_patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        isAddingPatient = false;
        loadPatientList();
        selectPatient(data.patients[data.patients.length - 1].id);
    })
    .catch(error => {
        alert("Error adding patient: " + error);
        isAddingPatient = false;
        loadPatientList();
    });
}

function selectPatient(patientId) {
    if (isAddingPatient) return;
    selectedPatientId = patientId;
    loadPatientList();
    updateSelectedPatientName();
    loadPatientHistory();
    loadNoteList();
    isViewingNote = false;
    switchTab('chat'); // Default to chat tab
    document.getElementById('note-display').innerHTML = '';
    document.getElementById('survey-display').innerHTML = '';
    document.getElementById('keywords-display').innerHTML = '';
    document.getElementById('statistics-display').innerHTML = '';
    document.getElementById('goals-display').innerHTML = '';
    document.getElementById('timeline-display').innerHTML = '';
    document.getElementById('resources-display').innerHTML = '';
    // Add active class to the list item for this patient in the list
    document.querySelectorAll('#patient-list-ul li').forEach(li => {
        li.classList.remove('selected');
        if (li.textContent.includes(patientId)) {
            li.classList.add('selected');
        }
    });
    updateButtonVisibility();
}

function updateSelectedPatientName() {
    const nameElement = document.getElementById('selected-patient-name');

    fetch('/patients')
    .then(response => response.json())
    .then(patients => {
        const selectedPatient = patients.find(p => p.id === Number(selectedPatientId));
        nameElement.textContent = selectedPatient ? selectedPatient.name : '';
    })
    .catch(error => console.error("Error fetching patient name:", error));
}

function renamePatient(patientId, currentName) {
    const newName = prompt("Enter the new name for this patient:", currentName);
    if (!newName || newName.trim() === currentName) return;

    fetch('/rename_patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: patientId, new_name: newName.trim() })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        loadPatientList();
        if (patientId === selectedPatientId) updateSelectedPatientName();
    })
    .catch(error => alert("Error renaming patient: " + error));
}

function loadPatientHistory() {
    const historyElement = document.getElementById('history');
    if (!selectedPatientId) {
        historyElement.innerHTML = '';
        return;
    }

    fetch(`/history/${selectedPatientId}`)
    .then(response => response.json())
    .then(history => {
        historyElement.innerHTML = history.map(entry => `
            <div class="chat-message clinician">
                <div class="timestamp">${entry.timestamp}</div>
                ${entry.user}
            </div>
            <div class="chat-message ai">
                <div class="timestamp">${entry.timestamp}</div>
                ${entry.model}
            </div>
        `).join('');
        historyElement.scrollTop = historyElement.scrollHeight;
    })
    .catch(error => console.error("Error loading history:", error));
}

function sendMessage() {
    const messageInput = document.getElementById('message');
    const message = messageInput.value.trim();

    if (!message || !selectedPatientId) {
        alert("Please select a patient and enter a message.");
        return;
    }

    messageInput.value = '';
    switchTab('chat');
    isViewingNote = false;
    updateButtonVisibility();

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, patient_id: selectedPatientId })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        function readStream() {
            reader.read()
            .then(({ done, value }) => {
                if (done) {
                    loadPatientHistory();
                    const historyElement = document.getElementById('history');
                    historyElement.scrollTop = historyElement.scrollHeight;
                    return;
                }
                const chunk = decoder.decode(value, { stream: true });
                fullResponse += chunk;
                loadPatientHistory();
                const historyElement = document.getElementById('history');
                historyElement.scrollTop = historyElement.scrollHeight;
                readStream();
            })
            .catch(error => {
                console.error("Error reading stream:", error);
                document.getElementById('history').textContent = "An error occurred.";
            });
        }
        readStream();
    })
    .catch(error => {
        console.error("Error sending request:", error);
        document.getElementById('history').textContent = "An error occurred.";
    });
}

function switchTab(tab) {
    // Get the current tab
    currentTab = tab;
    // List the tab names
    const tabs = ['chat', 'notes', 'survey', 'keywords', 'statistics', 'goals', 'timeline', 'resources'];
    // For each tab...
    tabs.forEach(t => {
        // Get the content and button elements
        const content = document.getElementById(`${t}-content`);
        const button = document.querySelector(`.tab-button[onclick="switchTab('${t}')"]`);
        if (t === tab) {
            content.classList.add('active');
            button.classList.add('active');
        } else {
            content.classList.remove('active');
            button.classList.remove('active');
        }
    });
    updateButtonVisibility();
}

function showCreateNoteDropdown() {
    if (!isCreatingNote && selectedPatientId) {
        isCreatingNote = true;
        loadNoteList();
    }
}

function createNote(noteType) {
    const noteDisplay = document.getElementById('note-display');
    const editTextarea = document.getElementById('edit-response');

    if (!selectedPatientId) {
        alert("Please select a patient.");
        isCreatingNote = false;
        loadNoteList();
        return;
    }

    noteDisplay.innerHTML = 'Generating note...';
    switchTab('notes');
    isViewingNote = true;
    updateButtonVisibility();
    editTextarea.style.display = 'none';

    fetch('/generate_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: selectedPatientId, note_type: noteType })
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        function readStream() {
            reader.read()
            .then(({ done, value }) => {
                if (done) {
                    try {
                        // Parse the accumulated JSON content
                        const jsonContent = JSON.parse(fullContent);
                        // Render the JSON content with the appropriate template
                        fetch('/note_template', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ note_type: noteType, content: jsonContent })
                        })
                        .then(response => response.json())
                        .then(data => {
                            noteDisplay.innerHTML = data.html_content;
                            isCreatingNote = false;
                            loadNoteList();
                        })
                        .catch(error => {
                            console.error("Error rendering note template:", error);
                            noteDisplay.textContent = "Error rendering note.";
                            isCreatingNote = false;
                            loadNoteList();
                        });
                    } catch (error) {
                        console.error("Error parsing JSON:", error);
                        noteDisplay.textContent = "Invalid note format.";
                        isCreatingNote = false;
                        loadNoteList();
                    }
                    return;
                }
                const chunk = decoder.decode(value, { stream: true });
                fullContent += chunk;
                noteDisplay.textContent = "Generating note...\n" + fullContent; // Show progress
                readStream();
            })
            .catch(error => {
                console.error("Error reading stream:", error);
                noteDisplay.textContent = "An error occurred.";
                isCreatingNote = false;
                isViewingNote = false;
                updateButtonVisibility();
                loadNoteList();
            });
        }
        readStream();
    })
    .catch(error => {
        console.error("Error generating note:", error);
        noteDisplay.textContent = "An error occurred.";
        isCreatingNote = false;
        isViewingNote = false;
        updateButtonVisibility();
        loadNoteList();
    });
}

function editNote() {
    const noteDisplay = document.getElementById('note-display');
    const editTextarea = document.getElementById('edit-response');
    const editButton = document.getElementById('edit-note');
    const saveButton = document.getElementById('save-note');

    editTextarea.value = noteDisplay.textContent;
    noteDisplay.style.display = 'none';
    editTextarea.style.display = 'block';
    editButton.textContent = 'Cancel Edit';
    editButton.onclick = cancelEdit;
    saveButton.style.display = 'inline';
}

function cancelEdit() {
    const noteDisplay = document.getElementById('note-display');
    const editTextarea = document.getElementById('edit-response');
    const editButton = document.getElementById('edit-note');

    noteDisplay.style.display = 'block';
    editTextarea.style.display = 'none';
    editButton.textContent = 'Edit Note';
    editButton.onclick = editNote;
    updateButtonVisibility();
}

function getNoteType(content) {
    if(content.includes('Subjective')) {
        return 'SOAP';
    } else if (content.includes('Behavior')) {
        return 'BIRP';
    } else if (content.includes('Data')) {
        return 'DAP';
    } else {
        return 'Basic';
    }
}

function saveNote() {
    const noteDisplay = document.getElementById('note-display');
    const editTextarea = document.getElementById('edit-response');
    const content = editTextarea.style.display === 'block' ? editTextarea.value : noteDisplay.textContent;
    console.log(content)

    if (!selectedPatientId || !content.trim()) {
        alert("Please select a patient and ensure the note has content.");
        return;
    }

    const noteType = getNoteType(content);

    fetch('/save_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: selectedPatientId, note_type: noteType, content: content })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) throw new Error(data.error);
        noteDisplay.style.display = 'block';
        editTextarea.style.display = 'none';
        document.getElementById('edit-note').textContent = 'Edit Note';
        document.getElementById('edit-note').onclick = editNote;
        isViewingNote = true;
        updateButtonVisibility();
        loadNoteList();
    })
    .catch(error => alert("Error saving note: " + error));
}

function loadNoteList() {
    const noteListElement = document.getElementById('note-list');
    if (!selectedPatientId) {
        noteListElement.innerHTML = '<ul></ul>';
        return;
    }

    fetch(`/notes/${selectedPatientId}`)
    .then(response => response.json())
    .then(notes => {
        let listContent = '<ul>';
        if (isCreatingNote) {
            listContent += `
                <li>
                    <select class="create-note-select" onchange="createNote(this.value)">
                        <option value="">Select Note Type</option>
                        <option value="SOAP">SOAP</option>
                        <option value="BIRP">BIRP</option>
                        <option value="DAP">DAP</option>
                        <option value="Basic">Basic</option>
                    </select>
                </li>`;
        }
        listContent += notes.map(note => 
            `<li onclick="showNote('${note.id}')">${note.timestamp} (${note.note_type})</li>`
        ).join('') + '</ul>';
        noteListElement.innerHTML = listContent;
    })
    .catch(error => console.error("Error loading notes:", error));
}

function showNote(noteId) {
    fetch(`/note/${noteId}`)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(note => {
        const noteDisplay = document.getElementById('note-display');
        const editTextarea = document.getElementById('edit-response');

        noteDisplay.innerHTML = note.content;
        noteDisplay.style.display = 'block';
        editTextarea.style.display = 'none';
        isViewingNote = true;
        switchTab('notes');
        updateButtonVisibility();
    })
    .catch(error => {
        console.error("Error loading note:", error);
        document.getElementById('note-display').textContent = "Error loading note.";
    });
}

function updateButtonVisibility() {
    const editButton = document.getElementById('edit-note');
    const saveButton = document.getElementById('save-note');
    editButton.style.display = (isViewingNote && currentTab === 'notes') ? 'inline' : 'none';
    saveButton.style.display = (isViewingNote && currentTab === 'notes') ? 'inline' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    loadPatientList();
    switchTab('chat');
    updateButtonVisibility();
});