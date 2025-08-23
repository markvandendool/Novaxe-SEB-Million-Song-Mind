# Phase 0.5 Stability Checklist

*Run before merging any major changes or starting cross-app integration.*

## 🚀 Quick Run

```bash
npm run stability-check
```

This automated script will verify all items below.

---

## ✅ Manual Checklist

### 1 — Dependency Lockdown

- [ ] Run `npm ci` in root and each app folder — confirm no unexpected changes
- [ ] Verify all apps use same Node version:
  ```bash
  nvm use
  node -v  # Should be 18.19.0
  ```

### 2 — Independent Build Health

- [ ] From root:
  ```bash
  npm run build:msm
  npm run build:novaxe
  ```
  Both must complete without errors

- [ ] `npm run serve:all` runs both apps on correct ports:
  - Novaxe: http://localhost:4200
  - MSM: http://localhost:5173
  
- [ ] Both load in browser without console errors

### 3 — Shared Package Integrity

- [ ] Run shared package tests:
  ```bash
  npm run test:shared
  ```

- [ ] Verify no direct cross-app imports:
  ```bash
  grep -R "from '../../msm" apps/novaxe
  grep -R "from '../../novaxe" apps/msm
  ```
  Should return **no results**

### 4 — Lint & Format

- [ ] Run:
  ```bash
  npm run lint
  npm run format:check
  ```

- [ ] Fix issues if needed:
  ```bash
  npm run format
  ```

### 5 — Git Clean State

- [ ] Confirm no untracked/modified files:
  ```bash
  git status --porcelain
  ```
  Output should be empty

- [ ] Ensure clean branch state:
  ```bash
  git merge --abort || true
  git rebase --abort || true
  ```

### 6 — CI/CD Verification

- [ ] Push branch to trigger GitHub Actions
- [ ] Confirm both build and test jobs pass in CI

### 7 — Snapshot

- [ ] Tag repo before starting integration:
  ```bash
  npm run tag:snapshot
  ```
  Or manually:
  ```bash
  git tag pre-phase1-$(date +%Y%m%d_%H%M%S)
  git push --tags
  ```

---

## 📊 Automated Check Results

The `stability-check` script verifies:

1. **Node Version**: Matches .nvmrc (18.19.0)
2. **Dependencies**: node_modules installed in both apps
3. **Build Scripts**: Both apps have build commands
4. **Cross-imports**: No direct app-to-app imports
5. **Shared Packages**: Structure exists and valid
6. **Git State**: Working directory clean
7. **CI/CD**: Workflow files present

---

## 🔧 Common Fixes

### Missing Dependencies
```bash
npm run install:all
```

### Dirty Git State
```bash
git add .
git commit -m "chore: checkpoint before integration"
```

### Node Version Mismatch
```bash
nvm install 18.19.0
nvm use 18.19.0
nvm alias default 18.19.0
```

### Build Failures
```bash
# Clean and rebuild
npm run clean
npm run install:all
npm run build:all
```

---

## ✨ Ready State

When all checks pass, you'll see:
```
✓ All stability checks passed!
Ready to proceed with integration.
```

This means:
- Both Novaxe and MSM can run independently
- Shared packages are clean and ready
- Builds are reproducible
- Git state is clean and tagged

You're ready for Phase 1 integration! 🎉