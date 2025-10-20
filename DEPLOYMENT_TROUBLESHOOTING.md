# 🔍 Deployment Troubleshooting Guide

## Why Localhost Works But Deployment Doesn't

This is a **very common issue**. Here are the most likely causes and solutions:

## 🎯 **Most Common Issues**

### 1. **Environment Variables Missing**
**Problem**: Supabase credentials not set in deployment
**Solution**: Set environment variables in your deployment platform

**For Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**For Netlify:**
- Go to Site Settings → Environment Variables
- Add the variables manually

### 2. **Base Path Issues**
**Problem**: Assets can't be found due to incorrect paths
**Solution**: Check if your app is deployed in a subdirectory

### 3. **CORS Issues**
**Problem**: Supabase requests blocked by CORS
**Solution**: Check Supabase project settings

### 4. **Build Configuration**
**Problem**: Different build settings for local vs production
**Solution**: Ensure consistent build configuration

## 🔧 **Step-by-Step Debugging**

### **Step 1: Check Browser Console**
1. Open your deployed app
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for error messages

**Common errors to look for:**
- `Failed to load resource` - Asset loading issues
- `CORS error` - Cross-origin request blocked
- `Supabase connection failed` - Database connection issues
- `Module not found` - Build configuration issues

### **Step 2: Check Network Tab**
1. Go to Network tab in Developer Tools
2. Refresh the page
3. Look for failed requests (red entries)
4. Check which files are failing to load

### **Step 3: Compare Environments**
**Local vs Deployed differences:**
- **Local**: `http://localhost:3000`
- **Deployed**: `https://your-domain.com`
- **Assets**: Different base paths
- **Environment**: Different variables

## 🚀 **Quick Fixes**

### **Fix 1: Environment Variables**
Add these to your deployment platform:
```
VITE_SUPABASE_URL=https://yrvicwapjsevyilxdzsm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlydmljd2FwanNldnlpbHhkenNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDY2ODIsImV4cCI6MjA3NTU4MjY4Mn0.tRhpswJI2CccGdWX3fcJEowSA9IBh-KMYHfaiKVjN7c
```

### **Fix 2: Clear Browser Cache**
1. Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Or open in incognito/private mode

### **Fix 3: Check Supabase Settings**
1. Go to your Supabase project dashboard
2. Check Authentication settings
3. Verify CORS configuration
4. Check if your domain is allowed

## 🧪 **Diagnostic Tools**

I've added diagnostic tools to your app. After deployment:

1. **Open browser console** (F12)
2. **Look for diagnostic messages** starting with 🔍
3. **Check for errors** and warnings
4. **Report the results** to me

## 📋 **Common Error Messages & Solutions**

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Failed to load resource` | Asset path issues | Check base path configuration |
| `CORS error` | Cross-origin blocked | Check Supabase CORS settings |
| `Supabase connection failed` | Missing credentials | Set environment variables |
| `Module not found` | Build issues | Rebuild with correct configuration |
| `Blank screen` | JavaScript errors | Check console for errors |

## 🎯 **Next Steps**

1. **Deploy with the diagnostic tools** I added
2. **Check browser console** for error messages
3. **Share the console output** with me
4. **I'll provide specific fixes** based on the errors

## 🔍 **What to Look For**

When you deploy and check the console, look for:
- ✅ `🚀 Main.tsx loaded successfully`
- ✅ `🔍 Running deployment diagnostics...`
- ❌ Any error messages in red
- ❌ Failed network requests

**Share the console output with me and I'll give you the exact fix!**
