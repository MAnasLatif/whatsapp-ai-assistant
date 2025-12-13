/**
 * Settings Panel Component
 * FR-03 to FR-36: Modal settings panel with tabs for General, AI Config, Cache, Privacy
 */

import type {
  WhatsAppTheme,
  UserSettings,
  CacheStatistics,
  AIModel,
  ResponseTone,
} from "@/utils/types";
import { DEFAULT_SETTINGS } from "@/utils/types";
import {
  getSettings,
  saveSettings,
  getCacheStats,
  clearAllCache,
  formatBytes,
} from "@/utils/storage";

type TabId = "general" | "ai" | "cache" | "privacy";

export class SettingsPanel {
  private container: HTMLElement;
  private panelElement: HTMLElement | null = null;
  private theme: WhatsAppTheme;
  private onClose: () => void;
  private settings: UserSettings = DEFAULT_SETTINGS;
  private cacheStats: CacheStatistics | null = null;
  private activeTab: TabId = "general";

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
        <h2 class="wa-ai-settings-title">AI Assistant Settings</h2>
        <button class="wa-ai-close-btn" aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </button>
      </div>
      <div class="wa-ai-settings-tabs">
        <button class="wa-ai-tab-btn active" data-tab="general">General</button>
        <button class="wa-ai-tab-btn" data-tab="ai">AI Config</button>
        <button class="wa-ai-tab-btn" data-tab="cache">Cache</button>
        <button class="wa-ai-tab-btn" data-tab="privacy">Privacy</button>
      </div>
      <div class="wa-ai-settings-content">
        ${this.renderTabContent("general")}
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
      case "general":
        return this.renderGeneralTab();
      case "ai":
        return this.renderAITab();
      case "cache":
        return this.renderCacheTab();
      case "privacy":
        return this.renderPrivacyTab();
      default:
        return "";
    }
  }

  private renderGeneralTab(): string {
    const { general } = this.settings;

    return `
      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Output Language</label>
        <select class="wa-ai-select" id="wa-ai-output-language">
          <option value="en" ${
            general.outputLanguage === "en" ? "selected" : ""
          }>English</option>
          <option value="es" ${
            general.outputLanguage === "es" ? "selected" : ""
          }>Spanish</option>
          <option value="fr" ${
            general.outputLanguage === "fr" ? "selected" : ""
          }>French</option>
          <option value="de" ${
            general.outputLanguage === "de" ? "selected" : ""
          }>German</option>
          <option value="it" ${
            general.outputLanguage === "it" ? "selected" : ""
          }>Italian</option>
          <option value="pt" ${
            general.outputLanguage === "pt" ? "selected" : ""
          }>Portuguese</option>
          <option value="ru" ${
            general.outputLanguage === "ru" ? "selected" : ""
          }>Russian</option>
          <option value="zh" ${
            general.outputLanguage === "zh" ? "selected" : ""
          }>Chinese</option>
          <option value="ja" ${
            general.outputLanguage === "ja" ? "selected" : ""
          }>Japanese</option>
          <option value="ko" ${
            general.outputLanguage === "ko" ? "selected" : ""
          }>Korean</option>
          <option value="ar" ${
            general.outputLanguage === "ar" ? "selected" : ""
          }>Arabic</option>
          <option value="hi" ${
            general.outputLanguage === "hi" ? "selected" : ""
          }>Hindi</option>
          <option value="ur" ${
            general.outputLanguage === "ur" ? "selected" : ""
          }>Urdu</option>
        </select>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Messages to Analyze (5-50)</label>
        <input 
          type="number" 
          class="wa-ai-input" 
          id="wa-ai-message-limit"
          min="5" 
          max="50" 
          value="${general.messageLimit}"
        />
      </div>

      <div class="wa-ai-toggle">
        <div>
          <div class="wa-ai-toggle-label">Enable Hover Button</div>
          <div class="wa-ai-toggle-description">Show AI action button when hovering over messages</div>
        </div>
        <div class="wa-ai-switch ${
          general.enableHoverButton ? "active" : ""
        }" id="wa-ai-hover-btn-toggle">
          <div class="wa-ai-switch-thumb"></div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-save-general">Save Changes</button>
      </div>
    `;
  }

  private renderAITab(): string {
    const { ai } = this.settings;

    const models: { value: AIModel; label: string }[] = [
      { value: "gpt-4o", label: "GPT-4o (Most capable)" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & efficient)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fastest)" },
    ];

    const tones: { value: ResponseTone; label: string }[] = [
      { value: "neutral", label: "Neutral" },
      { value: "friendly", label: "Friendly" },
      { value: "professional", label: "Professional" },
      { value: "casual", label: "Casual" },
    ];

    return `
      <div class="wa-ai-form-group">
        <label class="wa-ai-label">OpenAI API Key</label>
        <input 
          type="password" 
          class="wa-ai-input" 
          id="wa-ai-api-key"
          placeholder="sk-..."
          value="${ai.apiKey}"
        />
        <div style="margin-top: 8px;">
          <button class="wa-ai-btn wa-ai-btn-secondary" id="wa-ai-validate-key" style="font-size: 12px;">
            Validate Key
          </button>
          <span id="wa-ai-key-status" style="margin-left: 8px; font-size: 12px;"></span>
        </div>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">AI Model</label>
        <select class="wa-ai-select" id="wa-ai-model">
          ${models
            .map(
              (m) =>
                `<option value="${m.value}" ${
                  ai.model === m.value ? "selected" : ""
                }>${m.label}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Default Response Tone</label>
        <select class="wa-ai-select" id="wa-ai-tone">
          ${tones
            .map(
              (t) =>
                `<option value="${t.value}" ${
                  ai.defaultTone === t.value ? "selected" : ""
                }>${t.label}</option>`
            )
            .join("")}
        </select>
      </div>

      <div class="wa-ai-form-group">
        <label class="wa-ai-label">Enabled Features</label>
        ${this.renderFeatureToggles()}
      </div>

      <div style="margin-top: 20px;">
        <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-save-ai">Save Changes</button>
      </div>
    `;
  }

  private renderFeatureToggles(): string {
    const features = [
      { key: "analyze", label: "Analyze Messages" },
      { key: "translate", label: "Translation" },
      { key: "explainContext", label: "Explain Context" },
      { key: "detectTone", label: "Tone Detection" },
      { key: "generateReply", label: "Reply Generation" },
      { key: "smartSuggestions", label: "Smart Suggestions" },
    ];

    return features
      .map(
        (f) => `
        <div class="wa-ai-toggle">
          <div class="wa-ai-toggle-label">${f.label}</div>
          <div class="wa-ai-switch ${
            this.settings.ai.enabledFeatures[
              f.key as keyof typeof this.settings.ai.enabledFeatures
            ]
              ? "active"
              : ""
          }" data-feature="${f.key}">
            <div class="wa-ai-switch-thumb"></div>
          </div>
        </div>
      `
      )
      .join("");
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

  private renderPrivacyTab(): string {
    const { privacy } = this.settings;

    return `
      <div class="wa-ai-toggle">
        <div>
          <div class="wa-ai-toggle-label">Data Collection</div>
          <div class="wa-ai-toggle-description">Allow anonymous usage data to improve the extension</div>
        </div>
        <div class="wa-ai-switch ${
          privacy.dataCollectionEnabled ? "active" : ""
        }" id="wa-ai-data-collection">
          <div class="wa-ai-switch-thumb"></div>
        </div>
      </div>

      <div class="wa-ai-toggle">
        <div>
          <div class="wa-ai-toggle-label">Auto-Delete Processed Data</div>
          <div class="wa-ai-toggle-description">Automatically delete data after AI processing</div>
        </div>
        <div class="wa-ai-switch ${
          privacy.autoDeleteProcessedData ? "active" : ""
        }" id="wa-ai-auto-delete">
          <div class="wa-ai-switch-thumb"></div>
        </div>
      </div>

      <div class="wa-ai-form-group" style="margin-top: 20px;">
        <label class="wa-ai-label">Data Sent to OpenAI</label>
        <div style="font-size: 13px; color: var(--wa-ai-text-secondary); line-height: 1.6;">
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Message content you explicitly select for analysis</li>
            <li>Media content (images/voice) when you request processing</li>
            <li>Chat context for reply generation (when enabled)</li>
          </ul>
          <p style="margin-top: 12px;">
            <strong>Note:</strong> No data is stored on external servers. All processing is done via direct API calls to OpenAI.
          </p>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <button class="wa-ai-btn wa-ai-btn-primary" id="wa-ai-save-privacy">Save Changes</button>
      </div>
    `;
  }

  private setupTabListeners(panel: HTMLElement): void {
    // Toggle switches
    panel.querySelectorAll(".wa-ai-switch").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
      });
    });

    // Save buttons
    const saveGeneral = panel.querySelector("#wa-ai-save-general");
    saveGeneral?.addEventListener("click", () =>
      this.saveGeneralSettings(panel)
    );

    const saveAI = panel.querySelector("#wa-ai-save-ai");
    saveAI?.addEventListener("click", () => this.saveAISettings(panel));

    const saveCache = panel.querySelector("#wa-ai-save-cache");
    saveCache?.addEventListener("click", () => this.saveCacheSettings(panel));

    const savePrivacy = panel.querySelector("#wa-ai-save-privacy");
    savePrivacy?.addEventListener("click", () =>
      this.savePrivacySettings(panel)
    );

    // Validate API key
    const validateKey = panel.querySelector("#wa-ai-validate-key");
    validateKey?.addEventListener("click", () => this.validateAPIKey(panel));

    // Clear cache
    const clearCache = panel.querySelector("#wa-ai-clear-cache");
    clearCache?.addEventListener("click", () => this.handleClearCache(panel));
  }

  private async saveGeneralSettings(panel: HTMLElement): Promise<void> {
    const outputLanguage = (
      panel.querySelector("#wa-ai-output-language") as HTMLSelectElement
    )?.value;
    const messageLimit = parseInt(
      (panel.querySelector("#wa-ai-message-limit") as HTMLInputElement)
        ?.value || "20"
    );
    const enableHoverButton =
      panel
        .querySelector("#wa-ai-hover-btn-toggle")
        ?.classList.contains("active") ?? true;

    this.settings.general = {
      ...this.settings.general,
      outputLanguage,
      messageLimit: Math.min(50, Math.max(5, messageLimit)),
      enableHoverButton,
    };

    await saveSettings(this.settings);
    this.showSaveSuccess(panel);
  }

  private async saveAISettings(panel: HTMLElement): Promise<void> {
    const apiKey =
      (panel.querySelector("#wa-ai-api-key") as HTMLInputElement)?.value || "";
    const model = (panel.querySelector("#wa-ai-model") as HTMLSelectElement)
      ?.value as AIModel;
    const defaultTone = (
      panel.querySelector("#wa-ai-tone") as HTMLSelectElement
    )?.value as ResponseTone;

    // Get feature toggles
    const features = { ...this.settings.ai.enabledFeatures };
    panel.querySelectorAll("[data-feature]").forEach((toggle) => {
      const feature = (toggle as HTMLElement).dataset
        .feature as keyof typeof features;
      features[feature] = toggle.classList.contains("active");
    });

    this.settings.ai = {
      apiKey,
      model,
      defaultTone,
      enabledFeatures: features,
    };

    await saveSettings(this.settings);
    this.showSaveSuccess(panel);
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

  private async savePrivacySettings(panel: HTMLElement): Promise<void> {
    const dataCollectionEnabled =
      panel
        .querySelector("#wa-ai-data-collection")
        ?.classList.contains("active") ?? false;
    const autoDeleteProcessedData =
      panel.querySelector("#wa-ai-auto-delete")?.classList.contains("active") ??
      false;

    this.settings.privacy = {
      ...this.settings.privacy,
      dataCollectionEnabled,
      autoDeleteProcessedData,
    };

    await saveSettings(this.settings);
    this.showSaveSuccess(panel);
  }

  private async validateAPIKey(panel: HTMLElement): Promise<void> {
    const apiKey =
      (panel.querySelector("#wa-ai-api-key") as HTMLInputElement)?.value || "";
    const statusEl = panel.querySelector("#wa-ai-key-status");

    if (!apiKey) {
      if (statusEl)
        statusEl.innerHTML =
          '<span style="color: var(--wa-ai-error);">Please enter an API key</span>';
      return;
    }

    if (statusEl) statusEl.innerHTML = "<span>Validating...</span>";

    try {
      const response = await browser.runtime.sendMessage({
        type: "VALIDATE_API_KEY",
        payload: { apiKey },
      });

      if (response.success) {
        if (statusEl)
          statusEl.innerHTML =
            '<span style="color: var(--wa-ai-success);">✓ Valid API key</span>';
      } else {
        if (statusEl)
          statusEl.innerHTML = `<span style="color: var(--wa-ai-error);">✗ ${
            response.error || "Invalid key"
          }</span>`;
      }
    } catch (error) {
      if (statusEl)
        statusEl.innerHTML =
          '<span style="color: var(--wa-ai-error);">✗ Validation failed</span>';
    }
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
