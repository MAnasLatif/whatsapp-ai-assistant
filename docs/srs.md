# **Software Requirements Specification (SRS)**

## **WhatsApp AI Assistant – Chrome Extension**

**Version:** 1.0  
**Date:** December 2024

---

# **1. Introduction**

### **1.1 Purpose**

This document defines the functional and non-functional requirements for a Chrome extension built with **WXT** and **React**. The extension enhances WhatsApp Web with AI-powered tools for message analysis, translation, context explanation, and reply generation using **OpenAI API** integration.

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

| Category    | Technology                        |
| ----------- | --------------------------------- |
| Framework   | WXT (Web Extension Tools)         |
| Frontend    | React 18, TypeScript              |
| AI Services | OpenAI API (GPT, Vision, Whisper) |
| Storage     | Chrome Extension Local Storage    |

---

# **2. System Architecture**

### **2.1 Core Components**

| Component                  | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **AI Settings Panel**      | React-based modal UI for AI configuration, cache management, and preferences         |
| **Native UI Integrations** | AI settings button and message action buttons seamlessly integrated into WhatsApp UI |
| **Content Script**         | Handles DOM manipulation, message extraction, and UI injection                       |
| **Background Worker**      | Manages OpenAI API calls, caching, and cross-component communication                 |
| **Storage Layer**          | Chrome extension local storage for caching and user preferences                      |

### **2.2 Data Flow**

