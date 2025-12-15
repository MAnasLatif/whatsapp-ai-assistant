# Technical Reference Guide

**WhatsApp AI Assistant Extension**  
**Version:** 1.0  
**Last Updated:** December 14, 2025

Complete technical reference for DOM structure, data models, and implementation patterns.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Type Definitions](#type-definitions)
3. [DOM Components Reference](#dom-components-reference)
4. [WhatsApp Web DOM Patterns](#whatsapp-web-dom-patterns)
5. [Implementation Patterns](#implementation-patterns)
6. [API Integration](#api-integration)
7. [Storage & Caching](#storage--caching)

---

## Project Architecture

### Directory Structure

```
src/
├── entrypoints/           # Extension entry points
│   ├── background.ts      # Service worker (OpenAI API, caching)
│   ├── content/           # Content scripts
│   │   └── index.ts       # Main content script
│   └── popup/             # Extension popup
│       └── main.ts        # Popup UI logic
├── types/                 # TypeScript type definitions
│   └── index.ts           # All interfaces, types, constants
├── utils/                 # Utility functions
│   ├── dom-components.ts  # Global DOM selectors (110+ selectors)
│   ├── whatsapp-dom.ts    # WhatsApp DOM manipulation
│   ├── storage.ts         # Chrome storage wrapper
│   ├── storage-debug.ts   # Storage debugging tools
│   └── icons.ts           # Centralized SVG icons from svgrepo.com (25+ icons)
├── ui/                    # UI components (global)
│   ├── app.ts             # Main UI orchestrator
│   └── components/        # Individual UI components (7 files)
│       ├── chat-button.ts
│       ├── chat-panel.ts
│       ├── global-settings-button.ts
│       ├── global-settings-panel.ts
│       ├── action-menu.ts
│       ├── message-action-button.ts
│       └── results-display.ts
└── styles/                # Style files
    ├── ui-styles.ts       # Injected UI styles (876 lines)
    └── popup-styles.ts    # Popup window styles (295 lines)
```

### Path Aliases

```typescript
@/types       → src/types/
@/utils       → src/utils/
@/ui          → src/ui/
@/styles      → src/styles/
@/entrypoints → src/entrypoints/
```

### Data Flow

```
User Interaction → Content Script → Background Worker → OpenAI API
                         ↓                   ↓
                    UI Components      Local Cache
                         ↓                   ↓
                  Shadow DOM Injection  Chrome Storage
```

---

## Centralized Icons Library

All SVG icons are centralized in `src/utils/icons.ts` (25+ icons). **Always use icons from https://www.svgrepo.com**.

### Available Icons

```typescript
import { Icons } from "@/utils/icons";

// AI Icons
Icons.aiSparkle; // Main AI assistant icon

// Action Icons
Icons.analyze; // Magnifying glass with plus
Icons.translate; // Language/translation symbol
Icons.explain; // Question mark in circle
Icons.tone; // Smiley face for sentiment
Icons.reply; // Message bubble

// UI Control Icons
Icons.close; // X/close button
Icons.info; // Information circle
Icons.empty; // Empty state/inbox
Icons.calendar; // Calendar/time
Icons.delete; // Trash/delete
Icons.story; // Book/story thread
Icons.refresh; // Reload/refresh
Icons.loading; // Spinner animation
Icons.copy; // Clipboard
Icons.check; // Success checkmark
Icons.error; // Error/alert

// User Icons
Icons.settings; // Gear/settings
Icons.user; // User profile
Icons.group; // Multiple users
```

### Usage Examples

```typescript
// Direct usage in templates
const buttonHTML = `<button>${Icons.close}</button>`;

// In component classes
class MyComponent {
  render() {
    return `
      <div class="header">
        <h2>Title</h2>
        ${Icons.close}
      </div>
    `;
  }
}

// Multiple icons
const menuItems = [
  { icon: Icons.analyze, label: "Analyze" },
  { icon: Icons.translate, label: "Translate" },
  { icon: Icons.reply, label: "Reply" },
];
```

### Adding New Icons

1. Find icon on https://www.svgrepo.com
2. Download SVG code
3. Add to `Icons` object in `src/utils/icons.ts`
4. Add documentation comment with source URL
5. Export as property of Icons object

**Example:**

```typescript
export const Icons = {
  // ... existing icons ...

  /**
   * New Icon - Description
   * Source: https://www.svgrepo.com/svg/[id]/[name]
   */
  newIcon: `<svg viewBox="0 0 24 24">...</svg>`,
};
```

---

## Type Definitions

All types are centralized in `src/types/index.ts`. Key interfaces:

### Core Message Types

#### MessageData

```typescript
interface MessageData {
  id: string | null; // Unique message ID from data-id
  chatId: string | null; // Chat identifier (phone@c.us or group@g.us)
  isOutgoing: boolean; // true if sent by user
  sender: string; // Sender name or "You"
  content: string; // Message text content
  timestamp: string; // Short timestamp (e.g., "10:54 PM")
  fullTimestamp: string | null; // Full timestamp with date
  isGroup: boolean; // true if group chat message
  isDeleted: boolean; // true if message was deleted
  isForwarded: boolean; // true if message was forwarded
  isReply: boolean; // true if message is a reply
  mediaType: "text" | "voice" | "image" | "video" | "document" | "unknown";
  mediaSrc?: string; // Blob URL for media content
  mediaDuration?: string; // Duration for voice/video
}
```

**Example:**

```json
{
  "id": "false_923061400333@c.us_3A12F0908922EFDD735D",
  "chatId": "923061400333@c.us",
  "isOutgoing": false,
  "sender": "John Doe",
  "content": "Hello, how are you?",
  "timestamp": "10:54 PM",
  "fullTimestamp": "10:54 PM, 12/9/2025",
  "isGroup": false,
  "mediaType": "text"
}
```

### Chat Context Types

#### ChatContext

```typescript
interface ChatContext {
  chatId: string; // Unique chat identifier
  chatType: "personal" | "group";
  messages: MessageData[]; // Array of messages
  participants: string[]; // List of participant names
  lastUpdated: number; // Timestamp of last update
  messageCount: number; // Total number of messages
}
```

#### StoryThread

```typescript
interface StoryThread {
  id: string; // Unique story identifier
  chatId: string; // Associated chat ID
  title: string; // Story title/topic
  summary: string; // Narrative description of the story thread
  keyPoints: string[]; // Important points
  participants: string[]; // Involved participants
  messageCount: number; // Number of messages in story
  createdAt: number; // Creation timestamp
  updatedAt: number; // Last update timestamp
  isActive: boolean; // Whether story is currently active
  topics: string[]; // Topics discussed in this thread
  isActive: boolean; // true if story is ongoing
}
```

### Settings Types

#### UserSettings

```typescript
interface UserSettings {
  // AI Configuration
  apiKey: string;
  model: AIModel;
  defaultTone: ResponseTone;

  // Features
  enabledFeatures: {
    analysis: boolean;
    translation: boolean;
    replyGeneration: boolean;
    contextExplanation: boolean;
    toneDetection: boolean;
  };

  // Preferences
  outputLanguage: string;
  messageLimit: number; // 5-50 messages
  showHoverButtons: boolean;

  // Cache Settings
  cacheRetentionDays: number;
  maxCacheSize: number; // In MB
  maxStoriesPerChat: number;
  autoCleanup: boolean;

  // Privacy
  dataCollection: boolean;
  excludedChats: string[];
  autoDeleteProcessedData: boolean;
}

type AIModel = "gpt-4o" | "gpt-4o-mini" | "gpt-4-turbo" | "gpt-3.5-turbo";
type ResponseTone = "neutral" | "friendly" | "professional";
type WhatsAppTheme = "light" | "dark";
```

#### Default Settings

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  defaultTone: "neutral",
  enabledFeatures: {
    analysis: true,
    translation: true,
    replyGeneration: true,
    contextExplanation: true,
    toneDetection: true,
  },
  outputLanguage: "en",
  messageLimit: 20,
  showHoverButtons: true,
  cacheRetentionDays: 30,
  maxCacheSize: 100,
  maxStoriesPerChat: 10,
  autoCleanup: true,
  dataCollection: false,
  excludedChats: [],
  autoDeleteProcessedData: false,
};
```

---

## DOM Components Reference

All DOM selectors are centralized in `src/utils/dom-components.ts` (110+ selectors).

### WhatsApp Native Components (42 selectors)

#### Chat Elements

```typescript
CHAT_CONTAINER: '[data-scrolltracepolicy="wa.web.conversation.messages"]';
CHAT_HEADER: '[data-testid="conversation-header"]';
MESSAGE_INPUT: '[contenteditable="true"][data-tab="10"]';
SEND_BUTTON: 'button[aria-label*="Send"]';
```

#### Message Elements

```typescript
MESSAGE_WRAPPER: "div._amjv[data-id]";
MESSAGE_IN: ".message-in";
MESSAGE_OUT: ".message-out";
MESSAGE_GROUP_IN: "._amkz.message-in";
MESSAGE_CONTENT: "span.selectable-text.copyable-text";
MESSAGE_TIMESTAMP: ".x3nfvp2 .x1c4vz4f";
```

#### Media Elements

```typescript
VOICE_BUTTON: '[aria-label*="Play voice message"]';
VOICE_DURATION: ".x10l6tqk.x1fesggd";
IMAGE_MESSAGE: 'img[src^="blob:"]';
VIDEO_MESSAGE: 'video[src^="blob:"]';
```

#### Status & Types

```typescript
DELETED_MESSAGE: '[title*="deleted"]';
FORWARDED_INDICATOR: '[data-icon="forward-refreshed"]';
REPLY_INDICATOR: '[aria-label="Quoted message"]';
```

### Extension Components (68 selectors)

#### Settings Panel

```typescript
SETTINGS_PANEL: ".wa-ai-settings-panel";
SETTINGS_OVERLAY: ".wa-ai-overlay";
SETTINGS_BUTTON: ".wa-ai-settings-btn";
SETTINGS_CLOSE: ".wa-ai-close-btn";
```

#### Action Menu

```typescript
ACTION_MENU: ".wa-ai-action-menu";
ACTION_ITEM: ".wa-ai-action-item";
MENU_ANALYZE: ".wa-ai-menu-analyze";
MENU_TRANSLATE: ".wa-ai-menu-translate";
```

#### Results Display

```typescript
RESULTS_CONTAINER: ".wa-ai-results";
RESULTS_MODAL: ".wa-ai-results-modal";
RESULTS_CONTENT: ".wa-ai-results-content";
```

### Usage Example

```typescript
import { DOMComponents } from "@/utils/dom-components";

// Find chat container
const chatContainer = document.querySelector(
  DOMComponents.WhatsApp.Chat.CHAT_CONTAINER
);

// Get all messages
const messages = document.querySelectorAll(
  DOMComponents.WhatsApp.Message.MESSAGE_WRAPPER
);

// Inject settings button
const settingsBtn = document.createElement("button");
settingsBtn.className =
  DOMComponents.Extension.Settings.SETTINGS_BUTTON.replace(".", "");
```

---

## WhatsApp Web DOM Patterns

### Message Structure

#### Personal Chat - Incoming Message

```html
<div
  data-id="false_923061400333@c.us_3A12F0908922EFDD735D"
  class="_amjv xscbp6u"
>
  <div data-virtualized="false">
    <div class="message-in focusable-list-item">
      <div
        class="copyable-text"
        data-pre-plain-text="[10:54 PM, 12/9/2025] John Doe: "
      >
        <span class="selectable-text copyable-text"> Hello, how are you? </span>
        <span class="x3nfvp2">
          <span class="x1c4vz4f">10:54 PM</span>
        </span>
      </div>
    </div>
  </div>
</div>
```

#### Personal Chat - Outgoing Message

```html
<div
  data-id="true_923061400333@c.us_AC4140A2A99DD53053CE"
  class="_amjv xscbp6u"
>
  <div data-virtualized="false">
    <div class="message-out focusable-list-item">
      <div
        class="copyable-text"
        data-pre-plain-text="[10:55 PM, 12/9/2025] You: "
      >
        <span class="selectable-text copyable-text">
          I'm doing well, thanks!
        </span>
      </div>
    </div>
  </div>
</div>
```

#### Group Chat - Message with Sender

```html
<div
  data-id="false_923014285888@g.us_3A5B8EA211B4D1B780CA"
  class="_amjv xscbp6u"
>
  <div data-virtualized="false">
    <div class="_amkz message-in focusable-list-item">
      <div
        class="copyable-text"
        data-pre-plain-text="[1:02 AM, 12/10/2025] Jane Smith: "
      >
        <span class="selectable-text copyable-text"> Great idea! </span>
      </div>
    </div>
  </div>
</div>
```

### Extracting Message Data

#### Chat ID Extraction

```typescript
function extractChatId(dataId: string): string | null {
  // Format: [true/false]_[CHAT_ID]@[c.us/g.us]_[MESSAGE_ID]
  // Personal: "false_923061400333@c.us_3A12F0908922EFDD735D"
  // Group: "false_923014285888@g.us_3A5B8EA211B4D1B780CA"

  const parts = dataId.split("_");
  if (parts.length >= 2) {
    return parts[1]; // Returns "923061400333@c.us" or "923014285888@g.us"
  }
  return null;
}
```

#### Sender Name Extraction

```typescript
function extractSenderName(prePlainText: string): string {
  // Format: "[TIME, DATE] SENDER_NAME: "
  // Example: "[10:54 PM, 12/9/2025] John Doe: "

  const match = prePlainText.match(/\] (.+?): $/);
  return match ? match[1] : "Unknown";
}
```

#### Complete Message Extraction

```typescript
function extractMessageData(messageElement: HTMLElement): MessageData {
  const dataId = messageElement.getAttribute("data-id");
  const isOutgoing = dataId?.startsWith("true_") ?? false;

  const copyableText = messageElement.querySelector(".copyable-text");
  const prePlainText = copyableText?.getAttribute("data-pre-plain-text") || "";

  const contentSpan = messageElement.querySelector(
    "span.selectable-text.copyable-text"
  );
  const content = contentSpan?.textContent?.trim() || "";

  const timestampSpan = messageElement.querySelector(".x3nfvp2 .x1c4vz4f");
  const timestamp = timestampSpan?.textContent || "";

  return {
    id: dataId,
    chatId: extractChatId(dataId || ""),
    isOutgoing,
    sender: isOutgoing ? "You" : extractSenderName(prePlainText),
    content,
    timestamp,
    fullTimestamp: extractFullTimestamp(prePlainText),
    isGroup: messageElement.classList.contains("_amkz"),
    isDeleted: !!messageElement.querySelector('[title*="deleted"]'),
    isForwarded: !!messageElement.querySelector(
      '[data-icon="forward-refreshed"]'
    ),
    isReply: !!messageElement.querySelector('[aria-label="Quoted message"]'),
    mediaType: detectMediaType(messageElement),
  };
}
```

### Media Detection

```typescript
function detectMediaType(element: HTMLElement): MessageData["mediaType"] {
  if (element.querySelector('[aria-label*="Play voice"]')) return "voice";
  if (element.querySelector('img[src^="blob:"]')) return "image";
  if (element.querySelector('video[src^="blob:"]')) return "video";
  if (element.querySelector('[data-icon="document"]')) return "document";
  return "text";
}
```

---

## Implementation Patterns

### 1. Initialize Extension

```typescript
export default defineContentScript({
  matches: ["*://web.whatsapp.com/*"],
  main() {
    console.log("WhatsApp AI Assistant: Initializing...");

    // Wait for WhatsApp Web to load
    const checkWhatsAppLoaded = setInterval(() => {
      const chatContainer = document.querySelector(
        DOMComponents.WhatsApp.Chat.CHAT_CONTAINER
      );

      if (chatContainer) {
        clearInterval(checkWhatsAppLoaded);
        console.log("WhatsApp Web loaded");

        // Initialize features
        initializeApp();
      }
    }, 1000);
  },
});
```

### 2. Message Observer

```typescript
function observeNewMessages(callback: (message: MessageData) => void) {
  const chatContainer = document.querySelector(
    DOMComponents.WhatsApp.Chat.CHAT_CONTAINER
  );

  if (!chatContainer) return null;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (
          node.nodeType === 1 &&
          (node as Element).matches(
            DOMComponents.WhatsApp.Message.MESSAGE_WRAPPER
          )
        ) {
          const messageData = extractMessageData(node as HTMLElement);
          callback(messageData);
        }
      });
    });
  });

  observer.observe(chatContainer, {
    childList: true,
    subtree: true,
  });

  return observer;
}
```

### 3. Inject AI Button on Hover

```typescript
function setupMessageButtons() {
  const messages = document.querySelectorAll(
    DOMComponents.WhatsApp.Message.MESSAGE_WRAPPER
  );

  messages.forEach((messageElement) => {
    messageElement.addEventListener(
      "mouseenter",
      () => {
        injectAIButton(messageElement as HTMLElement);
      },
      { once: true }
    );
  });
}

