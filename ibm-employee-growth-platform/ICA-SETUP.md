# ICA Integration Setup Guide

## Overview

The IBM Employee Growth Platform is now integrated with IBM watsonx Code Assistant (ICA) using the **Ask Coach agent** to provide AI-powered career insights and coaching.

## Architecture

```
Browser (React App on :3000)
    ↓
ICA Proxy Server (:3001)
    ↓
IBM watsonx Code Assistant API
```

The proxy server is required because:
1. **Security**: API keys must never be exposed to the browser
2. **CORS**: ICA's API has CORS restrictions that prevent direct browser access

## Configuration

### 1. Proxy Server Configuration (`proxy/.env`)

```env
ICA_API_KEY=YOUR_ICA_API_KEY_HERE
ICA_BASE_URL=https://api.nextgen-beta.ica.ibm.com/ica/v1
ICA_NAMESPACE=agents
ICA_MODEL_ID=YOUR_ICA_API_KEY_HERE
PORT=3001
```

### 2. React App Configuration (`.env`)

```env
REACT_APP_ICA_ENABLED=true
REACT_APP_ICA_PROXY_URL=http://localhost:3001
```

## Running the Application

### Step 1: Start the ICA Proxy Server

```bash
cd proxy
npm start
```

Expected output:
```
[ica-proxy] listening on http://localhost:3001
[ica-proxy] base=https://api.nextgen-beta.ica.ibm.com/ica/v1 ns=agents model=YOUR_ICA_API_KEY_HERE key=set
```

### Step 2: Start the React Application

In a new terminal:

```bash
npm start
```

The app will open at `http://localhost:3000`

## ICA-Powered Features

### 1. AI Monthly Summary
- **Location**: Employee Dashboard (dark banner at top)
- **Function**: Generates personalized monthly performance summaries
- **Context**: Uses employee metrics, contributions, and skill scores
- **Prompt**: Analyzes strongest wins and identifies growth focus areas

### 2. AI Career Nudge
- **Location**: Employee Dashboard (blue card)
- **Function**: Provides actionable career development recommendations
- **Context**: Identifies weakest skill areas and suggests concrete actions
- **Prompt**: Recommends specific steps to build band readiness

### 3. AI Career Coach
- **Location**: Accessible via chat interface (AiCoach component)
- **Function**: Conversational assistant for career guidance
- **Context**: Grounded in employee's GrowthIQ profile
- **Capabilities**:
  - Answers questions about career progression
  - Provides personalized advice based on skill gaps
  - Explains IBM's band progression framework
  - Suggests specific actions to improve readiness

### 4. Recognition Extraction
- **Location**: Recognition inbox processing
- **Function**: Extracts structured contributions from recognition messages
- **Context**: Analyzes Slack/Outlook messages
- **Output**: Categorizes contributions by dimension (Outcomes, Skills, Behaviors, Leadership)

## API Endpoints

### Health Check
```bash
curl http://localhost:3001/api/health
```

Response:
```json
{
  "ok": true,
  "hasKey": true,
  "base": "https://api.nextgen-beta.ica.ibm.com/ica/v1",
  "namespace": "agents",
  "model": "YOUR_ICA_API_KEY_HERE"
}
```

### List Available Agents
```bash
curl http://localhost:3001/api/list?ns=agents
```

### Chat Completion
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "How can I improve my leadership skills?"}
    ],
    "max_tokens": 500
  }'
```

## Code Structure

### Service Layer (`src/services/ica.ts`)

Key functions:
- `icaChat()`: Core chat API wrapper
- `generateMonthlySummary()`: Creates monthly performance summaries
- `generateCareerNudge()`: Generates career recommendations
- `chatWithCoach()`: Handles conversational coaching
- `extractContribution()`: Parses recognition messages

### Integration Points

1. **Employee Dashboard** (`src/pages/employee/EmployeeDashboard.tsx`)
   - Calls `generateMonthlySummary()` and `generateCareerNudge()`
   - Displays AI-generated insights in banner cards

2. **AI Coach Component** (`src/components/shared/AiCoach.tsx`)
   - Uses `chatWithCoach()` for conversational interface
   - Maintains chat history for context

3. **Recognition Processing** (`src/hooks/useRecognitionInbox.ts`)
   - Uses `extractContribution()` to parse incoming messages
   - Categorizes by IBM's performance dimensions

## Fallback Behavior

When ICA is disabled (`REACT_APP_ICA_ENABLED=false`) or unavailable:
- Monthly Summary: Shows built-in static copy
- Career Nudge: Shows built-in static copy
- Recognition Extraction: Uses keyword-based heuristics
- No network calls are made to ICA

## Troubleshooting

### Proxy Server Issues

**Problem**: Proxy won't start
```bash
# Check if port 3001 is already in use
lsof -i :3001

# Kill the process if needed
kill -9 <PID>
```

**Problem**: "ICA_API_KEY is not set"
- Verify `proxy/.env` exists and contains the API key
- Restart the proxy server after creating/modifying `.env`

### React App Issues

**Problem**: AI features not working
1. Check proxy server is running: `curl http://localhost:3001/api/health`
2. Verify `REACT_APP_ICA_ENABLED=true` in `.env`
3. Restart React app after changing `.env` files

**Problem**: CORS errors
- Ensure you're accessing the proxy, not ICA directly
- Verify proxy URL in `.env` matches running proxy

### API Issues

**Problem**: 401 Unauthorized
- Verify API key is correct in `proxy/.env`
- Check key hasn't expired in ICA dashboard

**Problem**: 400 Bad Request
- Check agent ID is correct
- Verify namespace is "agents" not "assistants"

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files to version control
- Keep API keys server-side only
- The proxy server must run on a trusted backend
- In production, add authentication to the proxy endpoints

## Performance Considerations

- **Caching**: Monthly summaries and nudges are cached per session
- **Token Limits**: Max tokens set to 500-600 for most requests
- **Deduplication**: React StrictMode double-mounts are handled
- **Fallbacks**: Keyword-based extraction when ICA unavailable

## Next Steps

1. **Test the Integration**:
   - Open the employee dashboard
   - Verify AI Monthly Summary loads
   - Check AI Career Nudge appears
   - Test the AI Coach chat interface

2. **Customize Prompts**:
   - Edit system prompts in `src/services/ica.ts`
   - Adjust token limits based on response quality
   - Fine-tune context provided to ICA

3. **Production Deployment**:
   - Deploy proxy server to secure backend
   - Add authentication/authorization
   - Set up monitoring and logging
   - Configure rate limiting

## Support

For ICA-specific issues:
- Check ICA documentation: https://www.ibm.com/docs/en/watsonx-code-assistant
- Review API status: https://api.nextgen-beta.ica.ibm.com/status

For application issues:
- See `README_IMPLEMENTATION.md` for architecture details
- Check browser console for errors
- Review proxy server logs