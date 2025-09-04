const ConfigManager = require('./configManager');

/**
 * Get API key for the current project context, falling back to environment variables
 * @param {Object} options - Command options
 * @param {boolean} sandbox - Whether to use sandbox environment
 * @returns {string} API key
 */
function getProjectApiKey(options, sandbox = false) {
  const configManager = new ConfigManager();
  const environment = sandbox ? 'sandbox' : 'production';
  
  // Get project name from options
  const projectName = options.project;
  
  // If project is specified, use project-based configuration
  if (projectName) {
    const apiKey = configManager.getApiKey(projectName, environment);
    
    if (!apiKey) {
      throw new Error(
        `No API key found for ${projectName}:${environment}. ` +
        `Use "nue set-key --project ${projectName} --environment ${environment}" to set it.`
      );
    }
    
    return apiKey;
  }
  
  // No project specified, fall back to environment variables (backward compatibility)
  const envVarName = sandbox ? 'NUE_SANDBOX_API_KEY' : 'NUE_API_KEY';
  const apiKey = process.env[envVarName];
  
  if (!apiKey) {
    // No API key found anywhere
    throw new Error(
      `No API key found for ${environment} environment. ` +
      `Either set the ${envVarName} environment variable, ` +
      `or use "nue set-key --project <name> --environment ${environment}" to set up project-based configuration.`
    );
  }
  
  return apiKey;
}

/**
 * Get project context information, falling back to environment variables
 * @param {Object} options - Command options
 * @param {boolean} sandbox - Whether to use sandbox environment
 * @returns {Object} Project context with projectName, environment, and apiKey
 */
function getProjectContext(options, sandbox = false) {
  const configManager = new ConfigManager();
  const environment = sandbox ? 'sandbox' : 'production';
  
  // Get project name from options
  const projectName = options.project;
  
  // If project is specified, use project-based configuration
  if (projectName) {
    const apiKey = configManager.getApiKey(projectName, environment);
    
    if (!apiKey) {
      throw new Error(
        `No API key found for ${projectName}:${environment}. ` +
        `Use "nue set-key --project ${projectName} --environment ${environment}" to set it.`
      );
    }
    
    return {
      projectName,
      environment,
      apiKey
    };
  }
  
  // No project specified, fall back to environment variables
  const envVarName = sandbox ? 'NUE_SANDBOX_API_KEY' : 'NUE_API_KEY';
  const apiKey = process.env[envVarName];
  
  if (!apiKey) {
    // No API key found anywhere
    throw new Error(
      `No API key found for ${environment} environment. ` +
      `Either set the ${envVarName} environment variable, ` +
      `or use "nue set-key --project <name> --environment ${environment}" to set up project-based configuration.`
    );
  }
  
  return {
    projectName: null, // No project specified
    environment,
    apiKey
  };
}

/**
 * Check if project configuration exists
 * @param {string} projectName - Project name
 * @param {boolean} sandbox - Whether to check sandbox environment
 * @returns {boolean} Whether configuration exists
 */
function hasProjectConfig(projectName, sandbox = false) {
  const configManager = new ConfigManager();
  const environment = sandbox ? 'sandbox' : 'production';
  
  return configManager.environmentExists(projectName, environment);
}

/**
 * Get available projects for the current user
 * @returns {Object} Object with project names as keys
 */
function getAvailableProjects() {
  const configManager = new ConfigManager();
  return configManager.getAllProjects();
}

/**
 * Check if project-based configuration is being used
 * @param {Object} options - Command options
 * @returns {boolean} Whether a project is specified
 */
function isUsingProjectConfig(options) {
  return !!options.project;
}

module.exports = {
  getProjectApiKey,
  getProjectContext,
  hasProjectConfig,
  getAvailableProjects,
  isUsingProjectConfig
};
