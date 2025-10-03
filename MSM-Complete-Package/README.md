# Million Song Mind - Complete Source Package

## 🎵 Overview
This is the complete, standalone source code package for **Million Song Mind (MSM)** - a professional harmonic analysis tool for music education and research.

## 🚀 Features

### Core Components
- **Harmonic Profile Chart** - Vertical bars with 4-segment inversion sub-bars (root, 1st, 2nd, 3rd)
- **Braid Visualization** - Geometric visualization of harmonic relationships (2D/3D)
- **Song Search & Analysis** - Advanced filtering, fuzzy search, multi-select
- **Data Import System** - Multi-format CSV support (datanaught, data1, data2, data3)
- **Audio Integration** - Chord playback with celebration sounds
- **Professional UI** - Fontdec13 support, debug panel, onboarding system

### Technical Architecture
- **React/TypeScript** - Modern component-based architecture
- **Vite Build System** - Fast development and optimized production builds
- **Tailwind CSS** - Professional styling with custom harmonic color schemes
- **Fuse.js** - Fuzzy search for instant song filtering
- **Audio Manager** - Web Audio API integration for chord playback

## 📁 Package Contents

### Core Application Files
- `src/pages/MillionSongMind.tsx` (1,667 lines) - Main application component
- `src/components/HarmonicChart.tsx` (520 lines) - Harmonic profile visualization
- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root application component

### Dashboard Ecosystem
- `src/components/UnifiedVisualizationDashboard.tsx` - Format router for data visualization
- `src/components/MusicVizDashboard.tsx` - CPML song structure visualizer
- `src/components/VisualizationDashboard.tsx` - Combined harmonic + structure view
- `src/components/SongTimelineVisualizer.tsx` - Section timeline with color-coded blocks
- `src/components/SongDetailPanel.tsx` - Song metadata modal
- `src/components/SearchFilters.tsx` - Advanced filtering system
- `src/components/DebugPanel.tsx` - Development logging panel
- `src/components/AudioPreviewPlayer.tsx` - Audio preview functionality

### Data Processing
- `src/utils/cpmlParser.ts` (723 lines) - Multi-format CSV parsing
- `src/utils/romanMapping.ts` - Roman numeral to harmonic slot mapping
- `src/utils/chordMapping.ts` - Chord analysis utilities
- `src/utils/braidHarmonicMapping.ts` - Braid to harmonic mapping

### Supporting Components
- `src/components/NovaxeBridgeSender.tsx` - Bridge communication
- `src/hooks/useNovaxeBridge.ts` - Parent-child messaging hook
- `src/bridge/shared-bridge-schema.ts` - Message type definitions
- `src/components/OnboardingSystem.tsx` - Tutorial system

### Configuration & Build
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `tsconfig.json` - TypeScript configuration

## 🎯 Integration Points

### Novaxe Integration
- Bridge communication via `NovaxeBridgeSender.tsx`
- Shared message schema for parent-child communication
- Global key selector for harmonic analysis

### ChordCubes Integration
- Harmonic search integration via `useHarmonicSearch.ts`
- Chord progression analysis and visualization
- Real-time chord selection and highlighting

### Lesson Center Integration
- Educational onboarding system
- Tutorial and help documentation
- Progressive learning interface

## 🛠 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern browser with Web Audio API support

### Installation
```bash
cd MSM-Complete-Package
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 📊 Data Formats Supported

### Datanaught Format
- Vertical harmonic profile data
- Chord percentages with inversion data
- Professional analysis output

### Data1 Format
- Simple chord progressions
- Basic song metadata
- Quick analysis format

### Data2 Format
- Structured song sections
- CPML (Chordonomicon) format
- Section-based analysis

### Data3 Format
- Complete harmonic analysis
- Roman numeral progressions
- Key signatures and tonality
- 680K+ song database support

## 🎨 Visual Features

### Harmonic Profile
- Professional compression curve (normalized to 1.0 at 100%)
- Section grouping (Major/Applied/Minor/Other)
- "CHORDS ACTIVE" display with celebration effects
- Fontdec13 font support for natural chord text
- Inversion sub-bars with harmonic colors

### Braid Visualization
- 2D tonal and 3D torus views
- Interactive chord selection
- Text switching (letters ↔ Roman numerals)
- Zoom controls and touch-friendly interface

### Professional UI
- Sticky premium header
- Advanced search and filtering
- Multi-select song selection
- Pagination for performance
- Debug panel with comprehensive logging

## 🔧 Technical Specifications

### Performance
- Optimized for 680K+ song databases
- Fuse.js fuzzy search for instant results
- Virtual scrolling for large datasets
- Debounced search to prevent excessive filtering

### Audio Integration
- Web Audio API for chord playback
- Celebration sounds for 100% chord usage
- Audio manager with selection/deselection sounds
- Chord audio player with playback controls

### State Management
- React hooks for state management
- Global key selector with context
- Persistent selections and preferences
- Real-time data synchronization

## 📈 Usage Statistics

### Code Metrics
- **Total Lines**: ~15,000+ lines of TypeScript/React
- **Components**: 120+ React components
- **Utils**: 23+ utility functions
- **Types**: Comprehensive TypeScript definitions
- **Tests**: E2E testing with Playwright

### Performance Features
- Lazy loading for large datasets
- Memoized components for optimization
- Efficient search algorithms
- Responsive design for all screen sizes

## 🚀 Deployment Ready

This package is production-ready and includes:
- Vercel deployment configuration
- Environment-specific builds
- Asset optimization
- Error handling and logging
- Performance monitoring

## 📝 License

This is proprietary software developed for the Million Song Mind project.

## 🤝 Support

For technical support or questions about integration, please refer to the comprehensive documentation in the `/docs` directory.

---

**Million Song Mind V1.0** - Professional Music Analysis Tool
Built for harmonic exploration at scale