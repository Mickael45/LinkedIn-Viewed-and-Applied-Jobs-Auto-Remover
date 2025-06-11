console.log("✅ content-script.js running");

const scrollToTop = (jobList) =>
  jobList.scrollTo({
    top: 0,
    behavior: "smooth",
  });

const scrollToBottom = (jobList) =>
  jobList.scrollTo({
    top: jobList.scrollHeight,
    behavior: "smooth",
  });

const scrollToBottomThenUp = (jobList) => {
  scrollToBottom(jobList);

  return new Promise((resolve) => {
    scrollToTop(jobList);
    resolve();
  }, 1000);
};

const removeAlreadyFilteredOutJobs = () => {
  const suppressedJobElements = document.getElementsByClassName(
    "job-card-list--is-dismissed"
  );

  if (suppressedJobElements.length === 0) return;

  console.log(
    `Found ${suppressedJobElements.length} already filtered out jobs.`
  );

  Array.from(suppressedJobElements).forEach((jobElement) => {
    console.log("Removing already filtered out job element:", jobElement);
    jobElement.remove();
  });
};

const removeElements = async (jobList) => {
  const jobListContainer = jobList?.parentElement;

  if (!jobListContainer) {
    console.log("Job list not found.");
    return;
  }
  await scrollToBottomThenUp(jobListContainer);

  const jobElements = Array.from(
    jobListContainer.querySelectorAll("[data-job-id]")
  );
  jobElements.shift();

  jobElements.forEach((jobElement) => {
    if (
      jobElement.textContent.includes("Viewed") ||
      jobElement.textContent.includes("Applied")
    ) {
      console.log("Removing job element:", jobElement);
      jobElement.remove();
    }
  });
  console.log(`Removed ${jobElements.length} job elements.`);
  removeAlreadyFilteredOutJobs();
};

const observer = new MutationObserver(() => {
  const jobList = document.querySelector(
    "[data-results-list-top-scroll-sentinel]"
  );

  if (jobList) {
    observer.disconnect();
    removeElements(jobList);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
