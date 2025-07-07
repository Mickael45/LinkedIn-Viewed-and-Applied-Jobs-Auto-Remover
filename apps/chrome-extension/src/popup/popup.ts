const signInBtn = document.getElementById("log-in-button")!;
const aiSummarySetting = document.getElementById("ai-summary-setting")!;
const aiSummaryToggle = document.getElementById(
  "ai-summary-toggle"
) as HTMLInputElement;
const aiSummaryLink = document.getElementById(
  "ai-summary-link"
) as HTMLAnchorElement;
const loadingContainer = document.getElementById("loading-container")!;
const appContentContainer = document.getElementById("app-content")!;

const viewedJobsRadioButtons = document.querySelectorAll(
  "input[name='viewedJobs']"
) as NodeListOf<HTMLInputElement>;
const appliedJobsRadioButtons = document.querySelectorAll(
  "input[name='appliedJobs']"
) as NodeListOf<HTMLInputElement>;
const dismissedJobsRadioButtons = document.querySelectorAll(
  "input[name='dismissedJobs']"
) as NodeListOf<HTMLInputElement>;
const aiSummaryToggleElement = document.getElementById(
  "ai-summary-toggle"
) as HTMLInputElement;
const proSubscriptionEndDateElement = document.getElementById(
  "pro-subscription-end-date"
) as HTMLParagraphElement;

const MARKETING_PAGE_URL = "http://localhost:5173";

viewedJobsRadioButtons.forEach((radio) => {
  radio.addEventListener("change", async (event) => {
    const value = (event.target as HTMLInputElement).value;
    console.log("Viewed Jobs Toggle changed:", value);
    await chrome.storage.sync.set({ viewedJobs: value });
  });
});

appliedJobsRadioButtons.forEach((radio) => {
  radio.addEventListener("change", async (event) => {
    const value = (event.target as HTMLInputElement).value;
    console.log("Applied Jobs Toggle changed:", value);
    await chrome.storage.sync.set({ appliedJobs: value });
  });
});

dismissedJobsRadioButtons.forEach((radio) => {
  radio.addEventListener("change", async (event) => {
    const value = (event.target as HTMLInputElement).value;
    console.log("Dismissed Jobs Toggle changed:", value);
    await chrome.storage.sync.set({ dismissedJobs: value });
  });
});

aiSummaryToggleElement.addEventListener("change", async (event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  console.log("AI Summary Toggle changed:", isChecked);
  await chrome.storage.sync.set({ aiSummaryEnabled: isChecked });
});

const updateUI = async (
  isLoggedIn: boolean,
  subscribed: boolean,
  subscriptionEndDate: string
) => {
  loadingContainer.style.display = "none";
  appContentContainer.style.display = "block";

  console.log("Updating UI with auth status:", {
    isLoggedIn,
    subscribed,
  });

  console.log("Subscription end date:", subscriptionEndDate);
  signInBtn.style.display = isLoggedIn ? "none" : "block";

  if (subscribed && isLoggedIn) {
    aiSummarySetting.classList.remove("locked");
    aiSummaryLink.removeAttribute("href");
    aiSummaryToggle.checked = true;
    aiSummaryLink.style.cursor = "default";
    proSubscriptionEndDateElement.textContent = subscriptionEndDate
      ? `AI Summary is active until ${subscriptionEndDate}`
      : null;
  } else {
    aiSummarySetting.classList.add("locked");
    aiSummaryToggle.checked = false;
    aiSummaryLink.href = "http://localhost:5173/#pricing";
    aiSummaryLink.target = "_blank";
  }

  const { viewedJobs, appliedJobs, dismissedJobs, aiSummaryEnabled } =
    (await chrome.storage.sync.get([
      "viewedJobs",
      "appliedJobs",
      "dismissedJobs",
      "aiSummaryEnabled",
    ])) || {};

  viewedJobsRadioButtons.forEach((radio) => {
    radio.checked = radio.value === viewedJobs;
  });
  appliedJobsRadioButtons.forEach((radio) => {
    radio.checked = radio.value === appliedJobs;
  });
  dismissedJobsRadioButtons.forEach((radio) => {
    radio.checked = radio.value === dismissedJobs;
  });
  aiSummaryToggleElement.checked =
    (subscribed && isLoggedIn && aiSummaryEnabled) ?? false;
};

signInBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: MARKETING_PAGE_URL });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "LOGOUT_SUCCESS") {
    console.log("User logged out successfully.");
    updateUI(false, false, "");
  } else if (message.type === "ON_LOGIN_SUCCESS") {
    console.log("ON_LOGIN_SUCCESS");
    updateUI(true, message.subscribed, message.subscriptionEndDate);
  } else if (message.type === "GET_AUTH_STATUS_RESPONSE") {
    console.log("GET_AUTH_STATUS_RESPONSE");
    updateUI(
      message.isLoggedIn,
      message.subscribed,
      message.subscriptionEndDate
    );
  }
});

(async () => {
  const response = await chrome.runtime.sendMessage({
    type: "GET_AUTH_STATUS",
  });
  updateUI(
    response.isLoggedIn,
    response.subscribed,
    response.subscriptionEndDate
  );
})();
