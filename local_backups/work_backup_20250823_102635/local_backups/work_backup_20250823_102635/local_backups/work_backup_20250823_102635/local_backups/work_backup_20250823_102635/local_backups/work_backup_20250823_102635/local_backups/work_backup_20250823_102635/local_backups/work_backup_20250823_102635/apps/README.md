# Novaxe Oracle - Enterprise Music Technology Platform

## 🎯 Overview

Novaxe Oracle is a world-class, future-proof musical software ecosystem that combines:
- **Novaxe SEB** (Angular 15): Professional music ecosystem with MIDI, ABCJS, Tonal.js, and comprehensive music services
- **Million Song Mind** (React/Vite): Advanced braid visualization and music theory UI
- **Shared Infrastructure**: Canonical types, service interfaces, and cross-platform bridges

## 🏗️ Architecture

```
novaxe-oracle/
├── apps/
│   ├── novaxe/          # Angular 15 music platform
│   └── msm/             # React/Vite braid visualization
├── packages/
│   ├── shared/          # Shared types and interfaces
│   └── msm-bridge/      # PostMessage communication bridge
├── scripts/             # Build and test automation
└── .github/workflows/   # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.19.0 or 20.19.0
- npm 10.0.0+
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url> novaxe-oracle
cd novaxe-oracle

# Install dependencies for both apps
cd apps/novaxe && npm install
cd ../msm && npm install
cd ../..

# Build shared packages (when configured)
cd packages/shared && npm run build
cd ../msm-bridge && npm run build
```

### Development

```bash
# Run Novaxe SEB (Angular 15)
cd apps/novaxe
npm start
# Available at http://localhost:4200

# Run Million Song Mind (React/Vite)
cd apps/msm
npm run dev
# Available at http://localhost:5173

# Run both simultaneously (from root)
npm run serve:all
```

### Building for Production

```bash
# Build Novaxe SEB
cd apps/novaxe
npm run build -- --configuration production

# Build Million Song Mind
cd apps/msm
npm run build

# Build everything (from root)
npm run build:all
```

## 🎵 Features

### Novaxe SEB (Angular 15)
- **MIDI Integration**: Full Web MIDI API support with device management
- **Music Notation**: ABCJS rendering with interactive editing
- **Music Theory**: Tonal.js powered chord/scale analysis
- **Transport Control**: Professional playback with metronome and looping
- **Braid Visualization**: Harmonic relationship mapping
- **Audio Synthesis**: WebAudio API with effects processing

### Million Song Mind (React/Vite)
- **Advanced Braid UI**: Interactive harmonic visualization
- **Music Theory Tools**: Chord progression analysis
- **Dataset Exploration**: Large-scale music data visualization
- **Real-time Collaboration**: Multi-user music theory exploration

### Shared Infrastructure
- **Canonical Types**: Unified musical data structures
- **Service Interfaces**: Platform-agnostic service contracts
- **AI-Ready**: Prepared for ML/AI integration
- **Multi-Platform**: Ready for web, mobile, tablet deployment

## 🔧 Integration Architecture

### Phase 1: Embedding (Current)
MSM runs as iframe within Novaxe with PostMessage bridge for communication

### Phase 2: Service Unification (Next)
Unified service layer with feature-flag based implementations

### Phase 3: Component Migration (Future)
Angular Elements for tight integration and cross-framework components

## 📊 Performance Targets

- **Bundle Size**: < 6.0MB initial load
- **Time to Interactive**: < 3 seconds on 3G
- **MIDI Latency**: < 50ms note-on to audio
- **Frame Rate**: >= 30 FPS for visualizations
- **Memory Usage**: < 100MB baseline

## 🧪 Testing

```bash
# Run Novaxe tests
cd apps/novaxe
npm test

# Run MSM tests
cd apps/msm
npm test

# Run smoke tests (from root)
npm run smoke

# Analyze bundle sizes
npm run analyze:bundle

# Performance testing
npm run test:performance
```

## 🔄 CI/CD

GitHub Actions workflow runs on push/PR:
- Multi-OS testing (Ubuntu, macOS)
- Node.js version matrix (18.19.0, 20.19.0)
- Bundle size analysis
- Integration testing
- Performance benchmarking

## 📦 Shared Packages

### @novaxe-oracle/shared
Core types and interfaces for the entire ecosystem:
- Musical data types (NoteDTO, ChordDTO, ScaleDTO, etc.)
- Service interfaces (IMusicTheoryService, IMidiService, etc.)
- AI-ready types for future integration

### @novaxe-oracle/msm-bridge
PostMessage communication bridge for MSM integration:
- Type-safe message passing
- State synchronization
- Error boundary handling

## 🛠️ Scripts

From the root directory:

- `npm run build:all` - Build both applications
- `npm run serve:all` - Run both dev servers
- `npm run test:all` - Run all tests
- `npm run smoke` - Run smoke tests
- `npm run analyze:bundle` - Analyze bundle sizes
- `npm run clean` - Clean all node_modules
- `npm run reset` - Clean and reinstall everything

## 🔐 Security

- Content Security Policy configured for iframe embedding
- MIDI permissions handled with user consent
- Input sanitization for ABCJS notation
- Secure PostMessage origin validation

## 🎯 Roadmap

### Immediate (Phase 1) ✅
- [x] Monorepo setup with git subtree
- [x] Shared types and interfaces
- [x] CI/CD pipeline
- [ ] MSM iframe embedding in Novaxe
- [ ] PostMessage bridge implementation

### Short-term (Phase 2)
- [ ] Unified service layer
- [ ] Feature flag system
- [ ] Service adapters
- [ ] State synchronization

### Long-term (Phase 3)
- [ ] Angular Elements migration
- [ ] AI service integration
- [ ] Mobile/tablet apps
- [ ] Real-time collaboration
- [ ] Cloud deployment

## 🤝 Contributing

1. Create feature branch from `develop`
2. Follow Angular/React style guides
3. Ensure all tests pass
4. Submit PR with clear description
5. Wait for CI/CD and review

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Angular team for the excellent framework
- React team for the flexible UI library
- Tonal.js for music theory utilities
- ABCJS for notation rendering
- Web MIDI API contributors

---

Built with ❤️ for the future of music technology