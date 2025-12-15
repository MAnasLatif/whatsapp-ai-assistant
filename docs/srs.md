# **Software Requirements Specification (SRS)**

## **WhatsApp AI Assistant – Chrome Extension**

**Version:** 1.0  
**Date:** December 2024

---

# **1. Introduction**

### **1.1 Purpose**

This document defines the functional and non-functional requirements for a Chrome extension built with **WXT** and **vanilla TypeScript**. The extension enhances WhatsApp Web with AI-powered tools for message analysis, translation, context explanation, and reply generation using **OpenAI API** integration. The UI is built using class-based components that render into Shadow DOM for style isolation.

### **1.2 Scope**

The extension provides:

- **Native WhatsApp-integrated UI** that blends seamlessly with the existing interface.
- An **AI settings button** positioned above the native WhatsApp settings button.
- A **message-hover AI button** injected into the WhatsApp interface.
- Real-time AI analysis of WhatsApp conversations.
- Media processing (image/voice) via OpenAI Vision and Whisper APIs.
- Advanced cache management and control.
- Multi-language support for analysis and translation.
- Comprehensive AI configuration options.

### **1.3 Technology Stack**

| Category    | Technology                                              |
| ----------- | ------------------------------------------------------- |
| Framework   | WXT (Web Extension Tools)                               |
| Frontend    | Vanilla TypeScript (Class-based Components, Shadow DOM) |
| AI Services | OpenAI API (GPT-5 Family, Vision, Whisper)              |
| Storage     | Chrome Extension Local Storage                          |

---

# **2. System Architecture**

### **2.1 Core Components**

| Component                  | Description                                                                                                       |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **AI Settings Panel**      | Class-based modal UI rendered in Shadow DOM for AI configuration, cache management, and preferences               |
| **Native UI Integrations** | AI settings button and message action buttons seamlessly integrated into WhatsApp UI using class-based components |
| **Content Script**         | Handles DOM manipulation, message extraction, and UI injection using vanilla TypeScript                           |
| **Background Worker**      | Service worker managing OpenAI API calls, caching, and cross-component communication                              |
| **Storage Layer**          | Chrome extension local storage with typed wrapper functions for caching and user preferences                      |

### **2.2 Data Flow**

```
User Interaction → Content Script → Background Worker → OpenAI API
                         ↓                    ↓
              Class Components ← Background Worker ← API Response
                     ↓                        ↓
         Shadow DOM (Modals)            Local Cache
                     ↓
         WhatsApp DOM (Native Buttons)
```

---

# **3. Functional Requirements**

## **3.1 AI Settings Button & Panel**

| ID    | Requirement                                                                  |
| ----- | ---------------------------------------------------------------------------- |
| FR-01 | AI settings button shall be injected above WhatsApp's native settings button |
| FR-02 | AI settings button shall use native WhatsApp styling and icons               |
| FR-03 | Clicking AI settings button shall open a modal settings panel                |
| FR-04 | Settings panel shall support dark and light theme matching WhatsApp          |
| FR-05 | Settings panel shall include sections: General, AI Config, Cache, Privacy    |
| FR-06 | Settings panel shall be dismissible via close button or outside click        |
| FR-07 | Settings panel shall persist user preferences across sessions                |

---

## **3.2 AI Configuration Settings**

| ID    | Requirement                                                                    |
| ----- | ------------------------------------------------------------------------------ |
| FR-08 | User shall be able to configure OpenAI API key                                 |
| FR-09 | User shall be able to select AI model (gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano) |
| FR-10 | User shall be able to configure default response tone preference               |
| FR-11 | User shall be able to enable/disable specific AI features                      |
| FR-12 | System shall validate API key on save                                          |

---

## **3.3 Cache & Story Management Settings**

| ID    | Requirement                                                            |
| ----- | ---------------------------------------------------------------------- |
| FR-15 | User shall be able to view total cache size and number of cached chats |
| FR-16 | User shall be able to view number of story threads per chat            |
| FR-17 | User shall be able to clear all cache with confirmation dialog         |
| FR-18 | User shall be able to clear cache for specific chats                   |
| FR-19 | User shall be able to view and manage individual story threads         |
| FR-20 | User shall be able to set cache retention period (days)                |
| FR-21 | User shall be able to set maximum cache size limit                     |
| FR-22 | User shall be able to set maximum number of stories per chat           |
| FR-23 | User shall be able to enable/disable auto-cache cleanup                |
| FR-24 | System shall display cache statistics (hits, misses, storage used)     |
| FR-25 | System shall display story statistics (active threads, total messages) |

