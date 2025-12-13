import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  outDir: "dist",
  manifest: {
    name: "WhatsApp AI Assistant",
    description:
      "Enhance WhatsApp Web with AI-powered message analysis, translation, and reply generation",
    version: "0.1.0",
    permissions: ["storage", "activeTab"],
    host_permissions: ["*://web.whatsapp.com/*", "https://api.openai.com/*"],
    icons: {
      16: "icon/16.png",
      32: "icon/32.png",
      48: "icon/48.png",
      128: "icon/128.png",
    },
  },
  webExt: {
    chromiumProfile: ".wxt/chrome-data",
    firefoxProfile: ".wxt/firefox-data",
    keepProfileChanges: true,
  },
});
