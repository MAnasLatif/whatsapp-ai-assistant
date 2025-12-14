/**
 * Type definitions for WhatsApp AI Assistant
 */

// ============================================
// Settings Types
// ============================================

export interface AISettings {
  apiKey: string;
  model: AIModel;
  defaultTone: ResponseTone;
  enabledFeatures: AIFeatureFlags;
}

export type AIModel =
  | "gpt-4o"
  | "gpt-4o-mini"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo";

export type ResponseTone = "neutral" | "friendly" | "professional" | "casual";

export interface AIFeatureFlags {
  analyze: boolean;
  translate: boolean;
  explainContext: boolean;
  detectTone: boolean;
  generateReply: boolean;
  smartSuggestions: boolean;
}

export interface GeneralSettings {
  outputLanguage: string;
  messageLimit: number; // 5-50
  enableHoverButton: boolean;
  keyboardShortcuts: KeyboardShortcuts;
}

export interface KeyboardShortcuts {
  analyze: string;
  translate: string;
  generateReply: string;
  openChat: string;
}

export interface CacheSettings {
  retentionDays: number;
  maxCacheSize: number; // in MB
  maxStoriesPerChat: number;
  autoCleanupEnabled: boolean;
}

export interface PrivacySettings {
  dataCollectionEnabled: boolean;
  excludedChats: string[]; // Chat IDs to exclude
  autoDeleteProcessedData: boolean;
}

export interface UserSettings {
  ai: AISettings;
  general: GeneralSettings;
  cache: CacheSettings;
  privacy: PrivacySettings;
  theme: "light" | "dark" | "auto";
}

// Default settings
export const DEFAULT_SETTINGS: UserSettings = {
  ai: {
    apiKey: "",
    model: "gpt-4o-mini",
    defaultTone: "neutral",
    enabledFeatures: {
      analyze: true,
      translate: true,
      explainContext: true,
      detectTone: true,
      generateReply: true,
      smartSuggestions: true,
    },
  },
  general: {
    outputLanguage: "en",
    messageLimit: 20,
    enableHoverButton: true,
    keyboardShortcuts: {
      analyze: "Alt+A",
      translate: "Alt+T",
      generateReply: "Alt+R",
      openChat: "Alt+S",
    },
  },
  cache: {
    retentionDays: 7,
    maxCacheSize: 50,
    maxStoriesPerChat: 10,
    autoCleanupEnabled: true,
  },
  privacy: {
    dataCollectionEnabled: false,
    excludedChats: [],
    autoDeleteProcessedData: false,
  },
  theme: "auto",
};

// ============================================
// Cache & Story Types
// ============================================

export interface CacheStatistics {
  totalSize: number; // in bytes
  chatCount: number;
  storyCount: number;
  hits: number;
  misses: number;
  lastCleanup: number; // timestamp
}

export interface StoryThread {
  id: string;
  chatId: string;
  title: string;
  summary: string;
  keyPoints: string[];
  participants: string[];
  messageCount: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  topics: string[];
}

export interface ChatCache {
  chatId: string;
  chatName: string;
  isGroup: boolean;
  stories: StoryThread[];
  lastAnalyzed: number;
  messageHashes: string[]; // To detect new messages
}

export interface ChatSummary {
  chatId: string;
  summary: string;
  keyTopics: string[];
  participants: string[];
  messageCount: number;
  lastUpdated: number;
}

export interface ChatSettings {
  chatId: string;
  customPrompt?: string;
  preferredTone?: ResponseTone;
  autoAnalyze: boolean;
  translationLanguage?: string;
}

export interface ChatContext {
  chatId: string;
  chatName: string;
  isGroup: boolean;
  settings: ChatSettings;
  summary: ChatSummary | null;
  stories: StoryThread[];
  lastAccessed: number;
}

// ============================================
// Message & Analysis Types
// ============================================

export interface AnalysisResult {
  type: "analyze" | "translate" | "explain" | "tone" | "reply";
  chatId: string;
  messageId: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ToneAnalysis {
  primary: string;
  confidence: number;
  emotions: Array<{ emotion: string; score: number }>;
  sentiment: "positive" | "negative" | "neutral";
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface ReplyOption {
  id: string;
  tone: ResponseTone;
  content: string;
  isSelected: boolean;
}

export interface ReplyGenerationResult {
  options: ReplyOption[];
  context: string;
  storyId?: string;
}

// ============================================
// API & Message Passing Types
// ============================================

export type MessageType =
  | "ANALYZE_MESSAGE"
  | "TRANSLATE_MESSAGE"
  | "EXPLAIN_CONTEXT"
  | "DETECT_TONE"
  | "GENERATE_REPLY"
  | "GENERATE_SUMMARY"
  | "GET_MESSAGES"
  | "GET_SETTINGS"
  | "SAVE_SETTINGS"
  | "GET_CACHE_STATS"
  | "CLEAR_CACHE"
  | "CLEAR_CHAT_CACHE"
  | "VALIDATE_API_KEY"
  | "GET_STORIES"
  | "REFRESH_STORY";

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload?: T;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// OpenAI API Types
export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
}

export interface OpenAIContentPart {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
}

export interface OpenAICompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAICompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================
// UI State Types
// ============================================

export interface ChatPanelState {
  isOpen: boolean;
  activeTab: "general" | "ai" | "cache" | "privacy";
}

export interface AIActionMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  messageId: string | null;
}

export interface ToastNotification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

// ============================================
// WhatsApp Theme Types
// ============================================

export type WhatsAppTheme = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  headerBg: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryHover: string;
  error: string;
  success: string;
}

export const THEME_COLORS: Record<WhatsAppTheme, ThemeColors> = {
  light: {
    background: "#f0f2f5",
    surface: "#ffffff",
    headerBg: "#f0f2f5",
    text: "#111b21",
    textSecondary: "#667781",
    border: "#e9edef",
    primary: "#00a884",
    primaryHover: "#008f72",
    error: "#ea0038",
    success: "#00a884",
  },
  dark: {
    background: "#111b21",
    surface: "#202c33",
    headerBg: "#202c33",
    text: "#e9edef",
    textSecondary: "#8696a0",
    border: "#222d34",
    primary: "#00a884",
    primaryHover: "#06cf9c",
    error: "#f15c6d",
    success: "#00a884",
  },
};
