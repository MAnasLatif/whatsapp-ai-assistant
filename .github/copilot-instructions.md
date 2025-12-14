# WhatsApp AI Assistant - Copilot Instructions

## Project Overview

Chrome extension built with **WXT + TypeScript** that enhances WhatsApp Web with AI-powered features (message analysis, translation, reply generation) via OpenAI APIs. See [docs/srs.md](../docs/srs.md) for complete requirements.

## Architecture

```
src/
├── entrypoints/          # Extension entry points
│   ├── background.ts     # Service worker: OpenAI API calls, caching, message routing
│   ├── content/          # Content scripts for DOM manipulation
│   │   └── index.ts      # Main content script entry point
│   └── popup/            # Extension popup
│       └── main.ts       # Popup UI logic
├── types/                # TypeScript type definitions (centralized)
│   └── index.ts          # All interfaces, types, constants (345 lines)
├── utils/                # Utility functions
│   ├── dom-components.ts # Global DOM selectors (110+ selectors)
│   ├── whatsapp-dom.ts   # WhatsApp DOM manipulation utilities
│   ├── storage.ts        # Chrome storage wrapper
│   ├── storage-debug.ts  # Storage debugging tools
│   └── icons.ts          # Centralized SVG icons from svgrepo.com (25+ icons)
├── ui/                   # UI components (global, reusable)
│   ├── app.ts            # Main UI orchestrator
│   └── components/       # Individual UI components (7 files)
│       ├── chat-button.ts
│       ├── chat-panel.ts
│       ├── global-settings-button.ts
│       ├── global-settings-panel.ts
│       ├── action-menu.ts
│       ├── message-action-button.ts
│       └── results-display.ts
└── styles/               # Style files
    ├── ui-styles.ts      # Injected UI styles with theme support (876 lines)
    └── popup-styles.ts   # Popup window styles (295 lines)
```

**Data Flow:** User Interaction → Content Script → Background Worker → OpenAI API → UI Components → Shadow DOM

## Development Commands

```bash
npm dev              # Start dev server with HMR (Chrome)
npm dev:firefox      # Start dev server (Firefox)
npm build            # Production build
npm compile          # TypeScript check (no emit)
```

## WXT-Specific Patterns

### Entrypoint Definitions

- Use `defineBackground()` for service workers - auto-imports from WXT
- Use `defineContentScript({ matches, main })` for content scripts

### Content Script Targeting

```typescript
// Current: targets Google (placeholder)
export default defineContentScript({
  matches: ['*://*.google.com/*'],
  // Change to WhatsApp Web:
  // matches: ['*://web.whatsapp.com/*'],
```

### Path Aliases

- `@/` resolves to project root (configured in `.wxt/tsconfig.json`)
- `@/types` → `src/types/` - All TypeScript type definitions
- `@/utils` → `src/utils/` - Utility functions, DOM helpers, and centralized icons
- `@/ui` → `src/ui/` - Global UI components
- `@/styles` → `src/styles/` - Style files
- `@/entrypoints` → `src/entrypoints/` - Extension entry points

**Example:**

```typescript
import type { UserSettings, MessageData } from "@/types";
import { DOMComponents } from "@/utils/dom-components";
import { Icons } from "@/utils/icons";
import { ChatPanel } from "@/ui/components/chat-panel";
import { injectStyles } from "@/styles/ui-styles";
```

## Key Implementation Patterns

### Centralized Icons

All SVG icons are centralized in `src/utils/icons.ts`. **Always use icons from svgrepo.com**:

```typescript
import { Icons } from "@/utils/icons";

// Use icons directly
const html = `<button>${Icons.close}</button>`;
const icon = Icons.aiSparkle;

// Available icons:
// - AI: aiSparkle
// - Actions: analyze, translate, explain, tone, reply
// - UI Controls: close, info, empty, calendar, delete, story, refresh, loading, copy, check, error
// - User: settings, user, group
```

**Benefits:**

- Single source of truth for all icons (25+ icons)
- All icons sourced from https://www.svgrepo.com
- Consistent styling across the extension
- Easy to update or add new icons
- Reduces code duplication and bundle size

### Centralized DOM Selectors

All DOM selectors are defined in `src/utils/dom-components.ts`:

