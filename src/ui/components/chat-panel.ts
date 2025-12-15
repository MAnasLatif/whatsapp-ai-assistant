/**
 * Chat Panel Component - Chat-Specific Details
 * Shows per-chat story threads and settings
 * Global settings moved to extension popup
 */

import { browser } from "wxt/browser";
import type {
  WhatsAppTheme,
  ChatContext,
  ChatSettings,
  StoryThread,
} from "@/types";
import { LANGUAGE_OPTIONS } from "@/types";
import { DOMComponents } from "@/utils/dom-components";
import { Icons } from "@/utils/icons";
import {
  getChatContext,
  saveChatSettings,
  getStories,
  deleteStory,
  clearChatData,
} from "@/utils/storage";

type TabId = "stories" | "settings";

export class ChatPanel {
  private panel: HTMLElement | null = null;
  private theme: WhatsAppTheme;
  private activeTab: TabId = "stories";
  private chatContext: ChatContext | null = null;
  private chatId: string;
  private chatName: string;
  private isGroup: boolean;

  constructor(
    theme: WhatsAppTheme,
    chatId: string,
    chatName: string = "",
    isGroup: boolean = false
  ) {
    this.theme = theme;
    this.chatId = chatId;
    this.chatName = chatName;
    this.isGroup = isGroup;
  }

