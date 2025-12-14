/**
 * Extension Popup - Status Display
 * Shows extension status and links to settings in WhatsApp Web
 */

import { getSettings, getCacheStats } from "@/utils/storage";
import type { UserSettings } from "@/types";
import { createPopupStyles } from "@/styles/popup-styles";

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

  async render() {
    if (!this.settings) return;

    const cacheStats = await getCacheStats();
    const hasApiKey = !!(
      this.settings.ai.apiKey && this.settings.ai.apiKey.length > 0
    );
    const isConfigured = hasApiKey;

    this.rootEl.innerHTML = `
      ${createPopupStyles()}
      <div class="popup-container">
        <header class="popup-header">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h1 class="popup-title">WhatsApp AI Assistant</h1>
        </header>

        <div class="popup-content">
          ${this.renderStatusSection(isConfigured, hasApiKey)}
          ${this.renderStatsSection(cacheStats)}
          ${this.renderInstructionsSection()}
        </div>
      </div>
    `;
  }

  renderStatusSection(isConfigured: boolean, hasApiKey: boolean): string {
    const statusClass = isConfigured ? "status-active" : "status-inactive";
    const statusText = isConfigured ? "Active" : "Not Configured";
    const statusIcon = isConfigured ? "✓" : "⚠";

    return `
      <section class="popup-section">
        <div class="status-card ${statusClass}">
          <div class="status-icon">${statusIcon}</div>
          <div class="status-content">
            <h2 class="status-title">Extension Status</h2>
            <p class="status-text">${statusText}</p>
            ${
              !hasApiKey
                ? '<p class="status-warning">OpenAI API key not configured</p>'
                : ""
            }
          </div>
        </div>
      </section>
    `;
  }

  renderStatsSection(stats: any): string {
    return `
      <section class="popup-section">
        <h2 class="section-title">Quick Stats</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${stats?.totalChats || 0}</div>
            <div class="stat-label">Cached Chats</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${stats?.totalStories || 0}</div>
            <div class="stat-label">Story Threads</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${this.formatSize(
              stats?.totalSize || 0
            )}</div>
            <div class="stat-label">Cache Size</div>
          </div>
        </div>
      </section>
    `;
  }

  renderInstructionsSection(): string {
    return `
      <section class="popup-section">
        <h2 class="section-title">How to Use</h2>
        <div class="instructions">
          <ol class="instructions-list">
            <li>Open <strong>WhatsApp Web</strong></li>
            <li>Look for the <strong>"AI Assistant"</strong> button at the top of the sidebar</li>
            <li>Click it to configure your <strong>OpenAI API key</strong> and preferences</li>
            <li>Once configured, use AI features on any chat!</li>
          </ol>
        </div>

        <div class="info-box">
          <p><strong>Note:</strong> All settings are configured within WhatsApp Web interface for better integration.</p>
        </div>
      </section>

      <div class="popup-footer">
        <a href="https://web.whatsapp.com" target="_blank" class="btn-primary">Open WhatsApp Web</a>
      </div>
    `;
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  setupEventListeners() {
    // No action buttons needed in status-only popup
  }
}

// Initialize popup
const root = document.getElementById("root");
if (root) {
  new PopupApp(root);
}
