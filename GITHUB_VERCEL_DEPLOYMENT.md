# GrowthIQ Platform - GitHub & Vercel Deployment Guide

Complete step-by-step guide to host your project on GitHub and deploy to Vercel.

---

## **PHASE 1: GitHub Setup**

### Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon in the top right → **New repository**
3. Fill in the details:
   - **Repository name**: `growthiq-platform` (or similar)
   - **Description**: `IBM Employee Growth and Development Platform`
   - **Visibility**: Choose **Public** (or Private if preferred)
   - **Initialize**: Leave unchecked (we'll push existing code)
   - **Add .gitignore**: Select **Node** from dropdown
   - **Add license**: Choose **MIT License** (recommended)

4. Click **Create repository**

5. **Copy the repository URL** (you'll need it in Step 3)
   - It will look like: `https://github.com/YOUR_USERNAME/growthiq-platform.git`

---

### Step 2: Prepare Local Repository

Open terminal/command prompt and navigate to your project:

```bash
cd /Users/priyankaatodariya/Desktop/GrowthIQ-Platform-Final
```

Initialize git (if not already done):

```bash
git init
```

Configure git with your GitHub credentials:

```bash
git config user.name "Your Name"
git config user.email "your-email@gmail.com"
```

---

### Step 3: Add Remote and Push to GitHub

Add the GitHub repository as remote:

```bash
git remote add origin https://github.com/YOUR_USERNAME/growthiq-platform.git
```

Create `.gitignore` file (if not exists) to exclude unnecessary files:

```bash
# Create .gitignore at project root
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
```

Add all files to git:

```bash
git add .
```

Create initial commit:

```bash
git commit -m "Initial commit: GrowthIQ Platform setup"
```

Push to GitHub:

```bash
git branch -M main
git push -u origin main
```

**Expected output:**
```
Enumerating objects: ...
Counting objects: 100%
Writing objects: 100%
remote: ...
To https://github.com/YOUR_USERNAME/growthiq-platform.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## **PHASE 2: Vercel Deployment Setup**

### Step 1: Create Vercel Account

1. Go to [Vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **GitHub** as signup method
4. Authorize Vercel to access your GitHub account
5. Complete your profile setup

---

### Step 2: Import Repository to Vercel

1. From Vercel dashboard, click **Add New** → **Project**
2. Click **Import Git Repository**
3. Paste your GitHub repository URL:
   ```
   https://github.com/YOUR_USERNAME/growthiq-platform.git
   ```
4. Click **Continue**

---

### Step 3: Configure Build Settings

In the **Import Project** page, configure:

#### **Project Name**
```
growthiq-platform
```

#### **Framework Preset**
```
React
```

#### **Root Directory**
```
./ibm-employee-growth-platform
```
*(Since your React app is in a subdirectory)*

#### **Build Command**
```
npm run build
```

#### **Output Directory**
```
build
```

#### **Environment Variables**
Add these variables (you'll get values from Teams setup):

```
REACT_APP_ICA_API_KEY=your_ica_api_key
REACT_APP_API_URL=https://your-proxy-domain.com
TEAMS_CLIENT_ID=your_teams_client_id
TEAMS_CLIENT_SECRET=your_teams_client_secret
TEAMS_TENANT_ID=your_teams_tenant_id
TEAMS_REQUESTER_EMAIL=priyankaben.atodariya@Ibm.com
TEAMS_RECIPIENT_EMAIL=Naicy.Rajput@ibm.com
```

**Note**: You can leave Teams variables empty for now; update them later.

---

### Step 4: Deploy Proxy Server

Since you have a Node.js proxy server, you need to deploy it separately.

#### **Option A: Deploy Proxy to Vercel (Recommended for ease)**

1. Create a new Vercel project for the proxy:
   - In Vercel: **Add New** → **Project**
   - Import same repository
   
2. Configure for proxy:
   - **Root Directory**: `./ibm-employee-growth-platform/proxy`
   - **Framework Preset**: `Node.js`
   - **Build Command**: Leave empty (or `npm install`)
   - **Start Command**: `npm start`

3. Add environment variables same as Step 3

4. Deploy

#### **Option B: Deploy Proxy to Render, Railway, or Heroku**

Alternative platforms for backend:
- **Render.com** (free tier available)
- **Railway.app** (free tier available)
- **Heroku** (paid)

Example for Render:
1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Create new Web Service
4. Connect GitHub repository (proxy folder)
5. Set start command: `npm start`
6. Deploy

---

### Step 5: Complete Vercel Deployment

1. Click **Deploy** button
2. Wait for build to complete (usually 2-5 minutes)
3. Once complete, you'll get a URL like:
   ```
   https://growthiq-platform.vercel.app
   ```

---

## **PHASE 3: Post-Deployment Configuration**

### Step 1: Update Environment Variables

After deployment, update the API URL in your React app:

1. Go to **Vercel** → **Settings** → **Environment Variables**
2. Update `REACT_APP_API_URL`:
   ```
   https://your-proxy-url.com
   ```
   (Use your actual proxy domain/URL)

3. Redeploy to apply changes:
   - Push new commit to GitHub, OR
   - Click **Deployments** → **Redeploy** on latest build

### Step 2: Configure Custom Domain (Optional)

1. In Vercel project: **Settings** → **Domains**
2. Add your custom domain (e.g., `growthiq.yourdomain.com`)
3. Configure DNS records as instructed by Vercel

### Step 3: Enable HTTPS

- Vercel automatically provides free SSL certificates
- HTTPS is enabled by default on `*.vercel.app` domains

---

## **PHASE 4: Continuous Integration Setup**

### Enable Auto-Deployments

Vercel automatically deploys when you push to GitHub:

1. Every push to `main` branch → Production deployment
2. Pull requests → Preview deployments

**To keep things organized**, add branch protection:

1. GitHub: Settings → Branches → Add rule for `main`
2. Require pull request reviews before merging
3. Require status checks to pass

### Deployment Workflow

```
Local Changes
    ↓
git commit + git push
    ↓
GitHub updated
    ↓
Vercel detects change
    ↓
Automatic build & deploy
    ↓
Live at https://growthiq-platform.vercel.app
```

---

## **Step-by-Step Command Summary**

### Quick Command Reference:

```bash
# 1. Navigate to project
cd /Users/priyankaatodariya/Desktop/GrowthIQ-Platform-Final

# 2. Initialize git (if needed)
git init

# 3. Configure git
git config user.name "Your Name"
git config user.email "your-email@gmail.com"

# 4. Add remote
git remote add origin https://github.com/YOUR_USERNAME/growthiq-platform.git

# 5. Create .gitignore (see above)

# 6. Stage and commit
git add .
git commit -m "Initial commit: GrowthIQ Platform"

# 7. Push to GitHub
git branch -M main
git push -u origin main

# 8. Make future changes
git add .
git commit -m "Your message"
git push origin main
```

---

## **Troubleshooting**

### Build Fails on Vercel

**Error**: "Cannot find module 'react'"

**Solution**:
1. Verify `package.json` is in React app root
2. Check Build Command: `npm run build`
3. Check Root Directory: `./ibm-employee-growth-platform`

### Environment Variables Not Working

**Error**: "REACT_APP_* is undefined"

**Solution**:
1. Vercel → **Settings** → **Environment Variables**
2. Add variables with `REACT_APP_` prefix
3. Redeploy project
4. Variables must start with `REACT_APP_` for React app

### Proxy API Not Accessible

**Error**: "Failed to fetch from proxy"

**Solution**:
1. Check proxy URL in environment variables
2. Verify proxy server is running/deployed
3. Check CORS headers in proxy configuration
4. Add proxy URL to Vercel Analytics allowed domains

### Domain Issues

**Error**: "Custom domain not working"

**Solution**:
1. Verify DNS records are configured
2. Wait 24-48 hours for DNS propagation
3. Use Vercel's default domain while testing

---

## **Verification Checklist**

- [ ] GitHub repository created and code pushed
- [ ] Vercel account created
- [ ] React app deployed to Vercel
- [ ] Vercel deployment shows ✅ status
- [ ] Can access `https://growthiq-platform.vercel.app`
- [ ] Proxy server deployed (separate service)
- [ ] Environment variables set in Vercel
- [ ] API calls working (check browser console)
- [ ] Teams integration credentials added (optional)
- [ ] Custom domain configured (optional)

---

## **Next Steps**

1. **Share the URL**: Your app is now live at `https://growthiq-platform.vercel.app`
2. **Monitor**: Use Vercel Analytics to track performance
3. **Updates**: Push changes to GitHub → Vercel auto-deploys
4. **Scaling**: For more traffic, consider upgrading Vercel plan

---

## **Useful Links**

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Push Guide](https://docs.github.com/en/get-started/importing-your-projects-to-github/importing-source-code-to-github/adding-locally-hosted-code-to-github)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## **Support**

If you encounter issues:
1. Check Vercel logs: **Deployments** → **Build Logs**
2. Check GitHub Actions (if enabled)
3. Review browser console for errors
4. Check proxy server logs (if deployed separately)

