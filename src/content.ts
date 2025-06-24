import { JobProcessor } from "./jobProcessor";
import { type CommandMessage, CommandType } from "./shared-types";

class ContentController {
  private static instance: ContentController | null = null;
  private processor: JobProcessor | null = null;

  private constructor() {}

  public static main(): void {
    if (ContentController.instance) {
      console.warn("ContentController is already running.");
      return;
    }
    ContentController.instance = new ContentController();
    ContentController.instance.start();
  }

  private async start(): Promise<void> {
    this.listenForCommands();
    try {
      await this.reinitializeProcessor();
    } catch (error) {
      console.error("Failed to initialize processor:", error);
    }
  }

  private listenForCommands(): void {
    chrome.runtime.onMessage.addListener(
      (message: CommandMessage, _, sendResponse) => {
        console.log("Received command message:", message);
        switch (message.type) {
          case CommandType.RESET_PROCESSOR:
            this.reinitializeProcessor().then(() => {
              sendResponse({ status: "Processor Reset" });
            });
            return true;

          case CommandType.EXTRACT_JOB_CONTENT:
            this.processor?.runExtractionOnCurrentPanel();
            sendResponse({ status: "Extraction Triggered" });
            break;
        }
      }
    );
  }

  private async reinitializeProcessor(): Promise<void> {
    this.processor?.disconnect();
    this.processor = new JobProcessor();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ContentController.main, {
    once: true,
  });
} else {
  ContentController.main();
}
