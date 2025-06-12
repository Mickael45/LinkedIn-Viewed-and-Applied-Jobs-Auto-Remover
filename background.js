chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tab.url);
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("https://www.linkedin.com/jobs/search/")
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });
  }
});
