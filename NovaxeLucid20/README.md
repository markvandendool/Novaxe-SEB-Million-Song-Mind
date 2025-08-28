# NovaxeLucid20 - Dual Application Setup

## Project Structure

This directory contains two standalone applications that are working independently and ready for integration:

### 1. Angular 20 Application (`angular20-app/`)
- **Path**: `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/NovaxeLucid20/angular20-app/`
- **Version**: Angular 20.1.4 (authentic)
- **Port**: http://localhost:4200
- **Status**: ✅ **WORKING STANDALONE**
- **Command**: `cd angular20-app && npm start`

### 2. ChordCubes Standalone Application (`chordcubes-standalone/`)
- **Path**: `/Users/markvandendool/Novaxe-SEB-Million-Song-Mind/NovaxeLucid20/chordcubes-standalone/`
- **Version**: ChordCubes 2.0 with GIANT branding
- **Port**: http://localhost:8080
- **Status**: ✅ **WORKING STANDALONE**
- **Command**: `cd chordcubes-standalone && python3 -m http.server 8080`

## Current Status

Both applications are running successfully in their own environments:

1. **Angular 20 App**: Compiled and running on port 4200 with proper Angular 20.1.4 dependencies
2. **ChordCubes App**: Serving on port 8080 with complete 3D cube functionality

## Next Steps - Integration Architecture

Now that both apps work standalone, we can plan the integration:

### Integration Options:
1. **iframe Integration**: Embed ChordCubes as iframe in Angular (similar to previous approach)
2. **Component Integration**: Port ChordCubes JavaScript into Angular components
3. **Micro-frontend Approach**: Keep as separate apps but communicate via events

### Recommended Approach:
Start with iframe integration since both apps are working, then gradually move toward deeper integration as needed.

## Notes
- Angular app fixed the abcjs dependency issue by using npm version instead of GitHub direct
- ChordCubes contains complete Million Song Mind integration with proper file structure
- Both apps are ready for integration work
