import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envLocalPath = path.resolve(projectRoot, '.env.local');

// The actual Supabase service role key (you'll need to get this from your Supabase dashboard)
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTk5OTQ4MiwiZXhwIjoyMDM1NTc1NDgyfQ.YOUR_SUPABASE_SERVICE_ROLE_KEY";

const envContent = `# Supabase Configuration
VITE_SUPABASE_URL="https://yrvicwapjsevyilxdzsm.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c"
SUPABASE_SERVICE_ROLE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

# Application Configuration
VITE_APP_NAME="TourCompanion"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="development"

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
VITE_ENABLE_PWA=true

# API Configuration
VITE_API_TIMEOUT=30000
VITE_MAX_FILE_SIZE=10485760

# Development Configuration
VITE_DEV_SERVER_PORT=5173
VITE_DEV_SERVER_HOST=localhost

# Developer Mode (set to true for testing, false for production)
VITE_DEV_MODE=true
NODE_ENV=development

# Backend URL (if running a separate backend)
BACKEND_URL="http://localhost:3000"

# JWT Secret (for backend, if applicable)
JWT_SECRET="supersecretjwtkey"
JWT_EXPIRES_IN="1d"

# Stripe (if re-enabling billing)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_STRIPE_PUBLISHABLE_KEY"
STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_SECRET_KEY"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_STRIPE_WEBHOOK_SECRET"
STRIPE_PRICE_ID_BASIC="price_12345_basic"
STRIPE_PRICE_ID_PRO="price_67890_pro"
`;

try {
  fs.writeFileSync(envLocalPath, envContent.trim());
  console.log(`✅ Created ${envLocalPath} file successfully!`);
  console.log('⚠️  IMPORTANT: Please update SUPABASE_SERVICE_ROLE_KEY in .env.local with your actual Supabase Service Role Key from your Supabase dashboard.');
} catch (error) {
  console.error(`❌ Error creating ${envLocalPath}:`, error.message);
  process.exit(1);
}


