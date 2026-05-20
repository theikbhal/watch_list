// sidepanel.js - Main Controller for Watch List Chrome Extension

// Polyfill chrome extension APIs for testing outside of extension context
if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
  window.chrome = window.chrome || {};
  chrome.storage = {
    local: {
      get: (keys, callback) => {
        const result = {};
        for (let key in keys) {
          const val = localStorage.getItem(key);
          result[key] = val ? JSON.parse(val) : keys[key];
        }
        setTimeout(() => callback(result), 0);
      },
      set: (data, callback) => {
        for (let key in data) {
          localStorage.setItem(key, JSON.stringify(data[key]));
        }
        if (callback) setTimeout(callback, 0);
      },
      clear: (callback) => {
        localStorage.clear();
        if (callback) setTimeout(callback, 0);
      }
    }
  };
  chrome.runtime = {
    onMessage: { addListener: () => {} },
    sendMessage: () => {}
  };
}

// Global state
let state = {
  videos: [],
  activeVideoId: null,
  activeZoomNoteId: null, // Note ID currently zoomed in (Workflowy focus)
  filters: {
    timeframe: "all",
    priority: "all",
    niche: "all",
    search: "",
    tag: null
  },
  calendarMonth: new Date().getMonth(),
  calendarYear: new Date().getFullYear(),
  calendarSelectedDate: null
};

// DOM Elements
const videoListEl = document.getElementById("video-list");
const activeCountEl = document.getElementById("active-video-count");
const welcomePanel = document.getElementById("welcome-panel");
const editorPanel = document.getElementById("editor-panel");

// Form inputs/controls
const pasteInput = document.getElementById("paste-link-input");
const pasteAddBtn = document.getElementById("paste-add-btn");
const searchInput = document.getElementById("search-input");
const existingTagsContainer = document.getElementById("existing-tags-container");

// Filter Pills
const timeframeFilters = document.getElementById("timeframe-filters");
const priorityFilters = document.getElementById("priority-filters");
const nicheFilters = document.getElementById("niche-filters");

// Editor DOM
const editorTitle = document.getElementById("editor-title");
const editorSourceBadge = document.getElementById("editor-source-badge");
const editorLink = document.getElementById("editor-link");
const deleteVideoBtn = document.getElementById("delete-video-btn");

// Tab Navigation
const tabLinks = document.querySelectorAll(".tab-link");
const tabContents = document.querySelectorAll(".tab-content");

// Details Tab
const editTimeframe = document.getElementById("edit-timeframe");
const editPriority = document.getElementById("edit-priority");
const editNiche = document.getElementById("edit-niche");
const dateAddedInput = document.getElementById("date-added-input");
const dateWatchedInput = document.getElementById("date-watched-input");
const dateCompleteInput = document.getElementById("date-complete-input");
const historyLogList = document.getElementById("history-log-list");
const newHistoryDate = document.getElementById("new-history-date");
const newHistoryViewer = document.getElementById("new-history-viewer");
const addHistoryLogBtn = document.getElementById("add-history-log-btn");

// Notes Tab
const nestedNotesRoot = document.getElementById("nested-notes-root");
const noteBreadcrumbs = document.getElementById("note-breadcrumbs");
const zoomOutBtn = document.getElementById("zoom-out-btn");
const btnAddTag = document.getElementById("btn-add-tag");
const editorTagsBox = document.getElementById("editor-tags-box");

// Modals
const settingsModal = document.getElementById("settings-modal");
const exportImportBtn = document.getElementById("export-import-btn");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const exportBackupBtn = document.getElementById("export-backup-btn");
const importBackupTriggerBtn = document.getElementById("import-backup-trigger-btn");
const importBackupFileInput = document.getElementById("import-backup-file-input");
const resetDataBtn = document.getElementById("reset-data-btn");

const tagModal = document.getElementById("tag-modal");
const closeTagBtn = document.getElementById("close-tag-btn");
const newTagInput = document.getElementById("new-tag-input");
const saveTagBtn = document.getElementById("save-tag-btn");

const shortcutsModal = document.getElementById("shortcuts-modal");
const helpShortcutsBtn = document.getElementById("help-shortcuts-btn");
const closeShortcutsBtn = document.getElementById("close-shortcuts-btn");

// Calendar DOM
const calendarGrid = document.getElementById("calendar-grid");
const calendarMonthYear = document.getElementById("calendar-month-year");
const calendarPrevBtn = document.getElementById("calendar-prev-month");
const calendarNextBtn = document.getElementById("calendar-next-month");
const calendarDayDetails = document.getElementById("calendar-day-details");
const dayEventsList = document.getElementById("day-events-list");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupEventListeners();
  setupFilters();
  setupTabs();
  
  // Set default date picker value for new history log
  newHistoryDate.value = new Date().toISOString().split("T")[0];
});

// Load data from Storage
function loadData() {
  chrome.storage.local.get({ videos: [] }, (result) => {
    state.videos = result.videos;
    
    // Sort videos: completed at the bottom, high priority and newest added at the top
    sortVideosList();

    renderSidebar();
    renderWelcomeStats();
    
    if (state.activeVideoId) {
      selectVideo(state.activeVideoId);
    } else {
      showWelcome();
    }
  });
}

