# GrowthIQ Platform - Team Setup Guide

## 📦 Package Contents

This zip file contains the complete GrowthIQ Platform with all recent updates including:
- YourCareer@IBM API integration
- Skills Development features with accordion and pie chart
- Settings modal with Reset Prototype functionality
- Recognition Inbox system
- Complete proxy server for API authentication

## 🚀 Quick Start for Teammates

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- A code editor (VS Code recommended)

### Step 1: Extract the Project
```bash
# Extract the zip file to your desired location
unzip GrowthIQ-Platform-Final.zip
cd ibm-employee-growth-platform
```

### Step 2: Install Dependencies

**Main Application:**
```bash
npm install
```

**Proxy Server:**
```bash
cd proxy
npm install
cd ..
```

### Step 3: Configure Environment Variables

**Main Application (.env):**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and update:
REACT_APP_YC_ENABLED=true
REACT_APP_PROXY_URL=http://localhost:3001
```

**Proxy Server (proxy/.env):**
```bash
# Copy the example file
cd proxy
cp .env.example .env

# Edit proxy/.env and add your YourCareer token:
YC_TOKEN=your_bearer_token_here
YC_EMPLOYEE_ID=your_employee_id

cd ..
```

### Step 4: Start the Application

**Option A: Start Both Servers Separately (Recommended for Development)**

Terminal 1 - Proxy Server:
```bash
cd proxy
npm start
```

Terminal 2 - React Application:
```bash
npm start
```

**Option B: Quick Start (Single Command)**
```bash
# Kill any existing processes and start both servers
lsof -ti:3001 | xargs kill -9 2>/dev/null; cd proxy && npm start &
lsof -ti:3000 | xargs kill -9 2>/dev/null; npm start
```

### Step 5: Access the Application

Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **Proxy Server**: http://localhost:3001 (API endpoint)

## 🔑 Key Features

### 1. Skills Development Tab
- **Skills I Have**: Editable skill proficiency levels (0-5 scale)
- **Skill Gap Analysis**: 
  - Skills Portfolio pie chart (visual overview)
  - Skill Categories accordion (detailed breakdown)
  - Personalized recommendations based on ideal designer profile

### 2. YourCareer@IBM Integration
- Live data fetching from YourCareer API
- Cached fallback data when API is unavailable
- Refresh functionality with Live/Cached status indicators

### 3. Settings & Reset
- Settings modal accessible from top navigation
- Reset Prototype button to clear all localStorage data
- Resets Recognition Inbox to initial state

## 📁 Project Structure

```
ibm-employee-growth-platform/
├── src/
│   ├── components/
│   │   ├── employee/
│   │   │   ├── MySkills.tsx              # Editable skills component
│   │   │   ├── SkillCategoriesAccordion.tsx  # New accordion component
│   │   │   └── SkillsPortfolioPieChart.tsx   # Pie chart visualization
│   │   └── shared/
│   │       ├── TopNav.tsx                # Navigation with Settings
│   │       └── SettingsModal.tsx         # Settings modal component
│   ├── services/
│   │   └── yourCareer.ts                 # YourCareer API integration
│   ├── pages/
│   │   └── employee/
│   │       └── CareerRoadmap.tsx         # Main Skills Development page
│   └── types/
│       └── index.ts                      # TypeScript type definitions
├── proxy/
│   ├── server.js                         # Express proxy server
│   └── .env                              # Proxy configuration
└── .env                                  # Main app configuration
```

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports 3000 and 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Dependencies Issues
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Do the same for proxy
cd proxy
rm -rf node_modules package-lock.json
npm install
```

### YourCareer API Not Working
1. Check if proxy server is running on port 3001
2. Verify your Bearer token in `proxy/.env`
3. Check browser console for CORS errors
4. Application will use cached fallback data if API fails

### Reset Not Working
1. Open Settings modal from top navigation
2. Click "Reset Prototype"
3. Confirm the action
4. Page will reload automatically
5. Check browser console for any errors

## 📝 Environment Variables Reference

### Main Application (.env)
```env
REACT_APP_YC_ENABLED=true                    # Enable YourCareer integration
REACT_APP_PROXY_URL=http://localhost:3001    # Proxy server URL
REACT_APP_ICA_ENABLED=false                  # ICA integration (optional)
```

### Proxy Server (proxy/.env)
```env
PORT=3001                                    # Proxy server port
YC_API_BASE_URL=https://api.yourlearning.ibm.com  # YourCareer API base URL
YC_TOKEN=your_bearer_token_here              # Your Bearer token
YC_EMPLOYEE_ID=your_employee_id              # Your employee ID
```

## 🎯 Testing the Features

### Test Skills Development
1. Navigate to Career Roadmap → Skills Development tab
2. Verify "Skills I Have" section loads with your skills
3. Adjust skill proficiency levels using sliders
4. Check "Skill Gap Analysis & Growth Opportunities" section:
   - Pie chart should display skill distribution
   - Accordion should show categorized skills
   - Recommendations should appear below

### Test Settings & Reset
1. Click Settings icon in top navigation
2. Click "Reset Prototype" button
3. Confirm the reset action
4. Verify page reloads and Recognition Inbox resets

### Test Live/Cached Status
1. Check the tag next to "Skills I Have" title
2. Green "Live" = API working
3. Gray "Cached" = Using fallback data
4. Click "Refresh" to fetch latest data

## 📚 Additional Documentation

- **SETUP-INSTRUCTIONS.md**: Detailed setup instructions
- **ICA-INTEGRATION-SUMMARY.md**: ICA integration details
- **SKILLS-DEVELOPMENT-FEATURE.md**: Skills feature documentation
- **YOURCAREER-INTEGRATION.md**: YourCareer API integration guide

## 🤝 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Verify all environment variables are set correctly
4. Ensure both servers (proxy and main app) are running

## 🎉 You're All Set!

The application should now be running successfully. Explore the Skills Development features and test the YourCareer integration!

---

**Last Updated**: February 2026  
**Version**: 1.0.0 (Final)