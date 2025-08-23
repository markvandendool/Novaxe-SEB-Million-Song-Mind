# 🚀 DEVELOPMENT SETUP GUIDE
## NOVAXE SEB MILLION SONG MIND - GET STARTED IN 30 MINUTES

**Last Updated**: August 19, 2025  
**Prerequisites**: Node.js 18+, Git, VS Code (recommended)  
**Estimated Setup Time**: 15-30 minutes  

---

## 🎯 QUICK START (TL;DR)

```bash
# Clone and setup
git clone https://github.com/markvandendool/Novaxe-SEB-Million-Song-Mind.git
cd Novaxe-SEB-Million-Song-Mind

# Install dependencies
npm install

# Start development
npm run dev

# Access applications
# MSM React App: http://localhost:3000 (if configured)
# API: http://localhost:3001 (if configured)
```

---

## 📂 REPOSITORY STRUCTURE OVERVIEW

```
Novaxe-SEB-Million-Song-Mind/
├── PROJECT_STATUS_DASHBOARD.md    📊 Current status (READ FIRST)
├── docs/                          📚 Organized documentation
│   ├── font-analysis/             🎨 Font system documentation
│   ├── technical-specs/           🔧 Technical specifications  
│   └── reference/                 📖 Analysis references
├── apps/                          🎵 Applications
│   ├── million-song-mind/         ⭐ PRIMARY React app
│   ├── novaxe-angular11/          🔄 Legacy Angular (preserved)
│   └── api/                       🌐 Backend API
├── ARCHIVE/                       📦 Archived/conflicting files
└── [Config files]                 ⚙️ Build & workspace config
```

---

## 🔧 DEVELOPMENT ENVIRONMENT SETUP

### **Step 1: System Requirements**
```bash
# Check Node.js version (18+ required)
node --version  # Should be v18.0.0 or higher

# Check npm version
npm --version   # Should be 8.0.0 or higher

# Install Git if not present
git --version
```

### **Step 2: Clone Repository**
```bash
# Clone the repository
git clone https://github.com/markvandendool/Novaxe-SEB-Million-Song-Mind.git

# Navigate to project
cd Novaxe-SEB-Million-Song-Mind

# Check current status
cat PROJECT_STATUS_DASHBOARD.md
```

### **Step 3: Understand Current Applications**

#### **Primary MSM React App**
```bash
cd apps/million-song-mind
ls -la  # Check if package.json exists
npm install  # Install dependencies if app exists
npm run dev  # Start development server
```

#### **Legacy Angular App (Reference Only)**
```bash
cd apps/novaxe-angular11  
# This is preserved for reference/migration
# Contains analyzed 50,094 lines of code
# Font system and MIDI analysis source
```

#### **API Backend**
```bash
cd apps/api
ls -la  # Check structure
npm install  # If package.json exists
npm run dev  # Start API server
```

---

## 🎵 APPLICATION STATUS & TESTING

### **MSM React App Testing Protocol**

#### **If App Exists:**
```bash
cd apps/million-song-mind

# Check package.json
cat package.json | head -20

# Install and test
npm install
npm run dev

# Test these URLs:
# http://localhost:3000 (main app)
# http://localhost:3000/braid (if braid exists)
```

#### **If App Missing/Broken:**
```bash
# Check for alternatives
ls apps/msm-react/  # Duplicate app?
ls apps/*/package.json  # Find all apps

# Create new React app if needed
cd apps/
npx create-react-app million-song-mind --template typescript
cd million-song-mind
npm install
```

### **API Testing Protocol**
```bash
cd apps/api

# Test if API responds
curl http://localhost:3001/health  # or whatever port configured
curl http://localhost:3001/api/status

# Check for Vercel configuration
ls vercel.json
ls api/  # Check for serverless functions
```

---

## 🎨 FONT SYSTEM INTEGRATION

### **Adding Novaxe Font System to MSM**

#### **Step 1: Copy Font Files**
```bash
# From the analyzed Angular app
cp -r "apps/novaxe-angular11/src/assets/font" "apps/million-song-mind/src/assets/"

# Verify files copied
ls -la apps/million-song-mind/src/assets/font/
# Should see:
# - Chord_Grid_v2.otf (18,376 bytes) 
# - Chord_Grid.otf (37,880 bytes)
# - main_comma.otf (18,284 bytes)
```

