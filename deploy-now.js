#!/usr/bin/env node

/**
 * Immediate Deployment Script
 * This script deploys with environment variables included
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting immediate deployment with environment variables...');

// Set environment variables for this deployment
process.env.VITE_SUPABASE_URL = 'https://yrvicwapjsevyilxdzsm.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c';
process.env.VITE_APP_ENVIRONMENT = 'production';
process.env.VITE_ENABLE_DEBUG = 'false';

try {
  console.log('📦 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Built files are in the dist/ folder');
  
  // Check if dist folder exists and has files
  const distPath = path.join(process.cwd(), 'dist');
  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`📋 Built ${files.length} files in dist/ folder`);
    
    if (files.includes('index.html')) {
      console.log('✅ index.html found - deployment ready!');
    }
  }
  
  console.log('\n🎉 Your app is ready to deploy!');
  console.log('📋 Next steps:');
  console.log('1. Upload the dist/ folder to your hosting platform');
  console.log('2. Or use: npm run deploy (for GitHub Pages)');
  console.log('3. Or use: vercel --prod (for Vercel)');
  console.log('4. Or use: netlify deploy --dir=dist --prod (for Netlify)');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
