/**
 * WhatsApp Web DOM Utilities
 * Helper functions for extracting and manipulating WhatsApp Web DOM elements
 */

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
  return !!document.querySelector("._amkz");
}

/**
 * Checks if a message element is a voice message
 * @param messageElement - The message DOM element
 * @returns true if voice message
 */
export function isVoiceMessage(messageElement: Element): boolean {
  return !!messageElement.querySelector('[aria-label*="voice message" i]');
}

/**
 * Gets voice message duration
 * @param messageElement - The message DOM element
 * @returns Duration string (e.g., "0:24")
 */
export function getVoiceDuration(messageElement: Element): string | null {
  const durationElement = messageElement.querySelector(".x10l6tqk.x1fesggd");
  return durationElement?.textContent || null;
}

/**
 * Checks if a message element is an image message
 * @param messageElement - The message DOM element
 * @returns true if image message
 */
export function isImageMessage(messageElement: Element): boolean {
  return !!messageElement.querySelector('img[src^="blob:"]');
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
    'img[src^="blob:"]'
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
  return !!messageElement.querySelector('[aria-label="Quoted message"]');
}

/**
 * Checks if a message is forwarded
 * @param messageElement - The message DOM element
 * @returns true if forwarded message
 */
export function isForwarded(messageElement: Element): boolean {
  return !!messageElement.querySelector('[data-icon="forward-refreshed"]');
}

/**
 * Checks if a message is deleted
 * @param messageElement - The message DOM element
 * @returns true if deleted message
 */
export function isDeleted(messageElement: Element): boolean {
  return !!messageElement.querySelector('[title*="deleted" i]');
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

  const copyableText = messageElement.querySelector(".copyable-text");
  const prePlainText = copyableText?.getAttribute("data-pre-plain-text") || "";

  // Try multiple selectors for content
  const contentSpan = messageElement.querySelector(
    "span.selectable-text.copyable-text, .emoji.copyable-text"
  );
  const messageText = contentSpan?.textContent?.trim() || "";

  const timestampSpan = messageElement.querySelector(
    ".x3nfvp2 .x1c4vz4f, .x3nfvp2 .x2lah0s"
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
  const messageElements = document.querySelectorAll("div._amjv[data-id]");

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
  const firstMessage = document.querySelector("div._amjv[data-id]");
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
  const chatContainer = document.querySelector(
    '[data-scrolltracepolicy="wa.web.conversation.messages"]'
  );

  if (!chatContainer) {
    console.warn("Chat container not found");
    return null;
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const element = node as Element;
          if (element.matches("div._amjv[data-id]")) {
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
    ".x78zum5.xbfrwjf.x8k05lb.xeq5yr9.x1n2onr6.xrr41r3.xqcrz7y"
  );

  if (!actionsContainer || actionsContainer.querySelector(".ai-action-btn")) {
    return null; // Already injected or no container
  }

  const aiButton = document.createElement("button");
  aiButton.className =
    "ai-action-btn xjb2p0i x1ypdohk xjbqb8w x972fbf xcfux6l x1qhh985 xm0m39n xdj266r x11i5rnm xat24cr x1mh8g0r x1w3u9th x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x3nfvp2 x1q0g3np xexx8yu x4uap5 x18d9i69 xkhd6sd";
  aiButton.setAttribute("aria-label", "AI Actions");
  aiButton.setAttribute("type", "button");
  aiButton.style.cssText = "margin-right: 8px; cursor: pointer;";

  // Create icon (using simple text for now, can be replaced with SVG)
  aiButton.innerHTML = `
    <span class="x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j xozqiw3 x1oa3qoh x12fk4p8">
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
