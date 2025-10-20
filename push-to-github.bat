@echo off
echo 🚀 Pushing React SPA deployment fixes to GitHub...
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed or not in PATH
    echo.
    echo 📥 Please install Git first:
    echo 1. Go to https://git-scm.com/download/win
    echo 2. Download and install Git
    echo 3. Restart your command prompt
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Git is installed
echo.

REM Add all changes
echo 📝 Adding all changes...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "Fix React SPA deployment - add routing configuration files for Vercel, Netlify, and GitHub Pages"

REM Push to GitHub
echo 🚀 Pushing to GitHub...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ Successfully pushed to GitHub!
    echo 🎉 Your deployment fixes are now live!
    echo.
    echo 📋 Next steps:
    echo 1. Go to your GitHub repository
    echo 2. Check that all files are uploaded
    echo 3. Deploy to your hosting platform
    echo.
) else (
    echo.
    echo ❌ Failed to push to GitHub
    echo.
    echo 🔧 Possible solutions:
    echo 1. Check your internet connection
    echo 2. Verify your GitHub credentials
    echo 3. Make sure you have push permissions
    echo.
)

pause
