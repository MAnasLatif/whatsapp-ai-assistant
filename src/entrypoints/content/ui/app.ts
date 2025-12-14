/**
 * WhatsApp AI Assistant - Content Script UI App
 * Manages UI components injected into WhatsApp Web
 */

import type { WhatsAppTheme } from "@/utils/types";
import {
  extractMessageData,
  getActiveChatId,
  isGroupChat,
  type MessageData,
} from "@/utils/whatsapp-dom";
import { SettingsButton } from "./components/settings-button";
import { SettingsPanel } from "./components/settings-panel";
import { MessageActionButton } from "./components/message-action-button";
import { ActionMenu } from "./components/action-menu";
import { ResultsDisplay } from "./components/results-display";
import { injectShadowStyles } from "./styles";

export interface App {
  updateTheme: (theme: WhatsAppTheme) => void;
  injectMessageButton: (messageElement: HTMLElement) => void;
  openSettings: () => void;
  closeSettings: () => void;
  destroy: () => void;
}

/**
 * Create and initialize the app
 */
export function createApp(initialTheme: WhatsAppTheme): App {
  let currentTheme = initialTheme;
  let settingsPanel: SettingsPanel | null = null;
  let actionMenu: ActionMenu | null = null;
  let resultsDisplay: ResultsDisplay | null = null;

  // Create shadow root container for isolated styles
  const shadowHost = document.createElement("div");
  shadowHost.id = "wa-ai-assistant-root";
  shadowHost.style.cssText =
    "position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none;";
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  // Inject styles into shadow root
  injectShadowStyles(shadowRoot, currentTheme);

  // Create container inside shadow DOM
  const container = document.createElement("div");
  container.id = "wa-ai-container";
  container.className = `wa-ai-theme-${currentTheme}`;
  container.style.cssText = "pointer-events: auto;";
  shadowRoot.appendChild(container);

  // Initialize components
  const settingsButton = new SettingsButton(currentTheme, () => {
    openSettings();
  });

  // Inject settings button into WhatsApp sidebar
  injectSettingsButton(settingsButton);

  // Initialize action menu
  actionMenu = new ActionMenu(container, currentTheme, handleAIAction);

  // Initialize results display
  resultsDisplay = new ResultsDisplay(container, currentTheme);

  /**
   * Inject settings button before the "New chat" button
   */
  function injectSettingsButton(button: SettingsButton, retries = 0): void {
    console.log(
      `[WhatsApp AI Assistant] Attempting to inject settings button (retry ${retries})...`
    );

    // Check if already injected
    if (document.querySelector(".wa-ai-settings-btn")) {
      console.log("[WhatsApp AI Assistant] Settings button already exists");
      return;
    }

    // Find the "New chat" button - this is our reference point
    const newChatButton = document.querySelector(
      ".x1okw0bk .x78zum5.x6s0dn4.x1afcbsf.x14ug900>div"
    );

    if (!newChatButton) {
      console.log(
        "[WhatsApp AI Assistant] New chat button not found, will retry..."
      );
      if (retries < 10) {
        setTimeout(() => injectSettingsButton(button, retries + 1), 2000);
      } else {
        console.warn(
          "[WhatsApp AI Assistant] New chat button not found after 10 retries"
        );
      }
      return;
    }

    console.log(
      "[WhatsApp AI Assistant] New chat button found, locating container..."
    );

    // Get the parent span container of the new chat button
    let newChatSpan =
      newChatButton.closest("span.html-span") || newChatButton.closest("span");

    if (!newChatSpan) {
      console.warn(
        "[WhatsApp AI Assistant] Cannot find new chat span container"
      );
      if (retries < 10) {
        setTimeout(() => injectSettingsButton(button, retries + 1), 2000);
      }
      return;
    }

    // Get the parent div that contains all button spans
    const buttonsContainer = newChatSpan.parentElement;
    if (!buttonsContainer) {
      console.warn("[WhatsApp AI Assistant] Cannot find buttons container");
      if (retries < 10) {
        setTimeout(() => injectSettingsButton(button, retries + 1), 2000);
      }
      return;
    }

    // Wrap our button in a span with WhatsApp's classes to match styling
    const buttonWrapper = document.createElement("span");
    buttonWrapper.className = newChatSpan.className; // Copy classes from new chat span
    buttonWrapper.appendChild(button.element);

    // Insert before the new chat button span
    buttonsContainer.insertBefore(buttonWrapper, newChatSpan);

    console.log(
      "[WhatsApp AI Assistant] Settings button injected successfully"
    );
  }

  /**
   * Open settings panel
   */
  function openSettings(): void {
    // Get current active chat ID
    const chatId = getActiveChatId();

    if (!chatId) {
      console.warn("[WhatsApp AI Assistant] No active chat found");
      alert("Please open a chat to view its settings");
      return;
    }

    // Get chat name from header
    const chatHeader = document.querySelector(
      '[data-testid="conversation-info-header-chat-title"]'
    );
    const chatName = chatHeader?.textContent || "";
    const isGroup = isGroupChat();

    // Always create a new settings panel for the current chat
    settingsPanel = new SettingsPanel(
      container,
      currentTheme,
      chatId,
      chatName,
      isGroup,
      () => {
        closeSettings();
      }
    );

    settingsPanel.show();
  }

  /**
   * Close settings panel
   */
  function closeSettings(): void {
    settingsPanel?.hide();
  }

  /**
   * Handle AI action selection
   */
  async function handleAIAction(
    action: string,
    messageData: MessageData
  ): Promise<void> {
    console.log(`[WhatsApp AI Assistant] Action: ${action}`, messageData);

    actionMenu?.hide();

    // Show loading state
    resultsDisplay?.showLoading(action);

    try {
      // Send message to background script
      const response = await browser.runtime.sendMessage({
        type: getMessageType(action),
        payload: {
          messageData,
          chatId: messageData.chatId,
        },
      });

      if (response.success) {
        resultsDisplay?.showResult(action, response.data);
      } else {
        resultsDisplay?.showError(response.error || "An error occurred");
      }
    } catch (error) {
      console.error("[WhatsApp AI Assistant] Action failed:", error);
      resultsDisplay?.showError("Failed to process request");
    }
  }

  /**
   * Map action to message type
   */
  function getMessageType(action: string): string {
    const mapping: Record<string, string> = {
      analyze: "ANALYZE_MESSAGE",
      translate: "TRANSLATE_MESSAGE",
      explain: "EXPLAIN_CONTEXT",
      tone: "DETECT_TONE",
      reply: "GENERATE_REPLY",
    };
    return mapping[action] || "ANALYZE_MESSAGE";
  }

  // Return app interface
  return {
    updateTheme(theme: WhatsAppTheme): void {
      currentTheme = theme;
      container.className = `wa-ai-theme-${theme}`;
      injectShadowStyles(shadowRoot, theme); // Update shadow styles
      settingsButton.updateTheme(theme);
      settingsPanel?.updateTheme(theme);
      actionMenu?.updateTheme(theme);
      resultsDisplay?.updateTheme(theme);
    },

    injectMessageButton(messageElement: HTMLElement): void {
      const button = new MessageActionButton(currentTheme, (event) => {
        const messageData = extractMessageData(messageElement);
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        actionMenu?.show(rect.left, rect.bottom + 5, messageData);
      });

      const div: HTMLDivElement = document.createElement("div");
      div.className = "wa-ai-action-btn-container";
      div.appendChild(button.element);

      // Find the message actions container
      //   const actionsContainer = messageElement.querySelector(
      //     '[class*="x78zum5"][class*="xbfrwjf"]'
      //   );
      const actionsContainer = messageElement.querySelector(
        ".focusable-list-item ._amk6._amlo"
      );

      if (
        actionsContainer &&
        !actionsContainer.querySelector(".wa-ai-action-btn")
      ) {
        actionsContainer.appendChild(div);
      }
    },

    openSettings,
    closeSettings,

    destroy(): void {
      settingsButton.destroy();
      settingsPanel?.destroy();
      actionMenu?.destroy();
      resultsDisplay?.destroy();
      shadowHost.remove();
    },
  };
}
