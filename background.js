chrome.webNavigation.onHistoryStateUpdated.addListener(
  (details) => {
    if (details.url.includes("https://www.linkedin.com/jobs/collections/")) {
      chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ["content.js"],
      });
    }
  },
  {
    url: [{ urlMatches: "https://www.linkedin.com/jobs/collections/.*" }],
  }
);
