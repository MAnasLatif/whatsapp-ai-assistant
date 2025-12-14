/**
 * WhatsApp Web DOM Utilities
 * Helper functions for extracting and manipulating WhatsApp Web DOM elements
 */

import type { WhatsAppTheme } from "@/types";
import { DOMComponents } from "./dom-components";

export interface MessageData {
  id: string | null;
  chatId: string | null;
  isOutgoing: boolean;
  sender: string;
  content: string;
  timestamp: string;
  fullTimestamp: string | null;
  isGroup: boolean;
  isDeleted: boolean;
  isForwarded: boolean;
  isReply: boolean;
  mediaType: "text" | "voice" | "image" | "video" | "document" | "unknown";
  mediaSrc?: string;
  mediaDuration?: string;
}

// ============================================
// Theme Detection
// ============================================

/**
 * Detect current WhatsApp theme (dark or light)
 */
export function detectTheme(): WhatsAppTheme {
  // Check for dark mode class on body or html
  const isDark =
    document.body.classList.contains("dark") ||
    document.documentElement.classList.contains("dark") ||
    document.body.getAttribute("data-theme") === "dark" ||
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Also check WhatsApp's CSS variables or background
  const bodyStyle = window.getComputedStyle(document.body);
  const bgColor = bodyStyle.backgroundColor;

  // Parse RGB values
  const rgb = bgColor.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    const brightness =
      (parseInt(rgb[0]) * 299 +
        parseInt(rgb[1]) * 587 +
        parseInt(rgb[2]) * 114) /
      1000;
    if (brightness < 128) {
      return "dark";
    }
  }

  return isDark ? "dark" : "light";
}

/**
 * Observe theme changes
 */
export function observeThemeChanges(
  callback: (theme: WhatsAppTheme) => void
): MutationObserver {
  let currentTheme = detectTheme();

  const observer = new MutationObserver(() => {
    const newTheme = detectTheme();
    if (newTheme !== currentTheme) {
      currentTheme = newTheme;
      callback(newTheme);
    }
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class", "data-theme", "style"],
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });

  // Also listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      const newTheme: WhatsAppTheme = e.matches ? "dark" : "light";
      if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        callback(newTheme);
      }
    });

  return observer;
}

// ============================================
// DOM Utilities
// ============================================

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(
  selector: string,
  timeout: number = 10000
): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// ============================================
// Message Extraction
// ============================================

/**
 * Extracts chat ID from data-id attribute
 * @param dataId - The data-id attribute value
 * @returns Chat ID (e.g., "923061400333@c.us")
 */
export function extractChatId(dataId: string): string | null {
  // Format: [true/false]_[CHAT_ID]@c.us_[MESSAGE_ID]
  const parts = dataId.split("_");
  if (parts.length >= 2) {
    return parts[1]; // Returns "923061400333@c.us"
  }
  return null;
}

/**
 * Extracts sender name from data-pre-plain-text attribute
 * @param prePlainText - The data-pre-plain-text attribute value
 * @returns Sender name
 */
export function extractSenderName(prePlainText: string): string {
  // Format: "[TIME, DATE] SENDER_NAME: "
  // Example: "[1:02 AM, 12/10/2025] Esha Tanveer - Upvave - QA: "

  const match = prePlainText.match(/\] (.+?): $/);
  return match ? match[1] : "Unknown";
}

/**
 * Extracts full timestamp from data-pre-plain-text attribute
 * @param prePlainText - The data-pre-plain-text attribute value
 * @returns Full timestamp string (e.g., "10:54 PM, 12/9/2025")
 */
export function extractFullTimestamp(prePlainText: string): string | null {
  // Format: "[10:54 PM, 12/9/2025] ..."
  const match = prePlainText.match(/\[(.+?)\]/);
  return match ? match[1] : null;
}

/**
 * Checks if the current chat is a group chat
 * @returns true if group chat, false otherwise
 */
export function isGroupChat(): boolean {
  return !!document.querySelector(DOMComponents.groupIndicator);
}

/**
 * Checks if a message element is a voice message
 * @param messageElement - The message DOM element
 * @returns true if voice message
 */
export function isVoiceMessage(messageElement: Element): boolean {
  return !!messageElement.querySelector(DOMComponents.voiceMessageLabel);
}

/**
 * Gets voice message duration
 * @param messageElement - The message DOM element
 * @returns Duration string (e.g., "0:24")
 */
export function getVoiceDuration(messageElement: Element): string | null {
  const durationElement = messageElement.querySelector(
    DOMComponents.voiceDuration
  );
  return durationElement?.textContent || null;
}

/**
 * Checks if a message element is an image message
 * @param messageElement - The message DOM element
 * @returns true if image message
 */
export function isImageMessage(messageElement: Element): boolean {
  return !!messageElement.querySelector(DOMComponents.imageBlob);
}

/**
 * Gets image data from a message
 * @param messageElement - The message DOM element
 * @returns Image data object or null
 */
export function getImageData(messageElement: Element): {
  src: string;
  width: string;
  height: string;
} | null {
  const imgElement = messageElement.querySelector(
    DOMComponents.imageBlob
  ) as HTMLImageElement;

  if (!imgElement) return null;

  return {
    src: imgElement.src,
    width: imgElement.style.width || imgElement.width.toString(),
    height: imgElement.style.height || imgElement.height.toString(),
  };
}

/**
 * Checks if a message is a reply/quoted message
 * @param messageElement - The message DOM element
 * @returns true if reply message
 */
export function isReply(messageElement: Element): boolean {
  return !!messageElement.querySelector(DOMComponents.quotedMessage);
}

