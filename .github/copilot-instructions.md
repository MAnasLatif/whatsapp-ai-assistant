# WhatsApp AI Assistant - AI Agent Instructions

## Project Overview

A Chrome extension built with **WXT framework** that injects AI-powered features into WhatsApp Web. The extension uses vanilla TypeScript (no React/Vue) with class-based UI components that render into Shadow DOM for style isolation.

**Core Architecture**: Content script injects UI → Background worker handles OpenAI API → Chrome local storage for caching

## Critical WXT Framework Patterns

### Entry Points Structure

- `src/entrypoints/background.ts` - Service worker (API calls, message handling)
- `src/entrypoints/content/index.ts` - Content script (DOM injection, UI orchestration)
- `src/entrypoints/popup/` - Browser action popup

### WXT APIs Used

```typescript
export default defineBackground(() => {
  /* service worker logic */
});
export default defineContentScript({
  matches: ["*://web.whatsapp.com/*"],
  runAt: "document_idle",
});
```

### Path Aliases (via tsconfig.json)

Always use these aliases:

- `@/types` → `src/types/`
- `@/utils` → `src/utils/`
- `@/ui` → `src/ui/`
- `@/styles` → `src/styles/`

## Component Architecture Pattern

### Class-Based UI Components (Not React)

All UI components are vanilla TypeScript classes that create native DOM elements. Example pattern from `src/ui/components/chat-button.ts`:

```typescript
export class ChatButton {
  public element: HTMLButtonElement;
  private theme: WhatsAppTheme;

  constructor(theme: WhatsAppTheme, onClick: () => void) {
    this.element = this.createElement();
  }

  private createElement(): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = DOMComponents.aiChatButton; // Use centralized selectors
    button.innerHTML = `...`; // Native HTML structure
    return button;
  }

  updateTheme(theme: WhatsAppTheme): void {
    /* ... */
  }
  destroy(): void {
    this.element.remove();
  }
}
```

### Shadow DOM Isolation Strategy

Main app (`src/ui/app.ts`) creates a shadow root to prevent style conflicts with WhatsApp:

```typescript
const shadowHost = document.createElement("div");
const shadowRoot = shadowHost.attachShadow({ mode: "open" });
injectShadowStyles(shadowRoot, currentTheme); // Inject isolated CSS
```

**Important**: Buttons that mimic native WhatsApp UI (settings button, message actions) inject directly into WhatsApp's DOM, not shadow DOM.

## WhatsApp Web Integration

### DOM Selector Management

**All WhatsApp selectors centralized in `src/utils/dom-components.ts` (110+ selectors)**. Never hardcode selectors elsewhere.

```typescript
import { DOMComponents } from "@/utils/dom-components";

// WhatsApp core containers
DOMComponents.app; // "#app"
DOMComponents.conversationPanel; // '[data-testid="conversation-panel-messages"]'
DOMComponents.messageContainer; // "div._amjv[data-id]"
```

### Injection Points

1. **Global Settings Button** - Injected above WhatsApp's native settings button in sidebar header
2. **Message Action Buttons** - Hover overlay on individual messages, positioned with WhatsApp's action container
3. **Chat Panel** - Modal overlay rendered in shadow DOM

### Theme Detection & Sync

WhatsApp supports light/dark themes. Always use `detectTheme()` from `src/utils/whatsapp-dom.ts`:

```typescript
export function detectTheme(): WhatsAppTheme {
  // Checks body classes, data-theme attribute, prefers-color-scheme
  return isDark ? "dark" : "light";
}
```

Listen for theme changes via `observeThemeChanges()` - critical for maintaining visual consistency.

## Icon System

**All SVG icons MUST come from https://svgrepo.com** and be centralized in `src/utils/icons.ts` (25+ icons). Never inline SVG icons in components.

```typescript
import { Icons } from "@/utils/icons";
button.innerHTML = Icons.aiSparkle; // Pre-defined AI assistant icon
```

Available icon categories: AI actions (analyze, translate, explain, tone, reply), UI controls (close, settings, refresh), status indicators (success, error, loading).

## Storage & Caching Architecture

### Chrome Storage Wrapper Pattern

`src/utils/storage.ts` provides typed storage functions. Never use `browser.storage.local` directly:

```typescript
import {
  getSettings,
  saveSettings,
  getChatCache,
  saveChatCache,
} from "@/utils/storage";

const settings = await getSettings(); // Returns UserSettings with defaults merged
await saveSettings(updatedSettings);
```

### Cache Key Structure

```typescript
const STORAGE_KEYS = {
  SETTINGS: "wa_ai_settings",
  CACHE_STATS: "wa_ai_cache_stats",
  CHAT_CACHE_PREFIX: "wa_ai_chat_", // + chatId
  CHAT_CONTEXT_PREFIX: "wa_ai_context_", // + chatId
};
```

### Story Thread System

Chat "stories" are AI-generated contextual narratives cached per chat. Each chat can have multiple story threads (`StoryThread[]`). See `src/types/index.ts` for `StoryThread` interface.

## Type System

### Core Types Location