```
User Interaction → Content Script → Background Worker → OpenAI API
                                          ↓
          Native UI Components ← Background Worker ← API Response
                  ↓                       ↓
           Settings Panel            Local Cache
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
| FR-09 | User shall be able to select AI model (GPT-5.2, GPT-5, GPT-5 mini, GPT-5 nano) |
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
| FR-22 | User shall be able to select preferred output language               |
| FR-23 | User shall be able to configure number of messages to analyze (5-50) |
| FR-24 | User Shall be able to make story of all chat                         |
| FR-25 | User shall be able to enable/disable message hover AI button         |
| FR-26 | User shall be able to set keyboard shortcuts for AI actions          |

---

## **3.5 Privacy & Data Settings**

| ID    | Requirement                                                           |
| ----- | --------------------------------------------------------------------- |
| FR-32 | User shall be able to enable/disable data collection for improvements |
| FR-33 | User shall be able to view which data is sent to OpenAI               |
| FR-34 | User shall be able to exclude specific chats from AI processing       |
| FR-35 | System shall provide option to auto-delete processed data             |
| FR-36 | System shall display privacy policy and data handling information     |

---

## **3.6 Message Hover AI Button**

| ID    | Requirement                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| FR-37 | System shall inject an AI action button on message hover                                                                        |
| FR-38 | Button shall appear adjacent to existing WhatsApp message actions                                                               |
| FR-39 | Button shall use native WhatsApp styling and match theme (dark/light)                                                           |
| FR-40 | Clicking the button shall display a context menu with options: Analyze, Translate, Explain Context, Detect Tone, Generate Reply |
| FR-41 | Context menu shall display inline, matching WhatsApp's native menu style                                                        |
| FR-42 | For media messages, system shall extract and process image/voice content                                                        |
| FR-43 | AI results shall display in native WhatsApp message bubble style                                                                |

---

## **3.7 Message Extraction**

| ID    | Requirement                                                      |
| ----- | ---------------------------------------------------------------- |
| FR-44 | System shall extract visible chat messages from the DOM          |
| FR-45 | System shall identify chat ID (phone number or group identifier) |
| FR-46 | System shall respect user-configured message count limit         |
| FR-47 | System shall capture sender names in group conversations         |
| FR-48 | System shall extract message timestamps and metadata             |

---

## **3.8 AI Analysis**

| ID    | Requirement                                                                  |
| ----- | ---------------------------------------------------------------------------- |
| FR-45 | System shall create and maintain chat stories (narrative context) via OpenAI |
| FR-46 | System shall track multiple concurrent story threads within a single chat    |
| FR-47 | System shall identify topic transitions and create new story branches        |
| FR-48 | System shall provide key points extraction from active stories               |
| FR-49 | System shall analyze message tone and sentiment                              |
| FR-50 | System shall map group participants and their communication patterns         |
| FR-51 | System shall identify important intentions and action items                  |
| FR-52 | System shall maintain story continuity across conversation gaps              |
| FR-53 | AI results shall display in native-styled inline bubbles or tooltips         |

---

## **3.9 Chat Story System**

| ID    | Requirement                                                                   |
| ----- | ----------------------------------------------------------------------------- |
| FR-54 | System shall cache chat stories per chat ID in local storage                  |
| FR-55 | System shall maintain multiple story threads per chat with unique identifiers |
| FR-56 | Cached stories shall load instantly when reopening a chat                     |
| FR-57 | System shall perform incremental story updates for new messages               |
| FR-58 | System shall automatically merge or split stories based on topic changes      |
| FR-59 | System shall track story metadata (creation time, last update, message count) |
| FR-60 | System shall auto-cleanup old stories based on retention settings             |
| FR-61 | System shall compress story data to minimize storage usage                    |
| FR-62 | System shall support manual story refresh per chat                            |
| FR-63 | System shall prioritize active stories for context retrieval                  |

---

## **3.10 Reply Generation**

| ID    | Requirement                                                                      |
| ----- | -------------------------------------------------------------------------------- |
| FR-64 | System shall generate contextual reply suggestions using relevant chat stories   |
| FR-65 | System shall automatically select appropriate story context for reply generation |
| FR-66 | System shall consider all active story threads when generating replies           |
| FR-67 | System shall provide multiple tone variants: neutral, friendly, professional     |
| FR-68 | User shall be able to provide hints to refine generated replies                  |
| FR-69 | User shall be able to manually select which story context to use for reply       |
| FR-70 | System shall support reply regeneration with different parameters                |
| FR-71 | System shall insert selected reply into WhatsApp input field                     |
| FR-72 | Reply suggestions shall display in native-styled inline bubbles                  |
| FR-73 | User shall be able to edit suggested reply before insertion                      |

---

## **3.11 Media Processing**

| ID    | Requirement                                                         |
| ----- | ------------------------------------------------------------------- |
| FR-74 | System shall extract media blobs from WhatsApp messages             |
| FR-75 | System shall convert media to base64 format for API transmission    |
| FR-76 | Image content shall be analyzed via OpenAI Vision API               |
| FR-77 | Voice messages shall be transcribed via OpenAI Whisper API          |
| FR-78 | Media analysis results shall be integrated into chat stories        |
| FR-79 | Media analysis results shall display in native message bubble style |
| FR-80 | System shall cache media analysis results to avoid re-processing    |

---

## **3.12 Localization**

| ID    | Requirement                                                          |
| ----- | -------------------------------------------------------------------- |
| FR-81 | User shall be able to select preferred output language in settings   |
| FR-82 | AI responses and stories shall be generated in the selected language |
| FR-83 | System shall support translation between any two languages           |
| FR-84 | System shall auto-detect source language for translation             |

---

## **3.13 Smart Suggestions**

| ID    | Requirement                                                   |
| ----- | ------------------------------------------------------------- |
| FR-85 | System shall detect emotional tone in conversations           |
| FR-86 | System shall identify potential conversation risks            |
| FR-87 | System shall suggest professional/polite message alternatives |
| FR-88 | System shall provide conversation improvement recommendations |
| FR-89 | Suggestions shall display as subtle inline hints              |
| FR-90 | System shall use story context to enhance suggestion accuracy |

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
| NFR-05 | Sidebar shall be responsive and resizable                           |
| NFR-06 | Injected elements shall not interfere with native WhatsApp controls |

## **4.3 Reliability**

| ID     | Requirement                                                   |
| ------ | ------------------------------------------------------------- |
| NFR-07 | System shall handle WhatsApp DOM structure changes gracefully |
| NFR-08 | API failures shall trigger automatic retry (max 2 attempts)   |

## **4.4 Security**

| ID     | Requirement                                                    |
| ------ | -------------------------------------------------------------- |
| NFR-09 | Only user-selected content shall be transmitted to AI services |
| NFR-10 | OpenAI API key shall be stored securely in extension storage   |
| NFR-11 | No user data shall be persisted on external servers            |

## **4.5 Compatibility**

| ID     | Requirement                                                |
| ------ | ---------------------------------------------------------- |
| NFR-12 | Extension shall support the latest two Chrome versions     |
| NFR-13 | Extension shall support WhatsApp Web dark and light themes |

---

# **5. User Flows**

### **5.1 Access AI Settings**

1. User clicks AI settings button (above WhatsApp settings)
2. Settings modal opens with native WhatsApp styling
3. User configures AI preferences, cache settings, etc.
4. User saves settings
5. Settings persist in extension storage

### **5.2 Analyze Message**

1. User hovers over a message
2. AI action button appears (native style)
3. User clicks "Analyze"
4. Content script extracts message content
5. Background worker sends request to OpenAI
6. Analysis results display inline in native message bubble style

### **5.3 Generate Reply**

1. User clicks AI action button on a message
2. User selects "Generate Reply" from context menu
3. AI generates multiple tone variants (displayed inline)
4. User previews, edits, or regenerates reply
5. User clicks to insert reply into WhatsApp input field

### **5.4 Process Media**

1. User hovers over image/voice message
2. User clicks AI action button
3. System extracts media blob and converts to base64
4. Media sent to OpenAI Vision/Whisper API
5. Transcription or description displays inline in native bubble

### **5.5 Manage Cache & Stories**

1. User opens AI settings panel
2. User navigates to Cache & Story Management section
3. User views cache statistics, storage usage, and active story threads
4. User views individual story threads for specific chats
5. User clears specific chat cache/stories or all cache
6. User configures auto-cleanup settings and story retention limits

---

# **6. Future Enhancements**

- Auto-detection of important messages
- Conversation sentiment timeline visualization
- Message priority scoring
- Quick response templates
- Conversation analytics dashboard

---

# **7. Glossary**

| Term           | Definition                                                      |
| -------------- | --------------------------------------------------------------- |
| WXT            | Web Extension Tools - framework for building browser extensions |
| DOM            | Document Object Model - the structure of the web page           |
| Whisper        | OpenAI's speech-to-text API                                     |
| Vision API     | OpenAI's image analysis API                                     |
| Delta Analysis | Processing only new/changed content                             |

---

_Document End_
