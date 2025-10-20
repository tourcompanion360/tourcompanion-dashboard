#!/usr/bin/env node

/**
 * Deployment Script with Environment Variables
 * This script helps deploy the application with proper environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Environment variables for deployment
const deploymentEnv = {
  VITE_SUPABASE_URL: 'https://yrvicwapjsevyilxdzsm.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c',
  VITE_APP_NAME: 'TourCompanion',
  VITE_APP_VERSION: '1.0.0',
  VITE_APP_ENVIRONMENT: 'production',
  VITE_ENABLE_ANALYTICS: 'true',
  VITE_ENABLE_DEBUG: 'false',
  VITE_ENABLE_PWA: 'true',
  VITE_API_TIMEOUT: '30000',
  VITE_MAX_FILE_SIZE: '10485760'
};

function createEnvFile() {
  const envPath = path.join(projectRoot, '.env.production');
  
  console.log('🔧 Creating production environment file...');
  
  const envContent = Object.entries(deploymentEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.production file');
}

function createVercelEnvFile() {
  const vercelPath = path.join(projectRoot, '.vercel', 'env');
  
  console.log('🔧 Creating Vercel environment file...');
  
  // Ensure .vercel directory exists
  const vercelDir = path.dirname(vercelPath);
  if (!fs.existsSync(vercelDir)) {
    fs.mkdirSync(vercelDir, { recursive: true });
  }
  
  const vercelContent = Object.entries(deploymentEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(vercelPath, vercelContent);
  console.log('✅ Created .vercel/env file');
}

function createNetlifyEnvFile() {
  const netlifyPath = path.join(projectRoot, '.env.netlify');
  
  console.log('🔧 Creating Netlify environment file...');
  
  const netlifyContent = Object.entries(deploymentEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  fs.writeFileSync(netlifyPath, netlifyContent);
  console.log('✅ Created .env.netlify file');
}

function createGitHubActionsEnv() {
  const githubPath = path.join(projectRoot, '.github', 'workflows', 'deploy.yml');
  
  console.log('🔧 Creating GitHub Actions deployment workflow...');
  
  // Ensure .github/workflows directory exists
  const githubDir = path.dirname(githubPath);
  if (!fs.existsSync(githubDir)) {
    fs.mkdirSync(githubDir, { recursive: true });
  }
  
  const workflowContent = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${deploymentEnv.VITE_SUPABASE_URL}
        VITE_SUPABASE_ANON_KEY: ${deploymentEnv.VITE_SUPABASE_ANON_KEY}
        VITE_APP_NAME: ${deploymentEnv.VITE_APP_NAME}
        VITE_APP_VERSION: ${deploymentEnv.VITE_APP_VERSION}
        VITE_APP_ENVIRONMENT: ${deploymentEnv.VITE_APP_ENVIRONMENT}
        VITE_ENABLE_ANALYTICS: ${deploymentEnv.VITE_ENABLE_ANALYTICS}
        VITE_ENABLE_DEBUG: ${deploymentEnv.VITE_ENABLE_DEBUG}
        VITE_ENABLE_PWA: ${deploymentEnv.VITE_ENABLE_PWA}
        VITE_API_TIMEOUT: ${deploymentEnv.VITE_API_TIMEOUT}
        VITE_MAX_FILE_SIZE: ${deploymentEnv.VITE_MAX_FILE_SIZE}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        cname: tourcompanion.com
`;

  fs.writeFileSync(githubPath, workflowContent);
  console.log('✅ Created GitHub Actions workflow');
}

function main() {
  console.log('🚀 Setting up deployment environment...');
  
  try {
    createEnvFile();
    createVercelEnvFile();
    createNetlifyEnvFile();
    createGitHubActionsEnv();
    
    console.log('\n✅ Deployment environment setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. For GitHub Pages: Push to main branch to trigger deployment');
    console.log('2. For Vercel: Deploy using Vercel CLI or dashboard');
    console.log('3. For Netlify: Deploy using Netlify CLI or dashboard');
    console.log('\n📖 See DEPLOYMENT_ENVIRONMENT_SETUP.md for detailed instructions');
    
  } catch (error) {
    console.error('❌ Error setting up deployment environment:', error);
    process.exit(1);
  }
}

main();