function saveData() {
  chrome.storage.local.set({ videos: state.videos }, () => {
    renderSidebar();
    renderWelcomeStats();
    updateInsights();
    renderCalendar();
  });
}

function sortVideosList() {
  state.videos.sort((a, b) => {
    // If one is complete and the other isn't, incomplete comes first
    const aComplete = !!a.dateComplete;
    const bComplete = !!b.dateComplete;
    if (aComplete !== bComplete) {
      return aComplete ? 1 : -1;
    }
    // High priority comes first
    const aHigh = a.priority === "high";
    const bHigh = b.priority === "high";
    if (aHigh !== bHigh) {
      return aHigh ? -1 : 1;
    }
    // Otherwise, descending order of dateAdded
    return b.id.localeCompare(a.id);
  });
}

// --- VIEW STATE SWITCHER ---
function showWelcome() {
  welcomePanel.style.display = "flex";
  editorPanel.style.display = "none";
  state.activeVideoId = null;
  state.activeZoomNoteId = null;
  
  // Highlight active item in list
  document.querySelectorAll(".video-item").forEach(item => item.classList.remove("active"));
}

function selectVideo(videoId) {
  const video = state.videos.find(v => v.id === videoId);
  if (!video) {
    showWelcome();
    return;
  }

  state.activeVideoId = videoId;
  state.activeZoomNoteId = null; // reset zoom level on change
  welcomePanel.style.display = "none";
  editorPanel.style.display = "flex";

  // Highlight list item
  document.querySelectorAll(".video-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-id") === videoId);
  });

  // Render Header Details
  editorTitle.textContent = video.title;
  editorLink.href = video.url;
  editorLink.style.display = video.url ? "inline-block" : "none";

  const sourceInfo = detectVideoSource(video.url);
  editorSourceBadge.textContent = sourceInfo.label;
  editorSourceBadge.className = "source-badge";
  if (sourceInfo.label.includes("YouTube")) editorSourceBadge.classList.add("badge-youtube");
  else if (sourceInfo.label.includes("X.com")) editorSourceBadge.classList.add("badge-x");
  else if (sourceInfo.label.includes("Instagram")) editorSourceBadge.classList.add("badge-instagram");
  else editorSourceBadge.classList.add("badge-link");

  // Fill Settings Tab
  editTimeframe.value = video.timeframe || "week";
  editPriority.value = video.priority || "uncategorized";
  editNiche.value = video.niche || "uncategorized";
  dateAddedInput.value = video.dateAdded || "";
  dateWatchedInput.value = video.dateWatched || "";
  dateCompleteInput.value = video.dateComplete || "";

  // Render Subsections
  renderVideoTags();
  renderNotes();
  renderHistoryLog();
  renderCalendar();
  updateInsights();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Listen for message from popup to auto-refresh
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "REFRESH_VIDEOS") {
      loadData();
    }
  });

  // Paste Add Link Action
  pasteAddBtn.addEventListener("click", handlePasteAdd);
  pasteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handlePasteAdd();
  });

  // Search Input Action
  searchInput.addEventListener("input", () => {
    state.filters.search = searchInput.value.toLowerCase();
    renderSidebar();
  });

  // Delete Video Action
  deleteVideoBtn.addEventListener("click", () => {
    if (!state.activeVideoId) return;
    if (confirm("Are you sure you want to delete this video and all its notes?")) {
      state.videos = state.videos.filter(v => v.id !== state.activeVideoId);
      state.activeVideoId = null;
      saveData();
      showWelcome();
    }
  });

  // Header Title Edit
  editorTitle.addEventListener("blur", () => {
    const video = state.videos.find(v => v.id === state.activeVideoId);
    if (video) {
      const newTitle = editorTitle.textContent.trim();
      video.title = newTitle || "Untitled Video";
      saveData();
    }
  });
  editorTitle.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      editorTitle.blur();
    }
  });

  // Form Field Changers
  editTimeframe.addEventListener("change", () => updateVideoField("timeframe", editTimeframe.value));
  editPriority.addEventListener("change", () => updateVideoField("priority", editPriority.value));
  editNiche.addEventListener("change", () => updateVideoField("niche", editNiche.value));
  dateAddedInput.addEventListener("change", () => updateVideoField("dateAdded", dateAddedInput.value));
  dateWatchedInput.addEventListener("change", () => updateVideoField("dateWatched", dateWatchedInput.value));
  dateCompleteInput.addEventListener("change", () => updateVideoField("dateComplete", dateCompleteInput.value));

  // History Logger Actions
  addHistoryLogBtn.addEventListener("click", handleAddHistoryLog);

  // Settings / Backup Modals
  exportImportBtn.addEventListener("click", () => { settingsModal.style.display = "flex"; });
  closeSettingsBtn.addEventListener("click", () => { settingsModal.style.display = "none"; });
  exportBackupBtn.addEventListener("click", exportBackupData);
  importBackupTriggerBtn.addEventListener("click", () => importBackupFileInput.click());
  importBackupFileInput.addEventListener("change", handleImportBackup);
  resetDataBtn.addEventListener("click", handleResetData);

  // Tags Modal
  btnAddTag.addEventListener("click", () => { tagModal.style.display = "flex"; newTagInput.focus(); });
  closeTagBtn.addEventListener("click", () => { tagModal.style.display = "none"; });
  saveTagBtn.addEventListener("click", handleAddTag);
  newTagInput.addEventListener("keydown", (e) => { if (e.key === "Enter") handleAddTag(); });

  // Shortcuts Modal
  helpShortcutsBtn.addEventListener("click", () => { shortcutsModal.style.display = "flex"; });
  closeShortcutsBtn.addEventListener("click", () => { shortcutsModal.style.display = "none"; });

  // Calendar Controls
  calendarPrevBtn.addEventListener("click", () => { adjustCalendarMonth(-1); });
  calendarNextBtn.addEventListener("click", () => { adjustCalendarMonth(1); });
}

