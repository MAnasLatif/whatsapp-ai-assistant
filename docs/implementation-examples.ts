/**
 * Content Script Implementation Examples
 * Practical code snippets for implementing WhatsApp AI Assistant features
 */

import {
  MessageData,
  extractMessageData,
  getAllMessages,
  getActiveChatId,
  observeNewMessages,
  injectAIButton,
  isGroupChat,
} from "../utils/whatsapp-dom";

// ============================================================================
// Example 1: Initialize Extension on WhatsApp Web
// ============================================================================

export function initializeExtension() {
  console.log("WhatsApp AI Assistant: Initializing...");

  // Wait for WhatsApp Web to fully load
  const checkWhatsAppLoaded = setInterval(() => {
    const chatContainer = document.querySelector(
      '[data-scrolltracepolicy="wa.web.conversation.messages"]'
    );

    if (chatContainer) {
      clearInterval(checkWhatsAppLoaded);
      console.log("WhatsApp AI Assistant: WhatsApp Web loaded");

      // Setup features
      setupMessageObserver();
      setupAIButtons();
      injectAISettingsButton();

      console.log("WhatsApp AI Assistant: Initialization complete");
    }
  }, 1000);
}

// ============================================================================
// Example 2: Setup Message Observer for Real-time Updates
// ============================================================================

let messageObserver: MutationObserver | null = null;

export function setupMessageObserver() {
  // Clean up existing observer
  if (messageObserver) {
    messageObserver.disconnect();
  }

  // Setup new observer
  messageObserver = observeNewMessages((message: MessageData) => {
    console.log("New message detected:", message);

    // Update chat context/story incrementally
    updateChatContext(message);

    // Inject AI button into new message
    const messageElement = document.querySelector(`[data-id="${message.id}"]`);
    if (messageElement) {
      injectAIButton(messageElement, handleAIAction);
    }
  });

  console.log("Message observer setup complete");
}

// ============================================================================
// Example 3: Setup AI Buttons on Existing Messages
// ============================================================================

export function setupAIButtons() {
  const messageElements = document.querySelectorAll("div._amjv[data-id]");

  let injectedCount = 0;
  messageElements.forEach((messageElement) => {
    // Only inject on hover - add event listener
    messageElement.addEventListener(
      "mouseenter",
      () => {
        const button = injectAIButton(messageElement, handleAIAction);
        if (button) injectedCount++;
      },
      { once: true }
    ); // Only add listener once
  });

  console.log(`AI buttons ready for ${messageElements.length} messages`);
}

// ============================================================================
// Example 4: Handle AI Button Click - Show Context Menu
// ============================================================================

export function handleAIAction(event: Event, messageData: MessageData) {
  event.stopPropagation();

  // Remove existing context menu if any
  const existingMenu = document.querySelector(".ai-context-menu");
  if (existingMenu) {
    existingMenu.remove();
  }

  // Create context menu
  const menu = createAIContextMenu(messageData);

  // Position menu near the button
  const button = event.target as HTMLElement;
  const buttonRect = button.getBoundingClientRect();

  menu.style.position = "fixed";
  menu.style.top = `${buttonRect.bottom + 5}px`;
  menu.style.left = `${buttonRect.left}px`;
  menu.style.zIndex = "9999";

  document.body.appendChild(menu);

  // Close menu when clicking outside
  const closeMenu = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener("click", closeMenu);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", closeMenu);
  }, 100);
}

// ============================================================================
// Example 5: Create AI Context Menu
// ============================================================================

