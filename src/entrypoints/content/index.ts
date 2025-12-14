/**
 * WhatsApp AI Assistant - Content Script
 * Handles DOM manipulation, UI injection, and message extraction
 */

import { createApp, type App } from "@/ui/app";
import { injectStyles } from "@/ui/styles";
import {
  detectTheme,
  waitForElement,
  observeThemeChanges,
  getAllMessages,
} from "@/utils/whatsapp-dom";
import type { WhatsAppTheme } from "@/types";
import { DOMComponents } from "@/utils/dom-components";

// Global state
let app: App | null = null;
let themeObserver: MutationObserver | null = null;
let currentTheme: WhatsAppTheme = "light";

export default defineContentScript({
  matches: ["*://web.whatsapp.com/*"],
  runAt: "document_idle",

  async main() {
    console.log("[WhatsApp AI Assistant] Content script loaded");

    try {
      // Wait for WhatsApp to fully load
      await waitForWhatsAppReady();
      console.log("[WhatsApp AI Assistant] WhatsApp ready");

      // Detect initial theme
      currentTheme = detectTheme();
      console.log(`[WhatsApp AI Assistant] Detected theme: ${currentTheme}`);

      // Inject styles into the main document
      injectStyles(currentTheme);

      // Initialize the app
      app = createApp(currentTheme);
      console.log("[WhatsApp AI Assistant] App created");

      // Observe theme changes
      themeObserver = observeThemeChanges((newTheme) => {
        console.log(`[WhatsApp AI Assistant] Theme changed to: ${newTheme}`);
        currentTheme = newTheme;
        app?.updateTheme(newTheme);
        injectStyles(newTheme);
      });

      // Set up message hover button injection
      setupMessageHoverObserver();

      // Set up message listener for background script
      setupMessageListener();

      console.log("[WhatsApp AI Assistant] Initialization complete");
    } catch (error) {
      console.error("[WhatsApp AI Assistant] Initialization failed:", error);
    }
  },
});

/**
 * Wait for WhatsApp Web to be fully loaded
 */
async function waitForWhatsAppReady(): Promise<void> {
  console.log("[WhatsApp AI Assistant] Waiting for WhatsApp to load...");

  // Wait for the main app container
  await waitForElement(DOMComponents.app, 30000);
  console.log("[WhatsApp AI Assistant] #app found");

  // Wait for the side panel (chat list) to load - try multiple selectors
  try {
    await waitForElement(DOMComponents.chatList, 10000);
    console.log("[WhatsApp AI Assistant] chat-list found");
  } catch {
    // Fallback: wait for side panel
    await waitForElement(DOMComponents.side, 10000);
    console.log("[WhatsApp AI Assistant] #side found (fallback)");
  }

  // Additional delay for dynamic content
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Set up observer for message hover to inject AI buttons
 */
function setupMessageHoverObserver(): void {
  console.log("[WhatsApp AI Assistant] Setting up message hover observer...");

  // Try multiple selectors for conversation area
  const selectors = [
    DOMComponents.conversationPanel,
    '[role="application"]',
    DOMComponents.main,
    DOMComponents.copyableArea,
  ];

  let conversationArea: Element | null = null;

  for (const selector of selectors) {
    conversationArea = document.querySelector(selector);
    if (conversationArea) {
      console.log(
        `[WhatsApp AI Assistant] Found conversation area with: ${selector}`
      );
      break;
    }
  }

  if (!conversationArea) {
    console.log(
      "[WhatsApp AI Assistant] Conversation area not found, retrying..."
    );
    setTimeout(setupMessageHoverObserver, 2000);
    return;
  }

  // Use event delegation for message hover
  document.body.addEventListener("mouseover", handleMessageHover, true);
  console.log("[WhatsApp AI Assistant] Message hover observer set up");
}

/**
 * Handle mouse entering a message element
 */
function handleMessageHover(event: Event): void {
  const target = event.target as HTMLElement;

  // Find the message container
  const messageElement =
    target.closest("div[data-id]") ||
    target.closest(".message-in, .message-out");

  if (
    messageElement &&
    !messageElement.querySelector(DOMComponents.aiActionButton)
  ) {
    app?.injectMessageButton(messageElement as HTMLElement);
  }
}

/**
 * Set up message listener for background script requests
 */
function setupMessageListener(): void {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_MESSAGES") {
      try {
        const limit = message.payload?.limit || 20;
        const messages = getAllMessages(limit);
        sendResponse({ success: true, messages });
      } catch (error) {
        console.error("Error getting messages:", error);
        sendResponse({ success: false, error: (error as Error).message });
      }
      return true; // Keep channel open for async response
    }
  });
  console.log("[WhatsApp AI Assistant] Message listener set up");
}
