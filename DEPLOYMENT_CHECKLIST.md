# Deployment Checklist - GrowthIQ Platform

## 📋 Pre-Deployment Checklist

### Local Setup
- [ ] Node.js 18+ installed
- [ ] npm/yarn working
- [ ] Project builds locally: `npm run build` ✅
- [ ] No console errors in local dev
- [ ] All dependencies installed

### Code Preparation
- [ ] Remove sensitive data from code
- [ ] Environment variables moved to `.env` files
- [ ] API keys not committed to repo
- [ ] Proxy server configured
- [ ] All tests passing (if applicable)

---

## 🔐 Security Checklist

- [ ] `.env` files added to `.gitignore`
- [ ] No API keys in source code
- [ ] No database passwords committed
- [ ] HTTPS enabled by default
- [ ] CORS headers configured properly
- [ ] Rate limiting enabled (if applicable)

---

## 📝 Documentation Checklist

- [ ] README.md created with setup instructions
- [ ] `.env.example` file created (no secrets)
- [ ] API documentation updated
- [ ] Deployment guide available
- [ ] Troubleshooting guide available

---

## 🚀 GitHub Setup

### Create Repository

```bash
# Step 1: Go to GitHub.com
# Click "+" → "New repository"

# Configuration:
Repository Name: growthiq-platform
Description: IBM Employee Growth and Development Platform
Visibility: Public (or Private)
Add .gitignore: Node
Add License: MIT
```

**Expected Result**: Repository URL ready
```
https://github.com/YOUR_USERNAME/growthiq-platform.git
```

- [ ] Repository created on GitHub
- [ ] Repository URL copied
- [ ] .gitignore configured
- [ ] License added (MIT)

### Initialize Local Git

```bash
# Step 2: Setup local Git
cd /Users/priyankaatodariya/Desktop/GrowthIQ-Platform-Final

# Initialize
git init

# Configure
git config user.name "Your Name"
git config user.email "your-email@gmail.com"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/growthiq-platform.git

# Verify
git remote -v
```

**Expected Output**:
```
origin  https://github.com/YOUR_USERNAME/growthiq-platform.git (fetch)
origin  https://github.com/YOUR_USERNAME/growthiq-platform.git (push)
```

- [ ] Git initialized
- [ ] User configured
- [ ] Remote added
- [ ] Remote verified

### Push to GitHub

```bash
# Step 3: Commit and push
git add .
git commit -m "Initial commit: GrowthIQ Platform"
git branch -M main
git push -u origin main
```

**Expected Output**:
```
[main (root-commit) xxxxxxx] Initial commit: GrowthIQ Platform
Enumerating objects: ...
Counting objects: 100%
Writing objects: 100%
...
To https://github.com/YOUR_USERNAME/growthiq-platform.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

- [ ] Files committed
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub.com

---

## ⚙️ Vercel Deployment

### Vercel Setup

```
1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "GitHub" authentication
4. Authorize Vercel
5. Complete profile
```

- [ ] Vercel account created
- [ ] GitHub authorization granted
- [ ] Profile completed

### Import Project

```
1. Dashboard → "Add New" → "Project"
2. Click "Import Git Repository"
3. Paste: https://github.com/YOUR_USERNAME/growthiq-platform.git
4. Click "Continue"
```

- [ ] Repository imported
- [ ] Project detected as React

### Configure Build Settings

```
Project Name:           growthiq-platform
Framework Preset:       React
Root Directory:         ./ibm-employee-growth-platform
Build Command:          npm run build
Output Directory:       build
Install Command:        npm install
```

**Expected**: Vercel recognizes React project

- [ ] Root directory set correctly
- [ ] Build command correct
- [ ] Output directory correct

### Environment Variables

Add to Vercel (Settings → Environment Variables):

```
# Frontend
REACT_APP_ICA_API_KEY=your_key_here
REACT_APP_API_URL=https://your-proxy-domain.com

# Teams Integration (optional)
TEAMS_CLIENT_ID=your_client_id
TEAMS_CLIENT_SECRET=your_client_secret
TEAMS_TENANT_ID=your_tenant_id
TEAMS_REQUESTER_EMAIL=priyankaben.atodariya@Ibm.com
TEAMS_RECIPIENT_EMAIL=Naicy.Rajput@ibm.com
```

- [ ] All variables added
- [ ] No hardcoded secrets in code
- [ ] Variables marked as sensitive

### Deploy

```
1. Review all settings
2. Click "Deploy" button
3. Wait for build (2-5 minutes)
```

**Expected**: 
- Build succeeds (✅ checkmark)
- URL generated: `https://growthiq-platform.vercel.app`
- Deployment visible in "Deployments" tab

