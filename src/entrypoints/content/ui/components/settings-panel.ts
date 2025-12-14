/**
 * Settings Panel Component - Chat-Specific Settings
 * Shows per-chat settings, summary, and story threads
 * Global settings moved to extension popup
 */

import { browser } from "wxt/browser";
import type {
  WhatsAppTheme,
  ChatContext,
  ChatSettings,
  StoryThread,
} from "@/types";
import { DOMComponents } from "@/utils/dom-components";
import {
  getChatContext,
  saveChatSettings,
  saveChatSummary,
  getStories,
  deleteStory,
  clearChatData,
} from "@/utils/storage";

type TabId = "summary" | "stories" | "settings";

export class SettingsPanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private theme: WhatsAppTheme;
  private onClose: () => void;
  private activeTab: TabId = "summary";
  private chatContext: ChatContext | null = null;
  private chatId: string;
  private chatName: string;
  private isGroup: boolean;

  constructor(
    container: HTMLElement,
    theme: WhatsAppTheme,
    chatId: string,
    chatName: string = "",
    isGroup: boolean = false,
    onClose: () => void
  ) {
    this.container = container;
    this.theme = theme;
    this.chatId = chatId;
    this.chatName = chatName;
    this.isGroup = isGroup;
    this.onClose = onClose;
  }

  async show(): Promise<void> {
    // Load chat context
    this.chatContext = await getChatContext(
      this.chatId,
      this.chatName,
      this.isGroup
    );

    this.panelElement = this.createElement();
    this.container.appendChild(this.panelElement);

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  hide(): void {
    if (this.panelElement) {
      this.panelElement.remove();
      this.panelElement = null;
    }
    document.body.style.overflow = "";
    this.onClose();
  }

  private createElement(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.className = DOMComponents.settingsOverlay.substring(1); // Remove . prefix
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.hide();
    });

    const panel = document.createElement("div");
    panel.className = DOMComponents.settingsPanel.substring(1); // Remove . prefix
    panel.innerHTML = `
      <div class="wa-ai-settings-header">
        <div>
          <h2 class="wa-ai-settings-title">${
            this.chatContext?.chatName || "Chat Settings"
          }</h2>
          <p class="wa-ai-settings-subtitle">${
            this.isGroup ? "Group Chat" : "Private Chat"
          } • ${this.chatId.split("@")[0]}</p>
        </div>
        <button class="wa-ai-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      <div class="wa-ai-settings-info">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <span>For global AI settings, click the extension icon in toolbar</span>
      </div>
      <div class="wa-ai-settings-tabs">
        <button class="wa-ai-tab-btn active" data-tab="summary">Summary</button>
        <button class="wa-ai-tab-btn" data-tab="stories">Stories (${
          this.chatContext?.stories.length || 0
        })</button>
        <button class="wa-ai-tab-btn" data-tab="settings">Settings</button>
      </div>
      <div class="wa-ai-settings-content">
        ${this.renderTabContent("summary")}
      </div>
    `;

    // Setup event listeners
    const closeBtn = panel.querySelector(DOMComponents.settingsCloseBtn);
    closeBtn?.addEventListener("click", () => this.hide());

    const tabBtns = panel.querySelectorAll(DOMComponents.settingsTabBtn);
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = (e.target as HTMLElement).dataset.tab as TabId;
        this.switchTab(tab, panel);
      });
    });

    // Setup tab content listeners (for initial tab)
    this.setupTabListeners(panel);

    overlay.appendChild(panel);
    return overlay;
  }

  private switchTab(tab: TabId, panel: HTMLElement): void {
    this.activeTab = tab;

    // Update tab buttons
    const tabBtns = panel.querySelectorAll(DOMComponents.settingsTabBtn);
    tabBtns.forEach((btn) => {
      btn.classList.toggle("active", (btn as HTMLElement).dataset.tab === tab);
    });

    // Update content
    const content = panel.querySelector(DOMComponents.settingsContent);
    if (content) {
      content.innerHTML = this.renderTabContent(tab);
      this.setupTabListeners(panel);
    }
  }

  private renderTabContent(tab: TabId): string {
    switch (tab) {
      case "summary":
        return this.renderSummaryTab();
      case "stories":
        return this.renderStoriesTab();
      case "settings":
        return this.renderSettingsTab();
      default:
        return "";
    }
  }

  private renderSummaryTab(): string {
    const summary = this.chatContext?.summary;

    if (!summary) {
      return `
        <div class="wa-ai-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <p>No summary yet</p>
          <span>Use AI features to generate a conversation summary</span>
          <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-generate-summary" style="margin-top: 16px;">
            Generate Summary
          </button>
        </div>
      `;
    }

    const lastUpdated = new Date(summary.lastUpdated).toLocaleString();

    return `
      <div class="wa-ai-summary-container">
        <div class="wa-ai-summary-header">
          <div>
            <h3>Conversation Summary</h3>
            <p class="wa-ai-summary-meta">${
              summary.messageCount
            } messages • Last updated: ${lastUpdated}</p>
          </div>
          <button class="wa-ai-btn wa-ai-btn-secondary" id="wa-ai-refresh-summary">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>

        <div class="wa-ai-summary-content">
          <p>${summary.summary}</p>
        </div>

        ${
          summary.keyTopics.length > 0
            ? `
          <div class="wa-ai-summary-section">
            <h4>Key Topics</h4>
            <div class="wa-ai-tags">
              ${summary.keyTopics
                .map((topic) => `<span class="wa-ai-tag">${topic}</span>`)
                .join("")}
            </div>
          </div>
        `
            : ""
        }

        ${
          summary.participants.length > 0
            ? `
          <div class="wa-ai-summary-section">
            <h4>Participants</h4>
            <div class="wa-ai-tags">
              ${summary.participants
                .map((p) => `<span class="wa-ai-tag">${p}</span>`)
                .join("")}
            </div>
          </div>
        `
            : ""
        }
      </div>
    `;
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
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" opacity="0.3">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
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
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        `;
      })
      .join("");
  }

  private renderSettingsTab(): string {
    const settings = this.chatContext?.settings;

    return `
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
        <label class="wa-ai-label">Translation Language</label>
        <select class="wa-ai-select" id="wa-ai-translation-lang">
          <option value="">Use Global Setting</option>
          <option value="en" ${
            settings?.translationLanguage === "en" ? "selected" : ""
          }>English</option>
          <option value="es" ${
            settings?.translationLanguage === "es" ? "selected" : ""
          }>Spanish</option>
          <option value="fr" ${
            settings?.translationLanguage === "fr" ? "selected" : ""
          }>French</option>
          <option value="de" ${
            settings?.translationLanguage === "de" ? "selected" : ""
          }>German</option>
          <option value="zh" ${
            settings?.translationLanguage === "zh" ? "selected" : ""
          }>Chinese</option>
          <option value="ja" ${
            settings?.translationLanguage === "ja" ? "selected" : ""
          }>Japanese</option>
          <option value="ar" ${
            settings?.translationLanguage === "ar" ? "selected" : ""
          }>Arabic</option>
          <option value="ur" ${
            settings?.translationLanguage === "ur" ? "selected" : ""
          }>Urdu</option>
        </select>
      </div>

      <div class="wa-ai-toggle">
        <div>
          <div class="wa-ai-toggle-label">Auto-Analyze Messages</div>
          <div class="wa-ai-toggle-description">Automatically analyze new messages in this chat</div>
        </div>
        <div class="wa-ai-switch ${
          settings?.autoAnalyze ? "active" : ""
        }" id="wa-ai-auto-analyze">
          <div class="wa-ai-switch-thumb"></div>
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
    panel.querySelectorAll(DOMComponents.settingsSwitch).forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
      });
    });

    // Generate summary button
    const generateSummary = panel.querySelector(DOMComponents.generateSummary);
    generateSummary?.addEventListener("click", () =>
      this.generateSummary(panel)
    );

    // Refresh summary button
    const refreshSummary = panel.querySelector(DOMComponents.refreshSummary);
    refreshSummary?.addEventListener("click", () =>
      this.generateSummary(panel)
    );

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

  private async generateSummary(panel: HTMLElement): Promise<void> {
    // Send message to background to generate summary
    try {
      const response = await browser.runtime.sendMessage({
        type: "GENERATE_SUMMARY",
        payload: { chatId: this.chatId },
      });

      if (response.success) {
        // Reload context and refresh view
        this.chatContext = await getChatContext(
          this.chatId,
          this.chatName,
          this.isGroup
        );
        this.switchTab(
          "summary",
          panel.closest(DOMComponents.settingsPanel) as HTMLElement
        );
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      alert("Failed to generate summary. Please try again.");
    }
  }

  private async saveChatSettings(panel: HTMLElement): Promise<void> {
    const customPrompt =
      (panel.querySelector(DOMComponents.customPrompt) as HTMLTextAreaElement)
        ?.value || "";
    const preferredTone =
      (panel.querySelector(DOMComponents.preferredTone) as HTMLSelectElement)
        ?.value || undefined;
    const translationLanguage =
      (panel.querySelector(DOMComponents.translationLang) as HTMLSelectElement)
        ?.value || undefined;
    const autoAnalyze =
      panel
        .querySelector(DOMComponents.autoAnalyze)
        ?.classList.contains("active") ?? true;

    const settings: ChatSettings = {
      chatId: this.chatId,
      customPrompt: customPrompt || undefined,
      preferredTone: preferredTone as any,
      translationLanguage: translationLanguage || undefined,
      autoAnalyze,
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
        "summary",
        panel.closest(DOMComponents.settingsPanel) as HTMLElement
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

  destroy(): void {
    this.hide();
  }
}
