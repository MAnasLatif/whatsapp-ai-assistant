/**
 * Settings Panel Component - Chat-Specific Settings
 * Shows cache management and story threads for the current chat
 * Global settings moved to extension popup
 */

import type {
  WhatsAppTheme,
  UserSettings,
  CacheStatistics,
} from "@/utils/types";
import { DEFAULT_SETTINGS } from "@/utils/types";
import {
  getSettings,
  saveSettings,
  getCacheStats,
  clearAllCache,
  formatBytes,
} from "@/utils/storage";

type TabId = "cache" | "stories";

export class SettingsPanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private theme: WhatsAppTheme;
  private onClose: () => void;
  private settings: UserSettings = DEFAULT_SETTINGS;
  private cacheStats: CacheStatistics | null = null;
  private activeTab: TabId = "cache";
  private currentChatId: string | null = null;

  constructor(
    container: HTMLElement,
    theme: WhatsAppTheme,
    onClose: () => void
  ) {
    this.container = container;
    this.theme = theme;
    this.onClose = onClose;
  }

  async show(): Promise<void> {
    // Load current settings
    this.settings = await getSettings();
    this.cacheStats = await getCacheStats();

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
    overlay.className = "wa-ai-settings-overlay";
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) this.hide();
    });

    const panel = document.createElement("div");
    panel.className = "wa-ai-settings-panel";
    panel.innerHTML = `
      <div class="wa-ai-settings-header">
        <h2 class="wa-ai-settings-title">Chat Settings</h2>
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
        <span>For general settings, click the extension icon in toolbar</span>
      </div>
      <div class="wa-ai-settings-tabs">
        <button class="wa-ai-tab-btn active" data-tab="cache">Cache Management</button>
        <button class="wa-ai-tab-btn" data-tab="stories">Story Threads</button>
      </div>
      <div class="wa-ai-settings-content">
        ${this.renderTabContent("cache")}
      </div>
    `;

    // Setup event listeners
    const closeBtn = panel.querySelector(".wa-ai-close-btn");
    closeBtn?.addEventListener("click", () => this.hide());

    const tabBtns = panel.querySelectorAll(".wa-ai-tab-btn");
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const tab = (e.target as HTMLElement).dataset.tab as TabId;
        this.switchTab(tab, panel);
      });
    });

    overlay.appendChild(panel);
    return overlay;
  }

  private switchTab(tab: TabId, panel: HTMLElement): void {
    this.activeTab = tab;

    // Update tab buttons
    const tabBtns = panel.querySelectorAll(".wa-ai-tab-btn");
    tabBtns.forEach((btn) => {
      btn.classList.toggle("active", (btn as HTMLElement).dataset.tab === tab);
    });

    // Update content
    const content = panel.querySelector(".wa-ai-settings-content");
    if (content) {
      content.innerHTML = this.renderTabContent(tab);
      this.setupTabListeners(panel);
    }
  }

  private renderTabContent(tab: TabId): string {
    switch (tab) {
      case "cache":
        return this.renderCacheTab();
      case "stories":
        return this.renderStoriesTab();
      default:
        return "";
    }
  }

  private renderCacheTab(): string {
    const { cache } = this.settings;
    const stats = this.cacheStats;

    return `
      <div class="wa-ai-stats-grid">
        <div class="wa-ai-stat-card">
          <div class="wa-ai-stat-value">${stats?.chatCount || 0}</div>
          <div class="wa-ai-stat-label">Cached Chats</div>
        </div>
        <div class="wa-ai-stat-card">
          <div class="wa-ai-stat-value">${stats?.storyCount || 0}</div>
          <div class="wa-ai-stat-label">Story Threads</div>
        </div>
        <div class="wa-ai-stat-card">
          <div class="wa-ai-stat-value">${formatBytes(
            stats?.totalSize || 0
          )}</div>
          <div class="wa-ai-stat-label">Storage Used</div>
        </div>
        <div class="wa-ai-stat-card">
          <div class="wa-ai-stat-value">${stats?.hits || 0}</div>
          <div class="wa-ai-stat-label">Cache Hits</div>
        </div>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Cache Retention (days)</label>
        <input 
          type="number" 
          class="wa-ai-input" 
          id="wa-ai-retention-days"
          min="1" 
          max="365" 
          value="${cache.retentionDays}"
        />
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Max Cache Size (MB)</label>
        <input 
          type="number" 
          class="wa-ai-input" 
          id="wa-ai-max-cache"
          min="10" 
          max="500" 
          value="${cache.maxCacheSize}"
        />
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Max Stories per Chat</label>
        <input 
          type="number" 
          class="wa-ai-input" 
          id="wa-ai-max-stories"
          min="1" 
          max="50" 
          value="${cache.maxStoriesPerChat}"
        />
      </div>

      <div class="wa-ai-toggle">
        <div>
          <div class="wa-ai-toggle-label">Auto Cache Cleanup</div>
          <div class="wa-ai-toggle-description">Automatically remove old cached data</div>
        </div>
        <div class="wa-ai-switch ${
          cache.autoCleanupEnabled ? "active" : ""
        }" id="wa-ai-auto-cleanup">
          <div class="wa-ai-switch-thumb"></div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; gap: 12px;">
        <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-save-cache">Save Changes</button>
        <button class="wa-ai-btn wa-ai-btn-danger" id="wa-ai-clear-cache">Clear All Cache</button>
      </div>
    `;
  }

  private renderStoriesTab(): string {
    return `
      <div class="wa-ai-info-banner">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        <div>
          <strong>Story Threads</strong>
          <p>View and manage conversation story threads for this chat. Each thread represents a distinct topic or context within the conversation.</p>
        </div>
      </div>

      <div class="wa-ai-stories-list" id="wa-ai-stories-list">
        ${this.renderStoriesList()}
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

  private renderStoriesList(): string {
    // Placeholder for stories - in real implementation, this would fetch from storage
    const stories = [
      {
        id: "story-1",
        title: "Project Discussion",
        messageCount: 25,
        lastUpdate: "2 hours ago",
      },
      {
        id: "story-2",
        title: "Weekend Plans",
        messageCount: 12,
        lastUpdate: "5 hours ago",
      },
    ];

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
      .map(
        (story) => `
      <div class="wa-ai-story-item">
        <div class="wa-ai-story-info">
          <div class="wa-ai-story-title">${story.title}</div>
          <div class="wa-ai-story-meta">
            ${story.messageCount} messages • ${story.lastUpdate}
          </div>
        </div>
        <button class="wa-ai-btn wa-ai-btn-icon" data-story="${story.id}" title="Delete story">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    `
      )
      .join("");
  }

  private setupTabListeners(panel: HTMLElement): void {
    // Toggle switches
    panel.querySelectorAll(".wa-ai-switch").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
      });
    });

    // Save cache settings button
    const saveCache = panel.querySelector("#wa-ai-save-cache");
    saveCache?.addEventListener("click", () => this.saveCacheSettings(panel));

    // Clear cache button
    const clearCache = panel.querySelector("#wa-ai-clear-cache");
    clearCache?.addEventListener("click", () => this.handleClearCache(panel));

    // Refresh stories button
    const refreshStories = panel.querySelector("#wa-ai-refresh-stories");
    refreshStories?.addEventListener("click", () => this.refreshStories(panel));

    // Delete story buttons
    panel.querySelectorAll("[data-story]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const storyId = (e.currentTarget as HTMLElement).dataset.story;
        if (storyId) this.deleteStory(storyId, panel);
      });
    });
  }

  private async saveCacheSettings(panel: HTMLElement): Promise<void> {
    const retentionDays = parseInt(
      (panel.querySelector("#wa-ai-retention-days") as HTMLInputElement)
        ?.value || "7"
    );
    const maxCacheSize = parseInt(
      (panel.querySelector("#wa-ai-max-cache") as HTMLInputElement)?.value ||
        "50"
    );
    const maxStoriesPerChat = parseInt(
      (panel.querySelector("#wa-ai-max-stories") as HTMLInputElement)?.value ||
        "10"
    );
    const autoCleanupEnabled =
      panel
        .querySelector("#wa-ai-auto-cleanup")
        ?.classList.contains("active") ?? true;

    this.settings.cache = {
      retentionDays,
      maxCacheSize,
      maxStoriesPerChat,
      autoCleanupEnabled,
    };

    await saveSettings(this.settings);
    this.showSaveSuccess(panel);
  }

  private async handleClearCache(panel: HTMLElement): Promise<void> {
    if (
      confirm(
        "Are you sure you want to clear all cached data? This cannot be undone."
      )
    ) {
      await clearAllCache();
      this.cacheStats = await getCacheStats();
      this.switchTab(
        "cache",
        panel.closest(".wa-ai-settings-panel") as HTMLElement
      );
    }
  }

  private async refreshStories(panel: HTMLElement): Promise<void> {
    // Refresh the stories list
    const storiesList = panel.querySelector("#wa-ai-stories-list");
    if (storiesList) {
      storiesList.innerHTML = this.renderStoriesList();
      this.setupTabListeners(panel);
    }
  }

  private async deleteStory(
    storyId: string,
    panel: HTMLElement
  ): Promise<void> {
    if (confirm("Are you sure you want to delete this story thread?")) {
      // TODO: Implement story deletion
      console.log("Deleting story:", storyId);
      this.refreshStories(panel);
    }
  }

  private showSaveSuccess(panel: HTMLElement): void {
    // Show a brief success message
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
