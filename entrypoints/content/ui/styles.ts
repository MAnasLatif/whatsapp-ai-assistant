/**
 * WhatsApp AI Assistant - Injected Styles
 * CSS styles for injected UI components
 */

import type { WhatsAppTheme, ThemeColors } from "@/utils/types";
import { THEME_COLORS as themeColors } from "@/utils/types";

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

/* Settings Button */
.wa-ai-settings-btn {
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

.wa-ai-settings-btn:hover {
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
}

.wa-ai-settings-btn:active {
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"
  };
}

.wa-ai-settings-btn svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* Message Action Button */
.wa-ai-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  color: ${colors.textSecondary};
  transition: all 0.15s ease;
  margin-right: 4px;
}

.wa-ai-action-btn:hover {
  color: ${colors.primary};
  transform: scale(1.1);
}

.wa-ai-action-btn svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

/* Action Menu */
.wa-ai-action-menu {
  position: fixed;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, ${theme === "dark" ? "0.3" : "0.15"});
  min-width: 180px;
  padding: 8px 0;
  z-index: 10000;
  animation: wa-ai-fade-in 0.15s ease;
}

.wa-ai-action-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: ${colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.15s;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.wa-ai-action-menu-item:hover {
  background-color: ${
    theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
  };
}

.wa-ai-action-menu-item svg {
  width: 18px;
  height: 18px;
}

/* Settings Panel */
.wa-ai-settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, ${theme === "dark" ? "0.6" : "0.4"});
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  animation: wa-ai-fade-in 0.2s ease;
}

.wa-ai-settings-panel {
  background: ${colors.surface};
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, ${theme === "dark" ? "0.4" : "0.2"});
  animation: wa-ai-slide-up 0.25s ease;
}

.wa-ai-settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${colors.border};
}

.wa-ai-settings-title {
  font-size: 18px;
  font-weight: 600;
  color: ${colors.text};
  margin: 0;
}

.wa-ai-close-btn {
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
}

.wa-ai-close-btn:hover {
  background: ${
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"
  };
  color: ${colors.text};
}

.wa-ai-settings-tabs {
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

.wa-ai-settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
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
