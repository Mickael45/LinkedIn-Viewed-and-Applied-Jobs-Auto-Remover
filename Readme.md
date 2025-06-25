# Case Study: LinkedIn Job List Enhancement Chrome Extension

## Project Overview

The goal of this project was to build a Chrome extension to navigate thousands of LinkedIn job listings daily as efficiently as possible. To achieve this, the extension was designed to:

- Only show relevant jobs by automatically hiding irrelevant posts that were viewed, applied to, or "ghost jobs" (jobs that were previously dismissed but keep reappearing).

- Use a Large Language Model (LLM) to extract key data points and display them at the top of the job description for quick review.

This required overcoming several technical challenges related to the dynamic and asynchronous nature of how LinkedIn loads its job data.

## How the Code Solves the Challenges

The extension's architecture is designed to be both robust and resilient, directly addressing the complexities of LinkedIn's dynamic interface. Here’s a breakdown of how the code tackles each specific problem:

### 1. Handling Asynchronous Data & Skeleton Loaders

The core of the problem was executing code only _after_ LinkedIn’s jobs list was fully loaded, without being able to track the network request directly.

- **The Solution:** The `JobProcessor` class initiates the process. Its first job is to find the main job list container (`<ul>`). To do this, it uses the `waitForElement` utility (`domUtils.ts`), which sets up a `MutationObserver`. This observer patiently watches the DOM for the job list `<ul>` to appear. It doesn't act on the initial "skeleton" `<li>` elements. Instead, the `JobListManager` is initialized with this `<ul>`. The manager's own `MutationObserver` then watches for new `<li>` nodes that have the `data-occludable-job-id` attribute, ensuring it only processes fully rendered job items, effectively bypassing the skeleton state and solving the timing issue.
  - **Code Files:** `jobProcessor.ts`, `domUtils.ts`, `jobListManager.ts`

### 2. Managing "Below the Fold" Content (Virtual Scrolling)

The "dismiss" buttons on jobs that are off-screen don't exist in the DOM until you scroll them into view. Attaching listeners to each button as it appears would be inefficient and complex.

- **The Solution:** This is solved using **event delegation**. Instead of attaching a click listener to every dismiss button, the `JobListManager` attaches a single, highly-efficient `click` listener to the parent `<ul>` container. When a click occurs anywhere inside this list, the listener checks if the clicked element (or one of its parents) is a "dismiss" button (`[aria-label^='Dismiss']`). This approach works flawlessly for content loaded later via virtual scrolling, as the single listener on the parent container will catch events from any child element, new or old.
  - **Code File:** `jobListManager.ts` (specifically the `handleClick` method and the `addEventListener` call in the `start` method).

### 3. Fixing "Ghost Jobs"

LinkedIn fails to consistently hide jobs you've dismissed, causing them to reappear.

- **The Solution:** The extension creates its own persistent memory. When you click "dismiss," the `handleClick` function in `JobListManager` captures the job's unique `data-occludable-job-id`. This ID is then passed to the `StorageManager`, which saves it into a `Set` in the browser's `chrome.storage.local`. On every page load or navigation, the `JobProcessor` retrieves this list of IDs from storage and passes it to the `JobListManager`. The manager then iterates through all visible job items, checks if their ID is in the "dismissed" set, and applies a distinct visual style to hide them, ensuring they stay gone permanently.
  - **Code Files:** `jobListManager.ts`, `storageManager.ts`

### 4. Optimizing LLM Performance

Making an LLM API call for every single job description would be slow and costly.

- **The Solution:** Performance is significantly improved through caching. The `llm-api.ts` file implements an `LruCache` (Least Recently Used cache). Before making an API call, it creates a unique hash (SHA-256) of the job description text. It checks the cache for an existing entry with this hash. If a cached summary is found, it's returned instantly, skipping the expensive network request. If not, the API call is made, and the result is stored in the cache for future use. This means you only pay the performance cost for analyzing a specific job description once.
  - **Code Files:** `llm-api.ts` (the `LruCache` and `callLlm` function), `background.ts` (which triggers the call).

---

## Roadmap & Future Improvements

To further enhance the extension, the following improvements are planned:

- [x] Retry on LLM structure fail (or find a better model that is at least as fast)
- [x] LLM response caching
- [ ] Add an option to select LLM version
- [ ] Add profile matching meter derived from user's resume
- [ ] Add refecth button for AI generated content


## Known bugs

List of known bugs to bust before release:

- [] (P0) Cache busting that goes off way too early
- [] (P1) "UIManager: Could not find an anchor to inject the UI." Keeps happening
- [] (P1) AI search doesn't always trigger on first load
- [] (P2) Applies jobs style change doesn't work