function injectAIButton(messageElement: HTMLElement) {
  // Check if already injected
  if (messageElement.querySelector(".wa-ai-message-button")) return;

  const button = new MessageActionButton(messageElement, handleAIAction);
  messageElement.appendChild(button.render());
}
```

### 4. Handle AI Actions

```typescript
async function handleAIAction(action: string, messageData: MessageData) {
  const chatContext = getAllMessages(20); // Last 20 messages

  showLoadingIndicator(`Processing: ${action}...`);

  try {
    const response = await browser.runtime.sendMessage({
      type: `${action.toUpperCase()}_MESSAGE`,
      payload: {
        message: messageData,
        context: chatContext,
        chatId: getActiveChatId(),
        isGroup: isGroupChat(),
      },
    });

    hideLoadingIndicator();
    displayResult(response);
  } catch (error) {
    hideLoadingIndicator();
    showError(`Failed to ${action} message`);
    console.error(error);
  }
}
```

### 5. Shadow DOM for UI Isolation

```typescript
function createModalWithShadowDOM(theme: WhatsAppTheme) {
  const container = document.createElement("div");
  container.className = "wa-ai-modal-container";

  const shadowRoot = container.attachShadow({ mode: "open" });

  // Inject styles into shadow DOM
  injectShadowStyles(shadowRoot, theme);

  // Add modal content
  const modal = document.createElement("div");
  modal.className = "modal-content";
  modal.innerHTML = `
    <h2>AI Analysis</h2>
    <div class="content">
      <!-- Content here -->
    </div>
  `;

  shadowRoot.appendChild(modal);
  document.body.appendChild(container);

  return { container, shadowRoot };
}
```

---

## API Integration

### Background Worker Message Types

#### Request Format

```typescript
interface BackgroundRequest {
  type:
    | "ANALYZE_MESSAGE"
    | "GENERATE_REPLY"
    | "TRANSLATE_MESSAGE"
    | "UPDATE_STORY";
  payload: {
    message: MessageData;
    context: MessageData[];
    chatId: string;
    isGroup: boolean;
    options?: Record<string, any>;
  };
}
```

#### Response Format

```typescript
interface BackgroundResponse {
  success: boolean;
  result?: any;
  error?: string;
  timestamp: number;
}
```

### OpenAI API Patterns

#### Chat Completion

```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Analyze this message..." },
    ],
    temperature: 0.7,
    max_tokens: 500,
  }),
});
```

#### Vision API (Image Analysis)

```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
              detail: "high",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  }),
});
```

#### Whisper API (Audio Transcription)

```typescript
const formData = new FormData();
formData.append("file", audioBlob);
formData.append("model", "whisper-1");
formData.append("language", "en");

