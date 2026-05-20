# Task List - Watch List Chrome Extension 📺✍️

Below is the structured list of all implemented features and future enhancements.

## 🟩 Completed Tasks (What's Complete)

### 1. Workspace Views
- [x] **Trello Kanban View**: Interactive board with columns: *To Watch*, *Watching*, and *Completed*. Allows moving videos between columns with instant actions (Watch, Complete, Reset, Re-watch) and clicking cards to jump to Notes.
- [x] **Priority Kanban View**: Kanban board with columns: *High Priority*, *Low Priority*, and *Uncategorized*. Simple toggle buttons (Low, High, Clear) to move cards between columns instantly.
- [x] **Calendar View (Global)**: High-fidelity monthly calendar visualizing added, watched, and completed milestones across all videos. Click on days to inspect detailed event lists.
- [x] **Search Explorer View**: Multi-attribute search indexing video titles, tags, niches, and recursively scanning nested bullet-point notes. Highlights query terms dynamically inside results.
- [x] **Focus View (Minimalistic)**: Instantly declutters the entire sidebar UI, keeping only the media-notes editor visible for distraction-free writing. Includes a hover-reveal exit button.
- [x] **Notes View**: The classic master sidepanel layout showing all videos, filters, and settings.

### 2. Note-Taking Engine (Workflowy Style)
- [x] **Nested Bullets**: Fully recursive nesting supporting arbitrary levels.
- [x] **Keyboard Shortcuts**: `Tab` to indent, `Shift+Tab` to outdent, `Enter` to create new bullet, `Backspace` on empty bullet to delete.
- [x] **Workflowy Zooming**: Click bullet nodes to zoom in, and use breadcrumbs or the Zoom Out button to navigate back up.
- [x] **Paste Links**: Auto-fill links from YouTube, X.com, Instagram, and general webs.

### 3. Date & History Tracking
- [x] **Milestone Dates**: Edit Added Date, Watched Date, Completed Date.
- [x] **Viewer Logs**: Add history records with dates and names of who watched the video.

### 4. Storage & Settings
- [x] **Local Storage**: Auto-saves locally inside `chrome.storage.local`.
- [x] **JSON Backup**: Import and export your watch list data.
- [x] **Data Reset**: Full wipe button for settings.

---

## 🟨 Future Enhancements (What's Not Complete / Backlog)
- [ ] **Cloud Sync**: Optional cloud sync with Firebase or Supabase.
- [ ] **Automatic Video Title Fetching**: Query YouTube/Twitter APIs to fetch titles automatically instead of using the path placeholder.
- [ ] **Dark/Light Theme Toggle**: Quick switch between glassmorphic dark and light theme styles.
- [ ] **Custom Category Niches**: Allow users to add/delete custom niche tags.
- [ ] **Reminder Notifications**: Chrome notifications reminding the user to watch high priority videos.