---

## **3.4 General Settings**

| ID    | Requirement                                                          |
| ----- | -------------------------------------------------------------------- |
| FR-26 | User shall be able to select preferred reply language                |
| FR-27 | User shall be able to select preferred analysis/story language       |
| FR-28 | User shall be able to select preferred translation language          |
| FR-29 | User shall be able to configure number of messages to analyze (5-50) |
| FR-30 | User shall be able to enable/disable message hover AI button         |
| FR-31 | User shall be able to set keyboard shortcuts for AI actions          |

---

## **3.5 Privacy & Data Settings**

| ID    | Requirement                                                           |
| ----- | --------------------------------------------------------------------- |
| FR-32 | User shall be able to enable/disable data collection for improvements |
| FR-33 | User shall be able to view which data is sent to OpenAI               |
| FR-34 | User shall be able to exclude specific chats from AI processing       |
| FR-35 | System shall provide option to auto-delete processed data             |
| FR-36 | System shall display privacy policy and data handling information     |
| FR-37 | All settings shall persist in Chrome local storage securely           |
| FR-38 | Settings panel shall show toast notifications for save success/errors |

---

## **3.6 Message Hover AI Button**

| ID    | Requirement                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| FR-39 | System shall inject an AI action button on message hover using class-based component                                            |
| FR-40 | Button shall appear adjacent to existing WhatsApp message actions                                                               |
| FR-41 | Button shall use native WhatsApp styling and match theme (dark/light)                                                           |
| FR-42 | Clicking the button shall display a context menu with options: Analyze, Translate, Explain Context, Detect Tone, Generate Reply |
| FR-43 | Context menu shall display inline, matching WhatsApp's native menu style                                                        |
| FR-44 | For media messages, system shall extract and process image/voice content                                                        |
| FR-45 | AI results shall display in native WhatsApp message bubble style via ResultsDisplay component                                   |
| FR-46 | Button visibility shall be controlled by enableHoverButton setting                                                              |

---

## **3.7 Message Extraction**

| ID    | Requirement                                                                              |
| ----- | ---------------------------------------------------------------------------------------- |
| FR-47 | System shall extract visible chat messages from the DOM using centralized selectors      |
| FR-48 | System shall identify chat ID (phone number or group identifier) via `getActiveChatId()` |
| FR-49 | System shall respect user-configured message count limit (5-50)                          |
| FR-50 | System shall capture sender names in group conversations using `isGroupChat()`           |
| FR-51 | System shall extract message timestamps and metadata using `extractMessageData()`        |
| FR-52 | System shall use only selectors from `DOMComponents` utility, never hardcoded            |

---

## **3.8 AI Analysis**

| ID    | Requirement                                                                               |
| ----- | ----------------------------------------------------------------------------------------- |
| FR-53 | System shall create and maintain chat stories (narrative context) via OpenAI GPT-5 family |
| FR-54 | System shall track multiple concurrent story threads within a single chat                 |
| FR-55 | System shall identify topic transitions and create new story branches                     |
| FR-56 | System shall provide key points extraction from active stories                            |
| FR-57 | System shall analyze message tone and sentiment                                           |
| FR-58 | System shall map group participants and their communication patterns                      |
| FR-59 | System shall identify important intentions and action items                               |
| FR-60 | System shall maintain story continuity across conversation gaps                           |
| FR-61 | AI results shall display via ResultsDisplay component in native-styled bubbles            |
| FR-62 | All AI API calls shall be processed through background service worker                     |
| FR-63 | System shall use Chat Completions API format with role-based messages                     |

---

## **3.9 Chat Story System**