  private createElement(): HTMLElement {
    const panel = document.createElement("div");
    panel.className = DOMComponents.chatPanel.substring(1); // Remove . prefix

    panel.innerHTML = `
      <!-- Tabs -->
      <div class="wa-ai-chat-tabs">
        <button class="wa-ai-tab-btn active" data-tab="stories">Stories (${
          this.chatContext?.stories.length || 0
        })</button>
        <button class="wa-ai-tab-btn" data-tab="settings">Settings</button>
        <button class="wa-ai-back-btn" aria-label="Close">
          ${Icons.close}
        </button>
      </div>

      <!-- Content -->
      <div class="wa-ai-chat-content">
        ${this.renderTabContent("stories")}
      </div>
    `;

    // Setup event listeners
    const closeBtn = panel.querySelector(".wa-ai-back-btn");
    closeBtn?.addEventListener("click", () => this.hide());

    const tabBtns = panel.querySelectorAll(DOMComponents.chatTabBtn);
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = (e.target as HTMLElement).dataset.tab as TabId;
        this.switchTab(tab, panel);
      });
    });

    // Setup tab content listeners (for initial tab)
    this.setupTabListeners(panel);

    return panel;
  }

  private switchTab(tab: TabId, panel: HTMLElement): void {
    this.activeTab = tab;

    // Update tab buttons
    const tabBtns = panel.querySelectorAll(DOMComponents.chatTabBtn);
    tabBtns.forEach((btn) => {
      btn.classList.toggle("active", (btn as HTMLElement).dataset.tab === tab);
    });

    // Update content
    const content = panel.querySelector(DOMComponents.chatContent);
    if (content) {
      content.innerHTML = this.renderTabContent(tab);
      this.setupTabListeners(panel);
    }
  }

  private renderTabContent(tab: TabId): string {
    switch (tab) {
      case "stories":
        return this.renderStoriesTab();
      case "settings":
        return this.renderSettingsTab();
      default:
        return "";
    }
  }

  private renderStoriesTab(): string {
    const stories = this.chatContext?.stories || [];

    return `
      <div class="wa-ai-info-banner">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <div>
          <strong>Story Threads</strong>
          <p>Conversation story threads help AI understand context. Each thread represents a distinct topic.</p>
        </div>
      </div>

      <div class="wa-ai-stories-list" id="wa-ai-stories-list">
        ${this.renderStoriesList(stories)}
      </div>

      <div style="margin-top: 20px;">
        <button class="wa-ai-btn wa-ai-btn-secondary" id="wa-ai-refresh-stories">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="margin-right: 6px;">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Refresh Stories
        </button>
      </div>
    `;
  }

  private renderStoriesList(stories: StoryThread[]): string {
    if (stories.length === 0) {
      return `
        <div class="wa-ai-empty-state">
          ${Icons.story}
          <p>No story threads yet</p>
          <span>Stories will appear as you chat and use AI features</span>
        </div>
      `;
    }

    return stories
      .map((story) => {
        const lastUpdate = new Date(story.updatedAt).toLocaleString();
        const statusClass = story.isActive ? "active" : "inactive";

        return `
          <div class="wa-ai-story-item">
            <div class="wa-ai-story-status ${statusClass}"></div>
            <div class="wa-ai-story-info">
              <div class="wa-ai-story-title">${story.title}</div>
              <div class="wa-ai-story-summary">${story.summary}</div>
              ${
                story.keyPoints.length > 0
                  ? `
                <div class="wa-ai-story-points">
                  ${story.keyPoints
                    .slice(0, 3)
                    .map((point) => `• ${point}`)
                    .join(" ")}
                </div>
              `
                  : ""
              }
              <div class="wa-ai-story-meta">
                ${story.messageCount} messages • ${lastUpdate}
                ${
                  story.topics.length > 0 ? ` • ${story.topics.join(", ")}` : ""
                }
              </div>
            </div>
            <button class="wa-ai-btn wa-ai-btn-icon" data-story="${
              story.id
            }" title="Delete story">
              ${Icons.delete}
            </button>
          </div>
        `;
      })
      .join("");
  }

  private renderSettingsTab(): string {
    const settings = this.chatContext?.settings;

    return `
    <div class="wa-ai-form-groups">
      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Custom Prompt (Optional)</label>
        <textarea 
          class="wa-ai-textarea" 
          id="wa-ai-custom-prompt"
          rows="3"
          placeholder="Add custom instructions for AI when analyzing this chat..."
        >${settings?.customPrompt || ""}</textarea>
        <div class="wa-ai-input-description">Custom instructions will be used alongside global AI settings</div>
      </div>
      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Preferred Tone</label>
        <select class="wa-ai-select" id="wa-ai-preferred-tone">
          <option value="">Use Global Setting</option>
          <option value="neutral" ${
            settings?.preferredTone === "neutral" ? "selected" : ""
          }>Neutral</option>
          <option value="friendly" ${
            settings?.preferredTone === "friendly" ? "selected" : ""
          }>Friendly</option>
          <option value="professional" ${
            settings?.preferredTone === "professional" ? "selected" : ""
          }>Professional</option>
          <option value="casual" ${
            settings?.preferredTone === "casual" ? "selected" : ""
          }>Casual</option>
        </select>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Reply Generation Language</label>
        <select class="wa-ai-select" id="wa-ai-reply-lang">
          <option value="">Use Global Setting</option>
          ${LANGUAGE_OPTIONS.map(
            (lang) => `
            <option value="${lang.code}" ${
              settings?.replyLanguage === lang.code ? "selected" : ""
            }>${lang.name}</option>
          `
          ).join("")}
        </select>
        <div class="wa-ai-input-description">Language for AI-generated reply suggestions in this chat</div>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Analysis & Story Language</label>
        <select class="wa-ai-select" id="wa-ai-analysis-lang">
          <option value="">Use Global Setting</option>
          ${LANGUAGE_OPTIONS.map(
            (lang) => `
            <option value="${lang.code}" ${
              settings?.analysisLanguage === lang.code ? "selected" : ""
            }>${lang.name}</option>
          `
          ).join("")}
        </select>
        <div class="wa-ai-input-description">Language for message analysis and context stories in this chat</div>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Translation Language</label>
        <select class="wa-ai-select" id="wa-ai-translation-lang">
          <option value="">Use Global Setting</option>
          ${LANGUAGE_OPTIONS.map(
            (lang) => `
            <option value="${lang.code}" ${
              settings?.translationLanguage === lang.code ? "selected" : ""
            }>${lang.name}</option>
          `
          ).join("")}
        </select>
        <div class="wa-ai-input-description">Default target language for translations in this chat</div>
      </div>
    </div>
    <div style="margin-top: 24px; display: flex; gap: 12px;">
      <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-save-settings">Save Settings</button>
      <button class="wa-ai-btn wa-ai-btn-danger" id="wa-ai-clear-chat-data">Clear Chat Data</button>
    </div>
    `;
  }

  private setupTabListeners(panel: HTMLElement): void {
    // Toggle switches
    panel.querySelectorAll(DOMComponents.chatSwitch).forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
      });
    });

    // Save settings button
    const saveSettings = panel.querySelector(DOMComponents.saveSettings);
    saveSettings?.addEventListener("click", () => this.saveChatSettings(panel));

    // Clear chat data button
    const clearData = panel.querySelector(DOMComponents.clearChatData);
    clearData?.addEventListener("click", () => this.handleClearChatData(panel));

    // Refresh stories button
    const refreshStories = panel.querySelector(DOMComponents.refreshStories);
    refreshStories?.addEventListener("click", () => this.refreshStories(panel));

    // Delete story buttons
    panel.querySelectorAll(DOMComponents.dataStory).forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const storyId = (e.currentTarget as HTMLElement).dataset.story;
        if (storyId) this.handleDeleteStory(storyId, panel);
      });
    });
  }

  private async saveChatSettings(panel: HTMLElement): Promise<void> {
    const customPrompt =
      (panel.querySelector(DOMComponents.customPrompt) as HTMLTextAreaElement)
        ?.value || "";
    const preferredTone =
      (panel.querySelector(DOMComponents.preferredTone) as HTMLSelectElement)
        ?.value || undefined;
    const replyLanguage =
      (panel.querySelector("#wa-ai-reply-lang") as HTMLSelectElement)?.value ||
      undefined;
    const analysisLanguage =
      (panel.querySelector("#wa-ai-analysis-lang") as HTMLSelectElement)
        ?.value || undefined;
    const translationLanguage =
      (panel.querySelector(DOMComponents.translationLang) as HTMLSelectElement)
        ?.value || undefined;

    const settings: ChatSettings = {
      chatId: this.chatId,
      customPrompt: customPrompt || undefined,
      preferredTone: preferredTone as any,
      replyLanguage: replyLanguage || undefined,
      analysisLanguage: analysisLanguage || undefined,
      translationLanguage: translationLanguage || undefined,
    };

    await saveChatSettings(settings);

    if (this.chatContext) {
      this.chatContext.settings = settings;
    }

    this.showSaveSuccess(panel);
  }

  private async handleClearChatData(panel: HTMLElement): Promise<void> {
    if (
      confirm(
        "Are you sure you want to clear all data for this chat? This cannot be undone."
      )
    ) {
      await clearChatData(this.chatId);
      this.chatContext = await getChatContext(
        this.chatId,
        this.chatName,
        this.isGroup
      );
      this.switchTab(
        "stories",
        panel.closest(DOMComponents.chatPanel) as HTMLElement
      );
    }
  }

  private async refreshStories(panel: HTMLElement): Promise<void> {
    // Reload stories from storage
    this.chatContext = await getChatContext(
      this.chatId,
      this.chatName,
      this.isGroup
    );

    const storiesList = panel.querySelector(DOMComponents.storiesList);
    if (storiesList) {
      storiesList.innerHTML = this.renderStoriesList(this.chatContext.stories);
      this.setupTabListeners(panel);
    }
  }

  private async handleDeleteStory(
    storyId: string,
    panel: HTMLElement
  ): Promise<void> {
    if (confirm("Are you sure you want to delete this story thread?")) {
      await deleteStory(this.chatId, storyId);
      await this.refreshStories(panel);
    }
  }

  private showSaveSuccess(panel: HTMLElement): void {
    const btn = panel.querySelector(
      ".wa-ai-btn-primary:focus, .wa-ai-btn-primary"
    ) as HTMLButtonElement;
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = "✓ Saved!";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1500);
    }
  }

  updateTheme(theme: WhatsAppTheme): void {
    this.theme = theme;
  }

  async show(): Promise<void> {
    // Load chat context
    this.chatContext = await getChatContext(
      this.chatId,
      this.chatName,
      this.isGroup
    );

    this.panel = this.createElement();
    document.querySelector(DOMComponents.side)?.appendChild(this.panel);

    // Trigger animation
    requestAnimationFrame(() => {
      this.panel?.classList.add("active");
    });
  }

  hide(): void {
    this.panel?.classList.remove("active");

    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
    }, 300);
  }
}
