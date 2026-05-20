# Chrome Web Store Listing - Watch List Extension 🎬

This document contains all the necessary text copy, metadata, and asset instructions needed to publish the **Watch List** extension on the Chrome Web Store.

---

## 📝 Product Metadata

- **Extension Name**: Watch List: Video Bookmark & Nested Notes
- **Short Description (max 150 chars)**: Bookmarks videos from YouTube, X (Twitter), and Instagram and lets you take structured, Workflowy-style nested notes in a side panel.
- **Categories**: Productivity, Developer Tools, or Social & Communication
- **Keywords/Tags**: watch list, video notes, bookmarks, workflowy, side panel, youtube notes, x notes, instagram bookmark

---

## 📄 Detailed Description

**Watch List** is a premium, lightweight, and local-first Chrome extension designed for people who learn from videos. Whether you are watching educational tutorials on YouTube, tech insights on X (formerly Twitter), or guides on Instagram, Watch List provides a dedicated **Side Panel** to capture structure, logs, and dates without breaking your flow.

Take notes directly alongside your video without context switching!

### Key Features:

1. **Integrated Side Panel Workspace**: Keep your notes open side-by-side with your active browser tab. Perfect for taking notes while playing a video in the main window.
2. **Workflowy-Style Nested Editor**: Write notes in a natural hierarchy.
   - Use `Enter` to create sibling bullet points.
   - Use `Tab` to indent, and `Shift + Tab` to outdent.
   - Double-click any bullet to Zoom In (focus on just that section).
   - Use interactive breadcrumbs to Zoom Out.
3. **Date Milestone Tracker**: Manage dates Added, Watched, and Completed.
4. **Watch Log History**: Track multiple watch sessions. Record when you watched and who watched (great for group learning, family, or tracking content reviews).
5. **Niche & Priority Categorization**:
   - Organize items by Timeframe: *Today, This Week, This Month, This Quarter, This Year*.
   - Filter by Priority: *High, Low, or Uncategorized*.
   - Assign to specialized niches: *Urgent, Make Money, Relax, Kids Category, Family, and Health*.
6. **Analytics Insights**: Visual statistics showing watch completion ratios and categories distribution charts.
7. **Interactive Calendar View**: A custom month calendar mapping your watch activities (Added, Watched, and Completed milestones).
8. **Local-First & Private**: All notes, links, and log histories are stored securely in your browser's local storage (`chrome.storage.local`). No external databases, trackers, or sign-ups required.
9. **Data Export/Import**: Export all notes and lists as a standard JSON backup or restore them at any time.

---

## 🎨 Creative Assets Needed

When uploading to the Chrome Web Store, you must prepare the following images:

1. **Store Icon**:
   - Size: `128x128` pixels (already generated at `icons/icon128.png`).
2. **Screenshots (Minimum 1, Max 5)**:
   - Size: `1280x800` or `640x400` pixels (horizontal orientation).
   - *Suggested Screenshots*:
     - **Screenshot 1**: Side Panel open next to a YouTube video showing the Nested Note editor active.
     - **Screenshot 2**: The Side Panel showing the Calendar View with color-coded activity dots.
     - **Screenshot 3**: The Side Panel showing the Analytics Insights page with progress ring and category charts.
     - **Screenshot 4**: Quick-capture popup being opened on an Instagram/X page.
3. **Promotional Tiles (Optional but highly recommended)**:
   - Small Tile: `440x280` pixels
   - Large Tile: `920x680` pixels
   - Marquee Tile: `1400x560` pixels

---

## 🔒 Developer Console Declarations

During submission, you will be asked about data collection. Select the following settings:
- **Data Collection Declaration**: Declare that the extension **does not collect or transmit user data**.
- **Privacy Policy**: Provide the link to your privacy policy (e.g., hosted on GitHub Pages or a personal site). You can copy the contents of `PRIVACY_POLICY.md` for this page.
- **Permissions Justification**:
  - `storage`: Required to save videos, tags, notes, dates, and watch logs locally in the user's browser.
  - `activeTab`: Required to parse the active tab's URL and title for the quick-add popup.
  - `sidePanel`: Required to open the side panel workspace alongside web pages.
