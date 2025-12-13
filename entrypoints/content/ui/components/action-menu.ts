/**
 * Action Menu Component
 * FR-40, FR-41: Context menu with AI action options
 */

import type { WhatsAppTheme } from "@/utils/types";
import type { MessageData } from "@/utils/whatsapp-dom";

interface ActionItem {
  id: string;
  label: string;
  icon: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: "analyze",
    label: "Analyze",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path d="M10 7v6M7 10h6"/></svg>`,
  },
  {
    id: "translate",
    label: "Translate",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2v3M22 22l-5-10-5 10M14 18h6"/></svg>`,
  },
  {
    id: "explain",
    label: "Explain Context",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01"/></svg>`,
  },
  {
    id: "tone",
    label: "Detect Tone",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>`,
  },
  {
    id: "reply",
    label: "Generate Reply",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`,
  },
];

export class ActionMenu {
  private container: HTMLElement;
  private menuElement: HTMLElement | null = null;
  private theme: WhatsAppTheme;
  private onAction: (action: string, messageData: MessageData) => void;
  private currentMessageData: MessageData | null = null;

  constructor(
    container: HTMLElement,
    theme: WhatsAppTheme,
    onAction: (action: string, messageData: MessageData) => void
  ) {
    this.container = container;
    this.theme = theme;
    this.onAction = onAction;

    // Close menu when clicking outside
    document.addEventListener("click", this.handleOutsideClick);
    document.addEventListener("keydown", this.handleKeydown);
  }

  show(x: number, y: number, messageData: MessageData): void {
    this.hide(); // Close any existing menu
    this.currentMessageData = messageData;
    this.menuElement = this.createElement(x, y);
    this.container.appendChild(this.menuElement);
  }

  hide(): void {
    if (this.menuElement) {
      this.menuElement.remove();
      this.menuElement = null;
    }
    this.currentMessageData = null;
  }

  private createElement(x: number, y: number): HTMLElement {
    const menu = document.createElement("div");
    menu.className = "wa-ai-action-menu";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // Adjust position if menu would go off screen
    requestAnimationFrame(() => {
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menu.style.left = `${window.innerWidth - rect.width - 10}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menu.style.top = `${y - rect.height - 10}px`;
      }
    });

    ACTIONS.forEach((action) => {
      const item = this.createMenuItem(action);
      menu.appendChild(item);
    });

    return menu;
  }

  private createMenuItem(action: ActionItem): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = "wa-ai-action-menu-item";
    button.setAttribute("type", "button");
    button.innerHTML = `
      ${action.icon}
      <span>${action.label}</span>
    `;

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this.currentMessageData) {
        this.onAction(action.id, this.currentMessageData);
      }
      this.hide();
    });

    return button;
  }

  private handleOutsideClick = (e: Event): void => {
    if (this.menuElement && !this.menuElement.contains(e.target as Node)) {
      this.hide();
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
