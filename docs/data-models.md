# Data Models & API Structures

Reference for data structures used throughout the WhatsApp AI Assistant extension.

---

## Message Data Models

### MessageData Interface

```typescript
interface MessageData {
  id: string | null; // Unique message ID from data-id
  chatId: string | null; // Chat identifier (phone@c.us or group@g.us)
  isOutgoing: boolean; // true if sent by user
  sender: string; // Sender name or "You"
  content: string; // Message text content
  timestamp: string; // Short timestamp (e.g., "10:54 PM")
  fullTimestamp: string | null; // Full timestamp (e.g., "10:54 PM, 12/9/2025")
  isGroup: boolean; // true if group chat message
  isDeleted: boolean; // true if message was deleted
  isForwarded: boolean; // true if message was forwarded
  isReply: boolean; // true if message is a reply
  mediaType: "text" | "voice" | "image" | "video" | "document" | "unknown";
  mediaSrc?: string; // Blob URL for media content
  mediaDuration?: string; // Duration for voice/video (e.g., "0:24")
}
```

### Example MessageData Object

```json
{
  "id": "false_923061400333@c.us_3A12F0908922EFDD735D",
  "chatId": "923061400333@c.us",
  "isOutgoing": false,
  "sender": "Nouman Nawaz Khan - Upvave - CEO",
  "content": "Wrna team ko msg krwa dena remote ka ig",
  "timestamp": "10:54 PM",
  "fullTimestamp": "10:54 PM, 12/9/2025",
  "isGroup": false,
  "isDeleted": false,
  "isForwarded": false,
  "isReply": false,
  "mediaType": "text"
}
```

---

## Chat Context Models

### ChatContext Interface

```typescript
interface ChatContext {
  chatId: string; // Unique chat identifier
  chatType: "personal" | "group"; // Type of chat
  messages: MessageData[]; // Array of messages
  participants: string[]; // List of participant names (group only)
  lastUpdated: number; // Timestamp of last update
  messageCount: number; // Total number of messages
}
```

### ChatStory Interface

```typescript
interface ChatStory {
  storyId: string; // Unique story identifier
  chatId: string; // Associated chat ID
  title: string; // Story title/topic
  summary: string; // Narrative summary
  keyPoints: string[]; // Important points
  participants: string[]; // Involved participants
  startMessageId: string; // First message in story
  endMessageId: string; // Last message in story
  messageCount: number; // Number of messages in story
  createdAt: number; // Creation timestamp
  lastUpdated: number; // Last update timestamp
  isActive: boolean; // true if story is ongoing
}
```

---

## Background Worker Message Types

### Request Types

#### ANALYZE_MESSAGE

```typescript
{
  type: 'ANALYZE_MESSAGE',
  payload: {
    message: MessageData,
    context: MessageData[],
    chatId: string,
    isGroup: boolean
  }
}
```

#### GENERATE_REPLY

```typescript
{
  type: 'GENERATE_REPLY',
  payload: {
    message: MessageData,
    context: MessageData[],
    chatId: string,
    isGroup: boolean,
    tone?: 'neutral' | 'friendly' | 'professional',
    hints?: string
  }
}
```

#### TRANSLATE_MESSAGE

```typescript
{
  type: 'TRANSLATE_MESSAGE',
  payload: {
    message: MessageData,
    targetLanguage: string,
    sourceLanguage?: string
  }
}
```

#### UPDATE_STORY

```typescript
{
  type: 'UPDATE_STORY',
  payload: {
    chatId: string,
    newMessages: MessageData[]
  }
}
```

#### GET_CHAT_CONTEXT

```typescript
{
  type: 'GET_CHAT_CONTEXT',
  payload: {
    chatId: string,
    messageLimit?: number
  }
}
```

---

### Response Types

#### ANALYSIS_RESPONSE

```typescript
{
  success: boolean,
  result: {
    summary: string,
    keyPoints: string[],
    tone: string,
    sentiment: 'positive' | 'negative' | 'neutral',
    intent: string,
    actionItems?: string[],
    participants?: Map<string, ParticipantInfo>
  },
  error?: string
}
```

#### REPLY_RESPONSE

```typescript
{
  success: boolean,
  suggestions: Array<{
    text: string,
    tone: 'neutral' | 'friendly' | 'professional',
    confidence: number
  }>,
  error?: string
}
```

#### TRANSLATION_RESPONSE

```typescript
{
  success: boolean,
  translation: {
    originalText: string,
    translatedText: string,
    sourceLanguage: string,
    targetLanguage: string
  },
  error?: string
}
```

#### STORY_RESPONSE

```typescript
{
  success: boolean,
  stories: ChatStory[],
  activeStory: ChatStory | null,
  error?: string
}
```