function updateVideoField(field, value) {
  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (video) {
    video[field] = value;
    saveData();
  }
}

// --- PASTE & PARSE VIDEO LINK ---
function handlePasteAdd() {
  const url = pasteInput.value.trim();
  if (!url) return;

  // Simple validation
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    alert("Please enter a valid URL beginning with http:// or https://");
    return;
  }

  // Pre-extract nice name placeholders
  let titlePlaceholder = "Pasted Link";
  const sourceInfo = detectVideoSource(url);
  try {
    const urlObj = new URL(url);
    titlePlaceholder = urlObj.pathname.split("/").pop() || urlObj.hostname;
    
    // Clean YouTube paths
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      if (urlObj.searchParams.get("v")) {
        titlePlaceholder = "YouTube: " + urlObj.searchParams.get("v");
      } else if (urlObj.pathname.includes("/shorts/")) {
        titlePlaceholder = "YouTube Short: " + urlObj.pathname.split("/shorts/")[1];
      }
    } else if (url.includes("x.com") || url.includes("twitter.com")) {
      titlePlaceholder = "X Post by " + urlObj.pathname.split("/")[1];
    } else if (url.includes("instagram.com")) {
      titlePlaceholder = "Instagram Post: " + urlObj.pathname.split("/")[2];
    }
  } catch (e) {
    titlePlaceholder = "Video Link Details";
  }

  const newVideo = {
    id: "vid_" + Date.now(),
    title: titlePlaceholder,
    url: url,
    timeframe: "week",
    priority: "uncategorized",
    niche: "uncategorized",
    tags: [],
    dateAdded: new Date().toISOString().split("T")[0],
    dateWatched: "",
    dateComplete: "",
    watchHistory: [],
    notes: [
      {
        id: "note_" + Date.now() + "_1",
        text: "Add notes here...",
        children: []
      }
    ]
  };

  state.videos.unshift(newVideo);
  pasteInput.value = "";
  chrome.storage.local.set({ videos: state.videos }, () => {
    loadData();
    selectVideo(newVideo.id);
  });
}

function detectVideoSource(url) {
  if (!url) return { label: "Web", bgColor: "rgba(255,255,255,0.1)", color: "#f8fafc", borderColor: "rgba(255,255,255,0.2)" };

  const parsedUrl = url.toLowerCase();
  if (parsedUrl.includes("youtube.com") || parsedUrl.includes("youtu.be")) {
    return { label: "YouTube 🔴" };
  } else if (parsedUrl.includes("x.com") || parsedUrl.includes("twitter.com")) {
    return { label: "X.com 🐦" };
  } else if (parsedUrl.includes("instagram.com")) {
    return { label: "Instagram 📸" };
  } else {
    return { label: "Link 🔗" };
  }
}

// --- FILTERS LOGIC ---
function setupFilters() {
  const registerFilterPills = (containerEl, stateKey) => {
    containerEl.addEventListener("click", (e) => {
      const pill = e.target.closest(".pill");
      if (!pill) return;

      containerEl.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      state.filters[stateKey] = pill.getAttribute("data-filter");
      renderSidebar();
    });
  };

  registerFilterPills(timeframeFilters, "timeframe");
  registerFilterPills(priorityFilters, "priority");
  registerFilterPills(nicheFilters, "niche");
}

