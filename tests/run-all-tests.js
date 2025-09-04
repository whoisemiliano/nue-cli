#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running All Nue CLI Tests\n');

const tests = [
  {
    name: 'Backward Compatibility Tests',
    file: 'test-backward-compatibility.js',
    description: 'Tests fallback to environment variables when no project is specified'
  },
  {
    name: 'Configuration Tests',
    file: 'test-config.js', 
    description: 'Tests configuration system (needs updating for removed default project)'
  },
  {
    name: 'Command Test Runner',
    file: 'commandTestRunner.js',
    description: 'Tests command discovery and validation'
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n📋 ${test.name}`);
    console.log(`   ${test.description}`);
    console.log(`   Running: node ${test.file}\n`);
    
    const child = spawn('node', [test.file], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED\n`);
        resolve({ name: test.name, passed: true, code });
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})\n`);
        resolve({ name: test.name, passed: false, code });
      }
    });
    
    child.on('error', (error) => {
      console.log(`❌ ${test.name} - ERROR: ${error.message}\n`);
      resolve({ name: test.name, passed: false, error: error.message });
    });
  });
}

async function runAllTests() {
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${status} - ${result.name}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
});
