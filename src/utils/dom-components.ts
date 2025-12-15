/**
 * Global DOM Selectors for WhatsApp Web and Extension Components
 * Centralized repository of all DOM selectors used across the extension
 */

export const DOMComponents = {
  // ===== WhatsApp Core Containers =====
  app: "#app",
  side: "#side",
  main: "#main",
  mainMenu: "header.xq3y45c.xbyj736 > div > div > div",

  // ===== WhatsApp Chat Elements =====
  chatList: '[data-testid="chat-list"]',
  conversationPanel: '[data-testid="conversation-panel-messages"]',
  conversationInfoHeader: '[data-testid="conversation-info-header-chat-title"]',
  copyableArea: ".copyable-area",
  chatContainer: '[data-scrolltracepolicy="wa.web.conversation.messages"]',

  // ===== WhatsApp Message Elements =====
  messageContainer: "div._amjv[data-id]",
  messageVirtualized: '[data-virtualized="false"]',
  copyableText: ".copyable-text",
  messageContent: "span.selectable-text.copyable-text, .emoji.copyable-text",
  messageTimestamp: ".x3nfvp2 .x1c4vz4f, .x3nfvp2 .x2lah0s",
  messageActionsContainer:
    ".x78zum5.xbfrwjf.x8k05lb.xeq5yr9.x1n2onr6.xrr41r3.xqcrz7y",

  // ===== WhatsApp Media Elements =====
  voiceMessageLabel: '[aria-label*="voice message" i]',
  voiceDuration: ".x10l6tqk.x1fesggd",
  imageBlob: 'img[src^="blob:"]',

  // ===== WhatsApp Message Status/Type Elements =====
  quotedMessage: '[aria-label="Quoted message"]',
  forwardIcon: '[data-icon="forward-refreshed"]',
  deletedMessage: '[title*="deleted" i]',
  groupIndicator: "._amkz",

  // ===== WhatsApp Header/Navigation Elements =====
  newChatButton: ".x1okw0bk .x78zum5.x6s0dn4.x1afcbsf.x14ug900>div",
  htmlSpan: "span.html-span",

  // ===== Extension Custom Elements =====
  aiAssistantRoot: "#wa-ai-assistant-root",
  aiContainer: "#wa-ai-container",
  aiChatButton: ".wa-ai-chat-btn",
  aiActionButton: ".wa-ai-action-btn",
  aiActionButtonClass: "ai-action-btn",

  // ===== Extension Button Classes =====
  whatsappButtonBase:
    "html-button xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x178xt8z x1lun4ml xso031l xpilrb4 x1n2onr6 x1ejq31n x18oe1m7 x1sy0etr xstzfhl x1so62im x1syfmzz x1ja2u2z x1ypdohk x1s928wv x1j6awrg x4eaejv x1wsn0xg x1r0yslu x2q1x1w xapdjt xr6f91l x5rv0tg x1akc3lz xikp0eg x1xl5mkn x1mfml39 x1l5mzlr xgmdoj8 x1f1wgk5 x1x3ic1u xjbqb8w xuwfzo9 xy0j11r xg268so x1b4bgnk x1wb366y xtnn1bt x9v5kkp xmw7ebm xrdum7p x2lah0s x1lliihq xk8lq53 x9f619 xt8t1vi x1xc408v x129tdwq x15urzxu x1vqgdyp x100vrsf",
  whatsappButtonInner:
    "html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl",
  whatsappButtonContent:
    "html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1q0g3np xh8yej3 xl56j7k",
  whatsappButtonIcon:
    "html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1vjfegm",
  whatsappButtonIconSpan: "xxk0z11 xvy4d1p",
  whatsappButtonSpacer:
    "html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x1vjfegm x1c4vz4f",

  // ===== Message Action Button Classes =====
  messageActionButtonBase:
    "xjb2p0i x1ypdohk xjbqb8w x972fbf xcfux6l x1qhh985 xm0m39n xdj266r x11i5rnm xat24cr x1mh8g0r x1w3u9th x1t137rt x1o1ewxj x3x9cwd x1e5q0jg x13rtm0m x3nfvp2 x1q0g3np xexx8yu x4uap5 x18d9i69 xkhd6sd",
  messageActionIconSpan:
    "x1c4vz4f xs83m0k xdl72j9 x1g77sc7 x78zum5 xozqiw3 x1oa3qoh x12fk4p8 xeuugli x2lwn1j xozqiw3 x1oa3qoh x12fk4p8",
  messageActionContainer: ".focusable-list-item ._amk6._amlo",

  // ===== Extension Component Selectors =====
  // Global Settings
  globalSettingsWrapper: ".wa-global-settings-wrapper",
  globalSettingsButton: ".wa-global-settings-btn",
  globalSettingsOverlay: ".wa-global-settings-overlay",
  globalSettingsPanel: ".wa-global-settings-panel",

  // Chat Panel
  chatPanel: ".wa-ai-chat-panel",
  chatBackBtn: ".wa-ai-back-btn",
  chatTabBtn: ".wa-ai-tab-btn",
  chatContent: ".wa-ai-chat-content",
  chatSwitch: ".wa-ai-switch",

  // Settings Panel - IDs

  saveSettings: "#wa-ai-save-settings",
  clearChatData: "#wa-ai-clear-chat-data",
  refreshStories: "#wa-ai-refresh-stories",
  storiesList: "#wa-ai-stories-list",
  customPrompt: "#wa-ai-custom-prompt",
  preferredTone: "#wa-ai-preferred-tone",
  translationLang: "#wa-ai-translation-lang",
  autoAnalyze: "#wa-ai-auto-analyze",

  // Action Menu
  actionMenu: ".wa-ai-action-menu",
  actionMenuItem: ".wa-ai-action-item",

  // Results Display
  resultsDisplay: ".wa-ai-results",
  resultsHeader: ".wa-ai-results-header",
  resultsTitle: ".wa-ai-results-title",
  resultsContent: ".wa-ai-results-content",
  resultsCloseBtn: ".wa-ai-close-btn",

  // Common UI elements
  actionBtnContainer: ".wa-ai-action-btn-container",

  // Data attributes
  dataStory: "[data-story]",
  dataTab: "[data-tab]",
  dataFeature: "[data-feature]",
};