// --- SIDEBAR RENDERING ---
function renderSidebar() {
  videoListEl.innerHTML = "";
  
  // Collect unique tags to display below filters
  const uniqueTags = new Set();
  state.videos.forEach(v => {
    if (v.tags) v.tags.forEach(t => uniqueTags.add(t));
  });

  renderTagsFilterList(Array.from(uniqueTags));

  // Filter video items
  const filtered = state.videos.filter(video => {
    // Search Filter
    if (state.filters.search) {
      const titleMatches = video.title.toLowerCase().includes(state.filters.search);
      const tagMatches = video.tags && video.tags.some(t => t.toLowerCase().includes(state.filters.search));
      
      // Match within bullet notes recursive function
      const noteMatches = checkNotesContainText(video.notes || [], state.filters.search);

      if (!titleMatches && !tagMatches && !noteMatches) return false;
    }

    // Timeframe Filter
    if (state.filters.timeframe !== "all" && video.timeframe !== state.filters.timeframe) return false;

    // Priority Filter
    if (state.filters.priority !== "all" && video.priority !== state.filters.priority) return false;

    // Niche Filter
    if (state.filters.niche !== "all" && video.niche !== state.filters.niche) return false;

    // Selected Tag Filter
    if (state.filters.tag && (!video.tags || !video.tags.includes(state.filters.tag))) return false;

    return true;
  });

  activeCountEl.textContent = `${filtered.length} of ${state.videos.length} videos`;

  if (filtered.length === 0) {
    videoListEl.innerHTML = `<div class="empty-state">No videos match filters.</div>`;
    return;
  }

  filtered.forEach(video => {
    const isSelected = video.id === state.activeVideoId;
    const isCompleted = !!video.dateComplete;
    const sourceInfo = detectVideoSource(video.url);

    const card = document.createElement("div");
    card.className = `video-item ${isSelected ? "active" : ""}`;
    card.setAttribute("data-id", video.id);

    // Badges collection HTML
    let badgesHtml = "";
    if (video.priority === "high") {
      badgesHtml += `<span class="meta-pill pill-high">High</span>`;
    }
    if (video.niche && video.niche !== "uncategorized") {
      const nicheLabels = { urgent: "🚨 Urgent", money: "💰 Niche", relax: "☕ Relax", kids: "🧸 Kids", family: "👨‍👩‍👧‍👦 Family", health: "🍏 Health" };
      badgesHtml += `<span class="meta-pill">${nicheLabels[video.niche] || video.niche}</span>`;
    }
    if (isCompleted) {
      badgesHtml += `<span class="meta-pill pill-completed">Completed</span>`;
    } else if (video.dateWatched) {
      badgesHtml += `<span class="meta-pill">Watched</span>`;
    }

    let sourceClass = "badge-link";
    if (sourceInfo.label.includes("YouTube")) sourceClass = "badge-youtube";
    else if (sourceInfo.label.includes("X.com")) sourceClass = "badge-x";
    else if (sourceInfo.label.includes("Instagram")) sourceClass = "badge-instagram";

    card.innerHTML = `
      <div class="item-top">
        <span class="source-badge ${sourceClass}">${sourceInfo.label}</span>
        <span style="font-size: 10px; color: var(--text-muted);">${video.dateAdded || ""}</span>
      </div>
      <div class="item-title">${video.title}</div>
      <div class="item-meta">
        ${badgesHtml}
        ${video.timeframe ? `<span class="meta-pill" style="opacity: 0.7;">⏰ ${video.timeframe}</span>` : ""}
      </div>
    `;

    card.addEventListener("click", () => selectVideo(video.id));
    videoListEl.appendChild(card);
  });
}

function checkNotesContainText(notesList, text) {
  for (let note of notesList) {
    if (note.text && note.text.toLowerCase().includes(text)) return true;
    if (note.children && checkNotesContainText(note.children, text)) return true;
  }
  return false;
}

function renderTagsFilterList(tags) {
  existingTagsContainer.innerHTML = "";
  if (tags.length === 0) {
    existingTagsContainer.innerHTML = `<span style="font-size:11px; color:var(--text-muted);">No tags created.</span>`;
    return;
  }

  tags.forEach(tag => {
    const badge = document.createElement("span");
    badge.className = `tag-badge ${state.filters.tag === tag ? "active" : ""}`;
    badge.textContent = `#${tag}`;
    badge.addEventListener("click", () => {
      if (state.filters.tag === tag) {
        state.filters.tag = null; // Toggle off
      } else {
        state.filters.tag = tag;
      }
      renderSidebar();
    });
    existingTagsContainer.appendChild(badge);
  });
}

function renderWelcomeStats() {
  const total = state.videos.length;
  const completed = state.videos.filter(v => !!v.dateComplete).length;

  document.getElementById("welcome-stat-total").textContent = total;
  document.getElementById("welcome-stat-completed").textContent = completed;
}

// --- TABS SYSTEM ---
function setupTabs() {
  tabLinks.forEach(link => {
    link.addEventListener("click", () => {
      tabLinks.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      link.classList.add("active");
      const targetTabId = link.getAttribute("data-tab");
      document.getElementById(targetTabId).classList.add("active");

      // Rerender tab-specific dashboards
      if (targetTabId === "tab-calendar") {
        renderCalendar();
      } else if (targetTabId === "tab-insights") {
        updateInsights();
      }
    });
  });
}

// --- EDIT TAGS LOGIC ---
function renderVideoTags() {
  editorTagsBox.innerHTML = "";
  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (!video || !video.tags || video.tags.length === 0) {
    editorTagsBox.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">No tags. Add one.</span>`;
    return;
  }

  video.tags.forEach(tag => {
    const tagBadge = document.createElement("span");
    tagBadge.className = "editor-tag";
    tagBadge.innerHTML = `
      #${tag}
      <button class="remove-tag-btn" data-tag="${tag}">&times;</button>
    `;

    tagBadge.querySelector(".remove-tag-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      const tagToRemove = e.target.getAttribute("data-tag");
      video.tags = video.tags.filter(t => t !== tagToRemove);
      saveData();
      renderVideoTags();
    });

    editorTagsBox.appendChild(tagBadge);
  });
}