export function createAIContextMenu(messageData: MessageData): HTMLDivElement {
  const menu = document.createElement("div");
  menu.className = "ai-context-menu";
  menu.style.cssText = `
    background: var(--background-default, #fff);
    border: 1px solid var(--border-default, #e9edef);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 8px 0;
    min-width: 200px;
  `;

  const actions = [
    { label: "Analyze Message", icon: "🔍", action: "analyze" },
    { label: "Translate", icon: "🌐", action: "translate" },
    { label: "Explain Context", icon: "💡", action: "explain" },
    { label: "Detect Tone", icon: "😊", action: "tone" },
    { label: "Generate Reply", icon: "✍️", action: "reply" },
  ];

  actions.forEach((action) => {
    const item = document.createElement("div");
    item.className = "ai-menu-item";
    item.style.cssText = `
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      transition: background 0.2s;
    `;

    item.innerHTML = `
      <span style="font-size: 18px;">${action.icon}</span>
      <span>${action.label}</span>
    `;

    item.addEventListener("mouseenter", () => {
      item.style.background = "var(--background-default-hover, #f5f6f6)";
    });

    item.addEventListener("mouseleave", () => {
      item.style.background = "transparent";
    });

    item.addEventListener("click", () => {
      handleAIMenuAction(action.action, messageData);
      menu.remove();
    });

    menu.appendChild(item);
  });

  return menu;
}

// ============================================================================
// Example 6: Handle AI Menu Actions
// ============================================================================

export function handleAIMenuAction(action: string, messageData: MessageData) {
  console.log(`AI Action: ${action}`, messageData);

  switch (action) {
    case "analyze":
      analyzeMessage(messageData);
      break;
    case "translate":
      translateMessage(messageData);
      break;
    case "explain":
      explainContext(messageData);
      break;
    case "tone":
      detectTone(messageData);
      break;
    case "reply":
      generateReply(messageData);
      break;
  }
}

// ============================================================================
// Example 7: Analyze Message - Send to Background Worker
// ============================================================================

export async function analyzeMessage(messageData: MessageData) {
  showLoadingIndicator("Analyzing message...");

  try {
    // Get chat context (last N messages)
    const chatContext = getAllMessages(10); // Last 10 messages

    // Send to background worker
    const response = await browser.runtime.sendMessage({
      type: "ANALYZE_MESSAGE",
      payload: {
        message: messageData,
        context: chatContext,
        chatId: getActiveChatId(),
        isGroup: isGroupChat(),
      },
    });

    hideLoadingIndicator();
    displayAnalysisResult(response.result);
  } catch (error) {
    hideLoadingIndicator();
    showError("Failed to analyze message");
    console.error(error);
  }
}

// ============================================================================
// Example 8: Generate Reply with Context
// ============================================================================

export async function generateReply(messageData: MessageData) {
  showLoadingIndicator("Generating reply suggestions...");

  try {
    // Get relevant chat context
    const chatContext = getAllMessages(15);

    // Send to background worker
    const response = await browser.runtime.sendMessage({
      type: "GENERATE_REPLY",
      payload: {
        message: messageData,
        context: chatContext,
        chatId: getActiveChatId(),
        isGroup: isGroupChat(),
      },
    });

    hideLoadingIndicator();
    displayReplySuggestions(response.suggestions);
  } catch (error) {
    hideLoadingIndicator();
    showError("Failed to generate reply");
    console.error(error);
  }
}

// ============================================================================
// Example 9: Display Analysis Result in Native Style
// ============================================================================

export function displayAnalysisResult(result: any) {
  const resultContainer = document.createElement("div");
  resultContainer.className = "ai-result-container";
  resultContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--background-default, #fff);
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    padding: 24px;
    max-width: 500px;
    z-index: 10000;
  `;

  resultContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600;">AI Analysis</h3>
      <button class="close-btn" style="border: none; background: none; cursor: pointer; font-size: 24px;">&times;</button>
    </div>
    <div style="font-size: 14px; line-height: 1.6;">
      ${formatAnalysisResult(result)}
    </div>
  `;

  document.body.appendChild(resultContainer);

  // Close button
  resultContainer.querySelector(".close-btn")?.addEventListener("click", () => {
    resultContainer.remove();
  });

  // Close on outside click
  setTimeout(() => {
    document.addEventListener("click", function closeResult(e) {
      if (!resultContainer.contains(e.target as Node)) {
        resultContainer.remove();
        document.removeEventListener("click", closeResult);
      }
    });
  }, 100);
}

// ============================================================================
// Example 10: Format Analysis Result
// ============================================================================

