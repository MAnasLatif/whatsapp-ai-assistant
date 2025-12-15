/**
 * WhatsApp AI Assistant - Injected Styles
 * CSS styles for injected UI components
 */

import type { WhatsAppTheme, ThemeColors } from "@/types";
import { THEME_COLORS as themeColors } from "@/types";

let styleElement: HTMLStyleElement | null = null;
let shadowStyleElement: HTMLStyleElement | null = null;

/**
 * Inject or update styles into main document (for settings button)
 */
export function injectStyles(theme: WhatsAppTheme): void {
  const colors = themeColors[theme];
  const css = generateCSS(colors, theme);

  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.id = "wa-ai-assistant-styles";
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
}

/**
 * Inject styles into a shadow root (for modal components)
 */
export function injectShadowStyles(
  shadowRoot: ShadowRoot,
  theme: WhatsAppTheme
): void {
  const colors = themeColors[theme];
  const css = generateCSS(colors, theme);

  // Remove existing style if any
  const existing = shadowRoot.getElementById("wa-ai-shadow-styles");
  if (existing) {
    existing.remove();
  }

  const style = document.createElement("style");
  style.id = "wa-ai-shadow-styles";
  style.textContent = css;
  shadowRoot.insertBefore(style, shadowRoot.firstChild);
}

/**
 * Generate CSS with theme colors
 */