function handleAddTag() {
  const tagName = newTagInput.value.trim().toLowerCase().replace(/#/g, "");
  if (!tagName) return;

  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (video) {
    if (!video.tags) video.tags = [];
    if (!video.tags.includes(tagName)) {
      video.tags.push(tagName);
      saveData();
      renderVideoTags();
    }
  }

  newTagInput.value = "";
  tagModal.style.display = "none";
}

// --- WATCH LOG HISTORY ---
function renderHistoryLog() {
  historyLogList.innerHTML = "";
  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (!video || !video.watchHistory || video.watchHistory.length === 0) {
    historyLogList.innerHTML = `<div class="empty-history-text">No watch sessions logged yet.</div>`;
    return;
  }

  video.watchHistory.forEach((log, index) => {
    const row = document.createElement("div");
    row.className = "history-item";
    row.innerHTML = `
      <div>
        <span class="history-date">${log.date}</span>
        <span style="margin: 0 6px; opacity:0.5;">-</span>
        <span class="history-viewer">${log.viewer || "Viewer"}</span>
      </div>
      <button class="history-actions" data-index="${index}">Delete</button>
    `;

    row.querySelector(".history-actions").addEventListener("click", () => {
      video.watchHistory.splice(index, 1);
      saveData();
      renderHistoryLog();
    });

    historyLogList.appendChild(row);
  });
}

function handleAddHistoryLog() {
  const dateVal = newHistoryDate.value;
  const viewerVal = newHistoryViewer.value.trim() || "Self";

  if (!dateVal) {
    alert("Please select a valid date.");
    return;
  }

  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (video) {
    if (!video.watchHistory) video.watchHistory = [];
    video.watchHistory.push({
      date: dateVal,
      viewer: viewerVal
    });

    // Automatically update the Date Watched to this logged date if it's currently empty
    if (!video.dateWatched) {
      video.dateWatched = dateVal;
      dateWatchedInput.value = dateVal;
    }

    saveData();
    renderHistoryLog();
    newHistoryViewer.value = "";
  }
}

// --- WORKFLOWY NOTE-TAKING LOGIC ---
function renderNotes() {
  nestedNotesRoot.innerHTML = "";
  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (!video) return;

  if (!video.notes || video.notes.length === 0) {
    video.notes = [{ id: "note_" + Date.now(), text: "", children: [] }];
  }

  // Draw Breadcrumbs
  renderNoteBreadcrumbs(video);

  // If zoomed in, render from the zoomed node, else root
  let notesToRender = video.notes;
  if (state.activeZoomNoteId) {
    const found = findNoteById(video.notes, state.activeZoomNoteId);
    if (found && found.note) {
      // Add a header showing we are zoomed in
      const zoomHeader = document.createElement("div");
      zoomHeader.className = "bullet-zoom-header";
      zoomHeader.innerHTML = `
        <span>Focusing on: <strong>"${found.note.text || "Empty Note"}"</strong></span>
        <button class="btn-small" id="zoom-out-header-btn">Zoom Out</button>
      `;
      zoomHeader.querySelector("#zoom-out-header-btn").addEventListener("click", () => {
        zoomOutNote();
      });
      nestedNotesRoot.appendChild(zoomHeader);

      notesToRender = found.note.children;
      zoomOutBtn.removeAttribute("disabled");
      
      // If the zoomed note has no children, create a default empty child for inputting
      if (notesToRender.length === 0) {
        const newChild = { id: "note_" + Date.now(), text: "", children: [] };
        found.note.children.push(newChild);
        saveData();
        notesToRender = found.note.children;
      }
    } else {
      state.activeZoomNoteId = null; // invalid zoom id reset
    }
  } else {
    zoomOutBtn.setAttribute("disabled", "true");
  }

  // Recursive render
  const fragment = document.createDocumentFragment();
  notesToRender.forEach(note => {
    fragment.appendChild(createBulletDOM(note, video.notes));
  });

  nestedNotesRoot.appendChild(fragment);
}

// Recursive function to search/find note details
function findNoteById(notesArray, id, parent = null) {
  for (let i = 0; i < notesArray.length; i++) {
    const note = notesArray[i];
    if (note.id === id) {
      return { note, parentArray: notesArray, index: i, parent };
    }
    if (note.children && note.children.length > 0) {
      const found = findNoteById(note.children, id, note);
      if (found) return found;
    }
  }
  return null;
}

// Find path from root to a note (for breadcrumbs)
function getNotePath(notesArray, targetId, path = []) {
  for (let note of notesArray) {
    const currentPath = [...path, note];
    if (note.id === targetId) {
      return currentPath;
    }
    if (note.children && note.children.length > 0) {
      const childPath = getNotePath(note.children, targetId, currentPath);
      if (childPath) return childPath;
    }
  }
  return null;
}

function renderNoteBreadcrumbs(video) {
  noteBreadcrumbs.innerHTML = "";
  
  const rootSpan = document.createElement("span");
  rootSpan.className = "breadcrumb-item root-breadcrumb";
  rootSpan.textContent = "Root Notes";
  rootSpan.addEventListener("click", () => {
    state.activeZoomNoteId = null;
    renderNotes();
  });
  noteBreadcrumbs.appendChild(rootSpan);

  if (state.activeZoomNoteId) {
    const path = getNotePath(video.notes, state.activeZoomNoteId);
    if (path) {
      path.forEach((note, index) => {
        const item = document.createElement("span");
        item.className = "breadcrumb-item";
        if (index === path.length - 1) {
          item.classList.add("active-zoom");
        }
        item.textContent = note.text || "(empty)";
        item.addEventListener("click", () => {
          state.activeZoomNoteId = note.id;
          renderNotes();
        });
        noteBreadcrumbs.appendChild(item);
      });
    }
  }
}

function zoomOutNote() {
  const video = state.videos.find(v => v.id === state.activeVideoId);
  if (!video || !state.activeZoomNoteId) return;

  const found = findNoteById(video.notes, state.activeZoomNoteId);
  if (found && found.parent) {
    state.activeZoomNoteId = found.parent.id;
  } else {
    state.activeZoomNoteId = null;
  }
  renderNotes();
}

// Event handlers for breadcrumbs toolbar
zoomOutBtn.addEventListener("click", zoomOutNote);

// Create recursive DOM element for notes
function createBulletDOM(note, rootNotesArray) {
  const div = document.createElement("div");
  div.className = "bullet-item";
  div.setAttribute("data-id", note.id);
  
  if (note.children && note.children.length > 0) {
    div.classList.add("has-children");
  }

  const row = document.createElement("div");
  row.className = "bullet-row";

  // Indicator Bullet Point
  const indicator = document.createElement("div");
  indicator.className = "bullet-indicator";
  indicator.title = "Double click to zoom in / focus";
  indicator.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    state.activeZoomNoteId = note.id;
    renderNotes();
  });

  // Text Area Input
  const textarea = document.createElement("textarea");
  textarea.className = "bullet-text-input";
  textarea.value = note.text;
  textarea.placeholder = "Bullet item...";
  textarea.rows = 1;

  // Auto-resize textarea
  setTimeout(() => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }, 0);

  textarea.addEventListener("input", (e) => {
    note.text = e.target.value;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    
    // Save data debounced or instantly
    const video = state.videos.find(v => v.id === state.activeVideoId);
    if (video) {
      chrome.storage.local.set({ videos: state.videos });
    }
  });

  // Keyboard Navigation & Actions
  textarea.addEventListener("keydown", (e) => {
    const video = state.videos.find(v => v.id === state.activeVideoId);
    if (!video) return;

    const found = findNoteById(video.notes, note.id);
    if (!found) return;

    const { parentArray, index, parent } = found;

    // --- ENTER KEY: New Bullet (Sibling) ---
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      
      const newSibling = {
        id: "note_" + Date.now(),
        text: "",
        children: []
      };

      // Insert right below the current node in the current parent list
      parentArray.splice(index + 1, 0, newSibling);
      
      saveData();
      renderNotes();
      focusNoteInput(newSibling.id);
    }

    // --- TAB KEY: Indent Bullet (Move inside above sibling) ---
    else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (index === 0) return; // No sibling above to indent into

      const previousSibling = parentArray[index - 1];
      if (!previousSibling.children) previousSibling.children = [];

      // Move from current array into previous sibling's children
      const [movedItem] = parentArray.splice(index, 1);
      previousSibling.children.push(movedItem);

      saveData();
      renderNotes();
      focusNoteInput(note.id);
    }

    // --- SHIFT + TAB KEY: Outdent Bullet (Move up a level in hierarchy) ---
    else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      if (!parent) return; // Already at root notes level

      // Find grandparent
      const grandparentFound = findNoteById(video.notes, parent.id);
      if (!grandparentFound) return;

      const grandparentArray = grandparentFound.parentArray;
      const parentIndex = grandparentFound.index;

      // Move out of parent's children into grandparent's children, right after the parent
      const [movedItem] = parentArray.splice(index, 1);
      grandparentArray.splice(parentIndex + 1, 0, movedItem);

      saveData();
      renderNotes();
      focusNoteInput(note.id);
    }

    // --- BACKSPACE KEY: Delete on empty ---
    else if (e.key === "Backspace" && textarea.value.length === 0) {
      if (note.children && note.children.length > 0) return; // Don't delete if has children

      e.preventDefault();
      
      // Determine what to focus next
      let focusIdToSet = null;
      if (index > 0) {
        // Focus on previous sibling (or its deepest child if you want, but previous sibling is standard)
        focusIdToSet = parentArray[index - 1].id;
      } else if (parent) {
        // Focus parent
        focusIdToSet = parent.id;
      }

      // Remove from array
      parentArray.splice(index, 1);
      
      // If we deleted the last remaining bullet, ensure there's at least one empty root note
      if (video.notes.length === 0) {
        const defaultRoot = { id: "note_" + Date.now(), text: "", children: [] };
        video.notes.push(defaultRoot);
        focusIdToSet = defaultRoot.id;
      }

      saveData();
      renderNotes();
      if (focusIdToSet) focusNoteInput(focusIdToSet);
    }

    // --- ARROW UP: Focus above ---
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const allTextareas = Array.from(nestedNotesRoot.querySelectorAll(".bullet-text-input"));
      const currentIdx = allTextareas.indexOf(textarea);
      if (currentIdx > 0) {
        allTextareas[currentIdx - 1].focus();
      }
    }

    // --- ARROW DOWN: Focus below ---
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      const allTextareas = Array.from(nestedNotesRoot.querySelectorAll(".bullet-text-input"));
      const currentIdx = allTextareas.indexOf(textarea);
      if (currentIdx < allTextareas.length - 1) {
        allTextareas[currentIdx + 1].focus();
      }
    }
  });

  row.appendChild(indicator);
  row.appendChild(textarea);
  div.appendChild(row);

  // Render children recursive
  if (note.children && note.children.length > 0) {
    const childrenContainer = document.createElement("div");
    childrenContainer.className = "bullet-children";
    note.children.forEach(child => {
      childrenContainer.appendChild(createBulletDOM(child, rootNotesArray));
    });
    div.appendChild(childrenContainer);
  }

  return div;
}

