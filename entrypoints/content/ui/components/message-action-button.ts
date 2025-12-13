/**
 * Message Action Button Component
 * FR-37, FR-38, FR-39: AI action button on message hover with native styling
 */

import type { WhatsAppTheme } from "@/utils/types";

export class MessageActionButton {
  public element: HTMLButtonElement;
  private theme: WhatsAppTheme;
  private onClick: (event: Event) => void;

  constructor(theme: WhatsAppTheme, onClick: (event: Event) => void) {
    this.theme = theme;
    this.onClick = onClick;
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "wa-ai-action-btn";
    button.setAttribute("aria-label", "AI Actions");
    button.setAttribute("title", "AI Actions");
    button.setAttribute("type", "button");
    button.innerHTML = this.getIcon();
    button.addEventListener("click", this.handleClick);
    return button;
  }

  private handleClick = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
    this.onClick(e);
  };

  private getIcon(): string {
    // AI Wand/Magic icon
    return `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9M12.2 6.2L11 5"/>
      </svg>
    `;
  }

  updateTheme(theme: WhatsAppTheme): void {
    this.theme = theme;
    // Theme updates handled by CSS
  }

  destroy(): void {
    this.element.removeEventListener("click", this.handleClick);
    this.element.remove();
  }
}