- [ ] Deployment successful
- [ ] Public URL accessible
- [ ] No build errors

---

## ✅ Post-Deployment Verification

### Test Frontend

- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] CSS/styling displays correctly
- [ ] Console has no errors
- [ ] Performance acceptable
- [ ] Responsive on mobile

**Test URL**: `https://growthiq-platform.vercel.app`

### Test API Integration

- [ ] API calls succeed (check Network tab)
- [ ] Proxy endpoint responsive
- [ ] Environment variables working
- [ ] CORS errors resolved
- [ ] Data displays correctly

### Test Features

- [ ] Dashboard loads
- [ ] Data fetches properly
- [ ] Navigation between pages works
- [ ] Forms submit correctly
- [ ] Buttons are clickable
- [ ] Links work

---

## 🔗 Proxy Server Deployment

### Option 1: Vercel (Recommended)

```
1. Create new Vercel project
2. Import same GitHub repo
3. Configure for proxy:
   - Root Directory: ./ibm-employee-growth-platform/proxy
   - Framework: Node.js
   - Build: (empty or npm install)
   - Start: npm start
4. Add environment variables
5. Deploy
```

**Result**: Proxy URL
```
https://growthiq-proxy.vercel.app
```

- [ ] Proxy deployed
- [ ] Proxy URL obtained
- [ ] Environment variables set

### Option 2: Other Platform (Render, Railway, etc.)

Choose one:
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Heroku**: https://heroku.com

**Steps**:
1. Sign up with GitHub
2. Create new Web Service
3. Connect proxy folder
4. Set start command: `npm start`
5. Deploy

- [ ] Proxy deployment chosen
- [ ] Proxy deployed successfully
- [ ] Proxy URL working

---

## 🌐 Domain Configuration (Optional)

### Add Custom Domain

In Vercel Settings → Domains:

```
Domain:     growthiq.yourdomain.com
DNS:        Follow Vercel instructions
SSL:        Automatic (free)
```

- [ ] Domain registered
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Domain resolves correctly

---

## 📊 Monitoring & Maintenance

### Daily Checks

- [ ] Website accessible
- [ ] No deployment errors
- [ ] All features working
- [ ] API responding

### Weekly Tasks

- [ ] Review Vercel analytics
- [ ] Check build times
- [ ] Review error logs
- [ ] Update dependencies (if needed)

### Monthly Tasks

- [ ] Backup GitHub repository
- [ ] Review security
- [ ] Update documentation
- [ ] Plan new features

---

## 📞 Support & Troubleshooting

### If Build Fails
1. Check Vercel build logs
2. Verify all dependencies in package.json
3. Check Root Directory setting
4. Check for missing environment variables

### If Site Not Loading
1. Check if deployment is complete
2. Clear browser cache
3. Try incognito/private window
4. Check console for errors

### If API Not Working
1. Verify proxy server is running
2. Check API URL in environment variables
3. Check CORS configuration
4. Verify authentication

### Contact & Resources
- Vercel Docs: https://vercel.com/docs
- GitHub Help: https://docs.github.com
- React Docs: https://react.dev
- Node.js Docs: https://nodejs.org/docs

---

## ✨ Final Deployment Status

| Item | Status | Notes |
|------|--------|-------|
| GitHub Repository | ⏳ | To be completed |
| Code Pushed | ⏳ | To be completed |
| Vercel Account | ⏳ | To be completed |
| Frontend Deployed | ⏳ | To be completed |
| Proxy Deployed | ⏳ | Optional |
| Custom Domain | ⏳ | Optional |
| Production Ready | ⏳ | Pending all steps |

---

## 🎉 Success Criteria

✅ **Deployment is successful when:**

1. GitHub repository created and code pushed
2. Vercel shows successful deployment (✅)
3. Website loads at `https://growthiq-platform.vercel.app`
4. All pages render without errors
5. Navigation works smoothly
6. API calls complete successfully
7. No console errors
8. Responsive design works on mobile

---

## 🚀 Ready to Deploy?

**Quick Summary**:
1. Create GitHub repo ✅
2. Push code to GitHub ✅
3. Sign up on Vercel ✅
4. Import GitHub repo to Vercel ✅
5. Configure settings ✅
6. Add environment variables ✅
7. Click Deploy ✅
8. Share your live URL! 🎊

---

**Estimated Time**: 15-30 minutes

**Questions?** Refer to GITHUB_VERCEL_DEPLOYMENT.md for detailed steps.

