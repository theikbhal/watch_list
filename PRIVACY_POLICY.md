# Privacy Policy - Watch List Chrome Extension

**Last Updated: May 20, 2026**

Your privacy is extremely important to us. This Privacy Policy details how the **Watch List** Chrome extension handles your data.

---

## 1. Local Storage First (No Data Collection)

The **Watch List** Chrome extension is designed as a **local-first** application.
- **No External Servers**: We do not run any remote database servers. All bookmarks, notes, categorization filters, tag associations, calendar events, and watch histories are stored locally inside your browser's private directory using the `chrome.storage.local` API.
- **No Data Collection**: We do not collect, transmit, upload, sell, or rent any of your browsing history, notes, links, or logs to any external parties, analytics platforms, or servers.
- **No Account Required**: You do not need to register an account, sign up with an email, or authenticate to use the extension.

---

## 2. Explanation of Permissions Used

To function properly, this extension requests the following permissions from your browser:
1. **`storage`**: Used to save, update, delete, and read your watch list, notes, and log details.
2. **`activeTab`**: Used solely in the quick-add popup interface to query the URL and Title of the current active tab. This is used so that you can easily add the current video link to your list with a single click. No tab data is captured or read unless you explicitly click the extension button.
3. **`sidePanel`**: Used to enable the side-by-side note-taking workspace in the Chrome panel.

---

## 3. Data Control and Portability

Since all data is stored locally in your browser, you have absolute control over your records:
- **Backup & Export**: You can export your entire database (including notes and logs) into a standard JSON file at any time by clicking **Settings (⚙️)** in the sidebar and choosing **Export JSON Backup**.
- **Data Import**: You can import a previously exported JSON backup to restore your data on a new device or browser profile.
- **Complete Deletion**: You can permanently delete all saved lists, notes, and records by clicking **Settings (⚙️)** and choosing **Reset All Data**, or by simply uninstalling the extension from your browser.

---

## 4. Third-Party Links

While taking notes, you may copy and paste links to third-party platforms (such as YouTube, X.com, or Instagram). Clicking these links will open them in a new tab. This Privacy Policy does not apply to those external websites, and you should review the privacy terms of those individual services (e.g. Google/YouTube, Twitter/X, and Meta/Instagram).

---

## 5. Contact Information

If you have any questions or feedback regarding this Privacy Policy or the security of the extension, please contact the project author or submit an issue in the associated repository.