```typescript
import { DOMComponents } from "@/utils/dom-components";

// Use centralized selectors
const chatContainer = document.querySelector(
  DOMComponents.WhatsApp.Chat.CHAT_CONTAINER
);
const messages = document.querySelectorAll(
  DOMComponents.WhatsApp.Message.MESSAGE_WRAPPER
);
```

**Benefits:**

- Single source of truth for all selectors (110+ selectors)
- Easy to update when WhatsApp changes DOM structure
- Organized into categories (WhatsApp native vs Extension components)

### Type System

All type definitions are centralized in `src/types/index.ts`:

```typescript
// Import types from centralized location
import type {
  MessageData,
  ChatContext,
  UserSettings,
  AIModel,
  WhatsAppTheme,
} from "@/types";

// Access constants
import { DEFAULT_SETTINGS, THEME_COLORS } from "@/types";
```

## Core Implementation Patterns

### Message Passing (Background ↔ Content Script)

```typescript
// Content script: send message
browser.runtime.sendMessage({ type: "ANALYZE", payload: messageData });

// Background: listen
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ANALYZE") {
    /* handle */
  }
});
```

### Chrome Storage for Caching

```typescript
// Store per-chat summaries with chat ID as key
await browser.storage.local.set({ [`chat_${chatId}`]: summaryData });
```

### DOM Injection & UI Components

Content scripts inject UI components using Shadow DOM to isolate styles from WhatsApp's CSS:

```typescript
import { injectShadowStyles } from "@/styles/ui-styles";
import { ChatPanel } from "@/ui/components/chat-panel";

// Create component with Shadow DOM
const container = document.createElement("div");
const shadowRoot = container.attachShadow({ mode: "open" });

// Inject styles into shadow root
injectShadowStyles(shadowRoot, theme);

// Add component content
const panel = new ChatPanel(
  container,
  theme,
  chatId,
  chatName,
  isGroup,
  onClose
);
```

**UI Component Pattern:**

- All UI components are in `src/ui/components/`
- Use Shadow DOM for style isolation (for components in shadow root)
- Match WhatsApp's native theme (light/dark)
- Import styles from `@/styles/ui-styles`
- Global settings components inject directly into document body (not shadow DOM) for full-screen panels
- Chat-specific components use shadow DOM for better isolation

### Global Settings System

The extension uses a two-tier settings approach:

**Global Settings (via GlobalSettingsButton/Panel):**

- Injected directly into WhatsApp sidebar (outside shadow DOM)
- Full-screen slide-in panel from right
- Handles: OpenAI config, default preferences, enabled features, cache, privacy
- On save: reloads browser tab to apply changes
- Stored in `browser.storage.local` as `userSettings`

**Chat-Specific Settings (via ChatButton/Panel):**

- Injected in shadow DOM for isolation
- Per-chat configuration: summaries, stories, cache management
- Accessed from chat view only
- No page reload required

```typescript
// Global settings usage
import { GlobalSettingsButton } from "@/ui/components/global-settings-button";
import { GlobalSettingsPanel } from "@/ui/components/global-settings-panel";

const globalBtn = new GlobalSettingsButton(() => {
  const panel = new GlobalSettingsPanel(userSettings, onClose);
  panel.show();
});
```

## Conventions

- **File naming:** `kebab-case` for files, `PascalCase` for classes/types
- **State management:** Use native browser storage APIs and vanilla JavaScript patterns
- **API keys:** Store in `browser.storage.local`, never commit to code
- **Error handling:** Retry failed API calls up to 2 times (NFR-08)

## Testing

Run `pnpm compile` before committing to catch TypeScript errors. No test framework configured yet.

## Documentation

- **Do not create new docs or md files** unless explicitly requested
- Update `docs/update.md` to maintain update history
- If requirements change, update `docs/srs.md`
- Technical reference consolidated in `docs/technical-reference.md`

## Resources

- [Technical Reference Guide](../docs/technical-reference.md) - Complete DOM, data models, and implementation patterns
- [SRS Document](../docs/srs.md) - Software Requirements Specification

- [WXT Documentation](https://wxt.dev)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Model documentation](https://platform.openai.com/docs/models)
- [OpenAI Audio documentation](https://platform.openai.com/docs/guides/audio)
- [OpenAI text guides](https://platform.openai.com/docs/guides/text)
