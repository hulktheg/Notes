function loadNotes() {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const notesDiv = document.getElementById('notes');
    notesDiv.innerHTML = '';
    for (const [id, note] of Object.entries(data)) {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'note';
      noteDiv.innerHTML = `
        <p class="note-text">${note}</p>
        <button class="edit-btn" onclick="editNote('${id}')">Edit</button>
        <button class="delete-btn" onclick="deleteNote('${id}')">Delete</button>
      `;
      notesDiv.appendChild(noteDiv);
    }
  }
  
  function addNote() {
    const input = document.getElementById('noteInput');
    const note = input.value.trim();
    if (note) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      data[Date.now()] = note; // Use timestamp as unique ID
      localStorage.setItem('notes', JSON.stringify(data));
      input.value = ''; // Clear input
      loadNotes(); // Refresh note list
    }
  }
  
  function editNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const noteText = data[id];
    const noteDiv = document.querySelector(`.note:has(button[onclick="deleteNote('${id}')"])`);
    noteDiv.innerHTML = `
      <input type="text" class="note-input" value="${noteText}">
      <button class="edit-btn" onclick="saveEditedNote('${id}')">Save</button>
      <button class="delete-btn" onclick="loadNotes()">Cancel</button>
    `;
  }
  
  function saveEditedNote(id) {
    const noteDiv = document.querySelector(`.note:has(button[onclick="saveEditedNote('${id}')"])`);
    const input = noteDiv.querySelector('.note-input');
    const newText = input.value.trim();
    if (newText) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      data[id] = newText; // Update note text
      localStorage.setItem('notes', JSON.stringify(data));
      loadNotes(); // Refresh note list
    }
  }
  
  function deleteNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    delete data[id]; // Remove note by ID
    localStorage.setItem('notes', JSON.stringify(data));
    loadNotes(); // Refresh note list
  }
  
  function saveNotes() {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    alert(`Notes saved to localStorage! (${Object.keys(data).length} notes)`);
  }
  
  // Load notes when the page loads
  loadNotes();