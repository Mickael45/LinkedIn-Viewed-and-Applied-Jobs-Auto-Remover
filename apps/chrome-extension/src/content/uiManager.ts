import { DOM_SELECTORS } from "../shared/domSelectors";
import type { JobSummaryData, SalaryData } from "../shared/schemas";
import styles from "./uiManager.css?raw";

type OnRefreshCallback = () => void;

export class UIManager {
  private readonly onRefresh: OnRefreshCallback;
  private stylesInjected: boolean = false;
  private refreshButton: HTMLButtonElement | null = null;

  constructor(onRefresh: OnRefreshCallback) {
    this.onRefresh = onRefresh;
  }

  public async renderSummary(summaryData: JobSummaryData): Promise<void> {
    const contentArea = await this.getOrCreateContentArea();
    if (!contentArea) return;

    this.renderContent(contentArea, summaryData);
    this.setRefreshButtonState(false);
  }

  public async renderError(message: string): Promise<void> {
    const contentArea = await this.getOrCreateContentArea();
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="error-content">
            <h4>Analysis Failed</h4>
            <p></p>
        </div>
    `;
    const errorParagraph = contentArea.querySelector(".error-content p");
    if (errorParagraph) errorParagraph.textContent = message;

    this.setRefreshButtonState(true);
  }

  public renderEmpty(message: string): void {
    const contentArea = document.querySelector<HTMLElement>(
      `#${DOM_SELECTORS.SUMMARY_CONTAINER_ID} .content-area`
    );
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="empty-content">
            <h4>No Data Available</h4>
            <p>${message}</p>
        </div>
    `;
    this.setRefreshButtonState(true);
  }

  public async renderLoadingState(): Promise<void> {
    const contentArea = await this.getOrCreateContentArea();
    const mainContainer = document.getElementById(
      DOM_SELECTORS.SUMMARY_CONTAINER_ID
    );
    console.log("Before Rendering loading state...");
    if (!contentArea || !mainContainer) return;
    console.log("Rendering loading state...");
    mainContainer.style.display = "block";

    this.setRefreshButtonState(false);

    contentArea.innerHTML = `
        <div class="loading-bar">
            <div class="gemini-loader"></div>
        </div>
        <p style="text-align: center; margin: 16px 0 24px; font-style: italic; font-size: 1.4rem; color: var(--text-secondary); animation: fadeIn 1s ease-in-out;">Analyzing job requirements...</p>
        <div class="loading-skeleton loading-text"></div>
        <div class="tags-container">
            <div class="loading-skeleton loading-tag"></div>
            <div class="loading-skeleton loading-tag"></div>
            <div class="loading-skeleton loading-tag"></div>
        </div>
        <br/>
        <div class="loading-skeleton loading-text" style="width: 40%;"></div>
        <div class="tags-container">
            <div class="loading-skeleton loading-tag"></div>
            <div class="loading-skeleton loading-tag" style="width: 120px;"></div>
        </div>
      `;
  }

  public clearAll(): void {
    const mainContainer = document.getElementById(
      DOM_SELECTORS.SUMMARY_CONTAINER_ID
    );
    mainContainer?.remove();
    this.refreshButton = null;
  }

  public renderUnsuscribed(): void {
    const contentArea = document.querySelector<HTMLElement>(
      `#${DOM_SELECTORS.SUMMARY_CONTAINER_ID} .content-area`
    );
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="unsuscribed-content">
            <h4>AI Summary Unavailable</h4>
            <p>Please subscribe to access AI-powered job analysis.</p>
            <p>Click the button below to manage your subscription.</p>
            <a class="manage-subscription-button" href="http://localhost:5173/#pricing" target="_blank">
                Go Pro <span class="pro-badge">PRO</span>
            </a>
        </div>
    `;
    this.setRefreshButtonState(false);
  }

  public hide(): void {
    const mainContainer = document.getElementById(
      DOM_SELECTORS.SUMMARY_CONTAINER_ID
    );
    if (mainContainer) {
      mainContainer.style.display = "none";
    }
  }

  private injectStyles(): void {
    if (this.stylesInjected) return;
    try {
      const styleElement = document.createElement("style");
      styleElement.textContent = `
        ${styles}
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .refresh-button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-secondary);
            font-size: 1.8rem;
            line-height: 1;
            padding: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s, color 0.2s;
        }
        .refresh-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        `;
      document.head.appendChild(styleElement);
      this.stylesInjected = true;
    } catch (error) {
      console.error("UIManager: Failed to inject styles.", error);
    }
  }

  private async getOrCreateContentArea(): Promise<HTMLElement | null> {
    this.injectStyles();

    const mainContainerId = DOM_SELECTORS.SUMMARY_CONTAINER_ID;
    let mainContainer = document.getElementById(mainContainerId);

    if (mainContainer) {
      const contentArea =
        mainContainer.querySelector<HTMLElement>(".content-area");
      contentArea!.innerHTML = "";
      return contentArea;
    }

    const jobDetailsPanel = document.querySelector(
      DOM_SELECTORS.JOB_DETAIL_PANEL
    );

    if (!jobDetailsPanel) {
      console.error(
        "UIManager: Could not find a suitable anchor to inject the UI."
      );
      return null;
    }

    mainContainer = document.createElement("div");
    mainContainer.id = mainContainerId;
    mainContainer.className = "summary-container";

    const header = this.createHeader();
    const contentArea = document.createElement("div");

    contentArea.className = "content-area";
    mainContainer.appendChild(header);
    mainContainer.appendChild(contentArea);
    jobDetailsPanel.prepend(mainContainer);

    return contentArea;
  }

  private createHeader(): HTMLElement {
    const header = document.createElement("div");
    header.className = "header";

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = "Analysis";

    this.refreshButton = document.createElement("button");
    this.refreshButton.className = "refresh-button";
    this.refreshButton.innerHTML = "&#x21bb;";
    this.refreshButton.title = "Rerun Analysis";
    this.refreshButton.style.display = "none";
    this.refreshButton.addEventListener("click", this.onRefresh);

    header.appendChild(title);
    header.appendChild(this.refreshButton);

    return header;
  }

  private setRefreshButtonState(enabled: boolean): void {
    if (!this.refreshButton) return;
    this.refreshButton.style.display = enabled ? "inline-flex" : "none";
  }

  private renderContent(
    container: HTMLElement,
    summaryData: JobSummaryData
  ): void {
    container.innerHTML = "";

    const contentWrapper = document.createElement("div");
    const { salary, mustHaves, preferred, requirements } = summaryData;

    const hasData =
      salary || mustHaves?.length || preferred?.length || requirements?.length;

    if (!hasData) {
      this.renderEmpty("No job requirements data available.");
      return;
    }

    contentWrapper.className = "content";
    this.renderSection(contentWrapper, "Must-Haves", summaryData.mustHaves);
    this.renderSection(contentWrapper, "Preferred", summaryData.preferred);
    this.renderSection(
      contentWrapper,
      "Requirements",
      summaryData.requirements
    );
    this.renderSalary(contentWrapper, summaryData.salary);
    container.appendChild(contentWrapper);
  }

  private renderSection(
    container: HTMLElement,
    title: string,
    items: string[]
  ): void {
    if (!items || items.length === 0) {
      return;
    }

    const sectionEl = document.createElement("div");
    sectionEl.className = "section";

    const titleElement = document.createElement("h3");
    titleElement.className = "section-title";
    titleElement.textContent = title;
    sectionEl.appendChild(titleElement);

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "tags-container";

    items.forEach((item) => {
      tagsContainer.appendChild(this.createTag(item));
    });

    sectionEl.appendChild(tagsContainer);
    container.appendChild(sectionEl);
  }

  private renderSalary(container: HTMLElement, salaryData?: SalaryData): void {
    if (!salaryData || (!salaryData.minSalary && !salaryData.maxSalary)) return;

    let salaryText = "";
    const { minSalary, maxSalary, currency = "", period = "" } = salaryData;

    if (minSalary && maxSalary) {
      salaryText = `${this.formatCurrency(
        minSalary,
        currency || ""
      )} - ${this.formatCurrency(maxSalary, currency || "")} ${period}`;
    } else if (minSalary) {
      salaryText = `Starts at ${this.formatCurrency(
        minSalary,
        currency || ""
      )} ${period}`;
    } else if (maxSalary) {
      salaryText = `Up to ${this.formatCurrency(
        maxSalary,
        currency || ""
      )} ${period}`;
    }

    if (salaryText) {
      this.renderSection(container, "Compensation", [salaryText]);
    }
  }

  private formatCurrency(amount: number, currency: string): string {
    return `${currency}${amount.toLocaleString()}`;
  }

  private createTag(text: string): HTMLElement {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    return tag;
  }
}
