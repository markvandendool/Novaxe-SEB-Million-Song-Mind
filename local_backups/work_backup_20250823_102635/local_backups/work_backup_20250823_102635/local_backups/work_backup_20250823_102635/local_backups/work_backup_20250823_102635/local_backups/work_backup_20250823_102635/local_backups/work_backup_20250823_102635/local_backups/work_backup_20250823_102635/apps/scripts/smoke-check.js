#!/usr/bin/env node

/**
 * Smoke test script for Novaxe Oracle monorepo
 * Verifies basic functionality of both apps
 */

const http = require('http');
const https = require('https');

const NOVAXE_PORT = 4200;
const MSM_PORT = 5173;
const TIMEOUT = 5000;

const checkEndpoint = (url, name) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: TIMEOUT }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log(`✅ ${name}: OK (${res.statusCode})`);
        resolve(true);
      } else {
        console.error(`❌ ${name}: Failed (${res.statusCode})`);
        resolve(false);
      }
    });
    
    req.on('error', (err) => {
      console.error(`❌ ${name}: Error - ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.error(`❌ ${name}: Timeout after ${TIMEOUT}ms`);
      req.destroy();
      resolve(false);
    });
  });
};

const runSmokeTests = async () => {
  console.log('🔍 Running Novaxe Oracle Smoke Tests...\n');
  
  const results = [];
  
  // Check Novaxe SEB
  console.log('Testing Novaxe SEB...');
  results.push(await checkEndpoint(`http://localhost:${NOVAXE_PORT}`, 'Novaxe Home'));
  results.push(await checkEndpoint(`http://localhost:${NOVAXE_PORT}/braid`, 'Novaxe Braid'));
  results.push(await checkEndpoint(`http://localhost:${NOVAXE_PORT}/song`, 'Novaxe Song'));
  
  console.log('\nTesting Million Song Mind...');
  results.push(await checkEndpoint(`http://localhost:${MSM_PORT}`, 'MSM Home'));
  
  console.log('\n' + '='.repeat(50));
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  const success = passed === total;
  
  if (success) {
    console.log(`✅ All smoke tests passed! (${passed}/${total})`);
  } else {
    console.log(`⚠️  Some tests failed: ${passed}/${total} passed`);
  }
  
  process.exit(success ? 0 : 1);
};

// Run if called directly
if (require.main === module) {
  runSmokeTests();
}

module.exports = { checkEndpoint, runSmokeTests };