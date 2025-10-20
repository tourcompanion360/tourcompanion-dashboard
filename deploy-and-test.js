#!/usr/bin/env node

/**
 * Deploy and Test Script
 * This script helps deploy and test your application
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting deployment and test process...');

// Set environment variables for deployment
process.env.VITE_SUPABASE_URL = 'https://yrvicwapjsevyilxdzsm.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c';
process.env.VITE_APP_ENVIRONMENT = 'production';
process.env.VITE_ENABLE_DEBUG = 'false';

try {
  console.log('📦 Building application with diagnostic tools...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  
  // Check if dist folder exists and has files
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`📋 Built ${files.length} files in dist/ folder`);
    
    if (files.includes('index.html')) {
      console.log('✅ index.html found - deployment ready!');
      
      // Check if diagnostic tools are included
      const indexContent = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
      if (indexContent.includes('deploymentDiagnostics')) {
        console.log('✅ Diagnostic tools included in build');
      }
    }
  }
  
  console.log('\n🎉 Your app is ready to deploy with diagnostic tools!');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy the dist/ folder to your hosting platform');
  console.log('2. Open the deployed app in your browser');
  console.log('3. Press F12 to open Developer Tools');
  console.log('4. Go to Console tab and look for diagnostic messages');
  console.log('5. Share any error messages with me for specific fixes');
  
  console.log('\n🔍 What to look for in the console:');
  console.log('✅ "🚀 Main.tsx loaded successfully"');
  console.log('✅ "🔍 Running deployment diagnostics..."');
  console.log('❌ Any error messages in red');
  console.log('❌ Failed network requests');
  
  console.log('\n📖 See DEPLOYMENT_TROUBLESHOOTING.md for detailed instructions');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
