import { LlmTaskType, type BackgroundResponse } from "../shared/comms";
import { DOM_SELECTORS } from "../shared/domSelectors";
import type { JobSummaryData } from "../shared/schemas";
import { waitForContent } from "../utils/domUtils";
import { UIManager } from "./uiManager";

export class JobProcessor {
  private uiManager: UIManager;

  constructor(uiManager: UIManager) {
    this.uiManager = uiManager;
  }

  public disconnect(): void {
    this.uiManager?.clearAll();
  }

  public async runExtraction(jobId: string | null): Promise<void> {
    this.uiManager.clearAll();

    if (!jobId) return;
    this.uiManager.renderLoadingState();

    const jobDescriptionElement = await waitForContent(
      DOM_SELECTORS.JOB_DESCRIPTION_CONTAINER,
      { timeout: 5000 }
    );
    const jobDescription = jobDescriptionElement?.innerText || "";
    if (!jobDescription.trim()) {
      this.uiManager.renderError(
        "Job description is empty or could not be read."
      );
      return;
    }
    try {
      const response: BackgroundResponse<JobSummaryData> =
        await chrome.runtime.sendMessage({
          type: LlmTaskType.EXTRACT_JOB_SUMMARY,
          text: jobDescription,
          jobId,
        });
      if (response.success) {
        this.uiManager.renderSummary(response.data);
      } else {
        this.uiManager.renderError(response.error);
      }
    } catch (error) {
      console.error("Background script request failed:", error);
      this.uiManager.renderError("The background service is not responding.");
    }
  }
}
