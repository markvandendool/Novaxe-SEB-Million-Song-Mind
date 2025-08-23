#!/usr/bin/env node

/**
 * Monorepo-wide test runner
 * Runs tests for all apps and packages, collecting results
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, cwd) {
  try {
    const output = execSync(command, { 
      cwd, 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.message 
    };
  }
}

function testProject(name, path, testCommand = 'npm test') {
  log(`\n📦 Testing ${name}...`, colors.blue);
  
  // Check if path exists
  if (!fs.existsSync(path)) {
    log(`  ⚠️  Path not found: ${path}`, colors.yellow);
    return { name, status: 'skipped', reason: 'Path not found' };
  }
  
  // Check if package.json exists
  const packageJsonPath = `${path}/package.json`;
  if (!fs.existsSync(packageJsonPath)) {
    log(`  ⚠️  No package.json found`, colors.yellow);
    return { name, status: 'skipped', reason: 'No package.json' };
  }
  
  // Check if test script exists
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.scripts || !packageJson.scripts.test) {
    log(`  ⚠️  No test script defined`, colors.yellow);
    return { name, status: 'skipped', reason: 'No test script' };
  }
  
  // Check if node_modules exists
  if (!fs.existsSync(`${path}/node_modules`)) {
    log(`  ⚠️  Dependencies not installed`, colors.yellow);
    return { name, status: 'skipped', reason: 'Dependencies not installed' };
  }
  
  // Run tests
  const result = runCommand(testCommand, path);
  
  if (result.success) {
    log(`  ✅ Tests passed!`, colors.green);
    return { name, status: 'passed', output: result.output };
  } else {
    log(`  ❌ Tests failed!`, colors.red);
    console.log(result.output);
    return { name, status: 'failed', output: result.output };
  }
}

async function main() {
  log('================================================', colors.blue);
  log('         MONOREPO TEST RUNNER', colors.blue);
  log('================================================', colors.blue);
  
  const projects = [
    { name: 'Shared Package', path: 'packages/shared' },
    { name: 'MSM Bridge', path: 'packages/msm-bridge' },
    { name: 'Novaxe SEB', path: 'apps/novaxe' },
    { name: 'Million Song Mind', path: 'apps/msm' }
  ];
  
  const results = [];
  
  for (const project of projects) {
    const result = testProject(
      project.name, 
      path.join(__dirname, '..', project.path)
    );
    results.push(result);
  }
  
  // Summary
  log('\n================================================', colors.blue);
  log('                 SUMMARY', colors.blue);
  log('================================================', colors.blue);
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  
  results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : 
                 result.status === 'failed' ? '❌' : '⚠️';
    const color = result.status === 'passed' ? colors.green : 
                  result.status === 'failed' ? colors.red : colors.yellow;
    
    log(`${icon} ${result.name}: ${result.status}`, color);
    if (result.reason) {
      log(`   (${result.reason})`, colors.yellow);
    }
  });
  
  log('');
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, colors.red);
  log(`Skipped: ${skipped}`, colors.yellow);
  
  if (failed > 0) {
    log('\n❌ Some tests failed. Please fix before proceeding.', colors.red);
    process.exit(1);
  } else if (passed === 0) {
    log('\n⚠️  No tests were run. Configure tests for your packages.', colors.yellow);
    process.exit(0);
  } else {
    log('\n✅ All configured tests passed!', colors.green);
    process.exit(0);
  }
}

main().catch(error => {
  log(`\n❌ Test runner error: ${error.message}`, colors.red);
  process.exit(1);
});