/**
 * Checks if a message is forwarded
 * @param messageElement - The message DOM element
 * @returns true if forwarded message
 */
export function isForwarded(messageElement: Element): boolean {
  return !!messageElement.querySelector(DOMComponents.forwardIcon);
}

/**
 * Checks if a message is deleted
 * @param messageElement - The message DOM element
 * @returns true if deleted message
 */
export function isDeleted(messageElement: Element): boolean {
  return !!messageElement.querySelector(DOMComponents.deletedMessage);
}

/**
 * Extracts complete message data from a message element
 * @param messageElement - The message DOM element
 * @returns MessageData object
 */
export function extractMessageData(messageElement: Element): MessageData {
  const dataId = messageElement.getAttribute("data-id");
  const isOutgoing = dataId?.startsWith("true_") || false;
  const chatId = dataId ? extractChatId(dataId) : null;

  const copyableText = messageElement.querySelector(DOMComponents.copyableText);
  const prePlainText = copyableText?.getAttribute("data-pre-plain-text") || "";

  // Try multiple selectors for content
  const contentSpan = messageElement.querySelector(
    DOMComponents.messageContent
  );
  const messageText = contentSpan?.textContent?.trim() || "";

  const timestampSpan = messageElement.querySelector(
    DOMComponents.messageTimestamp
  );
  const timestamp = timestampSpan?.textContent || "";

  const fullTimestamp = extractFullTimestamp(prePlainText);
  const sender = isOutgoing ? "You" : extractSenderName(prePlainText);

  // Determine media type
  let mediaType: MessageData["mediaType"] = "text";
  let mediaSrc: string | undefined;
  let mediaDuration: string | undefined;

  if (isVoiceMessage(messageElement)) {
    mediaType = "voice";
    mediaDuration = getVoiceDuration(messageElement) || undefined;
  } else if (isImageMessage(messageElement)) {
    mediaType = "image";
    const imageData = getImageData(messageElement);
    mediaSrc = imageData?.src;
  }

  return {
    id: dataId,
    chatId,
    isOutgoing,
    sender,
    content: messageText,
    timestamp,
    fullTimestamp,
    isGroup: messageElement.classList.contains("_amkz"),
    isDeleted: isDeleted(messageElement),
    isForwarded: isForwarded(messageElement),
    isReply: isReply(messageElement),
    mediaType,
    mediaSrc,
    mediaDuration,
  };
}

/**
 * Gets all visible (rendered) messages in the current chat
 * @param limit - Optional limit on number of messages to return
 * @returns Array of MessageData objects
 */
export function getAllMessages(limit?: number): MessageData[] {
  const messageElements = document.querySelectorAll(
    DOMComponents.messageContainer
  );

  const messages = Array.from(messageElements)
    .filter((el) => el.getAttribute("data-virtualized") === "false")
    .map((el) => extractMessageData(el));

  if (limit && messages.length > limit) {
    return messages.slice(-limit); // Return last N messages
  }

  return messages;
}

/**
 * Gets the active chat's identifier
 * @returns Chat ID string or null
 */
export function getActiveChatId(): string | null {
  const firstMessage = document.querySelector(DOMComponents.messageContainer);
  if (!firstMessage) return null;

  const dataId = firstMessage.getAttribute("data-id");
  return dataId ? extractChatId(dataId) : null;
}

/**
 * Sets up a MutationObserver to watch for new messages
 * @param callback - Function to call when new message is detected
 * @returns MutationObserver instance (call .disconnect() to stop)
 */
export function observeNewMessages(
  callback: (message: MessageData) => void
): MutationObserver | null {
  const chatContainer = document.querySelector(DOMComponents.chatContainer);

  if (!chatContainer) {
    console.warn("Chat container not found");
    return null;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const element = node as Element;
          if (element.matches(DOMComponents.messageContainer)) {
            const messageData = extractMessageData(element);
            callback(messageData);
          }
        }
      });
    });
  });

  observer.observe(chatContainer, { childList: true, subtree: true });

  return observer;
}

/**
 * Injects an AI button into a message element's action container
 * @param messageElement - The message DOM element
 * @param onClick - Click handler for the AI button
 * @returns The created button element or null if injection failed
 */
export function injectAIButton(
  messageElement: Element,
  onClick: (e: Event, messageData: MessageData) => void
): HTMLButtonElement | null {
  const actionsContainer = messageElement.querySelector(
    DOMComponents.messageActionsContainer
  );

  if (
    !actionsContainer ||
    actionsContainer.querySelector(`.${DOMComponents.aiActionButtonClass}`)
  ) {
    return null; // Already injected or no container
  }

  const aiButton = document.createElement("button");
  aiButton.className = `${DOMComponents.aiActionButtonClass} ${DOMComponents.messageActionButtonBase}`;
  aiButton.setAttribute("aria-label", "AI Actions");
  aiButton.setAttribute("type", "button");
  aiButton.style.cssText = "margin-right: 8px; cursor: pointer;";

  // Create icon (using simple text for now, can be replaced with SVG)
  aiButton.innerHTML = `
    <span class="${DOMComponents.messageActionIconSpan}">
      <svg viewBox="0 0 24 24" height="20" width="20" fill="currentColor">
        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
        <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" fill="none"/>
      </svg>
    </span>
  `;

  const messageData = extractMessageData(messageElement);
  aiButton.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick(e, messageData);
  });

  actionsContainer.insertBefore(aiButton, actionsContainer.firstChild);

  return aiButton;
}

/**
 * Converts blob URL to base64 string (for sending media to API)
 * @param blobUrl - Blob URL from WhatsApp
 * @returns Base64 encoded string
 */
export async function blobToBase64(blobUrl: string): Promise<string> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
