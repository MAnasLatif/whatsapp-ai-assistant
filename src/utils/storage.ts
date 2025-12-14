/**
 * Storage utilities for WhatsApp AI Assistant
 * Handles settings persistence and cache management
 */

import { browser } from "wxt/browser";
import type {
  UserSettings,
  CacheStatistics,
  ChatCache,
  StoryThread,
  ChatContext,
  ChatSettings,
  ChatSummary,
  DEFAULT_SETTINGS,
} from "@/types";
import { DEFAULT_SETTINGS as defaultSettings } from "@/types";

// Storage keys
const STORAGE_KEYS = {
  SETTINGS: "wa_ai_settings",
  CACHE_STATS: "wa_ai_cache_stats",
  CHAT_CACHE_PREFIX: "wa_ai_chat_",
  CHAT_CONTEXT_PREFIX: "wa_ai_context_",
  CHAT_SETTINGS_PREFIX: "wa_ai_chat_settings_",
  CHAT_SUMMARY_PREFIX: "wa_ai_summary_",
} as const;

// ============================================
// Settings Storage
// ============================================

/**
 * Get user settings from storage
 */
export async function getSettings(): Promise<UserSettings> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.SETTINGS);
    const stored = result[STORAGE_KEYS.SETTINGS];

    if (!stored) {
      console.log("[Storage] No settings found, using defaults");
      return defaultSettings;
    }

    // Migration: Handle old outputLanguage field
    if (stored.general && "outputLanguage" in stored.general) {
      const oldLang = (stored.general as any).outputLanguage;
      if (!stored.general.replyLanguage) stored.general.replyLanguage = oldLang;
      if (!stored.general.analysisLanguage)
        stored.general.analysisLanguage = oldLang;
      if (!stored.general.translationLanguage)
        stored.general.translationLanguage = oldLang;
      delete (stored.general as any).outputLanguage;
      console.log(
        "[Storage] Migrated old outputLanguage to new language structure"
      );
    }

    console.log("[Storage] Settings loaded from storage");
    // Merge with defaults to handle new settings fields
    return deepMerge(defaultSettings, stored) as UserSettings;
  } catch (error) {
    console.error("[Storage] Failed to load settings:", error);
    return defaultSettings;
  }
}

/**
 * Save user settings to storage
 */
export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.SETTINGS]: settings,
    });
    console.log("[Storage] Settings saved successfully");
  } catch (error) {
    console.error("[Storage] Failed to save settings:", error);
    throw error;
  }
}

/**
 * Update partial settings
 */
export async function updateSettings(
  partial: Partial<UserSettings>
): Promise<UserSettings> {
  const current = await getSettings();
  const updated = deepMerge(current, partial) as UserSettings;
  await saveSettings(updated);
  return updated;
}

// ============================================
// Cache Statistics
// ============================================

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<CacheStatistics> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEYS.CACHE_STATS);
    return (
      result[STORAGE_KEYS.CACHE_STATS] || {
        totalSize: 0,
        chatCount: 0,
        storyCount: 0,
        hits: 0,
        misses: 0,
        lastCleanup: Date.now(),
      }
    );
  } catch (error) {
    console.error("Failed to load cache stats:", error);
    return {
      totalSize: 0,
      chatCount: 0,
      storyCount: 0,
      hits: 0,
      misses: 0,
      lastCleanup: Date.now(),
    };
  }
}

/**
 * Update cache statistics
 */
export async function updateCacheStats(
  stats: Partial<CacheStatistics>
): Promise<void> {
  const current = await getCacheStats();
  await browser.storage.local.set({
    [STORAGE_KEYS.CACHE_STATS]: { ...current, ...stats },
  });
}

/**
 * Increment cache hit counter
 */
export async function recordCacheHit(): Promise<void> {
  const stats = await getCacheStats();
  await updateCacheStats({ hits: stats.hits + 1 });
}

/**
 * Increment cache miss counter
 */
export async function recordCacheMiss(): Promise<void> {
  const stats = await getCacheStats();
  await updateCacheStats({ misses: stats.misses + 1 });
}

// ============================================
// Chat Cache Storage
// ============================================

/**
 * Get cache key for a chat
 */
function getChatCacheKey(chatId: string): string {
  return `${STORAGE_KEYS.CHAT_CACHE_PREFIX}${chatId}`;
}

/**
 * Get cached data for a specific chat
 */
export async function getChatCache(chatId: string): Promise<ChatCache | null> {
  try {
    const key = getChatCacheKey(chatId);
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  } catch (error) {
    console.error(`Failed to load cache for chat ${chatId}:`, error);
    return null;
  }
}

