(() => {
  console.log("✅ content-script.js running");
  const jobsListenedTo = new Set();
  let lastPageStart = -1;

  const getContainerById = (containerId) => {
    const container = document.querySelector(`#${containerId}`);

    if (container) {
      container.remove();
    }

    const containerParent = document.querySelector(
      ".job-details-fit-level-preferences"
    ).parentElement;
    const newContainer = document.createElement("div");
    newContainer.id = containerId;
    newContainer.classList.add("job-details-fit-level-preferences");
    containerParent.appendChild(newContainer);
    return newContainer;
  };

  const getJobListContainer = () =>
    document.querySelector("[data-results-list-top-scroll-sentinel]")
      ?.parentElement;

  const getJobList = () =>
    getJobListContainer()?.querySelectorAll("[data-occludable-job-id]");

  const addJobIdToDeletedList = (jobId) => {
    console.log(`Adding job ID ${jobId} to deleted list...`);

    chrome.storage.local.get("deletedJobIds", (result) => {
      const deletedJobIds = result.deletedJobIds || [];
      if (!deletedJobIds.includes(jobId)) {
        deletedJobIds.push(jobId);
        chrome.storage.local.set({ deletedJobIds }, () => {
          console.log(`Job ID ${jobId} added to deleted list.`);
        });
      } else {
        console.log(`Job ID ${jobId} is already in the deleted list.`);
      }
    });
  };

  const addEventListener = (deleteButton) => {
    const jobId = deleteButton.offsetParent.dataset.jobId;

    if (jobsListenedTo.has(jobId)) {
      console.log(`Job with ID ${jobId} already has an event listener.`);
      return;
    }

    deleteButton.addEventListener("click", () => {
      console.log(`Delete button clicked for job ID ${jobId}`);
      addJobIdToDeletedList(jobId);
    });
    console.log(`Adding event listener for job ID ${jobId}`);
    jobsListenedTo.add(jobId);
  };

  const observeListContainerChildrenMutations = () => {
    const jobListContainer = getJobListContainer();
    const jobList = getJobList();

    const observer = new MutationObserver((mutations) => {
      if (jobList.length === jobsListenedTo.length) {
        observer.disconnect();
      }
      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" &&
          mutation.target.nodeName === "BUTTON"
        ) {
          addEventListener(mutation.target);
        }
      });
    });

    observer.observe(jobListContainer, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
  };

  const addEventListenersToShownJobs = () => {
    const jobList = getJobList();
    if (!jobList) {
      return;
    }

    jobList.forEach((job) => {
      const deleteButton = job.querySelector("button[aria-label^='Dismiss']");

      if (deleteButton) {
        addEventListener(deleteButton);
      }
    });
  };

  const removeAlreadyDeletedJobs = () => {
    console.log("Removing already deleted jobs...");

    chrome.storage.local.get("deletedJobIds", (result) => {
      const deletedJobIds = result.deletedJobIds || [];
      const jobs = getJobList();

      if (!jobs || deletedJobIds.length === 0) {
        return;
      }

      console.log("Deleted job IDs:", deletedJobIds, jobs);
      jobs.forEach((job) => {
        console.log("Checking job:", job.dataset.occludableJobId);
        if (deletedJobIds.includes(job.dataset.occludableJobId)) {
          // job.remove();
          job.setAttribute("style", "background-color:red;"); // For debugging purposes
          console.log(
            `Removing job with ID ${job.dataset.occludableJobId}`,
            job
          );
        }
      });
    });
  };

  const getMatchingWords = (text, wordsToLookFor) =>
    wordsToLookFor.filter((word) =>
      text.toLowerCase().includes(word.toLocaleLowerCase())
    );

  const createWordButton = (word) => {
    const wordButton = document.createElement("button");

    wordButton.classList.add(
      "artdeco-button",
      "artdeco-button--secondary",
      "artdeco-button--muted"
    );
    wordButton.textContent = word;

    return wordButton;
  };

  const hoistWords = (text, wordsToLookFor, containerId) => {
    const foundWords = getMatchingWords(text, wordsToLookFor);

    if (foundWords.length > 0) {
      const residencyContainer = getContainerById(containerId);

      foundWords.forEach((word) =>
        residencyContainer.appendChild(createWordButton(word))
      );
    }
  };

  const extractSalary = (text) => {
    const patterns = [
      /\$[\d,\.]+[Kk]?(?:\s*\/yr)?\s*[-–]\s*\$[\d,\.]+[Kk]?(?:\s*\/yr)?/g,
      /\$[\d,\.]+\s*\/hr/gi,
      /\$[\d,\.]+[Kk]?(?:\s*\/yr)?/g,
    ];

    let normalizedParts = [];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let salary = match[0].replace(/\s+/g, ""); // remove spaces
        if (salary.toLowerCase().includes("/hr")) {
          return salary.replace(/\/hr/i, "/hr"); // normalize to lowercase
        }

        const rangeParts = salary.split(/[-–]/);
        normalizedParts = rangeParts.map((part) => {
          // Remove $ and commas
          let numStr = part.replace(/\$|,/g, "").toUpperCase();
          let num = 0;

          if (numStr.includes("K")) {
            num = parseFloat(numStr);
          } else {
            num = parseFloat(numStr) / 1000;
          }

          return `$${num.toFixed(1)}K/yr`;
        });
      }
    }

    if (normalizedParts.length > 0) {
      const salaryContainer = getContainerById("salary-container");
      console.log(normalizedParts);
      const salaryButton = createWordButton(normalizedParts.join(" - "));
      salaryContainer.appendChild(salaryButton);
    }
  };

  const extractContentFromJobDescription = () => {
    console.log("Extracting content from job description...");
    const jobDescription = document.getElementById("job-details").textContent;

    hoistWords(jobDescription, window.constants.skills, "skills-container");
    hoistWords(
      jobDescription,
      window.constants.clearanceWords,
      "clearance-container"
    );
    hoistWords(
      jobDescription,
      window.constants.residencyWords,
      "residency-container"
    );
    extractSalary(jobDescription, "salary-container");
  };

  const waitForJobListContainer = () => {
    const observer = new MutationObserver(() => {
      const jobListContainer = getJobListContainer();
      console.log("Checking for job list container...", jobListContainer);

      if (jobListContainer) {
        observer.disconnect();
        console.log("Job list container found.");
        const currentPageStart = new URLSearchParams(
          window.location.search
        ).get("start");
        if (lastPageStart !== currentPageStart) {
          lastPageStart = currentPageStart;
          removeAlreadyDeletedJobs();
        }
        extractContentFromJobDescription();
        addEventListenersToShownJobs();
        observeListContainerChildrenMutations();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
    });
  };

  waitForJobListContainer();
})();
