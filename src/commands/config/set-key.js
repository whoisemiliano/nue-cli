const chalk = require('chalk');
const ConfigManager = require('../../utils/configManager');

class SetKeyCommand {
  constructor() {
    this.configManager = new ConfigManager();
  }

  register(program) {
    program
      .command('set-key')
      .description('Set Nue API key for authentication')
      .option('--key <apiKey>', 'API key to set')
      .option('--project <projectName>', 'Project name')
      .option('--environment <env>', 'Environment (production, sandbox)', 'production')
      .option('--force', 'Overwrite existing key without prompting')
      .action(this.handleAction.bind(this));
  }

  async handleAction(options) {
    try {
      console.log(chalk.blue('Setting API key...'));

      // Get project name from options or use 'default'
      const projectName = options.project || 'default';
      
      // Validate environment
      if (options.environment && !['production', 'sandbox'].includes(options.environment)) {
        throw new Error('Environment must be either "production" or "sandbox"');
      }

      const environment = options.environment || 'production';

      // Get API key from options or prompt
      let apiKey = options.key;
      if (!apiKey) {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        apiKey = await new Promise((resolve) => {
          rl.question(`Enter your Nue API key for ${projectName}:${environment}: `, (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });
      }

      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Validate API key format
      if (!this.configManager.validateApiKey(apiKey)) {
        throw new Error('API key appears to be invalid (too short)');
      }

      // Check if configuration already exists
      if (this.configManager.environmentExists(projectName, environment) && !options.force) {
        console.log(chalk.yellow(`Configuration for ${projectName}:${environment} already exists.`));
        
        const shouldOverwrite = await this.configManager.promptForOverwrite(projectName, environment);
        if (!shouldOverwrite) {
          console.log(chalk.blue('Operation cancelled.'));
          return;
        }
      }

      // Set the API key
      this.configManager.setApiKey(projectName, environment, apiKey, true);

      console.log(chalk.green(`API key set successfully for ${projectName}:${environment}!`));
      
      // Show current project status
      this.showProjectStatus(projectName);

      // Show usage examples
      this.showUsageExamples(projectName, environment);

    } catch (error) {
      console.error(chalk.red('Failed to set API key:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Show current project status
   * @param {string} projectName - Project name
   */
  showProjectStatus(projectName) {
    const projects = this.configManager.getAllProjects();
    const project = projects[projectName];
    
    if (project) {
      console.log(chalk.blue(`\nProject: ${projectName}`));
      console.log(chalk.gray('Environments:'));
      
      if (project.environments.production) {
        console.log(chalk.green('  ✓ production'));
      } else {
        console.log(chalk.red('  ✗ production'));
      }
      
      if (project.environments.sandbox) {
        console.log(chalk.green('  ✓ sandbox'));
      } else {
        console.log(chalk.red('  ✗ sandbox'));
      }
    }
  }

  /**
   * Show usage examples
   * @param {string} projectName - Project name
   * @param {string} environment - Environment
   */
  showUsageExamples(projectName, environment) {
    const envFlag = environment === 'sandbox' ? ' --sandbox' : '';
    const projectFlag = projectName !== 'default' ? ` --project ${projectName}` : '';
    
    console.log(chalk.blue('\nYou can now use the CLI with commands like:'));
    console.log(chalk.gray(`nue lifecycle customers create --json '{"name": "Acme Corp"}'${projectFlag}${envFlag}`));
    console.log(chalk.gray(`nue platform metadata export --object-type customers${projectFlag}${envFlag}`));
    
    if (projectName === 'default') {
      console.log(chalk.blue('\nYou can also use commands without --project flag (fallback to environment variables):'));
      console.log(chalk.gray(`nue lifecycle customers create --json '{"name": "Acme Corp"}'${envFlag}`));
      console.log(chalk.gray(`nue platform metadata export --object-type customers${envFlag}`));
    }
  }
}

module.exports = SetKeyCommand; 