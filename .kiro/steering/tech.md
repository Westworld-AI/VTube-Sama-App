# Technology Stack

## Core Technologies

### Frontend (GUI)
- **Framework**: Electron with React 18 + TypeScript
- **UI Libraries**: 
  - NextUI components
  - Ant Design (antd)
  - Tailwind CSS for styling
  - Framer Motion for animations
- **Live2D**: pixi-live2d-display with PIXI.js v6
- **State Management**: React hooks and context

### Backend (Main Process)
- **Runtime**: Node.js with TypeScript
- **Database**: SQLite with TypeORM
- **Architecture**: Domain-driven design with dependency injection
- **HTTP Server**: Express.js (port 8889)
- **Live Streaming**: bili-live-listener for Bilibili integration

### AI & Voice
- **LLM Providers**: OpenAI, Ollama, ZhiPu (CharGLM)
- **TTS**: Microsoft Edge TTS (msedge-tts)
- **Voice Processing**: Web Audio API with VAD (Voice Activity Detection)
- **Speech Recognition**: Vosk browser integration

### Game Integration
- **Platform**: BepInEx plugin framework for Unity games
- **Language**: C# with Harmony patching
- **Target**: Subnautica mod support

## Build System & Commands

### Development
```bash
# Install dependencies
cd gui && yarn install && npm run electron-rebuild

# Start development server
yarn start
# or
make run-gui

# Start other modules
make run-binary
make run-webapps
```

### Building & Packaging
```bash
# Package for current platform
yarn package
# or
make package

# Package for Windows
yarn package-win
# or
make package-win

# Build components separately
npm run build:main
npm run build:renderer
```

### Testing & Quality
```bash
# Run tests
npm test

# Linting
npm run lint

# Electron rebuild (after native deps changes)
npm run electron-rebuild
```

## Development Tools
- **Bundler**: Webpack 5 with custom ERB configs
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint with TypeScript support
- **Code Formatting**: Prettier
- **Git Hooks**: Husky with lint-staged

## File Protocols
Custom protocols for asset loading:
- `modelfile://` - Live2D model files
- `mediafile://` - Media assets
- `imagesfile://` - Image resources