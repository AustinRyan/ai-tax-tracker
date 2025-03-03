#!/usr/bin/env node

/**
 * Backend deployment helper script for TaxAI
 * This script helps prepare the backend for deployment
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Create a require function
const require = createRequire(import.meta.url);

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m'
  }
};

// Helper functions
function printHeader(text) {
  console.log('\n' + colors.fg.cyan + colors.bright + '='.repeat(text.length + 4) + colors.reset);
  console.log(colors.fg.cyan + colors.bright + '| ' + text + ' |' + colors.reset);
  console.log(colors.fg.cyan + colors.bright + '='.repeat(text.length + 4) + colors.reset + '\n');
}

function printSuccess(text) {
  console.log(colors.fg.green + '✓ ' + text + colors.reset);
}

function printError(text) {
  console.log(colors.fg.red + '✗ ' + text + colors.reset);
}

function printInfo(text) {
  console.log(colors.fg.yellow + 'ℹ ' + text + colors.reset);
}

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Main function
async function main() {
  printHeader('TaxAI Backend Deployment Helper');
  console.log('This script will help you prepare your backend for deployment.\n');
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  let envExists = fs.existsSync(envPath);
  
  if (!envExists) {
    printInfo('No .env file found. Creating one...');
    
    // Get OpenAI API key
    const openaiKey = await question('Enter your OpenAI API key: ');
    
    // Get frontend URL
    const frontendUrl = await question('Enter your frontend URL (e.g., https://taxai.vercel.app): ');
    
    // Create .env file
    const envContent = `OPENAI_API_KEY=${openaiKey}\nFRONTEND_URL=${frontendUrl}\n`;
    fs.writeFileSync(envPath, envContent);
    
    printSuccess('.env file created successfully!');
  } else {
    printSuccess('Found existing .env file');
  }
  
  // Check for required dependencies
  printInfo('Checking for required dependencies...');
  
  try {
    // Check if package.json has all required dependencies
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredDeps = [
      'express', 'cors', 'dotenv', 'multer', 'openai', 
      'tesseract.js', 'sharp', 'pdf-parse'
    ];
    
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length > 0) {
      printInfo(`Installing missing dependencies: ${missingDeps.join(', ')}`);
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    } else {
      printSuccess('All required dependencies are installed');
    }
  } catch (error) {
    printError('Error checking dependencies: ' + error.message);
  }
  
  // Ask which platform to deploy to
  printInfo('Where would you like to deploy your backend?');
  console.log('1. Render.com (Recommended)');
  console.log('2. DigitalOcean App Platform');
  console.log('3. Railway.app');
  console.log('4. Traditional VPS');
  
  const platform = await question('Enter your choice (1-4): ');
  
  // Display deployment instructions based on platform choice
  switch (platform) {
    case '1':
      printHeader('Render.com Deployment Instructions');
      console.log('1. Create an account at https://render.com');
      console.log('2. Create a new Web Service');
      console.log('3. Connect your GitHub repository');
      console.log('4. Configure your service:');
      console.log('   - Build Command: npm install');
      console.log('   - Start Command: node server/index.js');
      console.log('5. Add your environment variables from .env');
      break;
      
    case '2':
      printHeader('DigitalOcean App Platform Instructions');
      console.log('1. Create an account at https://www.digitalocean.com/');
      console.log('2. Go to App Platform and create a new app');
      console.log('3. Connect your GitHub repository');
      console.log('4. Configure your app:');
      console.log('   - Build Command: npm install');
      console.log('   - Run Command: node server/index.js');
      console.log('5. Add your environment variables from .env');
      break;
      
    case '3':
      printHeader('Railway.app Deployment Instructions');
      console.log('1. Create an account at https://railway.app/');
      console.log('2. Create a new project');
      console.log('3. Connect your GitHub repository');
      console.log('4. Add your environment variables from .env');
      break;
      
    case '4':
      printHeader('Traditional VPS Deployment Instructions');
      console.log('1. Set up a VPS (DigitalOcean, AWS, Linode, etc.)');
      console.log('2. Install Node.js and npm');
      console.log('3. Clone your repository');
      console.log('4. Install PM2: npm install -g pm2');
      console.log('5. Copy your .env file to the server');
      console.log('6. Start your app: pm2 start server/index.js --name taxai-backend');
      console.log('7. Set up Nginx as a reverse proxy');
      console.log('8. Set up SSL with Let\'s Encrypt');
      break;
      
    default:
      printError('Invalid choice');
      break;
  }
  
  // Prepare for deployment
  printHeader('Final Deployment Preparation');
  
  // Create a production build
  const buildBackend = await question('Do you want to create a production build? (y/n): ');
  
  if (buildBackend.toLowerCase() === 'y') {
    printInfo('Creating production build...');
    
    try {
      // Make sure all dependencies are installed
      execSync('npm install', { stdio: 'inherit' });
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, 'server', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      printSuccess('Backend is ready for deployment!');
    } catch (error) {
      printError('Error creating production build: ' + error.message);
    }
  }
  
  printInfo('Remember to update your frontend with the correct backend URL once deployed.');
  printSuccess('Deployment preparation complete!');
  
  rl.close();
}

main().catch(error => {
  printError('An error occurred: ' + error.message);
  rl.close();
});
