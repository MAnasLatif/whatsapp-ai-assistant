/**
 * Chat Button Component
 * FR-01, FR-02: AI chat button positioned with native WhatsApp styling
 */

import type { WhatsAppTheme } from "@/types";
import { DOMComponents } from "@/utils/dom-components";
import { Icons } from "@/utils/icons";

export class ChatButton {
  public element: HTMLButtonElement;
  private theme: WhatsAppTheme;
  private onClick: () => void;

  constructor(theme: WhatsAppTheme, onClick: () => void) {
    this.theme = theme;
    this.onClick = onClick;
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = `${DOMComponents.aiChatButton.substring(1)} ${
      DOMComponents.whatsappButtonBase
    }`; // Remove . prefix
    button.setAttribute("aria-label", "AI Chat Details");
    button.setAttribute("title", "AI Chat Details");
    button.setAttribute("type", "button");
    button.setAttribute("tabindex", "0");
    button.setAttribute("aria-disabled", "false");

    // Create inner structure matching WhatsApp's button structure
    button.innerHTML = `
      <div class="${DOMComponents.whatsappButtonInner}">
        <div class="${DOMComponents.whatsappButtonContent}">
          <div class="${DOMComponents.whatsappButtonIcon}">
            <span aria-hidden="true" class="${
              DOMComponents.whatsappButtonIconSpan
            }">
              ${this.getIcon()}
            </span>
          </div>
          <div class="${DOMComponents.whatsappButtonSpacer}"></div>
        </div>
      </div>
    `;

    button.addEventListener("click", this.handleClick);

    return button;
  }

  private handleClick = (e: Event): void => {
    e.stopPropagation();
    this.onClick();
  };

  private getIcon(): string {
    return Icons.aiSparkle;
  }

  updateTheme(theme: WhatsAppTheme): void {
    this.theme = theme;
    // Theme updates handled by CSS
  }

  show(): void {
    this.element.style.display = "";
  }

  hide(): void {
    this.element.style.display = "none";
  }

  destroy(): void {
    this.element.removeEventListener("click", this.handleClick);
    this.element.remove();
  }
}