| ID    | Requirement                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------- |
| FR-64 | System shall cache chat stories per chat ID in Chrome local storage via typed storage wrapper       |
| FR-65 | System shall maintain multiple story threads per chat with unique identifiers                       |
| FR-66 | Cached stories shall load instantly when reopening a chat                                           |
| FR-67 | System shall perform incremental story updates for new messages                                     |
| FR-68 | System shall automatically merge or split stories based on topic changes                            |
| FR-69 | System shall track story metadata (creation time, last update, message count, topics, participants) |
| FR-70 | System shall auto-cleanup old stories based on retention settings (default 7 days)                  |
| FR-71 | System shall compress story data to minimize storage usage                                          |
| FR-72 | System shall support manual story refresh per chat                                                  |
| FR-73 | System shall prioritize active stories for context retrieval                                        |
| FR-74 | System shall use storage key pattern: `wa_ai_chat_` + chatId for stories                            |

---

## **3.10 Reply Generation**

| ID    | Requirement                                                                          |
| ----- | ------------------------------------------------------------------------------------ |
| FR-75 | System shall generate contextual reply suggestions using relevant chat stories       |
| FR-76 | System shall automatically select appropriate story context for reply generation     |
| FR-77 | System shall consider all active story threads when generating replies               |
| FR-78 | System shall provide multiple tone variants: neutral, friendly, professional, casual |
| FR-79 | User shall be able to provide hints to refine generated replies                      |
| FR-80 | User shall be able to manually select which story context to use for reply           |
| FR-81 | System shall support reply regeneration with different parameters                    |
| FR-82 | System shall insert selected reply into WhatsApp input field via DOM manipulation    |
| FR-83 | Reply suggestions shall display via ResultsDisplay component                         |
| FR-84 | User shall be able to edit suggested reply before insertion                          |
| FR-85 | Reply language shall default to user's replyLanguage setting                         |

---

## **3.11 Media Processing**

| ID    | Requirement                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------- |
| FR-86 | System shall extract media blobs from WhatsApp messages via `extractImageBlob()` and `extractAudioBlob()` |
| FR-87 | System shall convert media to base64 format for API transmission                                          |
| FR-88 | Image content shall be analyzed via OpenAI Vision API with GPT-5 model                                    |
| FR-89 | Voice messages shall be transcribed via OpenAI Whisper API                                                |
| FR-90 | Media analysis results shall be integrated into chat stories                                              |
| FR-91 | Media analysis results shall display via ResultsDisplay component                                         |
| FR-92 | System shall cache media analysis results to avoid re-processing                                          |
| FR-93 | All media processing shall occur in background service worker                                             |

---

## **3.12 Localization**

| ID    | Requirement                                                                                                                      |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| FR-94 | User shall be able to select preferred reply, analysis, and translation languages independently                                  |
| FR-95 | AI responses and stories shall be generated in the selected analysisLanguage                                                     |
| FR-96 | System shall support 23+ languages including English, Spanish, French, Arabic, Urdu, Roman Urdu, Chinese, Japanese, Korean, etc. |
| FR-97 | System shall support translation between any two languages via LANGUAGE_OPTIONS                                                  |
| FR-98 | System shall auto-detect source language for translation                                                                         |
| FR-99 | Language options shall be defined centrally in `src/types/index.ts`                                                              |

---

## **3.13 Smart Suggestions**

| ID     | Requirement                                                      |
| ------ | ---------------------------------------------------------------- |
| FR-100 | System shall detect emotional tone in conversations              |
| FR-101 | System shall identify potential conversation risks               |
| FR-102 | System shall suggest professional/polite message alternatives    |
| FR-103 | System shall provide conversation improvement recommendations    |
| FR-104 | Suggestions shall display via ResultsDisplay component           |
| FR-105 | System shall use story context to enhance suggestion accuracy    |
| FR-106 | Smart suggestions feature can be enabled/disabled in AI settings |

---

# **4. Non-Functional Requirements**

## **4.1 Performance**

| ID     | Requirement                                               |
| ------ | --------------------------------------------------------- |
| NFR-01 | Cached data shall load within 200ms                       |
| NFR-02 | AI response time shall be 1-4 seconds                     |
| NFR-03 | DOM injections shall not degrade WhatsApp Web performance |

## **4.2 Usability**

