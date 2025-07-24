# Project Structure

## Root Level Organization

```
├── binary/          # Vision processing module
├── gui/             # Main Electron application
├── mods/            # Game integration modules
│   └── Subnautica/  # Subnautica game mod support
└── scripts/         # Build and utility scripts
    ├── mac/         # macOS-specific scripts
    └── win/         # Windows-specific scripts
```

## GUI Application Structure

### Main Process (`gui/src/main/`)
```
src/main/
├── apps/                    # Application modules
│   ├── control/            # Control task management
│   ├── environment/        # Live room environment
│   └── perception/         # Perception processing
├── domain/                 # Domain layer (DDD pattern)
│   ├── dao/               # Data Access Objects
│   ├── dto/               # Data Transfer Objects
│   ├── entitys/           # Database entities
│   └── service/           # Business logic services
├── framework/             # Infrastructure layer
│   ├── bridge/            # Python bridge integration
│   ├── live/              # Live streaming clients
│   ├── orm/               # Database ORM setup
│   ├── queue/             # Task queue management
│   ├── tts/               # Text-to-speech clients
│   └── vision/            # Vision processing
├── route/                 # API routes (if applicable)
├── main.ts               # Main process entry point
├── menu.ts               # Application menu
├── preload.ts            # Preload script
└── util.ts               # Utilities
```

### Renderer Process (`gui/src/renderer/`)
```
src/renderer/
├── components/            # React components
│   ├── character/        # Character management UI
│   ├── common/           # Reusable components
│   ├── creativeworkshop/ # Model creation tools
│   ├── home/             # Home page components
│   ├── live2d/           # Live2D display components
│   ├── livepage/         # Live streaming UI
│   ├── memory/           # Chat history components
│   ├── menu/             # Navigation menu
│   ├── mssage/           # Message handling UI
│   └── system/           # System settings
├── features/             # Feature-specific logic
│   ├── agent/            # AI agent handling
│   ├── character/        # Character management
│   ├── charactermodel/   # Live2D model loading
│   ├── file/             # File utilities
│   ├── live/             # Live streaming
│   ├── llm/              # LLM integrations
│   ├── memory/           # Chat history
│   ├── system/           # System settings
│   ├── utils/            # Utility functions
│   ├── vision/           # Vision processing
│   ├── voice/            # Voice handling
│   └── websocket/        # WebSocket client
├── hooks/                # Custom React hooks
├── pages/                # Page components
├── types/                # TypeScript type definitions
├── constants/            # Application constants
├── App.tsx              # Main app component
└── index.tsx            # Renderer entry point
```

### Assets (`gui/assets/`)
```
assets/
├── background/           # Background images
├── icons/               # Application icons
├── images/              # UI images
│   └── character/       # Character avatars
├── js/                  # Live2D JavaScript libraries
├── models/              # Live2D model files
│   ├── Hiyori/         # Character model data
│   ├── atri/           # Character model data
│   └── chuixue_3/      # Character model data
└── vosk/               # Speech recognition models
```

## Architecture Patterns

### Domain-Driven Design (DDD)
- **Entities**: Core business objects (`character.ts`, `characterModel.ts`)
- **DTOs**: Data transfer between layers
- **DAOs**: Database access abstraction
- **Services**: Business logic implementation

### Dependency Injection
- Centralized injector in `framework/dependencyInjector.ts`
- Service registration in database initialization
- Clean separation of concerns

### Event-Driven Architecture
- IPC communication between main and renderer processes
- WebSocket integration for real-time features
- Queue-based task management

## File Naming Conventions

### TypeScript Files
- **Components**: PascalCase (e.g., `CharacterCard.tsx`)
- **Services**: camelCase with Service suffix (e.g., `characterService.ts`)
- **DTOs**: PascalCase with DTO suffix (e.g., `CharacterDTO.ts`)
- **DAOs**: camelCase with Dao suffix (e.g., `characterDao.ts`)
- **Entities**: camelCase (e.g., `character.ts`)

### Directories
- **Components**: camelCase (e.g., `charactermodel/`)
- **Features**: camelCase (e.g., `live2d/`)
- **Assets**: lowercase (e.g., `background/`, `models/`)

## Configuration Files
- **Database**: SQLite with TypeORM configuration
- **Build**: Webpack configs in `.erb/configs/`
- **Styling**: Tailwind config with NextUI integration
- **TypeScript**: Strict mode with decorators enabled