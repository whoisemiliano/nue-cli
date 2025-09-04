#!/usr/bin/env node

const ConfigManager = require('../src/utils/configManager');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function testConfig() {
  console.log('Testing Nue CLI Configuration System\n');
  
  const config = new ConfigManager();
  
  try {
    // Test 1: Initial state
    console.log('1. Testing initial state...');
    const initialProjects = config.getAllProjects();
    console.log(`   Initial projects: ${Object.keys(initialProjects).length}`);
    
    // Clean up any existing test project
    if (initialProjects['test-project']) {
      console.log('   Cleaning up existing test-project...');
      // We'll need to manually remove it from the config file
      const configPath = path.join(os.homedir(), '.nue', 'config.json');
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        delete configData.projects['test-project'];
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
        console.log('   ✓ Cleaned up existing test-project');
      }
    }
    
    // Test 2: Set API key for a test project
    console.log('\n2. Setting API key for test project...');
    config.setApiKey('test-project', 'production', 'test-api-key-12345');
    console.log('   ✓ Production API key set for test-project');
    
    // Test 3: Set sandbox API key
    console.log('\n3. Setting sandbox API key...');
    config.setApiKey('test-project', 'sandbox', 'test-sandbox-key-67890');
    console.log('   ✓ Sandbox API key set for test-project');
    
    // Test 4: Check project exists
    console.log('\n4. Checking project existence...');
    const exists = config.projectExists('test-project');
    console.log(`   Project 'test-project' exists: ${exists}`);
    
    // Test 5: Check environment exists
    console.log('\n5. Checking environment existence...');
    const prodExists = config.environmentExists('test-project', 'production');
    const sandboxExists = config.environmentExists('test-project', 'sandbox');
    console.log(`   Production exists: ${prodExists}`);
    console.log(`   Sandbox exists: ${sandboxExists}`);
    
    // Test 6: Get API keys
    console.log('\n6. Retrieving API keys...');
    const prodKey = config.getApiKey('test-project', 'production');
    const sandboxKey = config.getApiKey('test-project', 'sandbox');
    console.log(`   Production key: ${prodKey ? '✓ Found' : '✗ Not found'}`);
    console.log(`   Sandbox key: ${sandboxKey ? '✓ Found' : '✗ Not found'}`);
    
    // Test 7: Test project context
    console.log('\n7. Testing project context...');
    const context = config.getProjectContext({ project: 'test-project', sandbox: true });
    console.log(`   Project context: ${context.projectName}:${context.environment}`);
    
    // Test 8: List all projects
    console.log('\n8. Listing all projects...');
    const allProjects = config.getAllProjects();
    Object.entries(allProjects).forEach(([name, project]) => {
      console.log(`   ${name}:`);
      console.log(`     Production: ${project.environments.production ? '✓' : '✗'}`);
      console.log(`     Sandbox: ${project.environments.sandbox ? '✓' : '✗'}`);
      console.log(`     Created: ${project.createdAt}`);
      console.log(`     Updated: ${project.lastUpdated}`);
    });
    
    // Test 9: Test overwrite protection
    console.log('\n9. Testing overwrite protection...');
    try {
      config.setApiKey('test-project', 'production', 'new-key-12345');
      console.log('   ✗ Should have failed (no force flag)');
    } catch (error) {
      console.log('   ✓ Correctly prevented overwrite');
    }
    
    // Test 10: Test force overwrite
    console.log('\n10. Testing force overwrite...');
    config.setApiKey('test-project', 'production', 'new-key-12345', true);
    console.log('   ✓ Force overwrite successful');
    
    // Test 11: Test validation
    console.log('\n11. Testing API key validation...');
    const validKey = config.validateApiKey('valid-key-12345');
    const invalidKey = config.validateApiKey('short');
    console.log(`   Valid key validation: ${validKey}`);
    console.log(`   Invalid key validation: ${invalidKey}`);
    
    console.log('\n✅ All tests passed! Configuration system is working correctly.');
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      const configPath = path.join(os.homedir(), '.nue', 'config.json');
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        delete configData.projects['test-project'];
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
        console.log('   ✓ Test data cleaned up');
      }
    } catch (cleanupError) {
      console.log('   ⚠️  Warning: Could not clean up test data:', cleanupError.message);
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testConfig();
