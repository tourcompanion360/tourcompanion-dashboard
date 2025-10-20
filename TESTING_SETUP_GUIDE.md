# 🧪 Complete Testing Setup Guide

This guide will help you set up and test the entire application before deployment.

## 🚀 Quick Start (5 Minutes)

### Step 1: Enable Developer Mode
Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_DEV_MODE=true
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Create Test User
Run the test user creation script:

```bash
npm run create-test-user
```

### Step 3: Start Development Server
```bash
npm run dev
```

### Step 4: Login and Test
- Go to `http://localhost:5173`
- Click "Sign In"
- Use these credentials:
  - **Email**: `samirechchttioui@gmail.com`
  - **Password**: `test123456`

## 🎯 What You Can Test

### ✅ Full Access Features
- **Dashboard**: Complete access to all dashboard features
- **Projects**: Create, edit, delete projects (unlimited)
- **Clients**: Manage unlimited clients
- **Chatbots**: Create and configure chatbots (unlimited)
- **Analytics**: Full analytics access (Pro features)
- **Billing Page**: View billing management (bypassed)
- **Admin Features**: All admin functionality

### 🔓 Bypassed Restrictions
- **Subscription Checks**: All subscription requirements bypassed
- **Payment Requirements**: No payment needed
- **Feature Limits**: Unlimited access to all features
- **Plan Restrictions**: Pro features available without Pro plan

## 🛠️ Developer Mode Features

### Visual Indicators
- **Yellow Banner**: Shows "Developer Mode Active" at the top
- **Full Access**: All subscription gates are bypassed
- **Debug Logs**: Enhanced logging for development

### Configuration
The developer mode is controlled by:
- `VITE_DEV_MODE=true` in `.env.local`
- Automatically enabled in development environment
- Can be toggled on/off as needed

## 📋 Testing Checklist

### Authentication & Access
- [ ] Can login with test credentials
- [ ] Can access dashboard without subscription
- [ ] Can access all protected routes
- [ ] Can access Pro-only features (Analytics, etc.)

### Core Features
- [ ] Dashboard loads correctly
- [ ] Can create/edit/delete projects
- [ ] Can manage clients
- [ ] Can configure chatbots
- [ ] Analytics page works (Pro feature)
- [ ] Billing page accessible

### Navigation
- [ ] All navigation links work
- [ ] Protected routes accessible
- [ ] No subscription prompts
- [ ] No payment requirements

### UI/UX
- [ ] Developer banner visible
- [ ] All components render correctly
- [ ] No broken links or errors
- [ ] Responsive design works

## 🔧 Troubleshooting

### Login Issues
If you can't login with the test credentials:

1. **Check if user exists**:
   ```bash
   npm run create-test-user
   ```

2. **Verify environment variables**:
   - Ensure `.env.local` exists
   - Check Supabase URL and keys are correct

3. **Check Supabase connection**:
   - Go to your Supabase dashboard
   - Verify the project is active
   - Check if the `creators` table exists

### Access Issues
If you're still getting subscription prompts:

1. **Verify developer mode**:
   - Check `VITE_DEV_MODE=true` in `.env.local`
   - Restart the development server
   - Look for the yellow developer banner

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for any JavaScript errors
   - Check Network tab for failed requests

### Database Issues
If the test user creation fails:

1. **Check Supabase permissions**:
   - Ensure service role key has admin access
   - Verify RLS policies allow inserts

2. **Run database migrations**:
   ```bash
   # If using Supabase CLI
   supabase db reset
   ```

## 🚀 Production Deployment

### Before Going Live
1. **Disable Developer Mode**:
   ```bash
   # Remove or set to false
   VITE_DEV_MODE=false
   ```

2. **Set up Stripe**:
   - Add your live Stripe keys
   - Configure webhook endpoints
   - Test with real payments

3. **Run Production Build**:
   ```bash
   npm run build
   ```

### Environment Variables for Production
```bash
# Production .env
VITE_DEV_MODE=false
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_live_stripe_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
STRIPE_SECRET_KEY=your_live_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 📞 Support

If you encounter any issues:

1. **Check the console** for error messages
2. **Verify environment variables** are set correctly
3. **Ensure Supabase** is properly configured
4. **Restart the development server** after changes

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Yellow "Developer Mode Active" banner appears
- ✅ Can login with test credentials
- ✅ Dashboard loads without subscription prompts
- ✅ All features are accessible
- ✅ No payment or subscription errors

---

**Happy Testing! 🚀**

This setup gives you complete access to test every feature of your application before deploying to production.


