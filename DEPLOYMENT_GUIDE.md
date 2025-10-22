# 🚀 TourCompanion Deployment Guide

Complete guide for deploying the TourCompanion dashboard to various hosting platforms.

## 📋 Prerequisites

- ✅ **GitHub repository** with your code
- ✅ **Node.js 18+** installed locally
- ✅ **npm or yarn** package manager
- ✅ **Git** for version control

## 🎯 Quick Deployment Options

### Option 1: Vercel (Recommended)
**Best for**: React apps, automatic deployments, custom domains

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Import your repository**: `tourcompanion360/tourcompanion-dashboard`
4. **Vercel automatically detects**:
   - ✅ Build command: `npm run build`
   - ✅ Output directory: `dist`
   - ✅ Framework: Vite
   - ✅ React 18 scheduler fix
5. **Deploy** - Your app is live!

**Configuration**: Uses `vercel.json` for optimal settings

### Option 2: Netlify
**Best for**: Static sites, form handling, edge functions

1. **Go to [netlify.com](https://netlify.com)**
2. **Sign up with GitHub**
3. **Import your repository**: `tourcompanion360/tourcompanion-dashboard`
4. **Netlify automatically detects**:
   - ✅ Build command: `npm run build`
   - ✅ Publish directory: `dist`
   - ✅ SPA redirects: `/* -> /index.html`
5. **Deploy** - Your app is live!

**Configuration**: Uses `netlify.toml` for optimal settings

### Option 3: GitHub Pages
**Best for**: Free hosting, simple deployments

1. **Go to repository Settings → Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / `(root)`
4. **The `404.html` file handles SPA routing**
5. **Your app is live at**: `https://tourcompanion360.github.io/tourcompanion-dashboard`

## 🔧 Advanced Configuration

### Environment Variables
Set these in your deployment platform:

```bash
VITE_SUPABASE_URL=https://yrvicwapjsevyilxdzsm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG=false
```

### Custom Domain Setup
1. **Add your domain** in platform settings
2. **Update DNS records** as instructed
3. **SSL certificate** is automatically provisioned
4. **Update `vite.config.ts`** base path if needed

### Build Optimization
The project includes optimized build settings:

- ✅ **Code splitting** - Automatic chunk optimization
- ✅ **Asset optimization** - Compressed images and fonts
- ✅ **Tree shaking** - Removes unused code
- ✅ **Source maps** - For debugging in production

## 🐛 Troubleshooting

### Blank Screen Issues
**Problem**: App shows blank screen after deployment

**Solution**:
1. **Check browser console** for React scheduler errors
2. **Test diagnostic pages**:
   - `/test-basic.html` - Basic functionality
   - `/diagnose.html` - System diagnostics
   - `/index-react-fixed.html` - React scheduler fix
3. **Verify configuration files** are deployed

### Asset Loading 404s
**Problem**: CSS/JS files return 404 errors

**Solution**:
1. **Check base path** in `vite.config.ts`
2. **Verify asset paths** in `dist/index.html`
3. **Test with relative paths** instead of absolute

### Routing Issues
**Problem**: Direct URLs (like `/auth`) return 404

**Solution**:
1. **Verify SPA redirect configuration**:
   - Vercel: `vercel.json` rewrites
   - Netlify: `netlify.toml` redirects
   - GitHub Pages: `404.html` fallback
2. **Test all routes** after deployment

## 🧪 Testing Your Deployment

### Automated Tests
```bash
# Run local tests
npm run test

# Check build
npm run build
npm run preview
```

### Manual Testing
1. **Load main page** - Should show TourCompanion
2. **Test navigation** - All routes should work
3. **Check assets** - CSS/JS should load properly
4. **Test on mobile** - Responsive design
5. **Check console** - No JavaScript errors

### Diagnostic Pages
The project includes diagnostic pages for testing:

- **`/test-basic.html`** - Basic HTML/CSS/JS functionality
- **`/diagnose.html`** - Comprehensive system diagnostics
- **`/index-react-fixed.html`** - React 18 scheduler fix test

## 📊 Performance Optimization

### Build Settings
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: "dist",
    sourcemap: false, // Disable in production
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Optimized chunk splitting
        }
      }
    }
  }
});
```

### Caching Strategy
- ✅ **Static assets** - 1 year cache
- ✅ **HTML files** - No cache
- ✅ **API responses** - Short cache
- ✅ **Service worker** - Offline support

## 🔒 Security

### Headers Configuration
The deployment includes security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Environment Security
- ✅ **API keys** in environment variables
- ✅ **No sensitive data** in client code
- ✅ **HTTPS only** in production
- ✅ **CORS** properly configured

## 📈 Monitoring

### Error Tracking
- ✅ **Console error logging** - Client-side errors
- ✅ **Network request monitoring** - Failed requests
- ✅ **Performance metrics** - Load times
- ✅ **User analytics** - Usage patterns

### Health Checks
- ✅ **Build status** - Automated testing
- ✅ **Deployment status** - Success/failure tracking
- ✅ **Uptime monitoring** - Service availability
- ✅ **Performance monitoring** - Response times

## 🆘 Support

### Common Issues
1. **Build failures** - Check Node.js version and dependencies
2. **Deployment errors** - Verify configuration files
3. **Runtime errors** - Check browser console and logs
4. **Performance issues** - Optimize assets and code

### Getting Help
1. **Check this guide** for common solutions
2. **Review troubleshooting section** for specific issues
3. **Open GitHub issue** with detailed error information
4. **Contact support** at support@tourcompanion.com

---

**Your TourCompanion dashboard is now ready for production! 🎉**
