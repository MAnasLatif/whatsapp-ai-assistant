/**
 * Global Settings Button Component
 * Injects AI settings button into WhatsApp's sidebar below Meta AI button
 */

import { Icons } from "@/utils/icons";
import { DOMComponents } from "@/utils/dom-components";

export class GlobalSettingsButton {
  private button: HTMLDivElement;
  private onClick: () => void;

  constructor(onClick: () => void) {
    this.onClick = onClick;
    this.button = this.createButton();
  }

  private createButton(): HTMLDivElement {
    const buttonWrapper = document.createElement("div");
    buttonWrapper.className = DOMComponents.globalSettingsWrapper.substring(1); // Remove . prefix
    buttonWrapper.innerHTML = `
      <div class="${DOMComponents.globalSettingsButton.substring(
        1
      )}" role="button" tabindex="0" aria-label="AI Assistant Settings">
      ${Icons.aiSparkle}
      </div>
    `;

    const btn = buttonWrapper.querySelector(DOMComponents.globalSettingsButton);
    btn?.addEventListener("click", () => this.onClick());
    btn?.addEventListener("keydown", (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (keyEvent.key === "Enter" || keyEvent.key === " ") {
        e.preventDefault();
        this.onClick();
      }
    });

    return buttonWrapper;
  }

  public render(): HTMLDivElement {
    return this.button;
  }

  public remove(): void {
    this.button.remove();
  }
}
