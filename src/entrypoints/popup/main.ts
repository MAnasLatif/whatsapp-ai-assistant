/**
 * Extension Popup - Global Settings
 * Handles: API Key, AI Model, Features, Language Preferences
 */

import {
  getSettings,
  saveSettings,
  formatBytes,
  getCacheStats,
} from "@/utils/storage";
import type { UserSettings, AIModel, ResponseTone } from "@/types";
import { createPopupStyles } from "./styles";

class PopupApp {
  private settings: UserSettings | null = null;
  private rootEl: HTMLElement;

  constructor(rootEl: HTMLElement) {
    this.rootEl = rootEl;
    this.init();
  }

  async init() {
    this.settings = await getSettings();
    this.render();
    this.setupEventListeners();
  }

  render() {
    if (!this.settings) return;

    this.rootEl.innerHTML = `
      ${createPopupStyles()}
      <div class="popup-container">
        <header class="popup-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h1 class="popup-title">AI Assistant Settings</h1>
        </header>

        <div class="popup-content">
          ${this.renderAIConfigSection()}
          ${this.renderGeneralSection()}
          ${this.renderFeaturesSection()}
          ${this.renderInfoSection()}
        </div>
      </div>
    `;
  }

  renderAIConfigSection(): string {
    const { ai } = this.settings!;

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
      <section class="popup-section">
        <h2 class="section-title">AI Configuration</h2>
        
        <div class="form-group">
          <label class="form-label" for="api-key">OpenAI API Key</label>
          <input 
            type="password" 
            class="form-input" 
            id="api-key"
            placeholder="sk-..."
            value="${ai.apiKey}"
          />
          <div class="form-hint">
            <button class="btn-link" id="validate-key">Validate Key</button>
            <span id="key-status"></span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="ai-model">AI Model</label>
          <select class="form-select" id="ai-model">
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

        <div class="form-group">
          <label class="form-label" for="response-tone">Default Response Tone</label>
          <select class="form-select" id="response-tone">
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
      </section>
    `;
  }

  renderGeneralSection(): string {
    const { general } = this.settings!;

    return `
      <section class="popup-section">
        <h2 class="section-title">General</h2>
        
        <div class="form-group">
          <label class="form-label" for="output-language">Output Language</label>
          <select class="form-select" id="output-language">
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

        <div class="form-group">
          <label class="form-label" for="message-limit">Messages to Analyze (5-50)</label>
          <input 
            type="number" 
            class="form-input" 
            id="message-limit"
            min="5" 
            max="50" 
            value="${general.messageLimit}"
          />
        </div>

        <div class="toggle-item">
          <div class="toggle-content">
            <div class="toggle-label">Enable Hover Button</div>
            <div class="toggle-description">Show AI action button when hovering over messages</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="enable-hover" ${
              general.enableHoverButton ? "checked" : ""
            }>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </section>
    `;
  }

  renderFeaturesSection(): string {
    const { ai } = this.settings!;

    const features = [
      {
        key: "analyze",
        label: "Analyze Messages",
        description: "AI analysis of message content",
      },
      {
        key: "translate",
        label: "Translation",
        description: "Translate messages to any language",
      },
      {
        key: "explainContext",
        label: "Explain Context",
        description: "Get context explanation for messages",
      },
      {
        key: "detectTone",
        label: "Tone Detection",
        description: "Detect emotional tone in messages",
      },
      {
        key: "generateReply",
        label: "Reply Generation",
        description: "Generate contextual replies",
      },
      {
        key: "smartSuggestions",
        label: "Smart Suggestions",
        description: "Get conversation improvement suggestions",
      },
    ];

    return `
      <section class="popup-section">
        <h2 class="section-title">Enabled Features</h2>
        
        ${features
          .map(
            (f) => `
          <div class="toggle-item">
            <div class="toggle-content">
              <div class="toggle-label">${f.label}</div>
              <div class="toggle-description">${f.description}</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" data-feature="${f.key}" ${
              ai.enabledFeatures[f.key as keyof typeof ai.enabledFeatures]
                ? "checked"
                : ""
            }>
              <span class="toggle-slider"></span>
            </label>
          </div>
        `
          )
          .join("")}
      </section>
    `;
  }

  renderInfoSection(): string {
    return `
      <section class="popup-section">
        <div class="info-box">
          <div class="info-icon">ℹ️</div>
          <div class="info-content">
            <p><strong>Chat-specific settings</strong> (cache management, story threads) are available in the AI settings panel within WhatsApp Web.</p>
          </div>
        </div>
      </section>

      <div class="popup-footer">
        <button class="btn-primary" id="save-settings">Save Changes</button>
      </div>
    `;
  }

  setupEventListeners() {
    // Save button
    const saveBtn = this.rootEl.querySelector("#save-settings");
    saveBtn?.addEventListener("click", () => this.saveSettings());

    // Validate API key
    const validateBtn = this.rootEl.querySelector("#validate-key");
    validateBtn?.addEventListener("click", () => this.validateAPIKey());
  }

  async saveSettings() {
    if (!this.settings) return;

    // API Configuration
    const apiKey =
      (this.rootEl.querySelector("#api-key") as HTMLInputElement)?.value || "";
    const model = (this.rootEl.querySelector("#ai-model") as HTMLSelectElement)
      ?.value as AIModel;
    const defaultTone = (
      this.rootEl.querySelector("#response-tone") as HTMLSelectElement
    )?.value as ResponseTone;

    // General Settings
    const outputLanguage = (
      this.rootEl.querySelector("#output-language") as HTMLSelectElement
    )?.value;
    const messageLimit = parseInt(
      (this.rootEl.querySelector("#message-limit") as HTMLInputElement)
        ?.value || "20"
    );
    const enableHoverButton = (
      this.rootEl.querySelector("#enable-hover") as HTMLInputElement
    )?.checked;

    // Feature Flags
    const features = { ...this.settings.ai.enabledFeatures };
    this.rootEl.querySelectorAll("[data-feature]").forEach((toggle) => {
      const feature = (toggle as HTMLInputElement).dataset
        .feature as keyof typeof features;
      features[feature] = (toggle as HTMLInputElement).checked;
    });

    // Update settings
    this.settings.ai = {
      apiKey,
      model,
      defaultTone,
      enabledFeatures: features,
    };

    this.settings.general = {
      ...this.settings.general,
      outputLanguage,
      messageLimit: Math.min(50, Math.max(5, messageLimit)),
      enableHoverButton,
    };

    await saveSettings(this.settings);
    this.showSaveSuccess();
  }

  async validateAPIKey() {
    const apiKey =
      (this.rootEl.querySelector("#api-key") as HTMLInputElement)?.value || "";
    const statusEl = this.rootEl.querySelector("#key-status");

    if (!apiKey) {
      if (statusEl)
        statusEl.innerHTML =
          '<span class="status-error">Please enter an API key</span>';
      return;
    }

    if (statusEl)
      statusEl.innerHTML = '<span class="status-info">Validating...</span>';

    try {
      const response = await browser.runtime.sendMessage({
        type: "VALIDATE_API_KEY",
        payload: { apiKey },
      });

      if (response.success) {
        if (statusEl)
          statusEl.innerHTML =
            '<span class="status-success">✓ Valid API key</span>';
      } else {
        if (statusEl)
          statusEl.innerHTML = `<span class="status-error">✗ ${
            response.error || "Invalid key"
          }</span>`;
      }
    } catch (error) {
      if (statusEl)
        statusEl.innerHTML =
          '<span class="status-error">✗ Validation failed</span>';
    }
  }

  showSaveSuccess() {
    const btn = this.rootEl.querySelector(
      "#save-settings"
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
}

// Initialize popup
const root = document.getElementById("root");
if (root) {
  new PopupApp(root);
}
