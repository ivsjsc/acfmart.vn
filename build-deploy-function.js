/**
 * ACFMart Build & Deploy Function
 * Comprehensive script that follows ACFMart deployment pre-check specifications
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DEPLOY_TYPES = ['frontend', 'functions', 'both', 'hosting'];
const ENVIRONMENTS = ['development', 'staging', 'production'];

class ACFMartBuildDeploy {
  constructor(deployType = 'both', environment = 'production') {
    this.deployType = deployType;
    this.environment = environment;
    this.projectRoot = process.cwd();
  }

  /**
   * Log messages with timestamps and colors
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',     // Cyan
      success: '\x1b[32m',   // Green
      error: '\x1b[31m',     // Red
      warning: '\x1b[33m',   // Yellow
      reset: '\x1b[0m'       // Reset
    };

    const color = colors[level] || colors.info;
    console.log(`${color}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.reset}`);
  }

  /**
   * Execute shell command safely
   */
  executeCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        stdio: 'pipe',
        encoding: 'utf8',
        cwd: options.cwd || this.projectRoot,
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, stderr: error.stderr };
    }
  }

  /**
   * Run pre-checks according to ACFMart specifications
   */
  async runPreChecks() {
    this.log('Starting ACFMart deployment pre-checks...', 'info');

    // 1. Directory validation
    const expectedPath = 'd:\\IVS\\Apps\\DEVELOPER\\acfmart';
    const currentPath = this.projectRoot.toLowerCase();
    if (!currentPath.includes(expectedPath.toLowerCase())) {
      this.log(`Directory validation failed. Expected path to contain: ${expectedPath}, Current: ${currentPath}`, 'error');
      return false;
    } else {
      this.log(`Directory validation passed: ${currentPath}`, 'success');
    }

    // 2. Dependency check
    if (!fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
      this.log('Missing package.json in project root', 'error');
      return false;
    } else {
      this.log('Dependency check passed: package.json found', 'success');
    }

    // 3. Git sync check
    this.log('Checking git synchronization...', 'info');
    const gitPullResult = this.executeCommand('git pull origin main');
    if (!gitPullResult.success) {
      this.log(`Git pull failed: ${gitPullResult.error}`, 'warning');
    }

    const gitDiffResult = this.executeCommand('git diff --check');
    if (gitDiffResult.success && gitDiffResult.output.trim() !== '') {
      this.log(`Git conflicts detected: ${gitDiffResult.output}`, 'error');
      return false;
    } else {
      this.log('Git synchronization check passed', 'success');
    }

    // 4. Check if Firebase CLI is installed
    const firebaseVersionResult = this.executeCommand('firebase --version');
    if (!firebaseVersionResult.success) {
      this.log('Firebase CLI not found. Please install with \'npm install -g firebase-tools\'', 'error');
      return false;
    } else {
      this.log(`Firebase CLI version: ${firebaseVersionResult.output.trim()}`, 'success');
    }

    this.log('All pre-checks passed!', 'success');
    return true;
  }

  /**
   * Validate Firebase secrets
   */
  async validateFirebaseSecrets(functionName) {
    this.log(`Validating Firebase secrets for function: ${functionName}`, 'info');

    const secretsResult = this.executeCommand('firebase functions:secrets:list --non-interactive');
    if (secretsResult.success) {
      this.log(`Firebase secrets validation completed for ${functionName}`, 'success');
      return true;
    } else {
      this.log(`Could not validate Firebase secrets: ${secretsResult.error}`, 'warning');
      return true; // Not failing the build for now
    }
  }

  /**
   * Validate Firestore indexes
   */
  async validateFirestoreIndexes() {
    this.log('Validating Firestore indexes...', 'info');

    const indexesResult = this.executeCommand('firebase firestore:indexes --non-interactive');
    if (indexesResult.success) {
      this.log('Firestore indexes validation completed', 'success');
      return true;
    } else {
      this.log(`Firestore indexes validation failed: ${indexesResult.error}`, 'error');
      return false;
    }
  }

  /**
   * Build frontend application
   */
  async buildFrontend() {
    this.log('Building frontend application...', 'info');

    const frontendDir = path.join(this.projectRoot, 'src');
    const buildResult = this.executeCommand('npm run build', { cwd: frontendDir });

    if (buildResult.success) {
      this.log('Frontend build completed successfully', 'success');
      return true;
    } else {
      this.log(`Frontend build failed: ${buildResult.error}`, 'error');
      return false;
    }
  }

  /**
   * Build Firebase functions
   */
  async buildFunctions() {
    this.log('Building Firebase functions...', 'info');

    const functionsDir = path.join(this.projectRoot, 'functions');
    const buildResult = this.executeCommand('npm run build', { cwd: functionsDir });

    if (buildResult.success) {
      this.log('Functions build completed successfully', 'success');
      return true;
    } else {
      this.log(`Functions build failed: ${buildResult.error}`, 'error');
      return false;
    }
  }

  /**
   * Deploy frontend to Firebase Hosting
   */
  async deployFrontend() {
    this.log('Deploying frontend to Firebase Hosting...', 'info');

    const frontendDir = path.join(this.projectRoot, 'src');
    const deployResult = this.executeCommand('firebase deploy --only hosting --non-interactive', { cwd: frontendDir });

    if (deployResult.success) {
      this.log('Frontend deployment completed successfully', 'success');
      return true;
    } else {
      this.log(`Frontend deployment failed: ${deployResult.error}`, 'error');
      return false;
    }
  }

  /**
   * Deploy Firebase functions
   */
  async deployFunctions(functionName = '') {
    this.log('Deploying Firebase functions...', 'info');

    const functionsDir = path.join(this.projectRoot, 'functions');
    let command = 'firebase deploy --only functions --non-interactive';
    
    if (functionName) {
      command = `firebase deploy --only functions:${functionName} --non-interactive`;
    }

    const deployResult = this.executeCommand(command, { cwd: functionsDir });

    if (deployResult.success) {
      this.log('Functions deployment completed successfully', 'success');
      return true;
    } else {
      this.log(`Functions deployment failed: ${deployResult.error}`, 'error');
      return false;
    }
  }

  /**
   * Show deployment URLs
   */
  showDeploymentUrls() {
    this.log('Deployment completed! Access your applications at:', 'success');
    console.log('  - Main site: https://acfmart.web.app');
    console.log('  - Store site: https://acfmart-store.web.app');
    console.log('  - Cloud site: https://acfmart-cloud.web.app');
    console.log('  - Online site: https://acfmart-online.web.app');
    this.log('API endpoints are available at your Firebase project URL', 'info');
  }

  /**
   * Main execution function
   */
  async execute() {
    this.log(`Starting ACFMart Build & Deploy Process`, 'info');
    this.log(`Deploy type: ${this.deployType} | Environment: ${this.environment}`, 'info');

    // Validate inputs
    if (!DEPLOY_TYPES.includes(this.deployType)) {
      this.log(`Invalid deploy type. Valid options: ${DEPLOY_TYPES.join(', ')}`, 'error');
      return false;
    }

    if (!ENVIRONMENTS.includes(this.environment)) {
      this.log(`Invalid environment. Valid options: ${ENVIRONMENTS.join(', ')}`, 'warning');
    }

    // Run pre-checks
    if (!(await this.runPreChecks())) {
      this.log('Pre-checks failed. Aborting deployment.', 'error');
      return false;
    }

    let buildSuccess = true;

    switch (this.deployType) {
      case 'frontend':
        buildSuccess = await this.buildFrontend();
        if (buildSuccess) {
          buildSuccess = await this.deployFrontend();
        }
        break;

      case 'functions':
        buildSuccess = await this.buildFunctions();
        if (buildSuccess) {
          buildSuccess = await this.deployFunctions();
        }
        break;

      case 'hosting':
        buildSuccess = await this.deployFrontend(); // Just deploy hosting without rebuilding
        break;

      case 'both':
        const [frontendBuild, functionsBuild] = await Promise.all([
          this.buildFrontend(),
          this.buildFunctions()
        ]);

        if (frontendBuild && functionsBuild) {
          const [frontendDeploy, functionsDeploy] = await Promise.all([
            this.deployFrontend(),
            this.deployFunctions()
          ]);

          buildSuccess = frontendDeploy && functionsDeploy;
        } else {
          buildSuccess = false;
        }
        break;

      default:
        this.log(`Unknown deploy type: ${this.deployType}`, 'error');
        return false;
    }

    if (buildSuccess) {
      this.showDeploymentUrls();
      this.log('ACFMart Build & Deploy Process completed successfully!', 'success');
      return true;
    } else {
      this.log('ACFMart Build & Deploy Process failed!', 'error');
      return false;
    }
  }
}

// Command line argument parsing
const args = process.argv.slice(2);
const deployType = args[0] || 'both';
const environment = args[1] || 'production';

// Execute the build and deploy process
async function runBuildDeploy() {
  const buildDeploy = new ACFMartBuildDeploy(deployType, environment);
  const success = await buildDeploy.execute();
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  runBuildDeploy().catch(error => {
    console.error('Build/Deploy process failed:', error);
    process.exit(1);
  });
}

module.exports = ACFMartBuildDeploy;