// Focus on a particular note input field
function focusNoteInput(id) {
  setTimeout(() => {
    const bulletContainer = nestedNotesRoot.querySelector(`[data-id="${id}"]`);
    if (bulletContainer) {
      const input = bulletContainer.querySelector(".bullet-text-input");
      if (input) {
        input.focus();
        // Place caret at end
        input.selectionStart = input.selectionEnd = input.value.length;
      }
    }
  }, 30);
}

// --- CALENDAR VIEW GENERATION ---
function renderCalendar() {
  calendarGrid.innerHTML = "";
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  calendarMonthYear.textContent = `${monthNames[state.calendarMonth]} ${state.calendarYear}`;

  const firstDayIndex = new Date(state.calendarYear, state.calendarMonth, 1).getDay();
  const totalDays = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Fill pre-month empty slots
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "calendar-day day-empty";
    calendarGrid.appendChild(emptyCell);
  }

  // Draw Days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const cellDateStr = `${state.calendarYear}-${String(state.calendarMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    
    const dayCell = document.createElement("div");
    dayCell.className = "calendar-day";
    dayCell.setAttribute("data-date", cellDateStr);

    if (cellDateStr === todayStr) {
      dayCell.classList.add("day-today");
    }

    if (state.calendarSelectedDate === cellDateStr) {
      dayCell.classList.add("day-selected");
    }

    dayCell.innerHTML = `<span class="day-num">${dayNum}</span>`;

    // Find video events matching this date
    const events = getVideoEventsForDate(cellDateStr);
    if (events.added.length > 0 || events.watched.length > 0 || events.completed.length > 0) {
      const dotsContainer = document.createElement("div");
      dotsContainer.className = "day-dots";
      
      if (events.added.length > 0) dotsContainer.innerHTML += `<span class="dot dot-added" title="Added: ${events.added.length}"></span>`;
      if (events.watched.length > 0) dotsContainer.innerHTML += `<span class="dot dot-watched" title="Watched: ${events.watched.length}"></span>`;
      if (events.completed.length > 0) dotsContainer.innerHTML += `<span class="dot dot-completed" title="Completed: ${events.completed.length}"></span>`;
      
      dayCell.appendChild(dotsContainer);
    }

    dayCell.addEventListener("click", () => {
      selectCalendarDate(cellDateStr);
    });

    calendarGrid.appendChild(dayCell);
  }

  // Render day details if selected
  renderCalendarSelectedDayDetails();
}

