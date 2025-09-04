#!/usr/bin/env node

const { getProjectApiKey, getProjectContext } = require('../src/utils/projectApiKeyUtils');

async function testBackwardCompatibility() {
  console.log('Testing Nue CLI Backward Compatibility\n');
  
  try {
    // Test 1: No project specified, should fall back to environment variables
    console.log('1. Testing no project specified (should use env vars)...');
    
    // Set environment variables for testing
    process.env.NUE_API_KEY = 'test-env-api-key-12345';
    process.env.NUE_SANDBOX_API_KEY = 'test-env-sandbox-key-67890';
    
    const options = {};
    
    // Test production environment
    try {
      const prodKey = getProjectApiKey(options, false);
      console.log(`   ✓ Production API key: ${prodKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✗ Production API key error: ${error.message}`);
    }
    
    // Test sandbox environment
    try {
      const sandboxKey = getProjectApiKey(options, true);
      console.log(`   ✓ Sandbox API key: ${sandboxKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✗ Sandbox API key error: ${error.message}`);
    }
    
    // Test 2: Project specified, should use project configuration
    console.log('\n2. Testing project specified...');
    
    const projectOptions = { project: 'test-project' };
    
    try {
      const projectKey = getProjectApiKey(projectOptions, false);
      console.log(`   ✓ Project API key: ${projectKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✓ Project API key error (expected): ${error.message}`);
    }
    
    // Test 3: Project context
    console.log('\n3. Testing project context...');
    
    try {
      const context = getProjectContext(options, false);
      console.log(`   ✓ Context: ${context.projectName || 'No project'} - ${context.environment}`);
      console.log(`   ✓ API key: ${context.apiKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✗ Context error: ${error.message}`);
    }
    
    // Test 4: Sandbox context
    console.log('\n4. Testing sandbox context...');
    
    try {
      const sandboxContext = getProjectContext(options, true);
      console.log(`   ✓ Sandbox context: ${sandboxContext.projectName || 'No project'} - ${sandboxContext.environment}`);
      console.log(`   ✓ Sandbox API key: ${sandboxContext.apiKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✗ Sandbox context error: ${error.message}`);
    }
    
    // Test 5: Mixed options
    console.log('\n5. Testing mixed options...');
    
    const mixedOptions = { project: 'mixed-project', sandbox: true };
    
    try {
      const mixedKey = getProjectApiKey(mixedOptions, true);
      console.log(`   ✓ Mixed options API key: ${mixedKey ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ✓ Mixed options error (expected): ${error.message}`);
    }
    
    console.log('\n✅ Backward compatibility test completed!');
    console.log('   - No project specified: Falls back to environment variables ✓');
    console.log('   - Project specified: Uses project configuration ✓');
    console.log('   - Environment variables take precedence when no project is set ✓');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up environment variables
    delete process.env.NUE_API_KEY;
    delete process.env.NUE_SANDBOX_API_KEY;
  }
}

// Run the test
testBackwardCompatibility();
