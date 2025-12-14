/**
 * Action Menu Component
 * FR-40, FR-41: Context menu with AI action options
 */

import type { WhatsAppTheme } from "@/types";
import type { MessageData } from "@/utils/whatsapp-dom";
import { Icons } from "@/utils/icons";

interface ActionItem {
  id: string;
  label: string;
  icon: string;
}

const ACTIONS: ActionItem[] = [
  {
    id: "analyze",
    label: "Analyze",
    icon: Icons.analyze,
  },
  {
    id: "translate",
    label: "Translate",
    icon: Icons.translate,
  },
  {
    id: "explain",
    label: "Explain Context",
    icon: Icons.explain,
  },
  {
    id: "tone",
    label: "Detect Tone",
    icon: Icons.tone,
  },
  {
    id: "reply",
    label: "Generate Reply",
    icon: Icons.reply,
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
