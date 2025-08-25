# Unity2.0 Deployment Plan - Live Before Dinner Tonight

## 🎯 MISSION: Get All Apps Live on millionsongmind.com

### Directory Structure
```
Unity2.0/
├── landing-page/           # Main landing page (index.html)
├── million-song-mind-v1/   # MSM V1.0 (React/Next.js)
├── obsidian-angular8/      # Pre-tab changes Angular 8
├── chord-cubes/           # ChordCubes 1.0 (Three.js/React)
├── novaxe-angular20/      # Current Angular 20 version
└── deployment/            # Deploy scripts & configs
```

### Deployment Strategy

#### Phase 1: Build All Apps ✅ COPIED
- [x] Landing page copied
- [x] Million Song Mind V1.0 copied from worktrees/v1.0
- [x] Obsidian Angular 8 copied from worktrees/v1.0-last
- [x] ChordCubes copied from cubes-app
- [x] Angular 20 copied from current apps/obsidian-angular

#### Phase 2: Configure & Build 🚧 IN PROGRESS
- [ ] Install dependencies for each app
- [ ] Build production versions
- [ ] Test each app locally
- [ ] Configure routing for millionsongmind.com

#### Phase 3: Deploy to millionsongmind.com 🎯 TARGET
- [ ] Upload to web server
- [ ] Configure domain routing
- [ ] Test live deployment
- [ ] Verify all links work

### Live URLs Target:
- **Main**: millionsongmind.com
- **MSM V1.0**: millionsongmind.com/msm
- **Obsidian Angular 8**: millionsongmind.com/obsidian
- **ChordCubes**: millionsongmind.com/cubes  
- **Angular 20**: millionsongmind.com/novaxe

### Next Steps:
1. Build each app individually
2. Configure web server routing
3. Deploy and test
