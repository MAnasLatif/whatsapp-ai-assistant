# WhatsApp Web DOM Reference Guide

**Version:** December 2024  
**Purpose:** Reference for DOM structure extraction for AI Assistant extension

---

## Overview

This document provides comprehensive DOM patterns, selectors, and data extraction strategies for WhatsApp Web. Use this as a reference when implementing content scripts for message extraction, UI injection, and interaction.

---

## Table of Contents

1. [Key CSS Classes & Attributes](#key-css-classes--attributes)
2. [Message Structure](#message-structure)
3. [Chat Identification](#chat-identification)
4. [Sender Information](#sender-information)
5. [Message Content Extraction](#message-content-extraction)
6. [Timestamps](#timestamps)
7. [Media Messages](#media-messages)
8. [Group vs Personal Chat Differences](#group-vs-personal-chat-differences)
9. [Injection Points](#injection-points)
10. [Selectors Reference](#selectors-reference)

---

## Key CSS Classes & Attributes

### Message Container Classes

```
.message-in       # Incoming messages
.message-out      # Outgoing messages (user's messages)
._amjv            # Individual message wrapper
._amkz            # Group chat incoming message (with sender name)
.focusable-list-item  # Focusable message item
```

### Important Data Attributes

```
data-id="..."     # Unique message identifier format:
                  # Personal: "false_PHONENUMBER@c.us_MESSAGEID"
                  # Group: "false_GROUPID@c.us_MESSAGEID"
                  # Outgoing: "true_PHONENUMBER@c.us_MESSAGEID"

data-pre-plain-text="[TIME, DATE] SENDER_NAME: "  # Full message metadata
data-virtualized="false"  # Indicates message is rendered in DOM
```

---

## Message Structure

### Personal Chat - Incoming Message

```html
<div
  tabindex="-1"
  class="_amjv xscbp6u"
  data-id="false_923061400333@c.us_3A12F0908922EFDD735D"
>
  <div class="x78zum5 xdt5ytf" data-virtualized="false">
    <div class="">
      <div
        class="message-in focusable-list-item _amjy _amjz _amjw x1klvx2g xahtqtb"
      >
        <div class="_amk4 false _amkd false">
          <div class="_amk6 _amlo false false">
            <span aria-label="SENDER_NAME:"></span>
            <div>
              <div class="x9f619 x1hx0egp x1yrsyyn xizg8k xu9hqtb xwib8y2">
                <div
                  class="copyable-text"
                  data-pre-plain-text="[10:54 PM, 12/9/2025] SENDER_NAME: "
                >
                  <div class="_akbu x6ikm8r x10wlt62">
                    <span class="selectable-text copyable-text">
                      MESSAGE CONTENT HERE
                    </span>
                    <span class="x3nfvp2 xxymvpz xlshs6z xqtp20y">
                      <span class="x1c4vz4f x2lah0s">10:54 PM</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Personal Chat - Outgoing Message

```html
<div
  tabindex="-1"
  class="_amjv xscbp6u"
  data-id="true_923061400333@c.us_AC4140A2A99DD53053CE509326DB5878"
>
  <div class="x78zum5 xdt5ytf" data-virtualized="false">
    <div class="">
      <div
        class="message-out focusable-list-item _amjy _amjz _amjw x1klvx2g xahtqtb"
      >
        <div class="_amk4 false _amkq _amk5 false">
          <span aria-hidden="true" data-icon="tail-out" class="_amk7">
            <!-- SVG tail -->
          </span>
          <div class="_amk6 _amlo false false">
            <span aria-label="You:"></span>
            <div>
              <div
                class="copyable-text"
                data-pre-plain-text="[TIME, DATE] You: "
              >
                <span class="selectable-text copyable-text">
                  MESSAGE CONTENT HERE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Group Chat - Incoming Message (With Sender Name)

```html
<div
  tabindex="-1"
  class="_amjv xscbp6u"
  data-id="false_923014285888@c.us_3A5B8EA211B4D1B780CA"
>
  <div class="x78zum5 xdt5ytf" data-virtualized="false">
    <div class="">
      <div
        class="_amkz message-in focusable-list-item _amjy _amjz _amjw x1klvx2g xahtqtb"
      >
        <div class="_amk4 false _amkt _amk5 false">
          <div class="_amk6 _amlo false false">
            <span aria-label="Esha Tanveer - Upvave - QA:"></span>
            <div>
              <div class="x9f619 x1hx0egp x1yrsyyn xizg8k xu9hqtb xwib8y2">
                <div
                  class="copyable-text"
                  data-pre-plain-text="[1:02 AM, 12/10/2025] Esha Tanveer - Upvave - QA: "
                >
                  <div class="_akbu x6ikm8r x10wlt62">
                    <span class="selectable-text copyable-text"> Yes Sir </span>
                    <span class="x3nfvp2 xxymvpz xlshs6z xqtp20y">
                      <span class="x1c4vz4f x2lah0s">1:02 AM</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Chat Identification

### Extracting Chat ID from Message

The `data-id` attribute contains the chat identifier:

```javascript
// Example data-id patterns:
// Personal chat (incoming): "false_923061400333@c.us_3A12F0908922EFDD735D"
// Personal chat (outgoing): "true_923061400333@c.us_AC4140A2A99DD53053CE509326DB5878"
// Group chat: "false_923014285888@c.us_3A5B8EA211B4D1B780CA"

function extractChatId(dataId) {
  // Format: [true/false]_[CHAT_ID]@c.us_[MESSAGE_ID]
  const parts = dataId.split("_");
  if (parts.length >= 2) {
    return parts[1]; // Returns "923061400333@c.us"
  }
  return null;
}
```

### Chat Type Detection

```javascript
function getChatType() {
  // Check for group indicator in URL or DOM
  const chatHeader = document.querySelector(
    '[data-testid="conversation-header"]'
  );
  const isGroup = !!document.querySelector("._amkz"); // Group-specific class

  return isGroup ? "group" : "personal";
}
```

---

## Sender Information

### Personal Chat

- Incoming messages: Extract from `aria-label` attribute or `data-pre-plain-text`
- Outgoing messages: Always "You"

### Group Chat

Extract sender name from `data-pre-plain-text`:

```javascript
function extractSenderName(prePlainText) {
  // Format: "[TIME, DATE] SENDER_NAME: "
  // Example: "[1:02 AM, 12/10/2025] Esha Tanveer - Upvave - QA: "

  const match = prePlainText.match(/\] (.+?): $/);
  return match ? match[1] : "Unknown";
}
```

**Example Selectors:**

```javascript
// From aria-label
const senderLabel = messageElement.querySelector('[aria-label$=":"]');
const sender = senderLabel?.getAttribute("aria-label")?.replace(":", "");

// From data-pre-plain-text
const copyableText = messageElement.querySelector(".copyable-text");
const prePlainText = copyableText?.getAttribute("data-pre-plain-text");
```

---

## Message Content Extraction

### Text Messages

**Primary Selector:**

```javascript
const contentSpan = messageElement.querySelector(
  "span.selectable-text.copyable-text"
);
const messageText = contentSpan?.textContent || "";
```

**Alternative (for emoji-only or special messages):**

```javascript
// Emoji messages may use different classes
const emojiContent = messageElement.querySelector(".emoji.copyable-text");
```

### Complete Message Data Structure

```javascript
function extractMessageData(messageElement) {
  const dataId = messageElement.getAttribute("data-id");
  const isOutgoing = dataId?.startsWith("true_");

  const copyableText = messageElement.querySelector(".copyable-text");
  const prePlainText = copyableText?.getAttribute("data-pre-plain-text") || "";

  const contentSpan = messageElement.querySelector(
    "span.selectable-text.copyable-text, .emoji.copyable-text"
  );
  const messageText = contentSpan?.textContent?.trim() || "";

  const timestampSpan = messageElement.querySelector(".x3nfvp2 .x1c4vz4f");
  const timestamp = timestampSpan?.textContent || "";

  return {
    id: dataId,
    isOutgoing,
    sender: extractSenderName(prePlainText),
    content: messageText,
    timestamp,
    prePlainText,
    isGroup: messageElement.classList.contains("_amkz"),
  };
}
```

---

## Timestamps

### Inline Timestamp (within message)

```html
<span
  class="x3nfvp2 xxymvpz xlshs6z xqtp20y xexx8yu x1uc92m x18d9i69 x181vq82 x12lo8hy x152skdk"
  aria-hidden="true"
>
  <span class="x1c4vz4f x2lah0s">10:54 PM</span>
</span>
```

**Selector:**

```javascript
const timestamp = messageElement.querySelector(
  ".x3nfvp2 .x1c4vz4f, .x3nfvp2 .x2lah0s"
)?.textContent;
```

### Full Date/Time from data-pre-plain-text

```javascript
function extractFullTimestamp(prePlainText) {
  // Format: "[10:54 PM, 12/9/2025] ..."
  const match = prePlainText.match(/\[(.+?)\]/);
  return match ? match[1] : null;
}
```

---

## Media Messages

### Voice Messages

**Structure:**

```html
<div class="_ak4a x121pien x9f619 x193iq5w x1yrsyyn x1icxu4v x10b6aqq x25sj25">
  <div class="_ak4o">
    <div class="_ak4q">
      <button aria-label="Play voice message">
        <span aria-hidden="true" data-icon="audio-play">
          <!-- SVG icon -->
        </span>
      </button>
      <span aria-label="Voice message"></span>
      <div
        class="x10l6tqk x1fesggd xu96u03 x1ncwhqj x152skdk xljy9j3"
        aria-hidden="true"
      >
        0:24
      </div>
      <!-- Waveform canvas -->
      <canvas
        width="400"
        height="48"
        style="width: 200px; height: 24px;"
      ></canvas>
    </div>
  </div>
</div>
```

**Detection:**

```javascript
function isVoiceMessage(messageElement) {
  return !!messageElement.querySelector('[aria-label="Play voice message"]');
}

function getVoiceDuration(messageElement) {
  return messageElement.querySelector(".x10l6tqk.x1fesggd")?.textContent;
}
```

### Image Messages

**Structure:**

```html
<div
  class="x6s0dn4 xaejkm2 x1uuy6ko x1gfim23 xqfj769 x78zum5 xl56j7k x193iq5w x6ikm8r x10wlt62 x1n2onr6"
  style="width: 240px; height: 338.028px;"
  role="button"
  tabindex="0"
  aria-label="Open picture"
>
  <img
    class="x15kfjtz x1c4vz4f x2lah0s xdl72j9 x14tgpju"
    draggable="true"
    src="blob:https://web.whatsapp.com/BLOB_ID"
    style="width: 240px; height: 338px;"
  />
</div>
```

**Detection & Extraction:**

```javascript
function getImageData(messageElement) {
  const imgElement = messageElement.querySelector('img[src^="blob:"]');

  if (!imgElement) return null;

  return {
    type: "image",
    src: imgElement.src,
    width: imgElement.style.width,
    height: imgElement.style.height,
    alt: imgElement.alt || "",
  };
}
```

### Quoted/Replied Messages

**Indicator:**

```html
<div aria-label="Quoted message">
  <!-- Original message content -->
</div>
```

**Detection:**

```javascript
function isReply(messageElement) {
  return !!messageElement.querySelector('[aria-label="Quoted message"]');
}
```

### Forwarded Messages

**Indicator:**

```html
<div class="xe9ewy2 xyqdw3p xyri2b xg8j3zb x25sj25">
  <span aria-hidden="true" data-icon="forward-refreshed">
    <!-- SVG icon -->
  </span>
  <span
    class="x1n2onr6 x1qiirwl xdj266r x1p8j9ns xat24cr x7phf20 x13a8xbf x1k4tb9n xhslqc4"
  >
    Forwarded
  </span>
</div>
```

---

## Group vs Personal Chat Differences

| Feature                | Personal Chat                  | Group Chat                                      |
| ---------------------- | ------------------------------ | ----------------------------------------------- |
| Incoming message class | `.message-in`                  | `._amkz.message-in`                             |
| Sender display         | Not shown (inferred from chat) | Shown in `aria-label` and `data-pre-plain-text` |
| data-id format         | `false_PHONE@c.us_MSGID`       | `false_GROUPID@c.us_MSGID`                      |
| Sender extraction      | From chat header               | From each message                               |

---

## Injection Points

### Message Hover Actions

Inject AI button adjacent to existing message actions:

**Target Container:**

```javascript
// Message action buttons appear on hover
const actionsContainer = messageElement.querySelector(
  ".x78zum5.xbfrwjf.x8k05lb.xeq5yr9.x1n2onr6.xrr41r3.xqcrz7y"
);
```

**Example Injection:**

```javascript
function injectAIButton(messageElement) {
  const actionsContainer = messageElement.querySelector(
    ".x78zum5.xbfrwjf.x8k05lb"
  );

  if (!actionsContainer || actionsContainer.querySelector(".ai-action-btn")) {
    return; // Already injected or no container
  }

  const aiButton = document.createElement("button");
  aiButton.className = "ai-action-btn"; // Add WhatsApp-like styling
  aiButton.innerHTML = `<span data-icon="ai-assistant">AI</span>`;
  aiButton.addEventListener("click", handleAIAction);

  actionsContainer.prepend(aiButton);
}
```

### Settings Button Location

Target area above WhatsApp's native settings button:

```javascript
// WhatsApp settings menu (left sidebar)
const settingsPanel = document.querySelector(
  '[data-testid="default-user"]'
)?.parentElement;

// Inject above or within settings area
function injectAISettings() {
  const settingsButton = document.createElement("button");
  settingsButton.innerHTML = "AI Settings";
  settingsButton.className = "ai-settings-btn";

  settingsPanel?.insertBefore(settingsButton, settingsPanel.firstChild);
}
```

---

## Selectors Reference

### Quick Reference Table

| Element                  | Selector                            |
| ------------------------ | ----------------------------------- |
| **All visible messages** | `div[data-id][class*="message-"]`   |
| **Incoming messages**    | `.message-in`                       |
| **Outgoing messages**    | `.message-out`                      |
| **Message text content** | `.selectable-text.copyable-text`    |
| **Message timestamp**    | `.x3nfvp2 .x1c4vz4f`                |
| **Message ID**           | `[data-id]`                         |
| **Sender label**         | `[aria-label$=":"]`                 |
| **Voice message**        | `[aria-label="Play voice message"]` |
| **Image**                | `img[src^="blob:"]`                 |
| **Quoted message**       | `[aria-label="Quoted message"]`     |
| **Forwarded message**    | `[data-icon="forward-refreshed"]`   |

### Comprehensive Message Query

```javascript
function getAllMessages() {
  // Select all message containers
  const messageElements = document.querySelectorAll("div._amjv[data-id]");

  return Array.from(messageElements)
    .filter((el) => el.getAttribute("data-virtualized") === "false")
    .map((el) => extractMessageData(el));
}
```

---

## Message Extraction Best Practices

### 1. Use MutationObserver for New Messages

```javascript
const chatContainer = document.querySelector(
  '[data-scrolltracepolicy="wa.web.conversation.messages"]'
);

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches("div._amjv[data-id]")) {
        const messageData = extractMessageData(node);
        handleNewMessage(messageData);
      }
    });
  });
});

observer.observe(chatContainer, { childList: true, subtree: true });
```

### 2. Handle Dynamic Content Loading

WhatsApp uses virtualization - messages are loaded/unloaded as user scrolls:

```javascript
// Always check data-virtualized attribute
const isRendered = messageElement.getAttribute("data-virtualized") === "false";
```

### 3. Respect User Privacy

```javascript
// Only extract messages when user explicitly requests AI analysis
// Never auto-extract without user interaction
function extractOnDemand(userTriggered) {
  if (!userTriggered) {
    console.warn("Extraction requires user consent");
    return [];
  }

  return getAllMessages();
}
```

### 4. Cache Management

```javascript
// Store processed messages by chat ID
const messageCache = new Map();

function cacheMessage(chatId, messageData) {
  if (!messageCache.has(chatId)) {
    messageCache.set(chatId, []);
  }

  messageCache.get(chatId).push(messageData);
}
```

---

## Testing Selectors

### Console Test Commands

```javascript
// Test in browser console:

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

// 5. Extract first message data
const firstMsg = document.querySelector("div._amjv[data-id]");
extractMessageData(firstMsg); // Use function from above
```

---

## Known Edge Cases

### 1. Deleted Messages

```html
<span title="This message was deleted">This message was deleted</span>
```

**Detection:**

```javascript
const isDeleted = messageElement.querySelector('[title*="deleted"]');
```

### 2. System Messages (Day separators, encryption notices)

```html
<div class="x1n2onr6 x1vjfegm">
  <div class="_ak8k">
    <span class="x1iyjqo2 x6ikm8r x10wlt62">
      <span class="x1rg5ohu x16dsc37">
        Messages and calls are end-to-end encrypted...
      </span>
    </span>
  </div>
</div>
```

### 3. Unread Message Indicator

```html
<div aria-label="6 unread messages">
  <span>6 UNREAD MESSAGES</span>
</div>
```

### 4. Emoji-Only Messages

Use broader selector:

```javascript
const content = messageElement.querySelector(
  ".selectable-text.copyable-text, .emoji.copyable-text"
);
```

---

## Version History

| Date     | Changes                                               |
| -------- | ----------------------------------------------------- |
| Dec 2024 | Initial documentation based on WhatsApp Web structure |

---

## Additional Resources

- **WXT Framework:** https://wxt.dev/
- **Chrome Extension APIs:** https://developer.chrome.com/docs/extensions/
- **MutationObserver:** https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

---

_This document is a living reference and should be updated as WhatsApp Web's DOM structure evolves._
