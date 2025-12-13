# WhatsApp AI Assistant - Copilot Instructions

## Project Overview

Chrome extension built with **WXT + TypeScript** that enhances WhatsApp Web with AI-powered features (message analysis, translation, reply generation) via OpenAI APIs. See [docs/srs.md](../docs/srs.md) for complete requirements.

## Architecture

```
entrypoints/
├── background.ts     # Service worker: OpenAI API calls, caching, message routing
└── content/          # DOM manipulation: inject UI components into WhatsApp Web
    ├── index.ts      # Main content script entry point
    └── ui/           # UI components (settings panel, action buttons, etc.)
```

**Data Flow:** User Interaction → Content Script → Background Worker → OpenAI API → Sidebar UI

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
- Example: `import logo from '@/assets/react.svg'`

## Key Implementation Patterns

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

### DOM Injection (Sidebar/Hover Button)

Content scripts should inject UI components using Shadow DOM to isolate styles from WhatsApp's CSS. Use vanilla TypeScript/JavaScript for DOM manipulation.

## Conventions

- **File naming:** `kebab-case` for files, `PascalCase` for classes/types
- **State management:** Use native browser storage APIs and vanilla JavaScript patterns
- **API keys:** Store in `browser.storage.local`, never commit to code
- **Error handling:** Retry failed API calls up to 2 times (NFR-08)

## Testing

Run `pnpm compile` before committing to catch TypeScript errors. No test framework configured yet.

## documentation

- Not create any docs or md files.
- a doc "docs/update.md" file that is used to maintain update history by AI
- if change any Requirements feature then update srs doc.

## Resources

- [WXT Documentation](https://wxt.dev)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/reference/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Model documentation](https://platform.openai.com/docs/models)
- [OpenAI Audio documentation](https://platform.openai.com/docs/guides/audio)
- [OpenAI text guides](https://platform.openai.com/docs/guides/text)