function adjustCalendarMonth(offset) {
  state.calendarMonth += offset;
  if (state.calendarMonth < 0) {
    state.calendarMonth = 11;
    state.calendarYear -= 1;
  } else if (state.calendarMonth > 11) {
    state.calendarMonth = 0;
    state.calendarYear += 1;
  }
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  if (state.calendarSelectedDate === dateStr) {
    state.calendarSelectedDate = null; // toggle off selection
  } else {
    state.calendarSelectedDate = dateStr;
  }
  renderCalendar();
}

function getVideoEventsForDate(dateStr) {
  const events = { added: [], watched: [], completed: [] };
  
  state.videos.forEach(video => {
    if (video.dateAdded === dateStr) {
      events.added.push(video);
    }
    
    // Check main Date Watched or log history dates
    const logMatch = video.watchHistory && video.watchHistory.some(h => h.date === dateStr);
    if (video.dateWatched === dateStr || logMatch) {
      events.watched.push(video);
    }
    
    if (video.dateComplete === dateStr) {
      events.completed.push(video);
    }
  });

  return events;
}

function renderCalendarSelectedDayDetails() {
  dayEventsList.innerHTML = "";
  if (!state.calendarSelectedDate) {
    calendarDayDetails.innerHTML = `<h3>Select a calendar date to view specific video activity</h3>`;
    return;
  }

  const events = getVideoEventsForDate(state.calendarSelectedDate);
  calendarDayDetails.innerHTML = `
    <h3>Milestones on ${state.calendarSelectedDate}</h3>
    <div id="day-events-list"></div>
  `;
  const container = document.getElementById("day-events-list");

  let totalEvents = 0;

  const renderEventSub = (videoList, typeLabel, borderClass) => {
    videoList.forEach(v => {
      totalEvents++;
      const div = document.createElement("div");
      div.className = "day-event-row";
      div.innerHTML = `
        <span class="dot ${borderClass}"></span>
        <strong style="color:var(--primary); font-size:11px;">[${typeLabel}]</strong>
        <span style="cursor:pointer; text-decoration:underline;" class="view-vid-link" data-id="${v.id}">${v.title}</span>
      `;
      div.querySelector(".view-vid-link").addEventListener("click", () => {
        selectVideo(v.id);
        // Switch back to Notes tab
        document.querySelector('[data-tab="tab-notes"]').click();
      });
      container.appendChild(div);
    });
  };

  renderEventSub(events.added, "Added", "dot-added");
  renderEventSub(events.watched, "Watched/Logged", "dot-watched");
  renderEventSub(events.completed, "Completed", "dot-completed");

  if (totalEvents === 0) {
    container.innerHTML = `<p style="font-size:12px; color:var(--text-muted);">No activity recorded for this day.</p>`;
  }
}

