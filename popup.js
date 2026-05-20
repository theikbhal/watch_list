// popup.js for Watch List Chrome Extension

document.addEventListener("DOMContentLoaded", async () => {
  const tabTitleEl = document.getElementById("tab-title");
  const tabUrlEl = document.getElementById("tab-url");
  const pageTypeEl = document.getElementById("page-type");
  const addBtn = document.getElementById("add-btn");
  const openPanelBtn = document.getElementById("open-panel-btn");
  const successMsg = document.getElementById("success-msg");
  const addForm = document.getElementById("add-form");

  let currentTab = null;

  // Query the current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      currentTab = tabs[0];
      const title = currentTab.title || "Untitled Webpage";
      const url = currentTab.url || "";

      tabTitleEl.textContent = title;
      tabUrlEl.textContent = url;
      tabUrlEl.title = url;

      // Identify the page type/source
      const source = detectVideoSource(url);
      pageTypeEl.textContent = source.label;
      pageTypeEl.style.backgroundColor = source.bgColor;
      pageTypeEl.style.color = source.color;
      pageTypeEl.style.borderColor = source.borderColor;

      addBtn.removeAttribute("disabled");
    } else {
      tabTitleEl.textContent = "Unable to read current webpage";
      tabUrlEl.textContent = "Please try again on an open website.";
      pageTypeEl.textContent = "Unknown";
    }
  });

  // Action: Add current video to list
  addBtn.addEventListener("click", async () => {
    if (!currentTab) return;

    const timeframe = document.getElementById("timeframe").value;
    const priority = document.getElementById("priority").value;
    const niche = document.getElementById("niche").value;
    const tagsInput = document.getElementById("tags").value;
    
    // Parse tags to array
    const tags = tagsInput
      .split(",")
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newVideo = {
      id: "vid_" + Date.now(),
      title: currentTab.title || "Untitled Video",
      url: currentTab.url,
      timeframe: timeframe,
      priority: priority,
      niche: niche,
      tags: tags,
      dateAdded: new Date().toISOString().split("T")[0], // default current date (YYYY-MM-DD)
      dateWatched: "",
      dateComplete: "",
      watchHistory: [], // elements like { date: "YYYY-MM-DD", viewer: "User" }
      notes: [
        {
          id: "note_" + Date.now() + "_1",
          text: "First thoughts...",
          children: []
        }
      ]
    };

    // Load existing list, append new video, and save
    chrome.storage.local.get({ videos: [] }, (result) => {
      const videosList = result.videos;
      // Avoid duplicate URLs in list if wanted, but standard is just to add
      videosList.unshift(newVideo);

      chrome.storage.local.set({ videos: videosList }, () => {
        // Show success animation
        addForm.style.display = "none";
        successMsg.style.display = "flex";
        
        // Notify side panel if it's currently open
        chrome.runtime.sendMessage({ action: "REFRESH_VIDEOS" });

        setTimeout(() => {
          window.close(); // Auto-close popup
        }, 1200);
      });
    });
  });

  // Action: Open Side Panel Workspace
  openPanelBtn.addEventListener("click", async () => {
    chrome.windows.getCurrent((window) => {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ windowId: window.id })
          .then(() => {
            window.close(); // Close popup once side panel opens
          })
          .catch((err) => {
            console.error("Failed to open side panel:", err);
            // Fallback: Open sidepanel.html in a full tab if sidePanel API fails
            chrome.tabs.create({ url: "sidepanel.html" });
          });
      } else {
        chrome.tabs.create({ url: "sidepanel.html" });
      }
    });
  });

  // Help detect and style sources
  function detectVideoSource(url) {
    if (!url) return { label: "Web", bgColor: "rgba(255,255,255,0.1)", color: "#f8fafc", borderColor: "rgba(255,255,255,0.2)" };

    const parsedUrl = url.toLowerCase();
    if (parsedUrl.includes("youtube.com") || parsedUrl.includes("youtu.be")) {
      return {
        label: "YouTube 🔴",
        bgColor: "rgba(239, 68, 68, 0.15)",
        color: "#f87171",
        borderColor: "rgba(239, 68, 68, 0.3)"
      };
    } else if (parsedUrl.includes("x.com") || parsedUrl.includes("twitter.com")) {
      return {
        label: "X.com 🐦",
        bgColor: "rgba(255, 255, 255, 0.1)",
        color: "#e2e8f0",
        borderColor: "rgba(255, 255, 255, 0.2)"
      };
    } else if (parsedUrl.includes("instagram.com")) {
      return {
        label: "Instagram 📸",
        bgColor: "rgba(236, 72, 153, 0.15)",
        color: "#f472b6",
        borderColor: "rgba(236, 72, 153, 0.3)"
      };
    } else {
      return {
        label: "Link 🔗",
        bgColor: "rgba(129, 140, 248, 0.15)",
        color: "#93c5fd",
        borderColor: "rgba(129, 140, 248, 0.3)"
      };
    }
  }
});
