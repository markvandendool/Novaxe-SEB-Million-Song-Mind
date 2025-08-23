#!/usr/bin/env node

/**
 * Integration test for MSM-Novaxe communication
 * Tests the basic message bridge functionality
 */

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

// Simulate the bridge that will be implemented
class MockMSMBridge {
  constructor() {
    this.listeners = [];
  }
  
  sendChord(chord) {
    // Simulate async message passing
    setTimeout(() => {
      this.listeners.forEach(listener => listener(chord));
    }, 10);
  }
  
  onChordReceived(callback) {
    this.listeners.push(callback);
  }
}

async function testBasicCommunication() {
  return new Promise((resolve, reject) => {
    log('\n🧪 Testing basic MSM-Novaxe communication...', colors.blue);
    
    const bridge = new MockMSMBridge();
    const testChord = {
      root: 'C',
      quality: 'major',
      intervals: [0, 4, 7],
      midi: [60, 64, 67]
    };
    
    let received = false;
    
    // Set up receiver
    bridge.onChordReceived((chord) => {
      if (JSON.stringify(chord) === JSON.stringify(testChord)) {
        log('  ✅ Chord received correctly', colors.green);
        received = true;
        resolve(true);
      } else {
        log('  ❌ Chord data mismatch', colors.red);
        reject(new Error('Data mismatch'));
      }
    });
    
    // Send chord
    log('  📤 Sending test chord...', colors.yellow);
    bridge.sendChord(testChord);
    
    // Timeout after 1 second
    setTimeout(() => {
      if (!received) {
        log('  ❌ Timeout: No response received', colors.red);
        reject(new Error('Timeout'));
      }
    }, 1000);
  });
}

async function testBidirectionalFlow() {
  return new Promise((resolve, reject) => {
    log('\n🧪 Testing bidirectional data flow...', colors.blue);
    
    const msmBridge = new MockMSMBridge();
    const novaxeBridge = new MockMSMBridge();
    
    let msmReceived = false;
    let novaxeReceived = false;
    
    // MSM receives from Novaxe
    msmBridge.onChordReceived((chord) => {
      if (chord.source === 'novaxe') {
        log('  ✅ MSM received from Novaxe', colors.green);
        msmReceived = true;
        checkComplete();
      }
    });
    
    // Novaxe receives from MSM
    novaxeBridge.onChordReceived((chord) => {
      if (chord.source === 'msm') {
        log('  ✅ Novaxe received from MSM', colors.green);
        novaxeReceived = true;
        checkComplete();
      }
    });
    
    function checkComplete() {
      if (msmReceived && novaxeReceived) {
        resolve(true);
      }
    }
    
    // Send from both directions
    log('  📤 Sending from MSM...', colors.yellow);
    novaxeBridge.sendChord({ source: 'msm', root: 'C' });
    
    log('  📤 Sending from Novaxe...', colors.yellow);
    msmBridge.sendChord({ source: 'novaxe', root: 'D' });
    
    // Timeout
    setTimeout(() => {
      if (!msmReceived || !novaxeReceived) {
        log('  ❌ Timeout: Bidirectional flow incomplete', colors.red);
        reject(new Error('Bidirectional timeout'));
      }
    }, 1000);
  });
}

async function testDataIntegrity() {
  return new Promise((resolve, reject) => {
    log('\n🧪 Testing data integrity...', colors.blue);
    
    const bridge = new MockMSMBridge();
    const complexData = {
      chord: {
        root: 'F#',
        quality: 'diminished',
        intervals: [0, 3, 6],
        midi: [66, 69, 72]
      },
      metadata: {
        timestamp: Date.now(),
        source: 'msm',
        version: '1.0.0'
      },
      braid: {
        nodes: [
          { id: '1', x: 100, y: 200 },
          { id: '2', x: 150, y: 250 }
        ]
      }
    };
    
    bridge.onChordReceived((data) => {
      // Deep equality check
      if (JSON.stringify(data) === JSON.stringify(complexData)) {
        log('  ✅ Complex data integrity maintained', colors.green);
        resolve(true);
      } else {
        log('  ❌ Data corruption detected', colors.red);
        console.log('Expected:', complexData);
        console.log('Received:', data);
        reject(new Error('Data integrity failed'));
      }
    });
    
    log('  📤 Sending complex data structure...', colors.yellow);
    bridge.sendChord(complexData);
  });
}

async function main() {
  log('================================================', colors.blue);
  log('       MSM-NOVAXE INTEGRATION TESTS', colors.blue);
  log('================================================', colors.blue);
  
  const tests = [
    { name: 'Basic Communication', fn: testBasicCommunication },
    { name: 'Bidirectional Flow', fn: testBidirectionalFlow },
    { name: 'Data Integrity', fn: testDataIntegrity }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      failed++;
      log(`  Error: ${error.message}`, colors.red);
    }
  }
  
  // Summary
  log('\n================================================', colors.blue);
  log('                 SUMMARY', colors.blue);
  log('================================================', colors.blue);
  
  log(`Tests passed: ${passed}/${tests.length}`, passed === tests.length ? colors.green : colors.yellow);
  
  if (failed > 0) {
    log(`Tests failed: ${failed}/${tests.length}`, colors.red);
    log('\n❌ Integration tests failed', colors.red);
    process.exit(1);
  } else {
    log('\n✅ All integration tests passed!', colors.green);
    log('\n📝 Note: These are mock tests. Real integration tests will run after Phase 1 implementation.', colors.yellow);
    process.exit(0);
  }
}

main().catch(error => {
  log(`\n❌ Test runner error: ${error.message}`, colors.red);
  process.exit(1);
});