// --- INSIGHTS / ANALYTICS ---
function updateInsights() {
  const total = state.videos.length;
  if (total === 0) {
    document.getElementById("insights-progress-percent").textContent = "0%";
    drawProgressRing(0);
    return;
  }

  const completed = state.videos.filter(v => !!v.dateComplete).length;
  const watched = state.videos.filter(v => !v.dateComplete && !!v.dateWatched).length;
  const addedOnly = state.videos.filter(v => !v.dateComplete && !v.dateWatched).length;

  const pct = Math.round((completed / total) * 100);
  document.getElementById("insights-progress-percent").textContent = `${pct}%`;
  drawProgressRing(pct);

  document.getElementById("insights-num-completed").textContent = completed;
  document.getElementById("insights-num-watched").textContent = watched;
  document.getElementById("insights-num-added").textContent = addedOnly;

  // Compile Category distribution counts
  const categoryCounts = { urgent: 0, money: 0, relax: 0, kids: 0, family: 0, health: 0, uncategorized: 0 };
  // Compile Timeframe counts
  const timeframeCounts = { today: 0, week: 0, month: 0, quarter: 0, year: 0 };

  state.videos.forEach(v => {
    if (v.niche in categoryCounts) categoryCounts[v.niche]++;
    else categoryCounts.uncategorized++;

    if (v.timeframe in timeframeCounts) timeframeCounts[v.timeframe]++;
  });

  renderFlexBarChart("insights-categories-chart", [
    { label: "🚨 Urgent", count: categoryCounts.urgent },
    { label: "💰 Make Money", count: categoryCounts.money },
    { label: "☕ Relax", count: categoryCounts.relax },
    { label: "🧸 Kids", count: categoryCounts.kids },
    { label: "👨‍👩‍👧‍👦 Family", count: categoryCounts.family },
    { label: "🍏 Health", count: categoryCounts.health },
    { label: "General", count: categoryCounts.uncategorized }
  ]);

  renderFlexBarChart("insights-timeframes-chart", [
    { label: "Today", count: timeframeCounts.today },
    { label: "This Week", count: timeframeCounts.week },
    { label: "This Month", count: timeframeCounts.month },
    { label: "This Quarter", count: timeframeCounts.quarter },
    { label: "This Year", count: timeframeCounts.year }
  ]);
}

function drawProgressRing(percent) {
  const circle = document.getElementById("insights-progress-circle");
  if (!circle) return;
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;

  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

function renderFlexBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const maxVal = Math.max(...data.map(d => d.count), 1);

  data.forEach(item => {
    const row = document.createElement("div");
    row.className = "chart-bar-row";
    
    const pct = (item.count / maxVal) * 100;

    row.innerHTML = `
      <div class="chart-bar-label">
        <span>${item.label}</span>
        <strong>${item.count}</strong>
      </div>
      <div class="chart-bar-outer">
        <div class="chart-bar-inner" style="width: ${pct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });
}

// --- BACKUP & SETTINGS ACTIONS ---
function exportBackupData() {
  const dataStr = JSON.stringify({ videos: state.videos }, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `watch_list_backup_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleImportBackup(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const imported = JSON.parse(evt.target.result);
      if (imported && Array.isArray(imported.videos)) {
        state.videos = imported.videos;
        saveData();
        alert(`Successfully imported backup with ${imported.videos.length} video entries!`);
        settingsModal.style.display = "none";
        loadData();
      } else {
        alert("Invalid file format. Backup must contain a 'videos' array list.");
      }
    } catch (err) {
      alert("Error parsing JSON backup file: " + err.message);
    }
  };
  reader.readAsText(file);
}

function handleResetData() {
  if (confirm("🚨 WARNING: Are you absolutely sure you want to delete ALL extension data? This cannot be undone.")) {
    chrome.storage.local.clear(() => {
      state.videos = [];
      state.activeVideoId = null;
      state.activeZoomNoteId = null;
      saveData();
      alert("All extension storage data reset successfully.");
      settingsModal.style.display = "none";
      loadData();
      showWelcome();
    });
  }
}