| ID     | Requirement                                                         |
| ------ | ------------------------------------------------------------------- |
| NFR-04 | UI shall follow minimal, clean design principles                    |
| NFR-05 | All UI components shall support WhatsApp's dark and light themes    |
| NFR-06 | Injected elements shall not interfere with native WhatsApp controls |
| NFR-07 | Settings panel shall reload the page after save to apply changes    |
| NFR-08 | All icons shall be from svgrepo.com and centralized in icons.ts     |

## **4.3 Reliability**

| ID     | Requirement                                                                               |
| ------ | ----------------------------------------------------------------------------------------- |
| NFR-09 | System shall handle WhatsApp DOM structure changes gracefully using centralized selectors |
| NFR-10 | API failures shall trigger automatic retry with exponential backoff (max 2 attempts)      |
| NFR-11 | System shall use MutationObserver for theme change detection                              |
| NFR-12 | Extension shall wait for WhatsApp to fully load before injection                          |

## **4.4 Security**

| ID     | Requirement                                                               |
| ------ | ------------------------------------------------------------------------- |
| NFR-13 | Only user-selected content shall be transmitted to AI services            |
| NFR-14 | OpenAI API key shall be stored securely in Chrome extension local storage |
| NFR-15 | No user data shall be persisted on external servers                       |
| NFR-16 | Extension shall request only necessary permissions: storage, activeTab    |
| NFR-17 | Host permissions limited to web.whatsapp.com and api.openai.com           |
| NFR-18 | API key validation shall occur before making OpenAI requests              |

## **4.5 Compatibility**

| ID     | Requirement                                                            |
| ------ | ---------------------------------------------------------------------- |
| NFR-19 | Extension shall support Chrome and Firefox browsers via WXT framework  |
| NFR-20 | Extension shall use Manifest V3 specification                          |
| NFR-21 | Extension shall support WhatsApp Web dark and light themes dynamically |
| NFR-22 | Extension shall be compatible with latest WhatsApp Web DOM structure   |

---

# **5. Technical Implementation**

## **5.1 Component Architecture**

| Component Type           | Implementation Pattern                                                   |
| ------------------------ | ------------------------------------------------------------------------ |
| **UI Components**        | Vanilla TypeScript classes with `createElement()` methods, not React/Vue |
| **ChatButton**           | Class-based button component for opening AI chat panel                   |
| **ChatPanel**            | Class-based modal panel rendered in Shadow DOM                           |
| **GlobalSettingsButton** | Injected above WhatsApp settings, direct DOM injection                   |
| **GlobalSettingsPanel**  | Full-screen settings panel with tabs, rendered in Shadow DOM             |
| **MessageActionButton**  | Hover overlay on messages, direct DOM injection                          |
| **ActionMenu**           | Context menu for AI actions (analyze, translate, etc.)                   |
| **ResultsDisplay**       | Displays AI results in WhatsApp-style message bubbles                    |

## **5.2 Storage Architecture**

| Storage Key Pattern       | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `wa_ai_settings`          | User settings (AI config, general, cache, privacy) |
| `wa_ai_chat_${chatId}`    | Chat cache with story threads                      |
| `wa_ai_context_${chatId}` | Chat context and metadata                          |
| `wa_ai_cache_stats`       | Cache statistics and metrics                       |

All storage operations use typed wrapper functions from `src/utils/storage.ts`:

- `getSettings()`, `saveSettings()`
- `getChatCache()`, `saveChatCache()`
- `getStories()`, `saveStories()`
- `getCacheStats()`, `clearAllCache()`, `clearChatCache()`

## **5.3 Message Passing Protocol**

Extension uses typed message structure for content ↔ background communication:

```typescript
interface ExtensionMessage {
  type: "GET_SETTINGS" | "SAVE_SETTINGS" | "ANALYZE_MESSAGE" |
        "GENERATE_REPLY" | "TRANSLATE_TEXT" | "GET_CACHE_STATS" |
        "CLEAR_CACHE" | ...;
  payload: any;
}

interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}
```

All API calls go through background service worker, never directly from content script.

## **5.4 OpenAI Integration**

- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Supported Models**: GPT-5 family only (gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano)
- **Chat Completions Format**: Role-based messages (system, user, assistant)
- **Vision API**: Image analysis with GPT-5 model
- **Whisper API**: Voice transcription
- **Retry Logic**: Max 2 retries with exponential backoff
- **Response Handling**: Uses `response.choices[0].message.content`

