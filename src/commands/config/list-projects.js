const chalk = require('chalk');
const ConfigManager = require('../../utils/configManager');

class ListProjectsCommand {
  constructor() {
    this.configManager = new ConfigManager();
  }

  register(program) {
    program
      .command('list-projects')
      .description('List all configured projects and their status')
      .option('--verbose', 'Show detailed project information')
      .action(this.handleAction.bind(this));
  }

  async handleAction(options) {
    try {
      console.log(chalk.blue('Project Configuration Status\n'));

      const projects = this.configManager.getAllProjects();

      if (Object.keys(projects).length === 0) {
        console.log(chalk.yellow('No projects configured yet.'));
        console.log(chalk.blue('Use "nue set-key --project <name>" to create your first project.'));
        return;
      }

      // List all projects
      Object.entries(projects).forEach(([name, project]) => {
        console.log(chalk.blue(`${name}`));
        
        if (options.verbose) {
          console.log(chalk.gray(`  Created: ${project.createdAt || 'Unknown'}`));
          console.log(chalk.gray(`  Last Updated: ${project.lastUpdated || 'Unknown'}`));
        }
        
        console.log(chalk.gray('  Environments:'));
        
        if (project.environments.production) {
          console.log(chalk.green('    ✓ production'));
        } else {
          console.log(chalk.red('    ✗ production'));
        }
        
        if (project.environments.sandbox) {
          console.log(chalk.green('    ✓ sandbox'));
        } else {
          console.log(chalk.red('    ✗ sandbox'));
        }
        
        console.log(''); // Empty line between projects
      });

      // Show usage examples
      this.showUsageExamples();

    } catch (error) {
      console.error(chalk.red('Failed to list projects:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Show usage examples
   */
  showUsageExamples() {
    console.log(chalk.blue('Usage Examples:'));
    console.log(chalk.gray('  Set API key for a project:'));
    console.log(chalk.gray('    nue set-key --project my-project --environment production'));
    console.log(chalk.gray('    nue set-key --project my-project --environment sandbox'));
    console.log('');
    console.log(chalk.gray('  Use with specific project:'));
    console.log(chalk.gray('    nue lifecycle customers create --project my-project --sandbox'));
    console.log(chalk.gray('    nue platform metadata export --project my-project --object-type customers'));
    console.log('');
    console.log(chalk.gray('  Use without project (fallback to environment variables):'));
    console.log(chalk.gray('    nue lifecycle customers create --sandbox'));
    console.log(chalk.gray('    nue platform metadata export --object-type customers'));
  }
}

module.exports = ListProjectsCommand;
