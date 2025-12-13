/**
 * Results Display Component
 * FR-43, FR-53: Display AI results in native WhatsApp message bubble style
 */

import type { WhatsAppTheme } from "@/utils/types";

export class ResultsDisplay {
  private container: HTMLElement;
  private resultElement: HTMLElement | null = null;
  private theme: WhatsAppTheme;

  constructor(container: HTMLElement, theme: WhatsAppTheme) {
    this.container = container;
    this.theme = theme;

    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("keydown", this.handleKeydown);
  }

  showLoading(action: string): void {
    this.hide();

    const actionLabels: Record<string, string> = {
      analyze: "Analyzing message...",
      translate: "Translating...",
      explain: "Explaining context...",
      tone: "Detecting tone...",
      reply: "Generating replies...",
    };

    this.resultElement = this.createContainer();
    this.resultElement.innerHTML = `
      <div class="wa-ai-results-header">
        <span class="wa-ai-results-title">${
          actionLabels[action] || "Processing..."
        }</span>
        <button class="wa-ai-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      <div class="wa-ai-loading">
        <div class="wa-ai-spinner"></div>
        <span>Please wait...</span>
      </div>
    `;

    this.setupCloseButton();
    this.container.appendChild(this.resultElement);
    this.positionElement();
  }

  showResult(action: string, data: unknown): void {
    if (!this.resultElement) {
      this.resultElement = this.createContainer();
      this.container.appendChild(this.resultElement);
    }

    const actionLabels: Record<string, string> = {
      analyze: "Analysis",
      translate: "Translation",
      explain: "Context Explanation",
      tone: "Tone Detection",
      reply: "Reply Suggestions",
    };

    let contentHtml = "";

    if (action === "reply" && Array.isArray((data as any)?.options)) {
      contentHtml = this.renderReplyOptions((data as any).options);
    } else if (action === "tone" && (data as any)?.emotions) {
      contentHtml = this.renderToneAnalysis(data as any);
    } else if (typeof data === "string") {
      contentHtml = `<div class="wa-ai-results-content">${this.escapeHtml(
        data
      )}</div>`;
    } else if ((data as any)?.content) {
      contentHtml = `<div class="wa-ai-results-content">${this.escapeHtml(
        (data as any).content
      )}</div>`;
    } else {
      contentHtml = `<div class="wa-ai-results-content">${JSON.stringify(
        data,
        null,
        2
      )}</div>`;
    }

    this.resultElement.innerHTML = `
      <div class="wa-ai-results-header">
        <span class="wa-ai-results-title">${
          actionLabels[action] || "Result"
        }</span>
        <button class="wa-ai-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      ${contentHtml}
    `;

    this.setupCloseButton();
    this.positionElement();
  }

  showError(message: string): void {
    if (!this.resultElement) {
      this.resultElement = this.createContainer();
      this.container.appendChild(this.resultElement);
    }

    this.resultElement.innerHTML = `
      <div class="wa-ai-results-header">
        <span class="wa-ai-results-title">Error</span>
        <button class="wa-ai-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      <div class="wa-ai-error">${this.escapeHtml(message)}</div>
    `;

    this.setupCloseButton();
    this.positionElement();
  }

  hide(): void {
    if (this.resultElement) {
      this.resultElement.remove();
      this.resultElement = null;
    }
  }

  private createContainer(): HTMLElement {
    const container = document.createElement("div");
    container.className = "wa-ai-results";
    return container;
  }

  private positionElement(): void {
    if (!this.resultElement) return;

    // Position in the center-right of the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    this.resultElement.style.right = "20px";
    this.resultElement.style.top = `${viewportHeight / 2 - 100}px`;
    this.resultElement.style.left = "auto";
  }

  private setupCloseButton(): void {
    const closeBtn = this.resultElement?.querySelector(".wa-ai-close-btn");
    closeBtn?.addEventListener("click", () => this.hide());
  }

  private renderReplyOptions(
    options: Array<{ tone: string; content: string }>
  ): string {
    const optionsHtml = options
      .map(
        (opt, index) => `
        <div class="wa-ai-reply-option" data-index="${index}">
          <div class="wa-ai-reply-tone">${opt.tone}</div>
          <div class="wa-ai-reply-text">${this.escapeHtml(opt.content)}</div>
        </div>
      `
      )
      .join("");

    return `
      <div class="wa-ai-reply-options">
        ${optionsHtml}
      </div>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <button class="wa-ai-btn wa-ai-btn-primary wa-ai-insert-reply">Insert Selected</button>
        <button class="wa-ai-btn wa-ai-btn-secondary wa-ai-regenerate">Regenerate</button>
      </div>
    `;
  }

  private renderToneAnalysis(data: {
    primary: string;
    confidence: number;
    emotions: Array<{ emotion: string; score: number }>;
    sentiment: string;
  }): string {
    const emotionsHtml = data.emotions
      .map(
        (e) => `
        <div style="display: flex; justify-content: space-between; margin: 4px 0;">
          <span>${e.emotion}</span>
          <span>${Math.round(e.score * 100)}%</span>
        </div>
      `
      )
      .join("");

    return `
      <div class="wa-ai-results-content">
        <div style="margin-bottom: 12px;">
          <strong>Primary Tone:</strong> ${data.primary}
          <span style="opacity: 0.7;">(${Math.round(
            data.confidence * 100
          )}% confidence)</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Sentiment:</strong> 
          <span style="text-transform: capitalize;">${data.sentiment}</span>
        </div>
        <div>
          <strong>Emotions:</strong>
          ${emotionsHtml}
        </div>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private handleOutsideClick = (e: Event): void => {
    if (this.resultElement && !this.resultElement.contains(e.target as Node)) {
      // Don't close on outside click for results - let user close manually
    }
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.hide();
    }
  };

  updateTheme(theme: WhatsAppTheme): void {
    this.theme = theme;
    // Theme updates handled by CSS
  }

  destroy(): void {
    document.removeEventListener("click", this.handleOutsideClick);
    document.removeEventListener("keydown", this.handleKeydown);
    this.hide();
  }
}