## **5.5 DOM Selector Management**

All WhatsApp DOM selectors centralized in `src/utils/dom-components.ts` (110+ selectors):

- `DOMComponents.app` - Main WhatsApp container
- `DOMComponents.conversationPanel` - Chat messages area
- `DOMComponents.messageContainer` - Individual message wrapper
- `DOMComponents.settingsButton` - Native WhatsApp settings
- Never hardcode selectors in components

## **5.6 Icon System**

All SVG icons sourced from https://svgrepo.com and centralized in `src/utils/icons.ts` (25+ icons):

- AI actions: `Icons.aiSparkle`, `Icons.translate`, `Icons.analyze`
- UI controls: `Icons.close`, `Icons.settings`, `Icons.refresh`
- Status: `Icons.success`, `Icons.error`, `Icons.loading`

---

# **6. User Flows**

### **6.1 Access AI Settings**

1. User clicks AI settings button (above WhatsApp settings)
2. GlobalSettingsPanel renders in Shadow DOM with native WhatsApp styling
3. User navigates tabs: General, AI Config, Cache Management, Privacy
4. User configures preferences (API key, model, languages, features)
5. User clicks Save button
6. Settings persist in Chrome local storage via `saveSettings()`
7. Page reloads to apply changes
8. Toast notification confirms success

### **6.2 Analyze Message**

1. User hovers over a message
2. MessageActionButton component injects AI action button (if enableHoverButton is true)
3. User clicks button, ActionMenu appears with options
4. User selects "Analyze"
5. Content script extracts message via `extractMessageData()`
6. Content script sends ANALYZE_MESSAGE to background worker
7. Background worker calls OpenAI API with GPT-5 model
8. Background worker returns response
9. ResultsDisplay component renders analysis in native message bubble style
10. Result integrates into chat story threads

### **6.3 Generate Reply**

1. User clicks AI action button on a message
2. User selects "Generate Reply" from ActionMenu
3. Content script gathers chat context and active story threads
4. Content script sends GENERATE_REPLY to background worker with context
5. Background worker calls OpenAI with story context
6. AI generates reply in selected tone (neutral/friendly/professional/casual)
7. ResultsDisplay renders reply suggestion with edit option
8. User reviews and optionally edits reply
9. User clicks to insert reply into WhatsApp input field via DOM manipulation
10. Reply uses replyLanguage setting for output

### **6.4 Process Media**

1. User hovers over image/voice message
2. User clicks MessageActionButton
3. User selects appropriate action from ActionMenu
4. Content script calls `extractImageBlob()` or `extractAudioBlob()`
5. Content script converts media to base64
6. Content script sends to background worker with message type
7. Background worker calls OpenAI Vision API (images) or Whisper API (voice)
8. Transcription/description returned to content script
9. ResultsDisplay renders result in native bubble style
10. Result cached to avoid re-processing
11. Result integrated into chat story threads

### **6.5 Manage Cache & Stories**

1. User clicks AI settings button
2. GlobalSettingsPanel opens in Shadow DOM
3. User navigates to "Cache Management" tab
4. Panel displays cache statistics via `getCacheStats()`:
   - Total cache size (bytes)
   - Number of cached chats
   - Number of story threads
   - Cache hits/misses
   - Last cleanup timestamp
5. User views individual chat caches and story threads
6. User can clear specific chat via `clearChatCache(chatId)`
7. User can clear all cache via `clearAllCache()` with confirmation
8. User configures cache settings:
   - Retention days (default: 7)
   - Max cache size in MB (default: 50)
   - Max stories per chat (default: 10)
   - Auto-cleanup enabled (default: true)
9. Settings saved and auto-cleanup scheduled

---

# **7. Development Guidelines**

## **7.1 Project Structure**

