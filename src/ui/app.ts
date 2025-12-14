/**
 * WhatsApp AI Assistant - Content Script UI App
 * Manages UI components injected into WhatsApp Web
 */

import type { WhatsAppTheme, UserSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import {
  extractMessageData,
  getActiveChatId,
  isGroupChat,
  type MessageData,
} from "@/utils/whatsapp-dom";
import { ChatButton } from "./components/chat-button";
import { ChatPanel } from "./components/chat-panel";
import { GlobalSettingsButton } from "./components/global-settings-button";
import { GlobalSettingsPanel } from "./components/global-settings-panel";
import { MessageActionButton } from "./components/message-action-button";
import { ActionMenu } from "./components/action-menu";
import { ResultsDisplay } from "./components/results-display";
import { injectShadowStyles } from "@/styles/ui-styles";
import { DOMComponents } from "@/utils/dom-components";

export interface App {
  updateTheme: (theme: WhatsAppTheme) => void;
  injectMessageButton: (messageElement: HTMLElement) => void;
  openChat: () => void;
  openGlobalSettings: () => void;
  destroy: () => void;
}

/**
 * Create and initialize the app
 */
export function createApp(initialTheme: WhatsAppTheme): App {
  let currentTheme = initialTheme;
  let chatPanel: ChatPanel | null = null;
  let globalSettingsPanel: GlobalSettingsPanel | null = null;
  let actionMenu: ActionMenu | null = null;
  let resultsDisplay: ResultsDisplay | null = null;
  let userSettings: UserSettings = DEFAULT_SETTINGS;

  // Create shadow root container for isolated styles
  const shadowHost = document.createElement("div");
  shadowHost.id = DOMComponents.aiAssistantRoot.substring(1); // Remove # prefix
  shadowHost.style.cssText =
    "position: fixed; top: 0; left: 0; z-index: 99999; pointer-events: none;";
  document.body.appendChild(shadowHost);

  const shadowRoot = shadowHost.attachShadow({ mode: "open" });

  // Inject styles into shadow root
  injectShadowStyles(shadowRoot, currentTheme);

  // Create container inside shadow DOM
  const container = document.createElement("div");
  container.id = DOMComponents.aiContainer.substring(1); // Remove # prefix
  container.className = `wa-ai-theme-${currentTheme}`;
  container.style.cssText = "pointer-events: auto;";
  shadowRoot.appendChild(container);

  // Load user settings
  loadUserSettings();

  // Initialize components
  const chatButton = new ChatButton(currentTheme, openChat);

  const globalSettingsButton = new GlobalSettingsButton(openGlobalSettings);

  // Inject buttons into WhatsApp sidebar
  injectGlobalSettingsButton(globalSettingsButton);
  injectChatButton(chatButton);

  // Initialize action menu
  actionMenu = new ActionMenu(container, currentTheme, handleAIAction);

  // Initialize results display
  resultsDisplay = new ResultsDisplay(container, currentTheme);

  /**
   * Load user settings from storage
   */
  async function loadUserSettings(): Promise<void> {
    try {
      const result = await browser.storage.local.get("userSettings");
      if (result.userSettings) {
        userSettings = { ...DEFAULT_SETTINGS, ...result.userSettings };
        console.log("[WhatsApp AI Assistant] Settings loaded:", userSettings);
      }
    } catch (error) {
      console.error("[WhatsApp AI Assistant] Failed to load settings:", error);
    }
  }

  /**
   * Inject global settings button below Meta AI or in sidebar
   */
  function injectGlobalSettingsButton(
    button: GlobalSettingsButton,
    retries = 0
  ): void {
    // Check if already injected
    if (document.querySelector(DOMComponents.globalSettingsWrapper)) {
      return;
    }

    // Find the side panel (#side) which contains the chat list and top buttons
    const mainMenu = document.querySelector(DOMComponents.mainMenu);

    if (!mainMenu) {
      if (retries < 10) {
        setTimeout(() => injectGlobalSettingsButton(button, retries + 1), 2000);
      }
      return;
    }

    mainMenu.appendChild(button.render());
  }

  /**
   * Inject chat button before the "New chat" button
   */
  function injectChatButton(button: ChatButton, retries = 0): void {
    console.log(
      `[WhatsApp AI Assistant] Attempting to inject chat button (retry ${retries})...`
    );

    // Check if already injected
    if (document.querySelector(DOMComponents.aiChatButton)) {
      console.log("[WhatsApp AI Assistant] Chat button already exists");
      return;
    }

    // Find the "New chat" button - this is our reference point
    const newChatButton = document.querySelector(DOMComponents.newChatButton);

    if (!newChatButton) {
      console.log(
        "[WhatsApp AI Assistant] New chat button not found, will retry..."
      );
      if (retries < 10) {
        setTimeout(() => injectChatButton(button, retries + 1), 2000);
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
      newChatButton.closest(DOMComponents.htmlSpan) ||
      newChatButton.closest("span");

    if (!newChatSpan) {
      console.warn(
        "[WhatsApp AI Assistant] Cannot find new chat span container"
      );
      if (retries < 10) {
        setTimeout(() => injectChatButton(button, retries + 1), 2000);
      }
      return;
    }

    // Get the parent div that contains all button spans
    const buttonsContainer = newChatSpan.parentElement;
    if (!buttonsContainer) {
      console.warn("[WhatsApp AI Assistant] Cannot find buttons container");
      if (retries < 10) {
        setTimeout(() => injectChatButton(button, retries + 1), 2000);
      }
      return;
    }

    // Wrap our button in a span with WhatsApp's classes to match styling
    const buttonWrapper = document.createElement("span");
    buttonWrapper.className = newChatSpan.className; // Copy classes from new chat span
    buttonWrapper.appendChild(button.element);

    // Insert before the new chat button span
    buttonsContainer.insertBefore(buttonWrapper, newChatSpan);

    console.log("[WhatsApp AI Assistant] Chat button injected successfully");
  }

  /**
   * Open chat panel
   */
  function openChat(): void {
    if (chatPanel) {
      chatPanel.hide();
      chatPanel = null;
      return;
    }

    if (globalSettingsPanel) {
      globalSettingsPanel.hide();
      globalSettingsPanel = null;
    }

    // Get current active chat ID
    const chatId = getActiveChatId();

    if (!chatId) {
      console.warn("[WhatsApp AI Assistant] No active chat found");
      alert("Please open a chat to view its details");
      return;
    }

    // Get chat name from header
    const chatHeader = document.querySelector(
      DOMComponents.conversationInfoHeader
    );
    const chatName = chatHeader?.textContent || "";
    const isGroup = isGroupChat();

    // Always create a new chat panel for the current chat
    chatPanel = new ChatPanel(currentTheme, chatId, chatName, isGroup);

    chatPanel.show();
  }

  /**
   * Open global settings panel
   */
  function openGlobalSettings(): void {
    // check if setting panel is open the close it
    if (globalSettingsPanel) {
      globalSettingsPanel.hide();
      globalSettingsPanel = null;
      return;
    }

    if (chatPanel) {
      chatPanel.hide();
      chatPanel = null;
    }

    globalSettingsPanel = new GlobalSettingsPanel(userSettings, () => {
      // Callback when settings panel is closed
      loadUserSettings(); // Reload settings in case they were changed
    });

    globalSettingsPanel.show();
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
      chatButton.updateTheme(theme);
      chatPanel?.updateTheme(theme);
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
      div.className = DOMComponents.actionBtnContainer.substring(1);
      div.appendChild(button.element);

      const actionsContainer = messageElement.querySelector(
        DOMComponents.messageActionContainer
      );

      if (
        actionsContainer &&
        !actionsContainer.querySelector(DOMComponents.aiActionButton)
      ) {
        actionsContainer.appendChild(div);
      }
    },

    openChat,
    openGlobalSettings,

    destroy(): void {
      chatButton.destroy();
      chatPanel?.hide();
      actionMenu?.destroy();
      resultsDisplay?.destroy();
      shadowHost.remove();
    },
  };
}
