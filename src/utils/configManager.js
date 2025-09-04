const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const readline = require('readline');

class ConfigManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.nue');
    this.configFile = path.join(this.configDir, 'config.json');
    this.ensureConfigDir();
  }

  ensureConfigDir() {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
  }

  /**
   * Load the current configuration
   * @returns {Object} Configuration object
   */
  loadConfig() {
    if (!fs.existsSync(this.configFile)) {
      return {
        projects: {},
        defaultEnvironment: 'production'
      };
    }

    try {
      const configData = fs.readFileSync(this.configFile, 'utf8');
      const config = JSON.parse(configData);
      
      // Ensure backward compatibility with old config format
      if (config.apiKeys && !config.projects) {
        config.projects = {
          default: {
            name: 'default',
            environments: {
              production: config.apiKeys.production,
              sandbox: config.apiKeys.sandbox
            },
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          }
        };
        delete config.apiKeys;
      }

      return {
        projects: config.projects || {},
        defaultEnvironment: config.defaultEnvironment || 'production'
      };
    } catch (error) {
      console.warn(chalk.yellow('Warning: Could not read config file, using defaults'));
      return {
        projects: {},
        defaultEnvironment: 'production'
      };
    }
  }

  /**
   * Save configuration to file
   * @param {Object} config - Configuration object to save
   */
  saveConfig(config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      throw new Error(`Failed to save configuration: ${error.message}`);
    }
  }

  /**
   * Get API key for a specific project and environment
   * @param {string} projectName - Project name
   * @param {string} environment - Environment (production or sandbox)
   * @returns {string|null} API key or null if not found
   */
  getApiKey(projectName, environment = 'production') {
    const config = this.loadConfig();
    
    if (projectName && config.projects[projectName]) {
      return config.projects[projectName].environments[environment] || null;
    }
    
    return null;
  }

  /**
   * Set API key for a specific project and environment
   * @param {string} projectName - Project name
   * @param {string} environment - Environment (production or sandbox)
   * @param {string} apiKey - API key to set
   * @param {boolean} force - Whether to force overwrite existing key
   */
  setApiKey(projectName, environment, apiKey, force = false) {
    const config = this.loadConfig();
    
    // Initialize project if it doesn't exist
    if (!config.projects[projectName]) {
      config.projects[projectName] = {
        name: projectName,
        environments: {},
        createdAt: new Date().toISOString()
      };
    }

    // Check if key already exists
    if (config.projects[projectName].environments[environment] && !force) {
      throw new Error(`API key for ${projectName}:${environment} already exists. Use --force to overwrite.`);
    }

    // Set the API key
    config.projects[projectName].environments[environment] = apiKey;
    
    // Update timestamp
    config.projects[projectName].lastUpdated = new Date().toISOString();

    this.saveConfig(config);
  }

  /**
   * Check if project exists
   * @param {string} projectName - Project name to check
   * @returns {boolean} Whether project exists
   */
  projectExists(projectName) {
    const config = this.loadConfig();
    return !!config.projects[projectName];
  }

  /**
   * Check if environment exists for a project
   * @param {string} projectName - Project name
   * @param {string} environment - Environment to check
   * @returns {boolean} Whether environment exists
   */
  environmentExists(projectName, environment) {
    const config = this.loadConfig();
    return !!(config.projects[projectName] && config.projects[projectName].environments[environment]);
  }

  /**
   * Get all projects
   * @returns {Object} Object with project names as keys
   */
  getAllProjects() {
    const config = this.loadConfig();
    return config.projects;
  }


  /**
   * Prompt user for confirmation to overwrite existing configuration
   * @param {string} projectName - Project name
   * @param {string} environment - Environment
   * @returns {Promise<boolean>} Whether user confirmed overwrite
   */
  async promptForOverwrite(projectName, environment) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      rl.question(
        chalk.yellow(`Configuration for ${projectName}:${environment} already exists. Overwrite? (y/N): `),
        (input) => {
          rl.close();
          resolve(input.trim().toLowerCase());
        }
      );
    });

    return answer === 'y' || answer === 'yes';
  }

  /**
   * Get current project context from command options
   * @param {Object} options - Command options
   * @returns {Object} Project context with projectName and environment
   */
  getProjectContext(options) {
    const projectName = options.project;
    const environment = options.sandbox ? 'sandbox' : 'production';
    
    // If no project is specified, that's okay
    // The calling code should handle this case by falling back to environment variables
    
    return { 
      projectName, 
      environment,
      hasProject: !!projectName
    };
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Whether API key is valid
   */
  validateApiKey(apiKey) {
    return apiKey && apiKey.length >= 10;
  }
}

module.exports = ConfigManager;