const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
  body: formData,
});
```

---

## Storage & Caching

### Chrome Storage API

```typescript
// Save settings
await browser.storage.local.set({ settings: userSettings });

// Get settings
const { settings } = await browser.storage.local.get("settings");

// Save chat context
await browser.storage.local.set({
  [`chat_${chatId}`]: {
    messages: messageData,
    stories: stories,
    cachedAt: Date.now(),
  },
});

// Clear cache
await browser.storage.local.remove([`chat_${chatId}`]);
```

### Cache Statistics

```typescript
interface CacheStats {
  totalSize: number; // Total cache size in bytes
  totalChats: number; // Number of cached chats
  totalStories: number; // Total number of stories
  totalMessages: number; // Total cached messages
  cacheHits: number; // Cache hits
  cacheMisses: number; // Cache misses
  hitRate: number; // Hit rate (0-1)
  oldestEntry: number; // Oldest cache timestamp
  newestEntry: number; // Newest cache timestamp
  lastCleanup: number; // Last cleanup timestamp
}

async function getCacheStats(): Promise<CacheStats> {
  const allData = await browser.storage.local.get(null);

  // Calculate statistics
  const chatKeys = Object.keys(allData).filter((k) => k.startsWith("chat_"));

  return {
    totalSize: JSON.stringify(allData).length,
    totalChats: chatKeys.length,
    // ... calculate other stats
  };
}
```

### Storage Key Patterns

```typescript
// Key patterns used in extension
const STORAGE_KEYS = {
  SETTINGS: "settings",
  API_KEY: "api_key",
  CACHE_STATS: "cache_stats",
  CHAT: (chatId: string) => `chat_${chatId}`,
  STORY: (chatId: string, storyId: string) => `story_${chatId}_${storyId}`,
};
```

---

## Testing & Debugging

### Console Test Commands

```javascript
// Test in browser console on web.whatsapp.com:

