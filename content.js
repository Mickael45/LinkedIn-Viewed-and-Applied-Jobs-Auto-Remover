(() => {
  console.log("✅ content-script.js running");
  const jobsListenedTo = new Set();
  let lastPageStart = -1;

  const getSkillsContainer = () => {
    const skillsContainer = document.querySelector("#skills-container");

    if (skillsContainer) {
      skillsContainer.remove();
    }

    const skillsContainerParent = document.querySelector(
      ".job-details-fit-level-preferences"
    ).parentElement;
    const newSkillsContainer = document.createElement("div");
    newSkillsContainer.id = "skills-container";
    newSkillsContainer.classList.add("job-details-fit-level-preferences");
    skillsContainerParent.appendChild(newSkillsContainer);
    return newSkillsContainer;
  };

  const getResidencyContainer = () => {
    const residencyContainer = document.querySelector("#residency-container");

    if (residencyContainer) {
      residencyContainer.remove();
    }

    const residencyContainerParent = document.querySelector(
      ".job-details-fit-level-preferences"
    ).parentElement;
    const newResidencyContainer = document.createElement("div");
    newResidencyContainer.id = "residency-container";
    newResidencyContainer.classList.add("job-details-fit-level-preferences");
    residencyContainerParent.appendChild(newResidencyContainer);
    return newResidencyContainer;
  };

  const getClearanceContainer = () => {
    const clearanceContainer = document.querySelector("#clearance-container");

    if (clearanceContainer) {
      clearanceContainer.remove();
    }

    const clearanceContainerParent = document.querySelector(
      ".job-details-fit-level-preferences"
    ).parentElement;
    const newClearanceContainer = document.createElement("div");
    newClearanceContainer.id = "clearance-container";
    newClearanceContainer.classList.add("job-details-fit-level-preferences");
    clearanceContainerParent.appendChild(newClearanceContainer);
    return newClearanceContainer;
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

  const extractResidency = (jobDescription) => {
    const wordsToLookFor = [
      "Residency",
      "Citizenship",
      "Visa",
      "Work Permit",
      "W2",
      "H1B",
      "Green Card",
      "Sponsorship",
    ];

    const foundWords = wordsToLookFor.filter((word) =>
      jobDescription.textContent
        .toLowerCase()
        .includes(word.toLocaleLowerCase())
    );

    if (foundWords.length > 0) {
      const residencyContainer = getResidencyContainer();

      foundWords.forEach((skill) => {
        const wordButton = document.createElement("button");

        wordButton.classList.add(
          "artdeco-button",
          "artdeco-button--secondary",
          "artdeco-button--muted"
        );
        wordButton.textContent = skill;
        residencyContainer.appendChild(wordButton);
      });
    }
  };

  const extractClearance = (jobDescription) => {
    const wordsToLookFor = ["Clearance"];

    const foundWords = wordsToLookFor.filter((skill) =>
      jobDescription.textContent
        .toLowerCase()
        .includes(skill.toLocaleLowerCase())
    );

    if (foundWords.length > 0) {
      const clearanceContainer = getClearanceContainer();

      foundWords.forEach((skill) => {
        const wordButton = document.createElement("button");

        wordButton.classList.add(
          "artdeco-button",
          "artdeco-button--secondary",
          "artdeco-button--muted"
        );
        wordButton.textContent = skill;
        clearanceContainer.appendChild(wordButton);
      });
    }
  };

  const extractSkills = (jobDescription) => {
    const skillsToLookFor = [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "SQL",
      "HTML",
      "CSS",
      "React",
      "Node.js",
      "Angular",
    ];

    const foundSkills = skillsToLookFor.filter((skill) => {
      console.log(`Checking if job description contains skill: ${skill}`);
      return jobDescription.textContent
        .toLowerCase()
        .includes(skill.toLocaleLowerCase());
    });

    if (foundSkills.length > 0) {
      const skillsContainer = getSkillsContainer();
      console.log("Found skills:", foundSkills);
      foundSkills.forEach((skill) => {
        const skillButton = document.createElement("button");

        skillButton.classList.add(
          "artdeco-button",
          "artdeco-button--secondary",
          "artdeco-button--muted"
        );
        skillButton.textContent = skill;
        skillsContainer.appendChild(skillButton);
      });
    }
  };

  const extractContentFromJobDescription = () => {
    console.log("Extracting content from job description...");
    const jobDescription = document.getElementById("job-details");

    extractSkills(jobDescription);
    extractClearance(jobDescription);
    extractResidency(jobDescription);
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
