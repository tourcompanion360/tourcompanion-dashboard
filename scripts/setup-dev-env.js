/**
 * Development Environment Setup Script
 * Creates .env.local with development settings
 */

import fs from 'fs';
import path from 'path';

const envContent = `# Development Environment Configuration
# This file enables developer mode for testing

# Enable Developer Mode (bypasses all subscription/payment checks)
VITE_DEV_MODE=true

# Supabase Configuration (replace with your actual values)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Configuration (for testing - use test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PRICE_ID_BASIC=price_basic_monthly
STRIPE_PRICE_ID_PRO=price_pro_monthly

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Development Settings
NODE_ENV=development
DEV_MODE=true
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists');
    console.log('📝 Please manually add VITE_DEV_MODE=true to enable developer mode');
    console.log('📝 Or delete .env.local and run this script again');
  } else {
    // Create .env.local file
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local with development settings');
    console.log('📝 Please update the placeholder values with your actual credentials');
    console.log('🔧 Key settings:');
    console.log('   - VITE_DEV_MODE=true (enables developer mode)');
    console.log('   - Add your Supabase URL and keys');
    console.log('   - Add your Stripe test keys');
  }
  
  console.log('\n🚀 Next steps:');
  console.log('1. Update .env.local with your actual credentials');
  console.log('2. Run: npm run create-test-user');
  console.log('3. Run: npm run dev');
  console.log('4. Login with: samirechchttioui@gmail.com / test123456');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}


