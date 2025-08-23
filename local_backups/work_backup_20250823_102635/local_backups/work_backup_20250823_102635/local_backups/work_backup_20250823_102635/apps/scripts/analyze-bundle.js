#!/usr/bin/env node

/**
 * Bundle analysis script for Novaxe Oracle monorepo
 * Analyzes build output sizes and provides recommendations
 */

const fs = require('fs');
const path = require('path');

const NOVAXE_DIST = path.join(__dirname, '../apps/novaxe/dist');
const MSM_DIST = path.join(__dirname, '../apps/msm/dist');

const MAX_INITIAL_SIZE = 6 * 1024 * 1024; // 6MB
const MAX_LAZY_SIZE = 2 * 1024 * 1024; // 2MB
const WARNING_THRESHOLD = 0.9; // 90% of max

function getDirectorySize(dir) {
  let totalSize = 0;
  
  if (!fs.existsSync(dir)) {
    return 0;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stat.size;
    }
  }
  
  return totalSize;
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function analyzeBundle(name, distPath, maxSize) {
  console.log(`\n📦 Analyzing ${name}...`);
  console.log('='.repeat(40));
  
  if (!fs.existsSync(distPath)) {
    console.log(`⚠️  Distribution folder not found: ${distPath}`);
    return false;
  }
  
  const totalSize = getDirectorySize(distPath);
  const percentage = (totalSize / maxSize) * 100;
  
  console.log(`Total size: ${formatSize(totalSize)}`);
  console.log(`Max allowed: ${formatSize(maxSize)}`);
  console.log(`Usage: ${percentage.toFixed(1)}%`);
  
  if (totalSize > maxSize) {
    console.log(`❌ Bundle size exceeds maximum!`);
    return false;
  } else if (totalSize > maxSize * WARNING_THRESHOLD) {
    console.log(`⚠️  Bundle size approaching limit (>${WARNING_THRESHOLD * 100}%)`);
    return true;
  } else {
    console.log(`✅ Bundle size within limits`);
    return true;
  }
}

function findLargeFiles(dir, minSize = 100 * 1024) {
  const largeFiles = [];
  
  if (!fs.existsSync(dir)) {
    return largeFiles;
  }
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      largeFiles.push(...findLargeFiles(filePath, minSize));
    } else if (stat.size >= minSize) {
      largeFiles.push({
        path: path.relative(dir, filePath),
        size: stat.size
      });
    }
  }
  
  return largeFiles.sort((a, b) => b.size - a.size);
}

function runBundleAnalysis() {
  console.log('🔍 Novaxe Oracle Bundle Analysis');
  console.log('='.repeat(50));
  
  const results = [];
  
  // Analyze Novaxe SEB
  results.push(analyzeBundle('Novaxe SEB', NOVAXE_DIST, MAX_INITIAL_SIZE));
  
  // Find large files in Novaxe
  const novaxeLargeFiles = findLargeFiles(NOVAXE_DIST);
  if (novaxeLargeFiles.length > 0) {
    console.log('\nLargest files in Novaxe:');
    novaxeLargeFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.path}: ${formatSize(file.size)}`);
    });
  }
  
  // Analyze MSM
  results.push(analyzeBundle('Million Song Mind', MSM_DIST, MAX_INITIAL_SIZE));
  
  // Find large files in MSM
  const msmLargeFiles = findLargeFiles(MSM_DIST);
  if (msmLargeFiles.length > 0) {
    console.log('\nLargest files in MSM:');
    msmLargeFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.path}: ${formatSize(file.size)}`);
    });
  }
  
  // Recommendations
  console.log('\n📊 Recommendations:');
  console.log('='.repeat(50));
  
  const totalSize = getDirectorySize(NOVAXE_DIST) + getDirectorySize(MSM_DIST);
  console.log(`Total monorepo dist size: ${formatSize(totalSize)}`);
  
  if (totalSize > MAX_INITIAL_SIZE * 2) {
    console.log('\n⚠️  Consider the following optimizations:');
    console.log('  - Enable lazy loading for large modules');
    console.log('  - Use tree shaking to remove unused code');
    console.log('  - Compress images and assets');
    console.log('  - Split vendor bundles');
    console.log('  - Use CDN for large libraries');
  }
  
  const success = results.every(r => r !== false);
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ Bundle analysis passed!');
  } else {
    console.log('❌ Bundle analysis failed - size limits exceeded');
  }
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runBundleAnalysis();
}

module.exports = { getDirectorySize, formatSize, analyzeBundle };