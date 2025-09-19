function getRelativeTime(timestamp) {
    const now = new Date();
    const noteDate = new Date(parseInt(timestamp));
    const diffMs = now - noteDate;
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
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const sortOrder = document.getElementById('sortSelect').value;
    const noteCountDiv = document.getElementById('noteCount');
  
    // Filter notes by category and search term
    let notes = Object.entries(data).filter(([id, note]) => 
      note.category === category && 
      (note.text.toLowerCase().includes(searchInput) || 
       (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchInput))))
    );
  
    // Sort notes: pinned first, then by timestamp
    notes.sort((a, b) => {
      const pinnedA = a[1].pinned ? 1 : 0;
      const pinnedB = b[1].pinned ? 1 : 0;
      if (pinnedA !== pinnedB) return pinnedB - pinnedA;
      const timeA = parseInt(a[0]);
      const timeB = parseInt(b[0]);
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  
    // Update note count
    noteCountDiv.textContent = `${notes.length} note${notes.length !== 1 ? 's' : ''}`;
  
    notesDiv.innerHTML = '';
    for (const [id, note] of notes) {
      const noteDiv = document.createElement('div');
      noteDiv.className = `note ${note.pinned ? 'pinned' : ''}`;
      noteDiv.innerHTML = `
        <div class="note-content">
          <p class="note-text">${note.text}</p>
          <p class="note-meta">${getRelativeTime(id)}</p>
          ${note.tags && note.tags.length ? `<p class="note-tags">Tags: ${note.tags.join(', ')}</p>` : ''}
        </div>
        <button class="edit-btn" onclick="editNote('${id}')">Edit</button>
        <button class="pin-btn ${note.pinned ? 'pinned' : ''}" onclick="togglePin('${id}')">${note.pinned ? 'Unpin' : 'Pin'}</button>
        <button class="delete-btn" onclick="deleteNote('${id}')">Delete</button>
      `;
      notesDiv.appendChild(noteDiv);
    }
  }
  
  function addNote(category) {
    const noteInput = document.getElementById('noteInput');
    const tagInput = document.getElementById('tagInput');
    const noteText = noteInput.value.trim();
    const tags = tagInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
    if (noteText) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      const id = Date.now();
      data[id] = { text: noteText, category: category, tags: tags, pinned: false };
      localStorage.setItem('notes', JSON.stringify(data));
      noteInput.value = '';
      tagInput.value = '';
      loadNotes(category);
    }
  }
  
  function editNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const note = data[id];
    const noteDiv = document.querySelector(`.note:has(button[onclick="deleteNote('${id}')"])`);
    noteDiv.innerHTML = `
      <div class="note-content">
        <input type="text" class="note-input" value="${note.text}">
        <input type="text" class="tag-input" value="${note.tags ? note.tags.join(', ') : ''}" placeholder="Add tags (comma-separated)">
      </div>
      <button class="edit-btn" onclick="saveEditedNote('${id}', '${note.category}')">Save</button>
      <button class="delete-btn" onclick="loadNotes('${note.category}')">Cancel</button>
    `;
  }
  
  function saveEditedNote(id, category) {
    const noteDiv = document.querySelector(`.note:has(button[onclick="saveEditedNote('${id}', '${category}')"])`);
    const noteInput = noteDiv.querySelector('.note-input');
    const tagInput = noteDiv.querySelector('.tag-input');
    const newText = noteInput.value.trim();
    const tags = tagInput.value.trim().split(',').map(tag => tag.trim()).filter(tag => tag);
    if (newText) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      data[id] = { ...data[id], text: newText, tags: tags };
      localStorage.setItem('notes', JSON.stringify(data));
      loadNotes(category);
    }
  }
  
  function togglePin(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const category = data[id].category;
    data[id].pinned = !data[id].pinned;
    localStorage.setItem('notes', JSON.stringify(data));
    loadNotes(category);
  }
  
  function deleteNote(id) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const category = data[id].category;
    delete data[id];
    localStorage.setItem('notes', JSON.stringify(data));
    loadNotes(category);
  }
  
  function clearNotes(category) {
    if (confirm(`Are you sure you want to delete all notes in ${category}?`)) {
      const data = JSON.parse(localStorage.getItem('notes') || '{}');
      for (const id of Object.keys(data)) {
        if (data[id].category === category) {
          delete data[id];
        }
      }
      localStorage.setItem('notes', JSON.stringify(data));
      loadNotes(category);
    }
  }
  
  function exportNotes(category) {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    const notes = Object.entries(data).filter(([id, note]) => note.category === category);
    let exportText = `Notion 2.0 Notes - ${category}\n\n`;
    for (const [id, note] of notes) {
      exportText += `Note: ${note.text}\n`;
      exportText += `Time: ${getRelativeTime(id)}\n`;
      if (note.tags && note.tags.length) {
        exportText += `Tags: ${note.tags.join(', ')}\n`;
      }
      if (note.pinned) {
        exportText += `Pinned: Yes\n`;
      }
      exportText += `\n`;
    }
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  function saveNotes() {
    const data = JSON.parse(localStorage.getItem('notes') || '{}');
    alert(`Notes saved to localStorage! (${Object.keys(data).length} notes)`);
  }
  
  // Load notes for the current page's category when the page loads
  const category = document.querySelector('h1')?.textContent.split(' - ')[1];
  if (category) loadNotes(category);