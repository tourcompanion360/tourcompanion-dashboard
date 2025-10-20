/**
 * Quick Start Script
 * Sets up everything needed for testing the app
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Quick Start - Setting up development environment...\n');

try {
  // Step 1: Create .env.local if it doesn't exist
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env.local...');
    execSync('npm run setup-dev', { stdio: 'inherit' });
  } else {
    console.log('✅ .env.local already exists');
  }

  // Step 2: Create test user
  console.log('\n👤 Creating test user...');
  execSync('npm run create-test-user', { stdio: 'inherit' });

  console.log('\n🎉 Setup complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update .env.local with your actual Supabase credentials');
  console.log('2. Run: npm run dev');
  console.log('3. Go to: http://localhost:5173');
  console.log('4. Login with: samirechchttioui@gmail.com / test123456');
  console.log('\n🔓 You will have full access to test everything!');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n🔧 Manual setup:');
  console.log('1. Run: npm run setup-dev');
  console.log('2. Update .env.local with your credentials');
  console.log('3. Run: npm run create-test-user');
  console.log('4. Run: npm run dev');
}