#### **Step 2: Add Font CSS**
```css
/* Add to apps/million-song-mind/src/index.css or main CSS file */
@font-face {
    font-family: 'music-font';
    src: url('./assets/font/Chord_Grid_v2.otf') format('opentype');
}

.chord-font {
    font-family: 'music-font';
}

.roman-numeral {
    font-family: 'music-font';
    font-size: 25px;
}
```

#### **Step 3: Test Font Loading**
```tsx
// Test component in React
const FontTest = () => {
    return (
        <div>
            <div className="chord-font" style={{fontSize: '48px'}}>
                C7 Dm Em
            </div>
            <div className="roman-numeral">
                I ii iii
            </div>
        </div>
    );
};
```

---

## 🎹 MIDI INTEGRATION SETUP

### **Required Components from Analysis**

#### **Copy Key Files from Angular Analysis:**
```bash
# Based on forensic analysis, these are the minimum required files:
# (See docs/reference/NOVAXE_ULTIMATE_AI_AGENT_SEARCH_SYSTEM.md)

# Services (7 files):
# - midi.service.ts (166 lines)
# - chord-detect.service.ts (47 lines)  
# - music-utils.service.ts (675 lines)
# - synth.service.ts (86 lines)
# - transport.service.ts (253 lines)
# - audioplayer.service.ts (946 lines)
# - soundfont.service.ts (54 lines)

# Components (3 files):
# - fifth-circle.component.ts (250 lines)
# - guitar.component.ts (29 lines)
# - guitar.service.ts (86 lines)

# Models (2 files):
# - songmodel.ts (995 lines)
# - selectionmodel.ts (212 lines)
```

#### **React Conversion Strategy:**
```tsx
// Convert Angular services to React hooks
// Convert Angular components to React components
// Adapt RxJS observables to React state/context
```

---

## 🔍 TROUBLESHOOTING COMMON ISSUES

### **Application Won't Start**
```bash
# Check if package.json exists
ls apps/*/package.json

# Try different app directories
cd apps/million-song-mind && npm run dev
cd apps/msm-react && npm run dev

# Check for port conflicts
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
lsof -ti:3001 | xargs kill -9  # Kill process on port 3001
```

### **Font Not Loading**
```bash
# Verify font files copied correctly
ls -la apps/*/src/assets/font/

# Check browser dev tools
# Network tab → Look for 404 errors on .otf files
# Console → Look for font loading errors
```

### **MIDI Not Working**
```bash
# Check browser MIDI support
# Open browser console and run:
# navigator.requestMIDIAccess().then(console.log, console.error)

# Verify MIDI device connected
# Chrome → Settings → Privacy → Site Settings → Additional content → MIDI devices
```

---

## 📊 DEVELOPMENT WORKFLOW

### **Daily Development Process**
```bash
# 1. Check project status
cat PROJECT_STATUS_DASHBOARD.md

# 2. Pull latest changes
git pull origin main

# 3. Start development
npm run dev  # or appropriate start command

# 4. Make changes and test
# 5. Commit and push changes

# 6. Update status if needed
vim PROJECT_STATUS_DASHBOARD.md
```

### **Testing Checklist**
- [ ] MSM React app loads without errors
- [ ] API responds to requests
- [ ] Font system displays correctly
- [ ] MIDI input works (if implemented)
- [ ] Build process completes successfully
- [ ] No console errors in browser

---

## 🚨 CURRENT LIMITATIONS & KNOWN ISSUES

### **Status Unknown Items (Need Testing):**
- MSM React app functionality
- API endpoint availability  
- Database connectivity
- Build and deployment process
- MIDI integration status

### **Verified Working:**
- Repository organization (cleanup in progress)
- Font system analysis (complete)
- Angular legacy app (preserved)
- Documentation structure (organized)

---

## 📞 GETTING HELP

### **Documentation Hierarchy:**
1. `PROJECT_STATUS_DASHBOARD.md` - Current status
2. `docs/font-analysis/MASTER_FONT_ANALYSIS.md` - Font system
3. `docs/reference/NOVAXE_ULTIMATE_AI_AGENT_SEARCH_SYSTEM.md` - Technical queries
4. This document - Development setup

### **If Something Doesn't Work:**
1. Check PROJECT_STATUS_DASHBOARD.md for known issues
2. Look in docs/ for specific technical documentation
3. Check ARCHIVE/conflicting-reports/ for historical context
4. Verify you're using the correct application directory

---

**🎯 SUCCESS CRITERIA:**
- You can access at least one working application
- Font system test component displays correctly  
- Development environment is ready for coding
- You understand the repository organization

**⏱️ If setup takes more than 30 minutes, there may be missing pieces that need to be documented.**