/**
 * Save chat cache data
 */
export async function saveChatCache(cache: ChatCache): Promise<void> {
  try {
    const key = getChatCacheKey(cache.chatId);
    await browser.storage.local.set({ [key]: cache });

    // Update stats
    await recalculateCacheStats();
  } catch (error) {
    console.error(`Failed to save cache for chat ${cache.chatId}:`, error);
    throw error;
  }
}

/**
 * Clear cache for a specific chat
 */
export async function clearChatCache(chatId: string): Promise<void> {
  try {
    const key = getChatCacheKey(chatId);
    await browser.storage.local.remove(key);
    await recalculateCacheStats();
  } catch (error) {
    console.error(`Failed to clear cache for chat ${chatId}:`, error);
    throw error;
  }
}

/**
 * Get all cached chats
 */
export async function getAllChatCaches(): Promise<ChatCache[]> {
  try {
    const all = await browser.storage.local.get(null);
    const caches: ChatCache[] = [];

    for (const [key, value] of Object.entries(all)) {
      if (key.startsWith(STORAGE_KEYS.CHAT_CACHE_PREFIX)) {
        caches.push(value as ChatCache);
      }
    }

    return caches;
  } catch (error) {
    console.error("Failed to get all chat caches:", error);
    return [];
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
  try {
    const all = await browser.storage.local.get(null);
    const keysToRemove: string[] = [];

    for (const key of Object.keys(all)) {
      if (key.startsWith(STORAGE_KEYS.CHAT_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    if (keysToRemove.length > 0) {
      await browser.storage.local.remove(keysToRemove);
    }

    // Reset cache stats
    await updateCacheStats({
      totalSize: 0,
      chatCount: 0,
      storyCount: 0,
      lastCleanup: Date.now(),
    });
  } catch (error) {
    console.error("Failed to clear all cache:", error);
    throw error;
  }
}

// ============================================
// Story Management
// ============================================

/**
 * Add or update a story thread in a chat cache
 */
export async function saveStory(
  chatId: string,
  story: StoryThread
): Promise<void> {
  let cache = await getChatCache(chatId);

  if (!cache) {
    cache = {
      chatId,
      chatName: "",
      isGroup: false,
      stories: [],
      lastAnalyzed: Date.now(),
      messageHashes: [],
    };
  }

  const existingIndex = cache.stories.findIndex((s) => s.id === story.id);
  if (existingIndex >= 0) {
    cache.stories[existingIndex] = story;
  } else {
    cache.stories.push(story);
  }

  // Enforce max stories per chat
  const settings = await getSettings();
  if (cache.stories.length > settings.cache.maxStoriesPerChat) {
    // Remove oldest inactive stories first
    cache.stories.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
    cache.stories = cache.stories.slice(0, settings.cache.maxStoriesPerChat);
  }

  await saveChatCache(cache);
}

/**
 * Get stories for a chat
 */
export async function getStories(chatId: string): Promise<StoryThread[]> {
  const cache = await getChatCache(chatId);
  return cache?.stories || [];
}

/**
 * Delete a specific story
 */
export async function deleteStory(
  chatId: string,
  storyId: string
): Promise<void> {
  const cache = await getChatCache(chatId);
  if (!cache) return;

  cache.stories = cache.stories.filter((s) => s.id !== storyId);
  await saveChatCache(cache);
}

// ============================================
// Cache Cleanup
// ============================================

/**
 * Recalculate cache statistics
 */
export async function recalculateCacheStats(): Promise<CacheStatistics> {
  const caches = await getAllChatCaches();

  let totalSize = 0;
  let storyCount = 0;

  for (const cache of caches) {
    totalSize += JSON.stringify(cache).length;
    storyCount += cache.stories.length;
  }

  const stats: CacheStatistics = {
    totalSize,
    chatCount: caches.length,
    storyCount,
    hits: (await getCacheStats()).hits,
    misses: (await getCacheStats()).misses,
    lastCleanup: Date.now(),
  };

  await browser.storage.local.set({
    [STORAGE_KEYS.CACHE_STATS]: stats,
  });

  return stats;
}

/**
 * Perform automatic cache cleanup based on settings
 */
export async function performCacheCleanup(): Promise<void> {
  const settings = await getSettings();
  if (!settings.cache.autoCleanupEnabled) return;

  const caches = await getAllChatCaches();
  const now = Date.now();
  const retentionMs = settings.cache.retentionDays * 24 * 60 * 60 * 1000;

  for (const cache of caches) {
    // Remove old stories
    const oldStories = cache.stories.filter(
      (s) => now - s.updatedAt > retentionMs && !s.isActive
    );

    if (oldStories.length > 0) {
      cache.stories = cache.stories.filter(
        (s) => !oldStories.find((os) => os.id === s.id)
      );
      await saveChatCache(cache);
    }

    // Remove entire cache if empty and old
    if (cache.stories.length === 0 && now - cache.lastAnalyzed > retentionMs) {
      await clearChatCache(cache.chatId);
    }
  }

  // Check total cache size
  const stats = await recalculateCacheStats();
  const maxSizeBytes = settings.cache.maxCacheSize * 1024 * 1024;

  if (stats.totalSize > maxSizeBytes) {
    // Remove oldest caches until under limit
    const sortedCaches = caches.sort((a, b) => a.lastAnalyzed - b.lastAnalyzed);

    for (const cache of sortedCaches) {
      if (stats.totalSize <= maxSizeBytes) break;
      const cacheSize = JSON.stringify(cache).length;
      await clearChatCache(cache.chatId);
      stats.totalSize -= cacheSize;
    }
  }

  await updateCacheStats({ lastCleanup: Date.now() });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Deep merge two objects
 */
function deepMerge(target: unknown, source: unknown): unknown {
  if (
    typeof target !== "object" ||
    target === null ||
    typeof source !== "object" ||
    source === null
  ) {
    return source;
  }

  const output = { ...(target as Record<string, unknown>) };
  const sourceObj = source as Record<string, unknown>;

  for (const key of Object.keys(sourceObj)) {
    if (
      typeof sourceObj[key] === "object" &&
      sourceObj[key] !== null &&
      !Array.isArray(sourceObj[key])
    ) {
      output[key] = deepMerge(
        (target as Record<string, unknown>)[key],
        sourceObj[key]
      );
    } else {
      output[key] = sourceObj[key];
    }
  }

  return output;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================
// Per-Chat Context Functions
// ============================================

/**
 * Get per-chat settings
 */
export async function getChatSettings(chatId: string): Promise<ChatSettings> {
  try {
    const key = `${STORAGE_KEYS.CHAT_SETTINGS_PREFIX}${chatId}`;
    const result = await browser.storage.local.get(key);
    return (
      result[key] || {
        chatId,
        autoAnalyze: true,
      }
    );
  } catch (error) {
    console.error(`Failed to load settings for chat ${chatId}:`, error);
    return { chatId, autoAnalyze: true };
  }
}

/**
 * Save per-chat settings
 */
export async function saveChatSettings(settings: ChatSettings): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.CHAT_SETTINGS_PREFIX}${settings.chatId}`;
    await browser.storage.local.set({ [key]: settings });
  } catch (error) {
    console.error(
      `Failed to save settings for chat ${settings.chatId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get chat summary
 */
export async function getChatSummary(
  chatId: string
): Promise<ChatSummary | null> {
  try {
    const key = `${STORAGE_KEYS.CHAT_SUMMARY_PREFIX}${chatId}`;
    const result = await browser.storage.local.get(key);
    return result[key] || null;
  } catch (error) {
    console.error(`Failed to load summary for chat ${chatId}:`, error);
    return null;
  }
}

/**
 * Save chat summary
 */
export async function saveChatSummary(summary: ChatSummary): Promise<void> {
  try {
    const key = `${STORAGE_KEYS.CHAT_SUMMARY_PREFIX}${summary.chatId}`;
    await browser.storage.local.set({ [key]: summary });
  } catch (error) {
    console.error(`Failed to save summary for chat ${summary.chatId}:`, error);
    throw error;
  }
}

/**
 * Get complete chat context (settings, summary, stories)
 */
export async function getChatContext(
  chatId: string,
  chatName: string = "",
  isGroup: boolean = false
): Promise<ChatContext> {
  const [settings, summary, cache] = await Promise.all([
    getChatSettings(chatId),
    getChatSummary(chatId),
    getChatCache(chatId),
  ]);

  return {
    chatId,
    chatName: cache?.chatName || chatName,
    isGroup: cache?.isGroup ?? isGroup,
    settings,
    summary,
    stories: cache?.stories || [],
    lastAccessed: Date.now(),
  };
}

/**
 * Clear all data for a specific chat
 */
export async function clearChatData(chatId: string): Promise<void> {
  const keysToRemove = [
    `${STORAGE_KEYS.CHAT_CACHE_PREFIX}${chatId}`,
    `${STORAGE_KEYS.CHAT_SETTINGS_PREFIX}${chatId}`,
    `${STORAGE_KEYS.CHAT_SUMMARY_PREFIX}${chatId}`,
  ];

  await browser.storage.local.remove(keysToRemove);
  await recalculateCacheStats();
}
