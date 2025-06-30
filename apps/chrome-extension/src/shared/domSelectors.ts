export const DOM_SELECTORS = {
  JOB_LIST: "[data-results-list-top-scroll-sentinel] + ul",
  JOB_LIST_ITEM: "[data-occludable-job-id]",
  JOB_DETAIL_PANEL: ".jobs-details",
  JOB_DESCRIPTION_CONTAINER:
    ".jobs-description__container .text-heading-large + *",
  SUMMARY_CONTAINER_ID: "summary-container",
  DISMISS_BUTTON: "button[aria-label^='Dismiss']",
  UNDO_BUTTON: 'button[aria-label$="undo"]',
};
