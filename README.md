# 🏢 TourCompanion Dashboard

Professional dashboard for managing virtual tours and client projects. Create, manage, and share immersive virtual experiences.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/tourcompanion360/tourcompanion-dashboard.git
cd tourcompanion-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🎯 Features

- ✅ **Virtual Tour Management** - Create and manage virtual tours
- ✅ **Client Portal** - Dedicated client access and management
- ✅ **Admin Dashboard** - Comprehensive admin controls
- ✅ **Real-time Analytics** - Track tour performance and engagement
- ✅ **Responsive Design** - Works on all devices
- ✅ **PWA Support** - Install as a native app

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI
- **State**: React Query + Zustand
- **Backend**: Supabase
- **Deployment**: Vercel/Netlify/GitHub Pages

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically deploy with the included `vercel.json` configuration
3. Your app will be live with proper React 18 scheduler fixes

### Netlify
1. Connect your GitHub repository to Netlify
2. Netlify will use the included `netlify.toml` configuration
3. Automatic deployments on every push

### GitHub Pages
1. Enable GitHub Pages in repository settings
2. Deploy from the `main` branch
3. The included `404.html` handles SPA routing

## 🔧 React 18 Scheduler Fix

This project includes a fix for the React 18 `unstable_scheduleCallback` error that can cause blank screens in production. The fix is automatically applied and includes:

- ✅ **Scheduler polyfill** - Mocks missing scheduler functions
- ✅ **Error handling** - Graceful fallbacks for scheduler errors
- ✅ **Compatibility mode** - Works with React 18 concurrent features
- ✅ **Production optimization** - Only loads in production builds

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── config/             # Configuration files
├── integrations/       # External service integrations
└── types/              # TypeScript type definitions
```

## 🐛 Troubleshooting

### Blank Screen Issues
If you see a blank screen after deployment:

1. **Check browser console** for React scheduler errors
2. **Verify deployment configuration** files are present
3. **Test with the included diagnostic pages**:
   - `/test-basic.html` - Basic functionality test
   - `/diagnose.html` - Comprehensive diagnostics
   - `/index-react-fixed.html` - React scheduler fix test

### Common Issues
- **React 18 scheduler errors** - Fixed with included scheduler polyfill
- **Asset loading 404s** - Check base path configuration
- **Routing issues** - Verify SPA redirect configuration

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [React 18 Fix](REACT_18_SCHEDULER_FIX.md) - Scheduler error resolution
- [API Documentation](API.md) - Backend API reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [troubleshooting guide](TROUBLESHOOTING.md)
2. Review the [deployment documentation](DEPLOYMENT_GUIDE.md)
3. Open an issue on GitHub
4. Contact support at support@tourcompanion.com

---

**Built with ❤️ by the TourCompanion team**