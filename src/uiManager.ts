import type {
  JobSummaryData,
  SalaryData,
  UIManagerSelectors,
} from "./jobSummary.types";
import styles from "./uiManager.css?raw";

export class UIManager {
  private readonly SELECTORS: UIManagerSelectors;
  private stylesInjected: boolean = false;

  constructor(selectors: UIManagerSelectors) {
    this.SELECTORS = selectors;
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
        <div class="jarvis-header">
            <span class="jarvis-title">J.A.R.V.I.S.</span>
        </div>
        <div class="jarvis-error-content">
            <h4>Analysis Failed</h4>
            <p></p>
        </div>
    `;
    const errorParagraph = mainContainer.querySelector(
      ".jarvis-error-content p"
    );
    if (errorParagraph) errorParagraph.textContent = message;
  }

  public clearAll(): void {
    const mainContainer = document.getElementById(
      this.SELECTORS.summaryContainerId
    );
    mainContainer?.remove();
  }

  private injectStyles(): void {
    if (this.stylesInjected) {
      return;
    }
    try {
      const styleElement = document.createElement("style");
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
      this.stylesInjected = true;
    } catch (error) {
      console.error("J.A.R.V.I.S. UIManager: Failed to inject styles.", error);
    }
  }

  private getOrCreateMainContainer(): HTMLElement | null {
    this.injectStyles();

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
      console.error(
        "UIManager: Could not find a suitable anchor to inject the UI."
      );
      return null;
    }

    container = document.createElement("div");
    container.id = this.SELECTORS.summaryContainerId;
    container.className = "jarvis-summary-container";

    parentElement.prepend(container);
    return container;
  }

  public renderLoadingState(): void {
    const mainContainer = this.getOrCreateMainContainer();
    if (!mainContainer) return;

    mainContainer.innerHTML = `
        <div class="jarvis-loading-bar">
            <div class="gemini-loader"></div>
        </div>
        <p style="text-align: center; margin: 16px 0 24px; font-style: italic; font-size: 1.4rem; color: var(--jarvis-text-secondary); animation: fadeIn 1s ease-in-out;">Analyzing job requirements...</p>
        <div class="jarvis-loading-skeleton jarvis-loading-text"></div>
        <div class="jarvis-tags-container">
            <div class="jarvis-loading-skeleton jarvis-loading-tag"></div>
            <div class="jarvis-loading-skeleton jarvis-loading-tag"></div>
            <div class="jarvis-loading-skeleton jarvis-loading-tag"></div>
        </div>
        <br/>
        <div class="jarvis-loading-skeleton jarvis-loading-text" style="width: 40%;"></div>
        <div class="jarvis-tags-container">
            <div class="jarvis-loading-skeleton jarvis-loading-tag"></div>
            <div class="jarvis-loading-skeleton jarvis-loading-tag" style="width: 120px;"></div>
        </div>
      `;
  }

  private renderContent(
    mainContainer: HTMLElement,
    summaryData: JobSummaryData
  ): void {
    mainContainer.innerHTML = "";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "jarvis-content";

    const header = document.createElement("div");
    header.className = "jarvis-header";
    header.innerHTML = `<span class="jarvis-title">J.A.R.V.I.S. Analysis</span>`;
    contentWrapper.appendChild(header);
    console.log("Rendering job summary content...");
    console.log(summaryData);
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
    sectionEl.className = "jarvis-section";

    const titleElement = document.createElement("h3");
    titleElement.className = "jarvis-section-title";
    titleElement.textContent = title;
    sectionEl.appendChild(titleElement);

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "jarvis-tags-container";

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
        currency
      )} - ${this.formatCurrency(maxSalary, currency)} ${period}`;
    } else if (minSalary) {
      salaryText = `Starts at ${this.formatCurrency(
        minSalary,
        currency
      )} ${period}`;
    } else if (maxSalary) {
      salaryText = `Up to ${this.formatCurrency(
        maxSalary,
        currency
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
    tag.className = "jarvis-tag";
    tag.textContent = text;
    return tag;
  }
}