---

## OpenAI API Request Formats

### Chat Completion Request

```typescript
{
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo',
  messages: Array<{
    role: 'system' | 'user' | 'assistant',
    content: string
  }>,
  temperature?: number,
  max_tokens?: number,
  top_p?: number,
  frequency_penalty?: number,
  presence_penalty?: number
}
```

### Vision API Request (Image Analysis)

```typescript
{
  model: 'gpt-4-vision-preview',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'What is in this image?'
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
            detail: 'high' | 'low' | 'auto'
          }
        }
      ]
    }
  ],
  max_tokens: 300
}
```

### Whisper API Request (Audio Transcription)

```typescript
// FormData format
{
  file: Blob,                         // Audio file
  model: 'whisper-1',
  language?: string,                  // ISO-639-1 code
  prompt?: string,                    // Context hint
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt',
  temperature?: number
}
```

---

## Cache Storage Models

### CachedChatData

```typescript
interface CachedChatData {
  chatId: string;
  stories: ChatStory[];
  lastMessages: MessageData[];
  summary: string;
  participants: string[];
  cachedAt: number;
  expiresAt: number;
}
```

### StorageKey Patterns

```
chat_{chatId}             // Chat-specific data
story_{chatId}_{storyId}  // Individual story
settings                  // User settings
api_key                   // OpenAI API key
cache_stats               // Cache statistics
```

---

## User Settings Model

### Settings Interface

```typescript
interface UserSettings {
  // AI Configuration
  apiKey: string;
  model: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo";
  defaultTone: "neutral" | "friendly" | "professional";

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
  messageLimit: number; // 5-50 messages to analyze
  autoAnalyzeNewMessages: boolean;
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
```

### Default Settings

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  apiKey: "",
  model: "gpt-4-turbo",
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
  autoAnalyzeNewMessages: false,
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

## Cache Statistics Model

### CacheStats Interface

```typescript
interface CacheStats {
  totalSize: number; // Total cache size in bytes
  totalChats: number; // Number of cached chats
  totalStories: number; // Total number of stories
  totalMessages: number; // Total cached messages

  cacheHits: number; // Number of cache hits
  cacheMisses: number; // Number of cache misses
  hitRate: number; // Cache hit rate (0-1)

  oldestEntry: number; // Timestamp of oldest cache entry
  newestEntry: number; // Timestamp of newest cache entry
  lastCleanup: number; // Timestamp of last cleanup

  chatSizes: Map<string, number>; // Size per chat
  storyCounts: Map<string, number>; // Story count per chat
}
```

---

## Participant Analysis Model

### ParticipantInfo Interface

```typescript
interface ParticipantInfo {
  name: string;
  messageCount: number;
  averageTone: string;
  topicParticipation: Map<string, number>;
  replyFrequency: number;
  avgResponseTime?: number;
  keywords: string[];
}
```

---

## Error Response Model

### ErrorResponse Interface

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  details?: any;
  timestamp: number;
}
```

### Common Error Codes

```typescript
enum ErrorCode {
  API_KEY_MISSING = "API_KEY_MISSING",
  API_KEY_INVALID = "API_KEY_INVALID",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  NETWORK_ERROR = "NETWORK_ERROR",
  INVALID_PAYLOAD = "INVALID_PAYLOAD",
  CHAT_NOT_FOUND = "CHAT_NOT_FOUND",
  EXTRACTION_FAILED = "EXTRACTION_FAILED",
  OPENAI_API_ERROR = "OPENAI_API_ERROR",
}
```

---

## Event Types

### Extension Events

```typescript
type ExtensionEvent =
  | "MESSAGE_RECEIVED"
  | "CHAT_OPENED"
  | "CHAT_CLOSED"
  | "SETTINGS_UPDATED"
  | "CACHE_CLEARED"
  | "ANALYSIS_COMPLETE"
  | "ERROR_OCCURRED";
```

---

## Type Guards

### Useful Type Guards

```typescript
function isMessageData(obj: any): obj is MessageData {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.content === "string" &&
    typeof obj.isOutgoing === "boolean"
  );
}

function isChatStory(obj: any): obj is ChatStory {
  return (
    obj &&
    typeof obj.storyId === "string" &&
    typeof obj.chatId === "string" &&
    typeof obj.summary === "string" &&
    Array.isArray(obj.keyPoints)
  );
}

function isUserSettings(obj: any): obj is UserSettings {
  return (
    obj &&
    typeof obj.apiKey === "string" &&
    typeof obj.model === "string" &&
    typeof obj.enabledFeatures === "object"
  );
}
```

---

_This document provides a comprehensive reference for all data structures used in the extension. Update as new features are added._
