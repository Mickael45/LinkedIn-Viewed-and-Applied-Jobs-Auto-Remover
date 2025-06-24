import type { JobSummaryData, SalaryData } from "../shared/schemas";
import styles from "./uiManager.css?raw";

interface UIManagerSelectors {
  jobDetailPanel: string;
  panelContainerAnchor: string;
  summaryContainerId: string;
}

export class UIManager {
  private readonly SELECTORS: UIManagerSelectors;
  private stylesInjected: boolean = false;

  constructor(selectors: UIManagerSelectors) {
    this.SELECTORS = selectors;
    this.injectStyles();
  }

  public displaySummary(summaryData: JobSummaryData): void {
    const mainContainer = this.getOrCreateMainContainer();
    if (!mainContainer) return;
    this.renderContent(mainContainer, summaryData);
  }

  public displayError(message: string): void {
    const mainContainer = this.getOrCreateMainContainer();
    if (!mainContainer) return;

    mainContainer.innerHTML = `
      <div class="content">
        <div class="header">
            <span class="title">Analyser</span>
        </div>
        <div class="error-content">
            <h4>Analysis Failed</h4>
            <p title="${message}">The AI core could not process the job description. This can happen with unusual formatting or network errors. Please try another listing.</p>
        </div>
      </div>
    `;
  }

  public clearAll(): void {
    document.getElementById(this.SELECTORS.summaryContainerId)?.remove();
  }

  private injectStyles(): void {
    if (this.stylesInjected || document.getElementById("styles")) return;
    try {
      const styleElement = document.createElement("style");
      styleElement.id = "styles";
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      this.stylesInjected = true;
    } catch (error) {
      console.error("UIManager: Failed to inject styles.", error);
    }
  }

  private getOrCreateMainContainer(): HTMLElement | null {
    let container = document.getElementById(this.SELECTORS.summaryContainerId);
    if (container) {
      container.innerHTML = "";
      return container;
    }

    const detailPanel = document.querySelector(this.SELECTORS.jobDetailPanel);
    const parentElement = detailPanel?.querySelector(
      this.SELECTORS.panelContainerAnchor
    )?.parentElement;
    if (!parentElement) {
      console.error("UIManager: Could not find an anchor to inject the UI.");
      return null;
    }

    container = document.createElement("div");
    container.id = this.SELECTORS.summaryContainerId;
    container.className = "summary-container";
    parentElement.prepend(container);
    return container;
  }

  public renderLoadingState(): void {
    const mainContainer = this.getOrCreateMainContainer();
    if (!mainContainer) return;

    mainContainer.innerHTML = `
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

  private renderContent(
    mainContainer: HTMLElement,
    summaryData: JobSummaryData
  ): void {
    mainContainer.innerHTML = "";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "content";

    const header = document.createElement("div");
    header.className = "header";
    header.innerHTML = `<span class="title">Analysis</span>`;
    contentWrapper.appendChild(header);

    this.renderSection(contentWrapper, "Must-Haves", summaryData.mustHaves);
    this.renderSection(contentWrapper, "Preferred", summaryData.preferred);
    this.renderSection(
      contentWrapper,
      "Requirements",
      summaryData.requirements
    );
    this.renderSalary(contentWrapper, summaryData.salary);

    mainContainer.appendChild(contentWrapper);
  }

  private renderSection(
    container: HTMLElement,
    title: string,
    items: string[]
  ): void {
    if (!items || items.length === 0) return;

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
