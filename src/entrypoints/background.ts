/**
 * WhatsApp AI Assistant - Background Service Worker
 * Manages OpenAI API calls, caching, and cross-component communication
 */

import {
  getSettings,
  saveSettings,
  getCacheStats,
  clearAllCache,
  clearChatCache,
  getStories,
  performCacheCleanup,
  getChatSettings,
} from "@/utils/storage";
import type {
  ExtensionMessage,
  ExtensionResponse,
  UserSettings,
  OpenAICompletionRequest,
  OpenAICompletionResponse,
} from "@/types";
import type { MessageData } from "@/utils/whatsapp-dom";

// Import storage debug tools in dev mode
if (import.meta.env.DEV) {
  import("@/utils/storage-debug");
}

// API Configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_RETRIES = 2;

export default defineBackground(() => {
  console.log("[WhatsApp AI Assistant] Background worker started");
  console.log("[WhatsApp AI Assistant] Dev mode:", import.meta.env.DEV);

  // Listen for messages from content script
  browser.runtime.onMessage.addListener(
    (message: ExtensionMessage, sender, sendResponse) => {
      handleMessage(message)
        .then(sendResponse)
        .catch((error) => {
          console.error("[Background] Error handling message:", error);
          sendResponse({ success: false, error: error.message });
        });

      return true; // Async response
    }
  );

  // Periodic cache cleanup
  setInterval(async () => {
    try {
      await performCacheCleanup();
    } catch (error) {
      console.error("[Background] Cache cleanup failed:", error);
    }
  }, 60 * 60 * 1000); // Every hour
});

/**
 * Handle incoming messages from content script
 */
async function handleMessage(
  message: ExtensionMessage
): Promise<ExtensionResponse> {
  const { type, payload } = message;

  switch (type) {
    case "GET_SETTINGS":
      return { success: true, data: await getSettings() };

    case "SAVE_SETTINGS":
      await saveSettings(payload as UserSettings);
      return { success: true };

    case "GET_CACHE_STATS":
      return { success: true, data: await getCacheStats() };

    case "CLEAR_CACHE":
      await clearAllCache();
      return { success: true };

    case "CLEAR_CHAT_CACHE":
      await clearChatCache((payload as { chatId: string }).chatId);
      return { success: true };

    case "GET_STORIES":
      return {
        success: true,
        data: await getStories((payload as { chatId: string }).chatId),
      };

    case "VALIDATE_API_KEY":
      return await validateAPIKey((payload as { apiKey: string }).apiKey);

    case "ANALYZE_MESSAGE":
      return await analyzeMessage(
        payload as { messageData: MessageData; chatId: string }
      );

    case "TRANSLATE_MESSAGE":
      return await translateMessage(
        payload as {
          messageData: MessageData;
          targetLanguage?: string;
          chatId?: string;
        }
      );

    case "EXPLAIN_CONTEXT":
      return await explainContext(
        payload as { messageData: MessageData; chatId: string }
      );

    case "DETECT_TONE":
      return await detectTone(payload as { messageData: MessageData });

    case "GENERATE_REPLY":
      return await generateReply(
        payload as { messageData: MessageData; chatId: string }
      );

    default:
      return { success: false, error: `Unknown message type: ${type}` };
  }
}

/**
 * Validate OpenAI API key
 */
async function validateAPIKey(apiKey: string): Promise<ExtensionResponse> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return {
        success: false,
        error: error.error?.message || "Invalid API key",
      };
    }
  } catch (error) {
    return { success: false, error: "Failed to validate API key" };
  }
}

/**
 * Make OpenAI API call with retry logic
 */
async function callOpenAI(
  request: OpenAICompletionRequest,
  apiKey: string,
  retries: number = 0
): Promise<OpenAICompletionResponse> {
  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * (retries + 1)));
      return callOpenAI(request, apiKey, retries + 1);
    }
    throw error;
  }
}

/**
 * Analyze a message
 */