// 1. Count all messages
document.querySelectorAll("div._amjv[data-id]").length;

// 2. Get all message texts
Array.from(document.querySelectorAll(".selectable-text.copyable-text")).map(
  (el) => el.textContent
);

// 3. Check if group chat
!!document.querySelector("._amkz");

// 4. Get all timestamps
Array.from(document.querySelectorAll(".x3nfvp2 .x1c4vz4f")).map(
  (el) => el.textContent
);

// 5. Test message extraction
const firstMsg = document.querySelector("div._amjv[data-id]");
// Then use extractMessageData(firstMsg)
```

### Storage Debugging

```typescript
// Available in src/utils/storage-debug.ts

import { debugStorage, clearAllData, exportData } from "@/utils/storage-debug";

// View all storage data
await debugStorage();

// Clear all extension data
await clearAllData();

// Export data for backup
const data = await exportData();
console.log(JSON.stringify(data, null, 2));
```

---

## Best Practices

### 1. Respect User Privacy

- Only extract messages when user explicitly requests analysis
- Never auto-extract without user interaction
- Provide clear data handling information

### 2. Handle Dynamic Content

- WhatsApp uses virtualization - check `data-virtualized="false"`
- Use MutationObserver for new messages
- Handle scrolling and lazy-loading gracefully

### 3. Error Handling

- Implement retry logic for API failures (max 2 attempts)
- Provide clear error messages to users
- Log errors for debugging

### 4. Performance

- Cache API responses to minimize API calls
- Use debouncing for frequent operations
- Clean up observers and event listeners

### 5. Styling

- Use Shadow DOM to isolate extension styles
- Match WhatsApp's native theme (light/dark)
- Follow WhatsApp's UI patterns

---

## Version History

| Date         | Changes                                 |
| ------------ | --------------------------------------- |
| Dec 14, 2025 | Initial consolidated reference document |

---

_This document consolidates all technical references for the extension. Keep updated as features evolve._