All TypeScript interfaces in `src/types/index.ts` (348 lines). Key types:

- `UserSettings` - Nested structure: `ai`, `general`, `cache`, `privacy`
- `MessageData` - Extracted WhatsApp message with metadata
- `StoryThread` - AI-generated conversation context
- `ExtensionMessage` / `ExtensionResponse` - Background ↔ content script communication

### Default Values Pattern

Always import and spread defaults:

```typescript
import { DEFAULT_SETTINGS } from "@/types";
const settings = { ...DEFAULT_SETTINGS, ...userOverrides };
```

## Message Passing Protocol

### Content ↔ Background Communication

Use typed message structure from `src/types/index.ts`:

```typescript
const message: ExtensionMessage = {
  type: "ANALYZE_MESSAGE",
  payload: { messageData, chatId },
};

const response = (await browser.runtime.sendMessage(
  message
)) as ExtensionResponse;
if (response.success) {
  /* handle response.data */
}
```

Available message types: `GET_SETTINGS`, `SAVE_SETTINGS`, `ANALYZE_MESSAGE`, `GENERATE_REPLY`, `TRANSLATE_TEXT`, `GET_CACHE_STATS`, `CLEAR_CACHE`, etc.

## OpenAI Integration

### Supported Models (GPT-5 Family Only)

The extension exclusively uses GPT-5 models:

- `gpt-5.2` - Latest flagship model with enhanced reasoning
- `gpt-5` - Standard GPT-5 model
- `gpt-5-mini` - Faster, cost-effective model
- `gpt-5-nano` - Lightweight model for quick responses

**Note**: Update `AIModel` type in `src/types/index.ts` to reflect only GPT-5 family models.

### API Call Pattern (Background Worker Only)

All OpenAI API calls happen in `src/entrypoints/background.ts`. Content scripts never call OpenAI directly.

```typescript
// Background worker handles retries, rate limiting, caching
async function callOpenAI(
  request: OpenAICompletionRequest
): Promise<OpenAICompletionResponse> {
  // Max 2 retries, exponential backoff
  // Uses settings.ai.model (GPT-5 family) and settings.ai.apiKey
  // Follows Chat Completions API: https://platform.openai.com/docs/guides/text
}
```

### Chat Completions API Structure

Follow the standard Chat Completions format (https://platform.openai.com/docs/guides/text):

```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-5-mini", // or gpt-5, gpt-5.2, gpt-5-nano
    messages: [
      { role: "system", content: "System prompt..." },
      { role: "user", content: "User message..." },
    ],
  }),
});
```

### Response Migration

Follow OpenAI's response format (https://platform.openai.com/docs/guides/migrate-to-responses):

- Use `response.choices[0].message.content` for text responses
- Handle `finish_reason` appropriately (`stop`, `length`, `content_filter`)
- Implement proper error handling for rate limits and API errors

### Vision & Whisper API Usage

- **Images**: Extract blob via `extractImageBlob()` → convert to base64 → send to Vision API with GPT-5 model
- **Voice**: Extract audio blob → convert to base64 → send to Whisper API

Media processing results integrate into story threads.

## Development Workflow

### Build & Run Commands

```bash
npm run dev              # Chrome dev mode with hot reload
npm run dev:firefox      # Firefox dev mode
npm run build            # Production build
npm run compile          # TypeScript type checking (no emit)
```

### Dev Mode Features

- Hot reload via WXT
- Storage debug tools auto-imported in background.ts: `import("@/utils/storage-debug")`
- Persistent browser profiles: `.wxt/chrome-data`, `.wxt/firefox-data`

### Testing on WhatsApp Web

1. Run `npm run dev`
2. Load extension from `.output/chrome-mv3`
3. Navigate to https://web.whatsapp.com
4. Verify AI settings button appears above WhatsApp settings
5. Hover over messages to see AI action button

## Common Pitfalls

1. **Don't use React/Vue patterns** - This is vanilla TypeScript with class-based components
2. **Never hardcode WhatsApp selectors** - Always use `DOMComponents` from `src/utils/dom-components.ts`
3. **Respect Shadow DOM boundaries** - Modal components in shadow root, native integrations in main DOM
4. **Don't bypass storage wrapper** - Use `src/utils/storage.ts` functions, not raw `browser.storage`
5. **Icons must be from svgrepo.com** - Centralize in `src/utils/icons.ts`
6. **Theme awareness required** - All injected UI must support light/dark themes dynamically
7. **After Complete code review, run `npm run compile` to check for TypeScript errors**
8. **After Testing Create build** - Run `npm run build` to generate production-ready files
9. **Always test UI changes in both light and dark modes to ensure proper theming**

## Extension Manifest Configuration

Defined in `wxt.config.ts`:

- **Permissions**: `storage`, `activeTab`
- **Host permissions**: `*://web.whatsapp.com/*`, `https://api.openai.com/*`
- **Manifest V3** required

## References

- SRS: `/docs/srs.md` - Complete functional requirements
- Technical Reference: `/docs/technical-reference.md` - Detailed DOM patterns, 980 lines
- WXT Docs: https://wxt.dev/api/config.html