async function analyzeMessage(payload: {
  messageData: MessageData;
  chatId: string;
}): Promise<ExtensionResponse> {
  const settings = await getSettings();
  const chatSettings = await getChatSettings(payload.chatId);

  if (!settings.ai.apiKey) {
    return { success: false, error: "API key not configured" };
  }

  const { messageData } = payload;
  const analysisLang =
    chatSettings.analysisLanguage || settings.general.analysisLanguage;
  const systemPrompt = `You are an AI assistant analyzing WhatsApp messages. Provide a concise analysis of the message including:
1. Key points or main topic
2. Any implied meaning or context
3. Suggested response considerations

Respond in ${
    analysisLang === "en"
      ? "English"
      : analysisLang === "ur-roman"
      ? "Roman Urdu (Urdu written in Latin script)"
      : analysisLang
  }.
Keep your response brief and actionable.`;

  try {
    const response = await callOpenAI(
      {
        model: settings.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analyze this message:\n\nFrom: ${messageData.sender}\nContent: ${messageData.content}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      settings.ai.apiKey
    );

    return {
      success: true,
      data: {
        content:
          response.choices[0]?.message?.content || "No analysis available",
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Translate a message
 */
async function translateMessage(payload: {
  messageData: MessageData;
  targetLanguage?: string;
  chatId?: string;
}): Promise<ExtensionResponse> {
  const settings = await getSettings();
  const chatSettings = payload.chatId
    ? await getChatSettings(payload.chatId)
    : null;

  if (!settings.ai.apiKey) {
    return { success: false, error: "API key not configured" };
  }

  const targetLang =
    payload.targetLanguage ||
    chatSettings?.translationLanguage ||
    settings.general.translationLanguage;
  const targetLangName =
    targetLang === "ur-roman"
      ? "Roman Urdu (Urdu written in Latin script)"
      : targetLang;

  const systemPrompt = `You are a translator. Translate the following message to ${targetLangName}. 
Only provide the translation, no explanations.
If the message is already in the target language, indicate that.`;

  try {
    const response = await callOpenAI(
      {
        model: settings.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: payload.messageData.content },
        ],
        temperature: 0.3,
        max_tokens: 500,
      },
      settings.ai.apiKey
    );

    return {
      success: true,
      data: {
        originalText: payload.messageData.content,
        translatedText: response.choices[0]?.message?.content || "",
        targetLanguage: targetLang,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Explain context of a message
 */
async function explainContext(payload: {
  messageData: MessageData;
  chatId: string;
}): Promise<ExtensionResponse> {
  const settings = await getSettings();
  const chatSettings = await getChatSettings(payload.chatId);

  if (!settings.ai.apiKey) {
    return { success: false, error: "API key not configured" };
  }

  const analysisLang =
    chatSettings.analysisLanguage || settings.general.analysisLanguage;
  const systemPrompt = `You are an AI assistant helping understand message context. Explain:
1. What the message likely refers to
2. Any cultural or contextual references
3. The implied meaning or subtext

Respond in ${
    analysisLang === "en"
      ? "English"
      : analysisLang === "ur-roman"
      ? "Roman Urdu (Urdu written in Latin script)"
      : analysisLang
  }.
Be concise and helpful.`;

  try {
    const response = await callOpenAI(
      {
        model: settings.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Explain the context of this message:\n\nFrom: ${payload.messageData.sender}\nContent: ${payload.messageData.content}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      settings.ai.apiKey
    );

    return {
      success: true,
      data: {
        content:
          response.choices[0]?.message?.content || "No explanation available",
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Detect tone and sentiment of a message
 */
async function detectTone(payload: {
  messageData: MessageData;
}): Promise<ExtensionResponse> {
  const settings = await getSettings();

  if (!settings.ai.apiKey) {
    return { success: false, error: "API key not configured" };
  }

  const systemPrompt = `Analyze the emotional tone and sentiment of this message. Return a JSON object with:
{
  "primary": "main emotional tone (e.g., happy, frustrated, neutral, excited, concerned)",
  "confidence": 0.0-1.0,
  "sentiment": "positive|negative|neutral",
  "emotions": [
    {"emotion": "name", "score": 0.0-1.0}
  ]
}
Only return valid JSON, no other text.`;

  try {
    const response = await callOpenAI(
      {
        model: settings.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: payload.messageData.content },
        ],
        temperature: 0.3,
        max_tokens: 300,
      },
      settings.ai.apiKey
    );

    const content = response.choices[0]?.message?.content || "{}";

    // Parse JSON response
    try {
      const toneData = JSON.parse(content);
      return { success: true, data: toneData };
    } catch {
      return {
        success: true,
        data: {
          primary: "unknown",
          confidence: 0,
          sentiment: "neutral",
          emotions: [],
        },
      };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Generate reply suggestions
 */
async function generateReply(payload: {
  messageData: MessageData;
  chatId: string;
}): Promise<ExtensionResponse> {
  const settings = await getSettings();
  const chatSettings = await getChatSettings(payload.chatId);

  if (!settings.ai.apiKey) {
    return { success: false, error: "API key not configured" };
  }

  const tones = ["neutral", "friendly", "professional"];
  const { messageData } = payload;
  const replyLang =
    chatSettings.replyLanguage || settings.general.replyLanguage;

  const systemPrompt = `Generate 3 different reply options to this WhatsApp message, each with a different tone.
Return a JSON array with exactly 3 objects:
[
  {"tone": "neutral", "content": "reply text"},
  {"tone": "friendly", "content": "reply text"},
  {"tone": "professional", "content": "reply text"}
]

Guidelines:
- Keep replies concise and natural
- Match typical WhatsApp messaging style
- Respond in ${
    replyLang === "en"
      ? "English"
      : replyLang === "ur-roman"
      ? "Roman Urdu (Urdu written in Latin script)"
      : replyLang
  }
- Only return valid JSON array, no other text`;

  try {
    const response = await callOpenAI(
      {
        model: settings.ai.model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Message from ${messageData.sender}: ${messageData.content}`,
          },
        ],
        temperature: 0.8,
        max_tokens: 600,
      },
      settings.ai.apiKey
    );

    const content = response.choices[0]?.message?.content || "[]";

    try {
      const options = JSON.parse(content);
      return {
        success: true,
        data: {
          options: options.map(
            (opt: { tone: string; content: string }, i: number) => ({
              id: `reply-${i}`,
              tone: opt.tone,
              content: opt.content,
              isSelected: i === 0,
            })
          ),
          context: messageData.content,
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to parse reply options",
      };
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
