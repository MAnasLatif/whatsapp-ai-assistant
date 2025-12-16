# WhatsApp AI Assistant

> A powerful Chrome extension that brings AI-powered features to WhatsApp Web using OpenAI's GPT-5 models.

[![Built with WXT](https://img.shields.io/badge/Built%20with-WXT-00ADD8?style=flat&logo=google-chrome)](https://wxt.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 Features

### AI-Powered Message Analysis

- **Smart Message Insights**: Analyze message content with AI to understand context and sentiment
- **Multi-Language Translation**: Translate messages to and from any language
- **Tone Detection**: Understand the emotional tone and intent behind messages
- **Message Summarization**: Get concise summaries of long conversations

### Intelligent Reply Generation

- **Context-Aware Replies**: Generate appropriate responses based on conversation history
- **Multiple Tone Options**: Formal, casual, friendly, professional, and more
- **Custom Prompts**: Tailor AI responses to your specific needs

### Story Thread System

- **Contextual Narratives**: AI generates conversation summaries that maintain context
- **Multi-Thread Support**: Handle multiple conversation contexts per chat
- **Smart Caching**: Efficiently cache and retrieve conversation insights

### Media Processing

- **Image Analysis**: Extract and analyze images using GPT-5 Vision API
- **Voice Transcription**: Transcribe voice messages using Whisper API
- **Media Context Integration**: Integrate media insights into conversation threads

### Privacy & Performance

- **Local Caching**: Reduce API calls and improve response times
- **Theme Sync**: Automatically adapts to WhatsApp's light/dark theme
- **Isolated UI**: Shadow DOM ensures no conflicts with WhatsApp's interface

## 🚀 Tech Stack

- **Framework**: [WXT](https://wxt.dev) - Modern web extension framework
- **Language**: TypeScript 5.9+
- **Architecture**: Vanilla TypeScript with class-based components (no React/Vue)
- **API**: OpenAI GPT-5 family (gpt-5, gpt-5.2, gpt-5-mini, gpt-5-nano)
- **Storage**: Chrome Storage API with intelligent caching
- **Styling**: Shadow DOM for style isolation

## 📦 Installation

### For Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/MAnasLatif/whatsapp-ai-assistant.git
   cd whatsapp-ai-assistant
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up your OpenAI API key**

   - The extension will prompt you to enter your API key on first use
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

4. **Start development mode**

   ```bash
   npm run dev              # For Chrome
   npm run dev:firefox      # For Firefox
   ```

5. **Load the extension**

   - **Chrome**: Open `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select `.output/chrome-mv3`
   - **Firefox**: Open `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select the manifest file from `.output/firefox-mv3`

6. **Navigate to WhatsApp Web**
   - Visit https://web.whatsapp.com
   - You should see the AI settings button above WhatsApp's native settings button

### For Production

```bash
npm run build            # Build for Chrome
npm run build:firefox    # Build for Firefox
npm run zip              # Create distributable zip for Chrome
npm run zip:firefox      # Create distributable zip for Firefox
```

## 🎯 Usage

### Getting Started

1. **Configure AI Settings**

   - Click the AI settings button (sparkle icon) in WhatsApp's sidebar
   - Enter your OpenAI API key
   - Select your preferred GPT-5 model
   - Customize analysis options

2. **Analyze Messages**

   - Hover over any message to reveal the AI action button
   - Click to open the action menu with options:
     - Analyze message
     - Translate text
     - Explain in simple terms
     - Change tone
     - Generate reply

3. **View Results**
   - AI responses appear in a modal overlay
   - Copy results to clipboard
   - Insert generated replies directly into chat

### Keyboard Shortcuts

- Click AI settings button to open/close settings panel
- Hover over messages to access AI actions
- ESC key to close modals

## 🏗️ Project Structure

```
whatsapp-ai-assistant/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts              # Service worker (API calls, message handling)
│   │   ├── content/
│   │   │   └── index.ts               # Content script (DOM injection, UI orchestration)
│   │   └── popup/                     # Browser action popup
│   ├── ui/
│   │   ├── app.ts                     # Main app with Shadow DOM
│   │   └── components/                # Class-based UI components
│   │       ├── chat-button.ts
│   │       ├── chat-panel.ts
│   │       ├── action-menu.ts
│   │       ├── message-action-button.ts
│   │       ├── global-settings-button.ts
│   │       └── global-settings-panel.ts
│   ├── utils/
│   │   ├── dom-components.ts          # Centralized WhatsApp selectors (110+)
│   │   ├── icons.ts                   # SVG icon library (25+)
│   │   ├── storage.ts                 # Chrome storage wrapper
│   │   ├── whatsapp-dom.ts            # WhatsApp DOM utilities
│   │   └── storage-debug.ts           # Debug tools
│   ├── types/
│   │   └── index.ts                   # TypeScript type definitions
│   └── styles/
│       ├── ui-styles.ts               # Component styles
│       └── popup-styles.ts            # Popup styles
├── docs/
│   ├── srs.md                         # Software Requirements Specification
│   └── technical-reference.md         # Detailed technical documentation
├── wxt.config.ts                      # WXT configuration
└── tsconfig.json                      # TypeScript configuration
```

## 🔧 Development

### Available Commands

```bash
npm run dev              # Chrome dev mode with hot reload
npm run dev:firefox      # Firefox dev mode
npm run build            # Production build for Chrome
npm run build:firefox    # Production build for Firefox
npm run compile          # TypeScript type checking
npm run zip              # Create distributable zip
npm run postinstall      # WXT preparation (runs automatically)
```

### Code Style Guidelines

1. **Component Architecture**

   - Use class-based vanilla TypeScript components
   - No React/Vue patterns
   - Leverage Shadow DOM for style isolation

2. **WhatsApp Integration**

   - Always use `DOMComponents` from `src/utils/dom-components.ts`
   - Never hardcode WhatsApp selectors
   - Support both light and dark themes

3. **Icons**

   - All SVG icons must come from [SVG Repo](https://svgrepo.com)
   - Centralize in `src/utils/icons.ts`

4. **Storage**

   - Use wrapper functions from `src/utils/storage.ts`
   - Never access `browser.storage` directly

5. **Type Safety**
   - All types defined in `src/types/index.ts`
   - Use typed message passing between scripts

### Testing

1. Run type checking: `npm run compile`
2. Test in Chrome: `npm run dev` → Load extension → Visit WhatsApp Web
3. Test in Firefox: `npm run dev:firefox` → Load extension → Visit WhatsApp Web
4. Verify both light and dark theme support
5. Test all AI features with various message types

## 🔐 Privacy & Security

- **API Key Storage**: OpenAI API keys stored locally in Chrome storage
- **No Data Collection**: No user data collected or transmitted to third parties
- **OpenAI API Only**: All AI requests go directly to OpenAI's API
- **Local Caching**: Conversation context cached locally for performance

## 📝 Configuration

### Supported GPT-5 Models

- `gpt-5.2` - Latest flagship model with enhanced reasoning
- `gpt-5` - Standard GPT-5 model
- `gpt-5-mini` - Faster, cost-effective model
- `gpt-5-nano` - Lightweight model for quick responses

### Settings Structure

Settings are organized into categories:

- **AI Settings**: Model, API key, temperature, max tokens
- **General Settings**: Language preferences, UI options
- **Cache Settings**: Cache duration, size limits
- **Privacy Settings**: Data retention, analytics

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Run type checking: `npm run compile`
5. Test thoroughly in both Chrome and Firefox
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Resources

- [WXT Documentation](https://wxt.dev)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**M Anas Latif**

- Website: [m.anaslatif.dev](https://m.anaslatif.dev)
- Email: contact@anaslatif.dev

## 🙏 Acknowledgments

- Built with [WXT Framework](https://wxt.dev)
- Powered by [OpenAI GPT-5](https://openai.com)
- Icons from [SVG Repo](https://svgrepo.com)

## 📚 Documentation

For detailed technical documentation, see:

- [Software Requirements Specification](docs/srs.md)
- [Technical Reference](docs/technical-reference.md)

---

**Note**: This extension requires an OpenAI API key to function. API usage costs are the responsibility of the user.
