function getRelativeTime(timestamp) {
    const now = new Date();
    const noteDate = new Date(parseInt(timestamp));
    const diffMs = now - noteDate; // Difference in milliseconds
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const timeString = noteDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  
    if (diffDays === 0) {
      return `Made today at ${timeString}`;
    } else if (diffDays === 1) {
      return `Made yesterday at ${timeString}`;
    } else if (diffDays < 7) {
      return `Made ${diffDays} days ago`;
    } else if (diffDays < 14) {
      return `Made last week`;
    } else if (diffDays < 28) {
      return `Made ${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 60) {
      return `Made last month`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      return `Made ${diffMonths} months ago`;
    }
  }
  
  function loadNotes(category) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const notesDiv = document.getElementById('notes');
    notesDiv.innerHTML = '';
    for (const [id, note] of Object.entries(data)) {
      if (note.category === category) {
        const noteDiv = document.createElement('div');
        noteDiv.className = 'note';
        noteDiv.innerHTML = `
          <div class="note-content">
            <p class="note-text">${note.text}</p>
            <p class="note-meta">${getRelativeTime(id)}</p>
          </div>
          <button class="edit-btn" onclick="editNote('${id}')">Edit</button>
          <button class="delete-btn" onclick="deleteNote('${id}')">Delete</button>
        `;
        notesDiv.appendChild(noteDiv);
      }
    }
  }
  
  function addNote(category) {
    const input = document.getElementById('noteInput');
    const noteText = input.value.trim();
    if (noteText) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      const id = Date.now();
      data[id] = { text: noteText, category: category };
      localStorage.setItem('notes', JSON.stringify(data));
      input.value = ''; // Clear input
      loadNotes(category); // Refresh note list
    }
  }
  
  function editNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const note = data[id];
    const noteDiv = document.querySelector(`.note:has(button[onclick="deleteNote('${id}')"])`);
    noteDiv.innerHTML = `
      <div class="note-content">
        <input type="text" class="note-input" value="${note.text}">
      </div>
      <button class="edit-btn" onclick="saveEditedNote('${id}', '${note.category}')">Save</button>
      <button class="delete-btn" onclick="loadNotes('${note.category}')">Cancel</button>
    `;
  }
  
  function saveEditedNote(id, category) {
    const noteDiv = document.querySelector(`.note:has(button[onclick="saveEditedNote('${id}', '${category}')"])`);
    const input = noteDiv.querySelector('.note-input');
    const newText = input.value.trim();
    if (newText) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      data[id] = { text: newText, category: category };
      localStorage.setItem('notes', JSON.stringify(data));
      loadNotes(category); // Refresh note list
    }
  }
  
  function deleteNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const category = data[id].category;
    delete data[id]; // Remove note by ID
    localStorage.setItem('notes', JSON.stringify(data));
    loadNotes(category); // Refresh note list
  }
  
  function saveNotes() {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    alert(`Notes saved to localStorage! (${Object.keys(data).length} notes)`);
  }
  
  // Load notes for the current page's category when the page loads
  const category = document.querySelector('h1').textContent.split(' - ')[1];
  loadNotes(category);