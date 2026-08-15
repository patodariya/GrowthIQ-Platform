#!/bin/bash

# GrowthIQ Platform - Quick GitHub Setup Script
# This script automates the initial GitHub setup process

echo "=========================================="
echo "GrowthIQ Platform - GitHub Setup"
echo "=========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    echo "   Download from: https://git-scm.com/download"
    exit 1
fi

echo "✅ Git is installed"
echo ""

# Navigate to project root
cd "$(dirname "$0")"
echo "📁 Project root: $(pwd)"
echo ""

# Check if .git exists
if [ -d ".git" ]; then
    echo "⚠️  Git repository already initialized"
    read -p "Do you want to reinitialize? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping reinitialization"
    else
        rm -rf .git
        echo "Git repository removed"
    fi
else
    echo "Initializing new Git repository..."
    git init
    echo "✅ Git repository initialized"
fi

echo ""
echo "=========================================="
echo "Git Configuration"
echo "=========================================="
echo ""

# Prompt for user details
read -p "Enter your GitHub username: " github_username
read -p "Enter your GitHub email: " github_email

# Configure git
git config user.name "$github_username"
git config user.email "$github_email"

echo "✅ Git configured with:"
echo "   Username: $github_username"
echo "   Email: $github_email"

echo ""
echo "=========================================="
echo "Adding Files"
echo "=========================================="
echo ""

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.npm
.yarn

# Production build
build/
dist/
.next/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS files
Thumbs.db
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

echo ""

# Stage files
echo "Staging files..."
git add .
echo "✅ Files staged"

echo ""
echo "=========================================="
echo "GitHub Repository"
echo "=========================================="
echo ""

read -p "Enter your GitHub repository URL (e.g., https://github.com/username/growthiq-platform.git): " repo_url

# Add remote
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"
echo "✅ Remote repository added: $repo_url"

echo ""
echo "=========================================="
echo "Initial Commit & Push"
echo "=========================================="
echo ""

# Create branch and commit
git branch -M main
git commit -m "Initial commit: GrowthIQ Platform setup" --allow-empty
echo "✅ Initial commit created"

echo ""
echo "📤 Ready to push to GitHub"
echo "   Run: git push -u origin main"
echo ""

read -p "Do you want to push now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo "✅ Code pushed to GitHub successfully!"
    else
        echo "❌ Push failed. Check your credentials and try again."
        exit 1
    fi
else
    echo "Push skipped. You can push later with: git push -u origin main"
fi

echo ""
echo "=========================================="
echo "Next Steps"
echo "=========================================="
echo ""
echo "1. Go to https://vercel.com and sign up with GitHub"
echo "2. Create new project and import your GitHub repository"
echo "3. Configure build settings:"
echo "   - Root Directory: ./ibm-employee-growth-platform"
echo "   - Build Command: npm run build"
echo "   - Output Directory: build"
echo "4. Add environment variables"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see: GITHUB_VERCEL_DEPLOYMENT.md"
echo ""
echo "=========================================="

