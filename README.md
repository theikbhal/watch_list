# Watch List Chrome Extension 📺✍️

A premium Chrome extension designed for bookmarking and taking structured, nested notes on videos (YouTube, X.com, Instagram, and more) while watching them. Using a **Side Panel layout**, it enables side-by-side note-taking without interrupting your media consumption.

---

## 🛠 Features

- **Side Panel Interface**: Keep your notes open on the side of your browser while watching videos on YouTube, X (Twitter), or Instagram.
- **Workflowy-style Nested Note-taking**: Write notes in a clean hierarchical bullet-point list. Zoom in on any sub-bullet to focus, and zoom out via interactive breadcrumbs.
- **Timeframe & Priority Categories**: Organize videos by when you plan to watch them (Today, This Week, This Month, This Quarter, This Year) and their importance (High Priority, Low Priority, Uncategorized).
- **Special Niches**: Group content under dedicated categories: Urgent, Relax, Kids, Family, Health, Make Money.
- **Milestone Date Tracking**: Monitor dates added, dates watched, and dates completed, alongside logs of who watched and when.
- **Calendar View**: A visual heat-map/grid of your watch activity (added, watched, and completed dates).
- **Insights**: Interactive analytics on category distribution and progress tracking.

---

## 🚀 Installation (Load Unpacked)

1. Clone or download this repository.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** in the top-left corner.
5. Select the `watch_list` folder containing the extension files.
6. Click the extension icon in the toolbar, or open the **Side Panel** from Chrome's panel dropdown.

---

## 📅 Roadmap & Status (Complete vs Incomplete)

Below is the live status of the features planned for the extension:

### 1. Project Initialization
- [x] Git repository initialization
- [x] README documentation with status tracking
- [x] Manifest configuration (`manifest.json` MV3)
- [x] Background worker configuration (`background.js`)

### 2. Quick Capture Layout
- [x] Quick-add popup interface (`popup.html` / `popup.js`)
- [x] Current active tab URL parser (auto-fills YouTube, X/Twitter, Instagram links)

### 3. Main Dashboard & Sidebar Layout
- [x] Glassmorphic dark UI dashboard (`sidepanel.html` / `sidepanel.css`)
- [x] Category switcher & filters (Timeframes, Priorities, Niches)
- [x] Tags management interface

### 4. Interactive Note-taking System (Workflowy style)
- [x] Nested bullet list state model
- [x] Keyboard navigation (`Tab` to indent, `Shift+Tab` to outdent, `Enter` to insert sibling)
- [x] Bullet Focus / Zoom In (double click or bullet click zoom)
- [x] Breadcrumb Navigation / Zoom Out

### 5. Date Tracking & Calendar
- [x] Milestone dates editor (Added, Watched, Completed dates)
- [x] Watch log manager ("Who watched on what date")
- [x] Dynamic custom Month Calendar rendering with event dots

### 6. Analytics & Utilities
- [x] Insights Dashboard (Analytics charts / distribution statistics)
- [x] Local storage backup (JSON Import/Export)
- [x] Web Store publishing assets (Privacy Policy & Icons)

---

## 🔒 Privacy Policy

Our Privacy Policy is detailed in [PRIVACY_POLICY.md](./PRIVACY_POLICY.md). This extension stores all list data, notes, and preferences locally in the user's browser via `chrome.storage.local`. No personal data is collected, stored, or transmitted to external servers.
