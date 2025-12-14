/**
 * Message Action Button Component
 * FR-37, FR-38, FR-39: AI action button on message hover with native styling
 */

import type { WhatsAppTheme } from "@/types";
import { Icons } from "@/utils/icons";

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
    return Icons.aiSparkle;
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
