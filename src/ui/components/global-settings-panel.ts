/**
 * Global Settings Panel Component
 * Full-screen panel for configuring global AI settings
 * Matches WhatsApp's native panel style
 */

import { Icons } from "@/utils/icons";
import { DOMComponents } from "@/utils/dom-components";
import type { UserSettings, AIModel, ResponseTone } from "@/types";
import { DEFAULT_SETTINGS, LANGUAGE_OPTIONS } from "@/types";

export class GlobalSettingsPanel {
  private panel: HTMLDivElement | null = null;
  private settings: UserSettings;
  private originalSettings: UserSettings;
  private onClose: () => void;

  constructor(settings: UserSettings, onClose: () => void) {
    this.settings = settings || DEFAULT_SETTINGS;
    this.originalSettings = JSON.parse(JSON.stringify(this.settings)); // Deep copy
    this.onClose = onClose;
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await browser.storage.local.get("userSettings");
      if (result.userSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...result.userSettings };
        this.originalSettings = JSON.parse(JSON.stringify(this.settings)); // Deep copy
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await browser.storage.local.set({ userSettings: this.settings });

      // Show success message
      this.showSuccessMessage();

      // Reload the tab after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      this.showErrorMessage("Failed to save settings");
    }
  }

  private showSuccessMessage(): void {
    const message = document.createElement("div");
    message.className = "wa-settings-toast wa-settings-toast-success";
    message.innerHTML = `
      ${Icons.check}
      <span>Settings saved! Reloading...</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 3000);
  }

  private showErrorMessage(text: string): void {
    const message = document.createElement("div");
    message.className = "wa-settings-toast wa-settings-toast-error";
    message.innerHTML = `
      ${Icons.error}
      <span>${text}</span>
    `;
    document.body.appendChild(message);

    setTimeout(() => message.remove(), 3000);
  }

  private async testApiKey(): Promise<void> {
    if (!this.panel) return;

    const apiKeyInput = this.panel.querySelector(
      "#api-key"
    ) as HTMLInputElement;
    const testBtn = this.panel.querySelector(
      "#test-api-key-btn"
    ) as HTMLButtonElement;
    const statusDiv = this.panel.querySelector(
      "#api-key-status"
    ) as HTMLElement;
    const apiKey = apiKeyInput?.value?.trim();

    if (!apiKey || !apiKey.startsWith("sk-")) {
      statusDiv.style.display = "flex";
      statusDiv.style.color = "#f44336";
      statusDiv.innerHTML = `${Icons.error} Please enter a valid API key starting with 'sk-'`;
      return;
    }

    // Show loading state
    testBtn.disabled = true;
    testBtn.innerHTML = `${Icons.loading} Testing...`;
    statusDiv.style.display = "flex";
    statusDiv.style.color = "#666";
    statusDiv.innerHTML = `${Icons.loading} Testing connection...`;

    try {
      // Send message to background script to validate API key
      const response = await browser.runtime.sendMessage({
        type: "VALIDATE_API_KEY",
        payload: { apiKey },
      });

      if (response.success) {
        statusDiv.style.color = "#4caf50";
        statusDiv.innerHTML = `${Icons.check} API key is valid!`;
        setTimeout(() => {
          statusDiv.style.display = "none";
        }, 3000);
      } else {
        statusDiv.style.color = "#f44336";
        statusDiv.innerHTML = `${Icons.error} Invalid API key: ${
          response.error || "Authentication failed"
        }`;
      }
    } catch (error) {
      statusDiv.style.color = "#f44336";
      statusDiv.innerHTML = `${Icons.error} Network error: Unable to connect to background script`;
      console.error("API key validation error:", error);
    } finally {
      testBtn.disabled = false;
      testBtn.innerHTML = `${Icons.check} Test`;
    }
  }

  private createPanel(): HTMLDivElement {
    const panel = document.createElement("div");
    panel.className = DOMComponents.globalSettingsPanel.substring(1); // Remove . prefix
    panel.innerHTML = `
      <!-- Header -->
      <div class="wa-global-settings-header">
        <h1 class="wa-global-settings-title">AI Assistant Settings</h1>
        <button class="wa-global-settings-back" aria-label="Close">
          ${Icons.close}
        </button>
      </div>

      <!-- Content -->
      <div class="wa-global-settings-content">
        
        <!-- OpenAI Configuration -->
        <section class="wa-settings-section">          
          <div class="wa-settings-group">
            <label class="wa-settings-label" for="api-key">
              OpenAI API Key
              <span class="wa-settings-required">*</span>
            </label>
            <div class="wa-settings-input-container">
                <input
                  type="password"
                  id="api-key"
                  class="wa-settings-input"
                  placeholder="sk-..."
                  value="${this.settings.ai.apiKey}"
                  style="flex: 1;"
                />
                <button class="wa-settings-btn" id="test-api-key-btn" style="white-space: nowrap;">
                  ${Icons.check} Test
                </button>
            </div>
            <div id="api-key-status" style="margin-top: 8px; display: none;"></div>
            <p class="wa-settings-help">
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>
            </p>
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="ai-model">AI Model</label>
            <select id="ai-model" class="wa-settings-select">
              <option value="gpt-5.2" ${
                this.settings.ai.model === "gpt-5.2" ? "selected" : ""
              }>GPT-5.2 (Latest Flagship)</option>
              <option value="gpt-5" ${
                this.settings.ai.model === "gpt-5" ? "selected" : ""
              }>GPT-5 (Standard)</option>
              <option value="gpt-5-mini" ${
                this.settings.ai.model === "gpt-5-mini" ? "selected" : ""
              }>GPT-5 Mini (Faster)</option>
              <option value="gpt-5-nano" ${
                this.settings.ai.model === "gpt-5-nano" ? "selected" : ""
              }>GPT-5 Nano (Lightweight)</option>
            </select>
            <p class="wa-settings-help">Choose the AI model for analysis and generation</p>
          </div>
        </section>

        <!-- Default Preferences -->
        <section class="wa-settings-section">
          <div class="wa-settings-group">
            <label class="wa-settings-label" for="default-tone">Default Response Tone</label>
            <select id="default-tone" class="wa-settings-select">
              <option value="neutral" ${
                this.settings.ai.defaultTone === "neutral" ? "selected" : ""
              }>Neutral</option>
              <option value="friendly" ${
                this.settings.ai.defaultTone === "friendly" ? "selected" : ""
              }>Friendly</option>
              <option value="professional" ${
                this.settings.ai.defaultTone === "professional"
                  ? "selected"
                  : ""
              }>Professional</option>
            </select>
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="reply-language">Reply Generation Language</label>
            <select id="reply-language" class="wa-settings-select">
              ${LANGUAGE_OPTIONS.map(
                (lang) => `
                <option value="${lang.code}" ${
                  this.settings.general.replyLanguage === lang.code
                    ? "selected"
                    : ""
                }>${lang.name}</option>
              `
              ).join("")}
            </select>
            <p class="wa-settings-help">Language for AI-generated reply suggestions</p>
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="analysis-language">Analysis & Story Language</label>
            <select id="analysis-language" class="wa-settings-select">
              ${LANGUAGE_OPTIONS.map(
                (lang) => `
                <option value="${lang.code}" ${
                  this.settings.general.analysisLanguage === lang.code
                    ? "selected"
                    : ""
                }>${lang.name}</option>
              `
              ).join("")}
            </select>
            <p class="wa-settings-help">Language for message analysis and context stories</p>
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="translation-language">Translation Language</label>
            <select id="translation-language" class="wa-settings-select">
              ${LANGUAGE_OPTIONS.map(
                (lang) => `
                <option value="${lang.code}" ${
                  this.settings.general.translationLanguage === lang.code
                    ? "selected"
                    : ""
                }>${lang.name}</option>
              `
              ).join("")}
            </select>
            <p class="wa-settings-help">Default target language for translations</p>
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="message-limit">
              Messages to Analyze
              <span class="wa-settings-value">${
                this.settings.general.messageLimit
              }</span>
            </label>
            <input
              type="range"
              id="message-limit"
              class="wa-settings-range"
              min="5"
              max="50"
              step="5"
              value="${this.settings.general.messageLimit}"
            />
            <p class="wa-settings-help">Number of recent messages to include in analysis (5-50)</p>
          </div>
        </section>

        <!-- Enabled Features -->
        <section class="wa-settings-section">
          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Message Analysis</div>
              <div class="wa-settings-toggle-help">Analyze conversation context and sentiment</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="feature-analysis" ${
                this.settings.ai.enabledFeatures.analyze ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Translation</div>
              <div class="wa-settings-toggle-help">Translate messages to different languages</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="feature-translation" ${
                this.settings.ai.enabledFeatures.translate ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Reply Generation</div>
              <div class="wa-settings-toggle-help">Generate contextual reply suggestions</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="feature-reply" ${
                this.settings.ai.enabledFeatures.generateReply ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Context Explanation</div>
              <div class="wa-settings-toggle-help">Explain conversation context and history</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="feature-context" ${
                this.settings.ai.enabledFeatures.explainContext ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Tone Detection</div>
              <div class="wa-settings-toggle-help">Detect emotional tone in messages</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="feature-tone" ${
                this.settings.ai.enabledFeatures.detectTone ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>
        </section>

        <!-- UI Preferences -->
        <section class="wa-settings-section">
          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Show Message Hover Buttons</div>
              <div class="wa-settings-toggle-help">Display AI action button when hovering over messages</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="show-hover-buttons" ${
                this.settings.general.enableHoverButton ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>
        </section>

        <!-- Cache Settings -->
        <section class="wa-settings-section">
          <div class="wa-settings-group">
            <label class="wa-settings-label" for="cache-retention">
              Cache Retention (Days)
              <span class="wa-settings-value">${
                this.settings.cache.retentionDays
              }</span>
            </label>
            <input
              type="range"
              id="cache-retention"
              class="wa-settings-range"
              min="1"
              max="90"
              step="1"
              value="${this.settings.cache.retentionDays}"
            />
          </div>

          <div class="wa-settings-group">
            <label class="wa-settings-label" for="max-stories">
              Max Stories Per Chat
              <span class="wa-settings-value">${
                this.settings.cache.maxStoriesPerChat
              }</span>
            </label>
            <input
              type="range"
              id="max-stories"
              class="wa-settings-range"
              min="1"
              max="20"
              step="1"
              value="${this.settings.cache.maxStoriesPerChat}"
            />
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Auto-cleanup</div>
              <div class="wa-settings-toggle-help">Automatically clean up old cache data</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="auto-cleanup" ${
                this.settings.cache.autoCleanupEnabled ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>
        </section>

        <!-- Privacy -->
        <section class="wa-settings-section">
          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Data Collection</div>
              <div class="wa-settings-toggle-help">Allow anonymous usage data for improvements</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="data-collection" ${
                this.settings.privacy.dataCollectionEnabled ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>

          <div class="wa-settings-toggle">
            <div>
              <div class="wa-settings-toggle-label">Auto-delete Processed Data</div>
              <div class="wa-settings-toggle-help">Delete data after AI processing completes</div>
            </div>
            <label class="wa-switch">
              <input type="checkbox" id="auto-delete" ${
                this.settings.privacy.autoDeleteProcessedData ? "checked" : ""
              } />
              <span class="wa-switch-slider"></span>
            </label>
          </div>
        </section>

      </div>

      <!-- Footer -->
      <div class="wa-global-settings-footer" style="display: none;">
        <button class="wa-settings-btn wa-settings-btn-primary" id="save-btn">Save Changes</button>
      </div>
    `;

    return panel;
  }

  private setupEventListeners(): void {
    if (!this.panel) return;

    // Close button
    const backBtn = this.panel.querySelector(".wa-global-settings-back");
    backBtn?.addEventListener("click", () => this.hide());

    // Save button
    const saveBtn = this.panel.querySelector("#save-btn");
    saveBtn?.addEventListener("click", () => this.handleSave());

    // Test API key button
    const testBtn = this.panel.querySelector("#test-api-key-btn");
    testBtn?.addEventListener("click", () => this.testApiKey());

    // Range input live updates
    const rangeInputs = this.panel.querySelectorAll<HTMLInputElement>(
      "input[type='range']"
    );
    rangeInputs.forEach((input: HTMLInputElement) => {
      input.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        const valueSpan = this.panel?.querySelector(
          `label[for="${target.id}"] .wa-settings-value`
        );
        if (valueSpan) {
          valueSpan.textContent = target.value;
        }
        this.checkForChanges();
      });
    });

    // Track changes on all inputs
    const allInputs = this.panel.querySelectorAll<
      HTMLInputElement | HTMLSelectElement
    >("input, select");
    allInputs.forEach((input) => {
      input.addEventListener("change", () => this.checkForChanges());
    });
  }

  private checkForChanges(): void {
    if (!this.panel) return;

    // Get current form values
    const currentApiKey =
      (this.panel.querySelector("#api-key") as HTMLInputElement)?.value || "";
    const currentModel = (
      this.panel.querySelector("#ai-model") as HTMLSelectElement
    )?.value;
    const currentTone = (
      this.panel.querySelector("#default-tone") as HTMLSelectElement
    )?.value;
    const currentReplyLanguage = (
      this.panel.querySelector("#reply-language") as HTMLSelectElement
    )?.value;
    const currentAnalysisLanguage = (
      this.panel.querySelector("#analysis-language") as HTMLSelectElement
    )?.value;
    const currentTranslationLanguage = (
      this.panel.querySelector("#translation-language") as HTMLSelectElement
    )?.value;
    const currentMessageLimit = parseInt(
      (this.panel.querySelector("#message-limit") as HTMLInputElement)?.value ||
        "20"
    );
    const currentCacheRetention = parseInt(
      (this.panel.querySelector("#cache-retention") as HTMLInputElement)
        ?.value || "30"
    );
    const currentMaxStories = parseInt(
      (this.panel.querySelector("#max-stories") as HTMLInputElement)?.value ||
        "10"
    );

    // Check for changes
    const hasChanges =
      currentApiKey !== this.originalSettings.ai.apiKey ||
      currentModel !== this.originalSettings.ai.model ||
      currentTone !== this.originalSettings.ai.defaultTone ||
      currentReplyLanguage !== this.originalSettings.general.replyLanguage ||
      currentAnalysisLanguage !==
        this.originalSettings.general.analysisLanguage ||
      currentTranslationLanguage !==
        this.originalSettings.general.translationLanguage ||
      currentMessageLimit !== this.originalSettings.general.messageLimit ||
      currentCacheRetention !== this.originalSettings.cache.retentionDays ||
      currentMaxStories !== this.originalSettings.cache.maxStoriesPerChat ||
      (this.panel.querySelector("#feature-analysis") as HTMLInputElement)
        ?.checked !== this.originalSettings.ai.enabledFeatures.analyze ||
      (this.panel.querySelector("#feature-translation") as HTMLInputElement)
        ?.checked !== this.originalSettings.ai.enabledFeatures.translate ||
      (this.panel.querySelector("#feature-reply") as HTMLInputElement)
        ?.checked !== this.originalSettings.ai.enabledFeatures.generateReply ||
      (this.panel.querySelector("#feature-context") as HTMLInputElement)
        ?.checked !== this.originalSettings.ai.enabledFeatures.explainContext ||
      (this.panel.querySelector("#feature-tone") as HTMLInputElement)
        ?.checked !== this.originalSettings.ai.enabledFeatures.detectTone ||
      (this.panel.querySelector("#show-hover-buttons") as HTMLInputElement)
        ?.checked !== this.originalSettings.general.enableHoverButton ||
      (this.panel.querySelector("#auto-cleanup") as HTMLInputElement)
        ?.checked !== this.originalSettings.cache.autoCleanupEnabled ||
      (this.panel.querySelector("#data-collection") as HTMLInputElement)
        ?.checked !== this.originalSettings.privacy.dataCollectionEnabled ||
      (this.panel.querySelector("#auto-delete") as HTMLInputElement)
        ?.checked !== this.originalSettings.privacy.autoDeleteProcessedData;

    // Show/hide save button based on changes
    const footer = this.panel.querySelector(
      ".wa-global-settings-footer"
    ) as HTMLElement;
    if (footer) {
      footer.style.display = hasChanges ? "flex" : "none";
    }
  }

  private handleSave(): void {
    if (!this.panel) return;

    // Collect all form values
    const apiKey =
      (this.panel.querySelector("#api-key") as HTMLInputElement)?.value || "";
    const model = (this.panel.querySelector("#ai-model") as HTMLSelectElement)
      ?.value as AIModel;
    const defaultTone = (
      this.panel.querySelector("#default-tone") as HTMLSelectElement
    )?.value as ResponseTone;
    const replyLanguage =
      (this.panel.querySelector("#reply-language") as HTMLSelectElement)
        ?.value || "en";
    const analysisLanguage =
      (this.panel.querySelector("#analysis-language") as HTMLSelectElement)
        ?.value || "en";
    const translationLanguage =
      (this.panel.querySelector("#translation-language") as HTMLSelectElement)
        ?.value || "en";
    const messageLimit = parseInt(
      (this.panel.querySelector("#message-limit") as HTMLInputElement)?.value ||
        "20"
    );
    const cacheRetentionDays = parseInt(
      (this.panel.querySelector("#cache-retention") as HTMLInputElement)
        ?.value || "30"
    );
    const maxStoriesPerChat = parseInt(
      (this.panel.querySelector("#max-stories") as HTMLInputElement)?.value ||
        "10"
    );

    // Validate API key
    if (!apiKey || !apiKey.startsWith("sk-")) {
      this.showErrorMessage("Please enter a valid OpenAI API key");
      return;
    }

    // Update settings object with correct nested structure
    this.settings = {
      ...this.settings,
      ai: {
        apiKey,
        model,
        defaultTone,
        enabledFeatures: {
          analyze:
            (this.panel.querySelector("#feature-analysis") as HTMLInputElement)
              ?.checked || false,
          translate:
            (
              this.panel.querySelector(
                "#feature-translation"
              ) as HTMLInputElement
            )?.checked || false,
          generateReply:
            (this.panel.querySelector("#feature-reply") as HTMLInputElement)
              ?.checked || false,
          explainContext:
            (this.panel.querySelector("#feature-context") as HTMLInputElement)
              ?.checked || false,
          detectTone:
            (this.panel.querySelector("#feature-tone") as HTMLInputElement)
              ?.checked || false,
          smartSuggestions: this.settings.ai.enabledFeatures.smartSuggestions,
        },
      },
      general: {
        ...this.settings.general,
        replyLanguage,
        analysisLanguage,
        translationLanguage,
        messageLimit,
        enableHoverButton:
          (this.panel.querySelector("#show-hover-buttons") as HTMLInputElement)
            ?.checked || true,
      },
      cache: {
        ...this.settings.cache,
        retentionDays: cacheRetentionDays,
        maxStoriesPerChat,
        autoCleanupEnabled:
          (this.panel.querySelector("#auto-cleanup") as HTMLInputElement)
            ?.checked || true,
      },
      privacy: {
        ...this.settings.privacy,
        dataCollectionEnabled:
          (this.panel.querySelector("#data-collection") as HTMLInputElement)
            ?.checked || false,
        autoDeleteProcessedData:
          (this.panel.querySelector("#auto-delete") as HTMLInputElement)
            ?.checked || false,
      },
    };

    // Save to storage
    this.saveSettings();
  }

  public async show(): Promise<void> {
    // Load current settings first
    await this.loadSettings();

    // Create and show panel
    this.panel = this.createPanel();
    document.querySelector(DOMComponents.side)?.appendChild(this.panel);

    // Setup event listeners
    this.setupEventListeners();

    // Trigger animation
    requestAnimationFrame(() => {
      this.panel?.classList.add("active");
    });
  }

  public hide(): void {
    this.panel?.classList.remove("active");

    setTimeout(() => {
      this.panel?.remove();
      this.panel = null;
      this.onClose();
    }, 300);
  }
}
