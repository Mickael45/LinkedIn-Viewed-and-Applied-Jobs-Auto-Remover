import { CommandType, type CommandMessage } from "../shared/comms";
import { JobProcessor } from "./jobProcessor";

class ContentController {
  private static instance: ContentController | null = null;
  private processor: JobProcessor | null = null;

  public static main(): void {
    if (ContentController.instance) return;
    ContentController.instance = new ContentController();
    ContentController.instance.start();
  }

  private start(): void {
    this.processor = new JobProcessor();

    const initialize = async () => {
      let jobId: string | null = null;

      for (let i = 0; i < 5; i++) {
        try {
          const response = await chrome.runtime.sendMessage({
            type: CommandType.GET_CURRENT_JOB_ID,
          });
          if (response?.jobId) {
            jobId = response.jobId;
            break;
          }
        } catch (error) {
          console.warn(
            "[Controller] Background script not ready, retrying...",
            error
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (jobId) {
        this.processor?.runExtraction(jobId);
      } else {
        console.warn("[Controller] Failed to retrieve job ID after retries");
      }
    };
    initialize();

    chrome.runtime.onMessage.addListener((message: CommandMessage) => {
      if (message.type === CommandType.URL_UPDATED) {
        this.processor?.runExtraction(message.jobId);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ContentController.main, {
    once: true,
  });
} else {
  ContentController.main();
}