```
src/
├── entrypoints/
│   ├── background.ts           # Service worker for API calls
│   ├── content/index.ts        # Content script entry point
│   └── popup/                  # Browser action popup
├── ui/
│   ├── app.ts                  # Main app orchestrator
│   └── components/             # Class-based UI components
│       ├── chat-button.ts
│       ├── chat-panel.ts
│       ├── global-settings-button.ts
│       ├── global-settings-panel.ts
│       ├── message-action-button.ts
│       ├── action-menu.ts
│       └── results-display.ts
├── utils/
│   ├── dom-components.ts       # Centralized DOM selectors (110+)
│   ├── icons.ts                # SVG icons from svgrepo.com (25+)
│   ├── storage.ts              # Typed storage wrapper functions
│   ├── storage-debug.ts        # Dev mode debugging tools
│   └── whatsapp-dom.ts         # WhatsApp DOM utilities
├── styles/
│   ├── ui-styles.ts            # Shadow DOM styles
│   └── popup-styles.ts         # Popup styles
└── types/
    └── index.ts                # TypeScript interfaces (366 lines)
```

## **7.2 Build Commands**

```bash
npm run dev              # Chrome dev mode with hot reload
npm run dev:firefox      # Firefox dev mode
npm run build            # Production build for Chrome
npm run build:firefox    # Production build for Firefox
npm run compile          # TypeScript type checking (no emit)
npm run zip              # Create Chrome extension zip
npm run zip:firefox      # Create Firefox extension zip
```

## **7.3 Development Workflow**

1. Run `npm run dev` to start development server
2. Extension loads from `.output/chrome-mv3`
3. Navigate to https://web.whatsapp.com to test
4. Hot reload active for code changes
5. Storage debug tools available in dev mode (imported in background.ts)
6. Before committing, run `npm run compile` to verify TypeScript

## **7.4 Code Conventions**

| Convention            | Rule                                                                |
| --------------------- | ------------------------------------------------------------------- |
| **Component Pattern** | Classes with `element` property, `createElement()`, `destroy()`     |
| **Selector Usage**    | Always use `DOMComponents.selector`, never hardcode                 |
| **Icon Usage**        | Always use `Icons.iconName` from icons.ts                           |
| **Storage Access**    | Use wrapper functions from storage.ts, never direct browser.storage |
| **Path Aliases**      | Use `@/types`, `@/utils`, `@/ui`, `@/styles` via tsconfig           |
| **Theme Support**     | All components must support light/dark themes                       |
| **Shadow DOM**        | Use for modal panels, avoid for native-style buttons                |

## **7.5 API Integration**

- All OpenAI calls go through background service worker
- Use Chat Completions API format (https://platform.openai.com/docs/guides/text)
- Follow response migration guide (https://platform.openai.com/docs/guides/migrate-to-responses)
- Implement retry logic with exponential backoff (max 2 retries)
- Use only GPT-5 family models (gpt-5.2, gpt-5, gpt-5-mini, gpt-5-nano)

---

# **8. Future Enhancements**

- Auto-detection of important messages
- Conversation sentiment timeline visualization
- Message priority scoring
- Quick response templates
- Conversation analytics dashboard

---

# **9. Glossary**

| Term                   | Definition                                                                      |
| ---------------------- | ------------------------------------------------------------------------------- |
| **WXT**                | Web Extension Tools - framework for building browser extensions with TypeScript |
| **DOM**                | Document Object Model - the structure of the web page                           |
| **Shadow DOM**         | Isolated DOM tree for style encapsulation, prevents CSS conflicts               |
| **Content Script**     | JavaScript that runs in the context of web pages (WhatsApp Web)                 |
| **Background Worker**  | Service worker that runs independently, handles API calls                       |
| **Whisper API**        | OpenAI's speech-to-text API for voice transcription                             |
| **Vision API**         | OpenAI's image analysis API using GPT-5 model                                   |
| **Chat Completions**   | OpenAI API format using role-based messages (system, user, assistant)           |
| **Story Thread**       | AI-generated narrative context for a conversation segment                       |
| **DOMComponents**      | Centralized utility containing 110+ WhatsApp DOM selectors                      |
| **Message Extraction** | Process of extracting message data from WhatsApp DOM using typed functions      |
| **Class Component**    | Vanilla TypeScript class-based UI component (not React/Vue)                     |
| **Typed Storage**      | Storage wrapper with TypeScript interfaces for type safety                      |
| **MutationObserver**   | Browser API for detecting DOM changes (used for theme detection)                |

---

_Document End_
