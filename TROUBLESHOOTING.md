# 🐛 TourCompanion Troubleshooting Guide

Comprehensive guide for resolving common issues with the TourCompanion dashboard.

## 🚨 Critical Issues

### Blank Screen After Deployment
**Symptoms**: App shows completely blank white screen, no content visible

**Root Causes**:
1. **React 18 scheduler error** - `unstable_scheduleCallback` undefined
2. **Asset loading failures** - CSS/JS files not loading
3. **Routing configuration** - SPA redirects not working
4. **Build configuration** - Incorrect base path or output directory

**Solutions**:

#### 1. React 18 Scheduler Fix
```bash
# Check for scheduler errors in console
# Look for: "Cannot read properties of undefined (reading 'unstable_scheduleCallback')"

# The fix is already included in the project:
# - src/react-scheduler-fix.ts
# - dist/index-react-fixed.html
```

**Test**: Visit `/index-react-fixed.html` on your deployed site

#### 2. Asset Loading Issues
```bash
# Check Network tab in browser dev tools
# Look for 404 errors on CSS/JS files

# Verify these files exist:
# - /assets/index-CGA1F0yl.css
# - /assets/index-BAH6E2Vl.js
```

**Fix**: Update `vite.config.ts` base path:
```typescript
export default defineConfig({
  base: '/', // For root domain
  // base: '/tourcompanion-dashboard/', // For subdirectory
});
```

#### 3. SPA Routing Issues
**Vercel**: Ensure `vercel.json` exists:
```json
{
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

**Netlify**: Ensure `netlify.toml` exists:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**GitHub Pages**: Ensure `404.html` exists (copy of `index.html`)

### Build Failures
**Symptoms**: `npm run build` fails with errors

**Common Causes**:
1. **Node.js version** - Need Node.js 18+
2. **Dependencies** - Missing or outdated packages
3. **TypeScript errors** - Type checking failures
4. **Memory issues** - Insufficient RAM for build

**Solutions**:
```bash
# Check Node.js version
node --version  # Should be 18+

# Clean install
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check

# Build with more memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Asset 404 Errors
**Symptoms**: CSS/JS files return 404 Not Found

**Root Causes**:
1. **Incorrect base path** in Vite configuration
2. **Missing files** in dist folder
3. **Server configuration** not serving static files
4. **Cache issues** with old asset references

**Solutions**:

#### 1. Check Base Path
```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // For root domain (tourcompanion.com)
  // base: '/tourcompanion-dashboard/', // For subdirectory
});
```

#### 2. Verify Build Output
```bash
# Check if assets exist
ls -la dist/assets/

# Should see files like:
# - index-CGA1F0yl.css
# - index-BAH6E2Vl.js
```

#### 3. Clear Cache
```bash
# Clear browser cache
Ctrl+Shift+R (hard refresh)

# Clear build cache
rm -rf dist/
npm run build
```

## 🔧 Development Issues

### Local Development Problems
**Symptoms**: App doesn't work in development mode

**Solutions**:
```bash
# Start fresh
npm run dev

# Check for port conflicts
# Default port: 8080
# Change in vite.config.ts if needed

# Clear browser cache
# Disable service workers in dev tools
```

### Hot Reload Not Working
**Symptoms**: Changes don't reflect in browser

**Solutions**:
```bash
# Restart dev server
Ctrl+C
npm run dev

# Check file watching limits
# On Linux: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
```

### TypeScript Errors
**Symptoms**: Red squiggly lines in IDE, build failures

**Solutions**:
```bash
# Check TypeScript version
npx tsc --version

# Run type checking
npm run type-check

# Fix common issues:
# - Import/export mismatches
# - Missing type definitions
# - Strict null checks
```

## 🌐 Deployment Issues

### Vercel Deployment Problems
**Symptoms**: Build fails or app doesn't work on Vercel

**Solutions**:
1. **Check build logs** in Vercel dashboard
2. **Verify `vercel.json`** configuration
3. **Check environment variables**
4. **Test build locally**: `npm run build`

**Common Vercel Issues**:
```bash
# Build timeout
# Solution: Optimize build process, reduce dependencies

# Memory limit exceeded
# Solution: Use smaller chunks, optimize imports

# Environment variables missing
# Solution: Add in Vercel dashboard settings
```

### Netlify Deployment Problems
**Symptoms**: Build fails or routing doesn't work

**Solutions**:
1. **Check build logs** in Netlify dashboard
2. **Verify `netlify.toml`** configuration
3. **Check build settings** in dashboard
4. **Test redirects** manually

### GitHub Pages Issues
**Symptoms**: 404 errors, routing problems

**Solutions**:
1. **Check Pages settings** in repository
2. **Verify `404.html`** exists
3. **Check base path** configuration
4. **Test with custom domain**

## 🔍 Debugging Tools

### Browser Developer Tools
**Console Tab**:
```javascript
// Check for errors
console.error('Error message');

// Test React app loading
console.log('React app loaded:', !!window.React);

// Check scheduler fix
console.log('Scheduler available:', !!window.ReactScheduler);
```

**Network Tab**:
- Look for failed requests (red status codes)
- Check response headers
- Verify asset loading

**Sources Tab**:
- Check if JavaScript files are loaded
- Verify source maps (in development)

### Diagnostic Pages
The project includes diagnostic pages:

1. **`/test-basic.html`** - Basic functionality test
2. **`/diagnose.html`** - Comprehensive system check
3. **`/index-react-fixed.html`** - React scheduler fix test

### Logging and Monitoring
```javascript
// Add to your code for debugging
console.log('Debug info:', {
  userAgent: navigator.userAgent,
  url: window.location.href,
  timestamp: new Date().toISOString()
});
```

## 🚀 Performance Issues

### Slow Loading
**Symptoms**: App takes too long to load

**Solutions**:
1. **Optimize images** - Use WebP format, compress
2. **Code splitting** - Already configured in Vite
3. **Lazy loading** - Load components on demand
4. **CDN** - Use Vercel/Netlify edge network

### Memory Issues
**Symptoms**: Browser becomes slow, crashes

**Solutions**:
1. **Check for memory leaks** in dev tools
2. **Optimize React components** - Use React.memo
3. **Clean up event listeners** - Remove on unmount
4. **Limit concurrent requests** - Use request queuing

## 🆘 Getting Help

### Before Asking for Help
1. **Check this guide** for your specific issue
2. **Search existing issues** on GitHub
3. **Test with diagnostic pages**
4. **Gather error information**:
   - Browser console errors
   - Network request failures
   - Build logs
   - Deployment platform errors

### Reporting Issues
When reporting issues, include:

1. **Environment**:
   - Operating system
   - Node.js version
   - Browser and version
   - Deployment platform

2. **Error Details**:
   - Exact error messages
   - Console logs
   - Network request failures
   - Steps to reproduce

3. **Configuration**:
   - `package.json` dependencies
   - `vite.config.ts` settings
   - Environment variables (without secrets)

### Contact Information
- **GitHub Issues**: [Create an issue](https://github.com/tourcompanion360/tourcompanion-dashboard/issues)
- **Email Support**: support@tourcompanion.com
- **Documentation**: [Full docs](https://docs.tourcompanion.com)

---

**Most issues can be resolved using this guide. If you're still having problems, don't hesitate to reach out for help! 🚀**
