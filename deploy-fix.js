#!/usr/bin/env node

/**
 * Deployment Fix Script
 * This script fixes common deployment issues and ensures the app builds correctly
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🔧 Starting deployment fix...');

// 1. Create a simple .env file for build
const envContent = `VITE_SUPABASE_URL=https://yrvicwapjsevyilxdzsm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with Supabase credentials');
} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
}

// 2. Clean previous builds
try {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('✅ Cleaned previous build');
  }
} catch (error) {
  console.error('❌ Failed to clean dist:', error.message);
}

// 3. Install dependencies
try {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// 4. Build the project
try {
  console.log('🏗️ Building project...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// 5. Verify build output
try {
  const distExists = fs.existsSync('dist');
  const indexExists = fs.existsSync('dist/index.html');
  
  if (distExists && indexExists) {
    console.log('✅ Build verification successful');
    console.log('📁 Build output: dist/');
    console.log('🌐 Ready for deployment!');
  } else {
    console.error('❌ Build verification failed - missing files');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Build verification error:', error.message);
  process.exit(1);
}

console.log('🎉 Deployment fix completed successfully!');
console.log('📋 Next steps:');
console.log('   1. Upload the dist/ folder to your hosting provider');
console.log('   2. Make sure your hosting provider serves index.html for all routes');
console.log('   3. Set environment variables in your hosting provider if needed');
