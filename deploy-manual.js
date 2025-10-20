#!/usr/bin/env node

/**
 * Manual Deployment Helper
 * This script helps you deploy your app manually when automated deployment fails
 */

import fs from 'fs';
import path from 'path';

console.log('🚀 Manual Deployment Helper');
console.log('============================\n');

// Check if dist folder exists
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist/ folder not found!');
  console.log('Please run: npm run build');
  process.exit(1);
}

// List files in dist folder
const files = fs.readdirSync(distPath);
console.log(`📁 Found ${files.length} files in dist/ folder:`);
files.forEach(file => {
  const filePath = path.join(distPath, file);
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    console.log(`   📂 ${file}/`);
    const subFiles = fs.readdirSync(filePath);
    subFiles.forEach(subFile => {
      console.log(`      📄 ${subFile}`);
    });
  } else {
    console.log(`   📄 ${file}`);
  }
});

console.log('\n🎯 Deployment Options:');
console.log('======================');

console.log('\n1. 🌐 GitHub Pages:');
console.log('   - Upload all files from dist/ to your repository root');
console.log('   - Go to Settings → Pages → Deploy from branch');
console.log('   - Select main branch, / (root) folder');

console.log('\n2. 🚀 Netlify:');
console.log('   - Go to netlify.com');
console.log('   - Drag and drop the dist/ folder');
console.log('   - Your site will be live instantly!');

console.log('\n3. ⚡ Vercel:');
console.log('   - Go to vercel.com');
console.log('   - Upload the dist/ folder');
console.log('   - Deploy');

console.log('\n4. 🔥 Surge.sh (Simplest):');
console.log('   - Run: npm install -g surge');
console.log('   - Run: surge dist/');
console.log('   - Follow prompts');

console.log('\n5. 🔧 Firebase Hosting:');
console.log('   - Run: npm install -g firebase-tools');
console.log('   - Run: firebase init hosting');
console.log('   - Select dist as public directory');
console.log('   - Run: firebase deploy');

console.log('\n🧪 Test Your Deployment:');
console.log('========================');
console.log('After deployment, test these URLs:');
console.log('- Main app: https://your-domain.com/');
console.log('- Diagnostics: https://your-domain.com/diagnose.html');
console.log('- Direct access: https://your-domain.com/test-direct-access.html');

console.log('\n✅ Your app is ready to deploy manually!');
console.log('The dist/ folder contains everything needed.');