function generateCSS(colors: ThemeColors, theme: WhatsAppTheme): string {
  return `
/* WhatsApp AI Assistant Styles */

/* Chat Button */
.wa-ai-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  margin-right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
  color: ${theme === "dark" ? "rgba(255, 255, 255, 1)" : "rgba(0, 0, 0, 1)"};
}

.wa-ai-chat-btn:hover {
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
}

.wa-ai-chat-btn:active {
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
  };
}

.wa-ai-chat-btn svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Message Action Button */
.wa-ai-action-btn-container {
  opacity: 0;
  position: absolute;
  top: 0;
  left: -60px;
  height: 100%;
  display: flex;
  align-items: center;
  transition: all 0.15s ease;
}

.focusable-list-item:hover .wa-ai-action-btn-container {
  opacity: 1;
}

.focusable-list-item.message-in .wa-ai-action-btn-container {
  left: auto;
  right: -65px;
}

.wa-ai-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: var(--bubble-meta-icon);
  transition: all 0.15s ease;
  margin-right: 4px;
}

.wa-ai-action-btn:hover {
  color: ${colors.primary};
  transform: scale(1.1);
}

.wa-ai-action-btn svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Action Menu */
.wa-ai-action-menu {
  position: fixed;
  background: var(--dropdown-background);
  border-radius: 16px;
  box-shadow: 0 2px 5px rgba(var(--shadow-rgb), .26), 0 2px 10px rgba(var(--shadow-rgb), .16);
  min-width: 180px;
  padding: 10px;
  z-index: 10000;
  animation: wa-ai-fade-in 0.15s ease;
}

.wa-ai-action-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: var(--WDS-content-deemphasized);
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.15s;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  border-radius: 8px;
}

.wa-ai-action-menu-item:hover {
  background-color: var(--WDS-systems-chat-surface-composer);
}

.wa-ai-action-menu-item svg {
  width: 18px;
  height: 18px;
}

/* Chat Panel - Sidebar Style */
.wa-ai-chat-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--WDS-surface-default);
  display: flex;
  flex-direction: column;
  z-index: 10001;
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
  overflow: hidden;
}

.wa-ai-chat-panel.active {
  transform: translateX(0);
}

.wa-ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  padding-top: 0;
  border-bottom: 1px solid #222d34;
  flex-shrink: 0;
}

.wa-ai-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: ${colors.textSecondary};
  transition: all 0.15s;
  margin-left: auto;
}

.wa-ai-back-btn:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
  color: ${colors.text};
}

.wa-ai-back-btn svg {
  width: 24px;
  height: 24px;
}

.wa-ai-chat-title {
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
}

.wa-ai-chat-subtitle {
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 4px 0 0 0;
}

.wa-ai-chat-tabs {
  display: flex;
  border-bottom: 1px solid ${colors.border};
  padding: 0 20px;
}

.wa-ai-tab-btn {
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${colors.textSecondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.15s;
}

.wa-ai-tab-btn:hover {
  color: ${colors.text};
}

.wa-ai-tab-btn.active {
  color: ${colors.primary};
}

.wa-ai-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: ${colors.primary};
}

.wa-ai-chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Form Elements */
.wa-ai-form-group {
  margin-bottom: 20px;
}

.wa-ai-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 8px;
}

.wa-ai-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : colors.background
  };
  color: ${colors.text};
  font-size: 14px;
  transition: border-color 0.15s;
}

.wa-ai-input:focus {
  outline: none;
  border-color: ${colors.primary};
}

.wa-ai-input::placeholder {
  color: ${colors.textSecondary};
}

.wa-ai-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : colors.background
  };
  color: ${colors.text};
  font-size: 14px;
  cursor: pointer;
}

.wa-ai-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid ${colors.border};
}

.wa-ai-toggle:last-child {
  border-bottom: none;
}

.wa-ai-toggle-label {
  font-size: 14px;
  color: ${colors.text};
}

.wa-ai-toggle-description {
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 4px;
}

.wa-ai-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"
  };
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.wa-ai-switch.active {
  background: ${colors.primary};
}

.wa-ai-switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}

.wa-ai-switch.active .wa-ai-switch-thumb {
  transform: translateX(20px);
}

/* Buttons */
.wa-ai-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.wa-ai-chat-content 
.wa-ai-btn {
  display: flex;
  width: 100%;
  justify-content: center;
}

.wa-ai-btn-primary {
  background: ${colors.primary};
  color: white;
}

.wa-ai-btn-primary:hover {
  background: ${colors.primaryHover};
}

.wa-ai-btn-secondary {
  background: transparent;
  color: ${colors.text};
  border: 1px solid ${colors.border};
}

.wa-ai-btn-secondary:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
  };
}

.wa-ai-btn-danger {
  background: ${colors.error};
  color: white;
}

.wa-ai-btn-danger:hover {
  opacity: 0.9;
}

/* Results Display */
.wa-ai-results {
  position: fixed;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 16px;
  max-width: 400px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, ${theme === "dark" ? "0.3" : "0.15"});
  z-index: 10000;
  animation: wa-ai-slide-up 0.2s ease;
}

.wa-ai-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.wa-ai-results-title {
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
}

.wa-ai-results-content {
  font-size: 14px;
  color: ${colors.text};
  line-height: 1.5;
}

.wa-ai-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${colors.textSecondary};
}

.wa-ai-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid ${colors.border};
  border-top-color: ${colors.primary};
  border-radius: 50%;
  animation: wa-ai-spin 0.8s linear infinite;
}

.wa-ai-error {
  color: ${colors.error};
}

/* Reply Options */
.wa-ai-reply-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wa-ai-reply-option {
  padding: 12px;
  border: 1px solid ${colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.wa-ai-reply-option:hover {
  border-color: ${colors.primary};
  background: ${
    theme === "dark" ? "rgba(0,168,132,0.1)" : "rgba(0,168,132,0.05)"
  };
}

.wa-ai-reply-option.selected {
  border-color: ${colors.primary};
  background: ${
    theme === "dark" ? "rgba(0,168,132,0.15)" : "rgba(0,168,132,0.1)"
  };
}

.wa-ai-reply-tone {
  font-size: 12px;
  font-weight: 600;
  color: ${colors.primary};
  text-transform: capitalize;
  margin-bottom: 4px;
}

.wa-ai-reply-text {
  font-size: 14px;
  color: ${colors.text};
}

/* Cache Stats */
.wa-ai-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.wa-ai-stat-card {
  padding: 12px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : colors.background
  };
  border-radius: 8px;
  text-align: center;
}

.wa-ai-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: ${colors.text};
}

.wa-ai-stat-label {
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 4px;
}

/* Info Banner */
.wa-ai-info-banner {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: ${
    theme === "dark" ? "rgba(59,130,246,0.15)" : "rgba(219,234,254,1)"
  };
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid ${
    theme === "dark" ? "rgba(59,130,246,0.3)" : "rgba(147,197,253,1)"
  };
}

.wa-ai-info-banner svg {
  flex-shrink: 0;
  fill: ${theme === "dark" ? "rgba(147,197,253,1)" : "rgba(59,130,246,1)"};
}

.wa-ai-info-banner strong {
  display: block;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 4px;
}

.wa-ai-info-banner p {
  font-size: 13px;
  color: ${colors.textSecondary};
  line-height: 1.5;
}

/* Chat Header Subtitle */
.wa-ai-chat-subtitle {
  font-size: 13px;
  color: ${colors.textSecondary};
  margin-top: 4px;
  font-weight: 400;
}

.wa-ai-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.wa-ai-tag {
  display: inline-block;
  padding: 4px 12px;
  background: ${
    theme === "dark" ? "rgba(0,168,132,0.15)" : "rgba(0,168,132,0.1)"
  };
  color: ${colors.primary};
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

/* Textarea */
.wa-ai-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : colors.background
  };
  color: ${colors.text};
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.15s;
}

.wa-ai-textarea:focus {
  outline: none;
  border-color: ${colors.primary};
}

.wa-ai-textarea::placeholder {
  color: ${colors.textSecondary};
}

.wa-ai-input-description {
  font-size: 12px;
  color: ${colors.textSecondary};
  margin-top: 6px;
}

/* Stories List */
.wa-ai-stories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.wa-ai-story-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : colors.background
  };
  border: 1px solid ${colors.border};
  border-radius: 8px;
  transition: all 0.15s;
}

.wa-ai-story-item:hover {
  border-color: ${colors.primary};
  background: ${
    theme === "dark" ? "rgba(0,168,132,0.08)" : "rgba(0,168,132,0.03)"
  };
}

.wa-ai-story-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.wa-ai-story-status.active {
  background: ${colors.success};
  box-shadow: 0 0 0 2px ${
    theme === "dark" ? "rgba(0,168,132,0.2)" : "rgba(0,168,132,0.15)"
  };
}

.wa-ai-story-status.inactive {
  background: ${colors.textSecondary};
}

.wa-ai-story-info {
  flex: 1;
  min-width: 0;
}

.wa-ai-story-title {
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 6px;
}

.wa-ai-story-summary {
  font-size: 13px;
  color: ${colors.text};
  line-height: 1.5;
  margin-bottom: 8px;
}

.wa-ai-story-points {
  font-size: 12px;
  color: ${colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 8px;
}

.wa-ai-story-meta {
  font-size: 12px;
  color: ${colors.textSecondary};
}

.wa-ai-btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: ${colors.textSecondary};
}

.wa-ai-btn-icon:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
  color: ${colors.error};
}

.wa-ai-btn-icon svg {
  fill: currentColor;
}

/* Empty State */
.wa-ai-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  margin: auto;
}

.wa-ai-empty-state svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  fill: ${colors.textSecondary};
}

.wa-ai-empty-state p {
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 6px;
}

.wa-ai-empty-state span {
  font-size: 12px;
  color: ${colors.textSecondary};
}

/* Animations */
@keyframes wa-ai-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes wa-ai-slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wa-ai-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========================================
   GLOBAL SETTINGS COMPONENTS
   ======================================== */

/* Global Settings Button in Sidebar */
.wa-global-settings-wrapper {
  margin: 0;
  padding: 0;
}

.wa-global-settings-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  padding: 4px;
  margin-top: 4px;
  border-radius: 100%;
  color: ${colors.textSecondary};
}

.wa-global-settings-btn:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
  };
}

.wa-global-settings-btn svg {
  width: 32px;
  height: 32px;
  fill: ${colors.textSecondary};
}

.wa-global-settings-content {
  flex: 1;
  text-align: left;
}

.wa-global-settings-title {
  font-size: 16px;
  font-weight: 500;
  color: ${colors.text};
  margin: 0;
}

.wa-global-settings-subtitle {
  font-size: 13px;
  color: ${colors.textSecondary};
  margin: 0;
}

/* Global Settings Panel - Full Screen */
.wa-global-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--WDS-surface-default);
  z-index: 10000;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.wa-global-settings-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.wa-global-settings-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--WDS-surface-default);
  z-index: 10001;
  display: flex;
  flex-direction: column;
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
}

.wa-global-settings-panel.active {
  transform: translateX(0);
}

/* Settings Header */
.wa-global-settings-header {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
  padding: 18px;
  padding-top: 0;
  flex-shrink: 0;
}

.wa-global-settings-back {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${colors.text};
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.wa-global-settings-back:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
}

.wa-global-settings-back svg {
  width: 24px;
  height: 24px;
  stroke: ${colors.text};
}

.wa-global-settings-title {
  font-size: 20px;
  font-weight: 500;
  color: ${colors.text};
  margin: 0;
}

/* Settings Content */
.wa-global-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.wa-settings-section {
  margin-bottom: 32px;
}

.wa-settings-section:last-child {
  margin-bottom: 0;
}

.wa-settings-section-title {
  font-size: 16px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${colors.border};
}

/* Settings Group */
.wa-settings-group {
  margin-bottom: 20px;
  position: relative;
}

.wa-settings-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 8px;
}

.wa-settings-required {
  color: #e53935;
}

.wa-settings-value {
  margin-left: auto;
  color: ${colors.primary};
  font-weight: 600;
}

.wa-settings-input-container {
  display: flex;
  gap: 8px;
}

.wa-settings-input,
.wa-settings-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  color: ${colors.text};
  background: ${theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff"};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;
}

.wa-settings-input:focus,
.wa-settings-select:focus {
  border-color: ${colors.primary};
}

.wa-settings-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
  outline: none;
  -webkit-appearance: none;
}

.wa-settings-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${colors.primary};
  cursor: pointer;
  border: 2px solid ${colors.background};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.wa-settings-range::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${colors.primary};
  cursor: pointer;
  border: 2px solid ${colors.background};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.wa-settings-help {
  font-size: 12px;
  color: ${colors.textSecondary};
  margin: 6px 0 0 0;
}

.wa-settings-help a {
  color: ${colors.primary};
  text-decoration: none;
}

.wa-settings-help a:hover {
  text-decoration: underline;
}

/* Toggle Switch */
.wa-settings-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid ${colors.border};
}

.wa-settings-toggle:last-child {
  border-bottom: none;
}

.wa-settings-toggle-label {
  font-size: 14px;
  font-weight: 500;
  color: ${colors.text};
  margin-bottom: 2px;
}

.wa-settings-toggle-help {
  font-size: 12px;
  color: ${colors.textSecondary};
}

.wa-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.wa-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.wa-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"
  };
  transition: 0.3s;
  border-radius: 24px;
}

.wa-switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.wa-switch input:checked + .wa-switch-slider {
  background-color: ${colors.primary};
}

.wa-switch input:checked + .wa-switch-slider:before {
  transform: translateX(20px);
}

/* Settings Footer */
.wa-global-settings-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  flex-shrink: 0;
}

.wa-settings-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

button#test-api-key-btn {
  flex: 0;
  flex-shrink: 0;
  background: #00a884;
  color: white;
}

.wa-settings-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.wa-settings-btn-primary {
  background: ${colors.primary};
  color: white;
}

.wa-settings-btn-primary:hover {
  background: ${theme === "dark" ? "#00c9a1" : "#00a884"};
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 168, 132, 0.3);
}

.wa-settings-btn-secondary {
  background: transparent;
  color: ${colors.text};
  border: 1px solid ${colors.border};
}

.wa-settings-btn-secondary:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"
  };
}

/* API Key Status */
#api-key-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

#api-key-status svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* Toast Messages */
.wa-settings-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: ${colors.background};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10002;
  animation: wa-toast-slide-in 0.3s ease-out;
}

.wa-settings-toast svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.wa-settings-toast-success svg {
  fill: #4caf50;
}

.wa-settings-toast-error svg {
  fill: #f44336;
}

.wa-settings-toast span {
  font-size: 14px;
  color: ${colors.text};
}

@keyframes wa-toast-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
}

/**
 * Remove injected styles
 */
export function removeStyles(): void {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
}
