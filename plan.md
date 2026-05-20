# Implementation Plan - Multi-View Workspace Expansion 🚀

This document outlines the technical design and layout additions made to support Trello Kanban, Global Calendar, Priority Kanban, Global Search, and Focus mode views in the Watch List Chrome Extension.

---

## 🎨 Layout & Architecture Design

To support a seamless multi-view workspace in the sidepanel without bloating the layout, we implemented a state-driven view-switching architecture:

1. **Workspace Navigation Header**:
   - Added a sub-header underneath the main search and quick-add bar in `sidepanel.html`.
   - Features 6 glassmorphic navigation buttons: Notes, Trello, Calendar, Priority, Search, and Focus.
   - Highlighting active mode button with distinct background gradient.

2. **Conditional View Panels**:
   - Created `#workspace-panels` container in the layout.
   - Declared multiple panel divs with class `.view-panel`:
     - `#view-notes`: Holds the classic sidepanel list & editor view.
     - `#view-trello`: Grid of To Watch, Watching, and Completed columns.
     - `#view-calendar`: Unified month calendar grid with daily event timelines.
     - `#view-priority`: Grid of High, Low, and Uncategorized columns.
     - `#view-search`: Multi-attribute search indexing page with dynamic snippet highlighting.
     - (Focus mode overrides body styling with `.focus-active` class, hiding non-editor elements).

3. **Active Panel Switching**:
   - Toggling the `.active-view` class on panels via JavaScript (`switchWorkspaceView(mode)`).
   - Only one panel is set to `display: flex;` or `display: block;` at any given time, others are hidden (`display: none;`).

---

## ⚡️ Detailed Technical Implementations

### 1. Trello Board
- **Columns**: To Watch, Watching, Completed.
- **Categorization Rule**:
  - *To Watch*: Video has no watch date and no completed date.
  - *Watching*: Video has watch date but no completed date.
  - *Completed*: Video has completed date.
- **Action Triggers**:
  - "Watch" button: Sets watched date to today, adds entry to viewer log.
  - "Complete" button: Sets completed date to today.
  - "Reset" button: Wipes watch/complete dates.
  - "Re-watch" button: Re-opens a completed video back to "To Watch" or "Watching".
  - Clicking on a card body programmatically selects the video and switches workspace mode to Notes view.

### 2. Priority Board
- **Columns**: High, Low, Uncategorized.
- **Categorization Rule**: Filtered by `video.priority` property.
- **Action Triggers**: Quick toggles to move cards to alternate columns.

### 3. Global Calendar
- **Grid Layout**: Displays days of the month with event indicators.
- **Milestone Dots**: Maps video activities: Added (blue/cyan), Watched/Logged (yellow/orange), Completed (green).
- **Interactive Details**: Clicking any calendar day renders a daily schedule panel mapping all milestones with links to view notes.

### 4. Search Explorer
- **Index Scope**: Indexes Video Titles, Tags, and recursively searches through nested bullet nodes.
- **Snippet Rendering**: Retrieves matching nested note text bullets, highlights query terms with yellow background badges (`<span class="highlight">`), and presents them as summary cards.

### 5. Focus Mode
- **Layout Shift**: Sets a body class `.focus-active` which hides:
  - Extension Header (Logo & Title)
  - Quick Link Adder Bar
  - Sidebar Video List / Search Filters
  - Workspace View Selector
  - Editor settings tabs (Metadata Details, Watch Log History)
- **Visible Elements**: Only the core nested notes Workflowy editor panel is kept visible, occupying 100% of the viewport.
- **Exit Interaction**: A floating hover-active banner in the corner allowing the user to return to the normal layout.
