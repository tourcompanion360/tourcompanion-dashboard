#!/usr/bin/env node

/**
 * Environment Setup Script for TourCompanion
 * This script creates the necessary environment files for the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Environment configuration
const envConfig = {
  // Supabase Configuration
  VITE_SUPABASE_URL: 'https://yrvicwapjsevyilxdzsm.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c',
  
  // Application Configuration
  VITE_APP_NAME: 'TourCompanion',
  VITE_APP_VERSION: '1.0.0',
  VITE_APP_ENVIRONMENT: 'development',
  
  // Feature Flags
  VITE_ENABLE_ANALYTICS: 'true',
  VITE_ENABLE_DEBUG: 'true',
  VITE_ENABLE_PWA: 'true',
  VITE_DEV_MODE: 'true',
  
  // API Configuration
  VITE_API_TIMEOUT: '30000',
  VITE_MAX_FILE_SIZE: '10485760',
  
  // Development Configuration
  VITE_DEV_SERVER_PORT: '5173',
  VITE_DEV_SERVER_HOST: 'localhost',
  
  // Security Configuration
  JWT_SECRET: 'supersecretjwtkey',
  JWT_EXPIRES_IN: '1d',
  
  // Backend Configuration
  BACKEND_URL: 'http://localhost:3000',
  NODE_ENV: 'development'
};

function createEnvFile() {
  const envPath = path.join(projectRoot, '.env.local');
  
  // Check if file already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, path.join(projectRoot, '.env.local.backup'));
  }
  
  // Create environment file content
  const envContent = `# TourCompanion SaaS Environment Configuration
# This file contains the actual environment variables for your app
# Generated on ${new Date().toISOString()}

# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
VITE_SUPABASE_URL=${envConfig.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${envConfig.VITE_SUPABASE_ANON_KEY}

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
VITE_APP_NAME=${envConfig.VITE_APP_NAME}
VITE_APP_VERSION=${envConfig.VITE_APP_VERSION}
VITE_APP_ENVIRONMENT=${envConfig.VITE_APP_ENVIRONMENT}

# =============================================================================
# FEATURE FLAGS
# =============================================================================
VITE_ENABLE_ANALYTICS=${envConfig.VITE_ENABLE_ANALYTICS}
VITE_ENABLE_DEBUG=${envConfig.VITE_ENABLE_DEBUG}
VITE_ENABLE_PWA=${envConfig.VITE_ENABLE_PWA}
VITE_DEV_MODE=${envConfig.VITE_DEV_MODE}

# =============================================================================
# API CONFIGURATION
# =============================================================================
VITE_API_TIMEOUT=${envConfig.VITE_API_TIMEOUT}
VITE_MAX_FILE_SIZE=${envConfig.VITE_MAX_FILE_SIZE}

# =============================================================================
# DEVELOPMENT CONFIGURATION
# =============================================================================
VITE_DEV_SERVER_PORT=${envConfig.VITE_DEV_SERVER_PORT}
VITE_DEV_SERVER_HOST=${envConfig.VITE_DEV_SERVER_HOST}

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================
JWT_SECRET=${envConfig.JWT_SECRET}
JWT_EXPIRES_IN=${envConfig.JWT_EXPIRES_IN}

# =============================================================================
# BACKEND CONFIGURATION
# =============================================================================
BACKEND_URL=${envConfig.BACKEND_URL}
NODE_ENV=${envConfig.NODE_ENV}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file successfully!');
    console.log('📍 Location:', envPath);
    return true;
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
    return false;
  }
}

function verifyEnvironment() {
  console.log('\n🔍 Verifying environment configuration...');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envConfig[varName] || envConfig[varName] === 'your-value-here') {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    return false;
  }
  
  console.log('✅ All required environment variables are configured');
  return true;
}

function main() {
  console.log('🚀 TourCompanion Environment Setup');
  console.log('=====================================\n');
  
  // Verify configuration
  if (!verifyEnvironment()) {
    console.error('❌ Environment setup failed due to missing configuration');
    process.exit(1);
  }
  
  // Create environment file
  if (createEnvFile()) {
    console.log('\n🎉 Environment setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:5173');
    console.log('3. Login with: samirechchttioui@gmail.com / test123456');
    console.log('\n⚠️  Note: Make sure to never commit .env.local to version control!');
  } else {
    console.error('❌ Environment setup failed');
    process.exit(1);
  }
}

// Run the setup
main();


