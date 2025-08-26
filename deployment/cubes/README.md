# OBS Cubes - Production Deployment

## Overview
Professional 3D interactive chord visualization system for millionsonmind.com/cubes

## Deployment Details
- **Target URL**: https://millionsonmind.com/cubes/
- **Version**: 2.0 Production
- **Build Date**: August 25, 2025
- **Technology**: Pure Three.js with Web Audio API
- **Code Size**: 3,436 lines of JavaScript

## Features
- Interactive 3D chord cubes with physics-based drag system
- Real-time audio synthesis with SoundFont integration
- Professional lighting and stage mode
- Chord progression tracking and analysis
- Roman numeral and letter chord notation
- Voice leading algorithms
- Shelf mapping with REST/MOTION/TENSION zones
- Multi-instrument audio layers (chord/bass/melody)
- Save/load functionality for custom arrangements

## Technical Requirements
- Modern browser with WebGL support
- Web Audio API support
- ES6 modules support
- Internet connection for CDN resources

## File Structure
```
cubes/
├── index.html              # Production-optimized entry point
├── main.js                 # Core 3D engine (3,436 lines)
├── chords.js              # Chord theory and musical logic
├── styles.css             # Production styles
├── raycastRouter.js       # Interaction handling
├── shelfMapService.js     # Shelf system
├── interactionFSM.js      # State management
├── diagnosticsOverlay.js  # Debug tools
├── stateStore.js         # Data persistence
├── textureConfig.js      # Visual configuration
├── tweens.js             # Animation system
├── engine/               # Core engine components
├── integration/          # External integrations
└── assets/               # Static resources
```

## CDN Dependencies
- Three.js v0.160.0 (https://unpkg.com/three@0.160.0/)
- SoundFont Player v0.15.7 (https://unpkg.com/soundfont-player@0.15.7/)
- Tone.js v14.8.49 (https://unpkg.com/tone@14.8.49/)
- Tonal.js v4.12.1 (https://cdn.jsdelivr.net/npm/@tonaljs/tonal@4.12.1/)
- Troika Three Text v0.49.0 (https://unpkg.com/troika-three-text@0.49.0/)

## Performance Optimizations
- Preloaded critical resources
- Lazy loading of audio instruments
- Efficient Three.js scene management
- Optimized animation loops
- Memory management and cleanup
- CDN failover handling

## SEO & Social Media
- Complete Open Graph meta tags
- Twitter Card integration
- Canonical URL setup
- Structured meta descriptions
- Performance monitoring
- Error tracking

## Deployment Steps
1. Upload entire `cubes/` directory to web server
2. Ensure `millionsonmind.com/cubes/` points to `index.html`
3. Verify HTTPS is enabled
4. Test WebGL and Web Audio functionality
5. Validate all CDN resources load correctly
6. Test on multiple browsers and devices

## Production Features
- Loading overlay with spinner
- Error handling and fallbacks
- Performance monitoring
- Production logging
- Cache-busting with version parameters
- Responsive design for all screen sizes

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers with WebGL support

## Monitoring
The application includes built-in performance monitoring and error tracking. Check browser console for:
- Load time metrics
- WebGL support detection
- CDN resource loading status
- Error reports

## Maintenance
- Monitor CDN uptime for dependencies
- Update Three.js version periodically
- Review browser compatibility
- Update audio instrument libraries as needed
- Regular backup of user-generated shelf maps

## Contact
Million Song Mind Development Team
millionsonmind.com