function formatAnalysisResult(result: any): string {
  let html = "";

  if (result.summary) {
    html += `<div style="margin-bottom: 16px;">
      <strong>Summary:</strong>
      <p style="margin: 8px 0;">${result.summary}</p>
    </div>`;
  }

  if (result.keyPoints && result.keyPoints.length > 0) {
    html += `<div style="margin-bottom: 16px;">
      <strong>Key Points:</strong>
      <ul style="margin: 8px 0; padding-left: 20px;">
        ${result.keyPoints.map((point: string) => `<li>${point}</li>`).join("")}
      </ul>
    </div>`;
  }

  if (result.tone) {
    html += `<div style="margin-bottom: 16px;">
      <strong>Tone:</strong>
      <p style="margin: 8px 0;">${result.tone}</p>
    </div>`;
  }

  if (result.intent) {
    html += `<div>
      <strong>Intent:</strong>
      <p style="margin: 8px 0;">${result.intent}</p>
    </div>`;
  }

  return html || "<p>No analysis available</p>";
}

// ============================================================================
// Example 11: Inject AI Settings Button
// ============================================================================

export function injectAISettingsButton() {
  // Find WhatsApp settings area
  const settingsArea = document
    .querySelector('[data-testid="default-user"]')
    ?.closest("div");

  if (!settingsArea) {
    console.warn("Settings area not found");
    return;
  }

  // Check if already injected
  if (document.querySelector(".ai-settings-button")) {
    return;
  }

  const aiSettingsBtn = document.createElement("button");
  aiSettingsBtn.className = "ai-settings-button";
  aiSettingsBtn.setAttribute("aria-label", "AI Settings");
  aiSettingsBtn.style.cssText = `
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: var(--background-default-hover, #f0f2f5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px;
    transition: background 0.2s;
  `;

  aiSettingsBtn.innerHTML = `
    <svg viewBox="0 0 24 24" height="24" width="24" fill="currentColor">
      <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
      <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" fill="none"/>
    </svg>
  `;

  aiSettingsBtn.addEventListener("mouseenter", () => {
    aiSettingsBtn.style.background =
      "var(--background-default-active, #d9dbd9)";
  });

  aiSettingsBtn.addEventListener("mouseleave", () => {
    aiSettingsBtn.style.background = "var(--background-default-hover, #f0f2f5)";
  });

  aiSettingsBtn.addEventListener("click", () => {
    openAISettingsPanel();
  });

  settingsArea.insertBefore(aiSettingsBtn, settingsArea.firstChild);
  console.log("AI Settings button injected");
}

// ============================================================================
// Example 12: Open AI Settings Panel
// ============================================================================

export function openAISettingsPanel() {
  console.log("Opening AI Settings Panel...");

  // Send message to open popup or show inline modal
  browser.runtime.sendMessage({
    type: "OPEN_SETTINGS",
  });

  // Or show inline modal (simplified example)
  showAISettingsModal();
}

function showAISettingsModal() {
  // TODO: Implement full settings modal
  alert("AI Settings Panel - Coming Soon!");
}

// ============================================================================
// Helper Functions
// ============================================================================

function showLoadingIndicator(message: string) {
  const loader = document.createElement("div");
  loader.id = "ai-loading";
  loader.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 14px;
  `;
  loader.textContent = message;
  document.body.appendChild(loader);
}

function hideLoadingIndicator() {
  document.getElementById("ai-loading")?.remove();
}

function showError(message: string) {
  alert(message); // Replace with better error UI
}

function translateMessage(messageData: MessageData) {
  console.log("Translate:", messageData);
  // TODO: Implement translation
}

function explainContext(messageData: MessageData) {
  console.log("Explain context:", messageData);
  // TODO: Implement context explanation
}

function detectTone(messageData: MessageData) {
  console.log("Detect tone:", messageData);
  // TODO: Implement tone detection
}

function displayReplySuggestions(suggestions: any) {
  console.log("Display reply suggestions:", suggestions);
  // TODO: Implement reply suggestions UI
}

function updateChatContext(message: MessageData) {
  console.log("Update chat context:", message);
  // TODO: Implement incremental context update
}
