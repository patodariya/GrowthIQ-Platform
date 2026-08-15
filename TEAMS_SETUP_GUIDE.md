# Microsoft Teams Calendar Integration - Setup Guide

## Step 1: Register App in Azure AD

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: `GrowthIQ-Teams-Integration`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `http://localhost:3000` (for development)
5. Click **Register**

## Step 2: Get Your Credentials

After registration, you'll see:
- **Application (client) ID** - Copy this
- **Directory (tenant) ID** - Copy this

## Step 3: Create Client Secret

1. Click **Certificates & secrets** in the left menu
2. Click **New client secret**
3. Set expiration to 24 months
4. Click **Add**
5. **Copy the value** (not the ID) - this is your CLIENT_SECRET

## Step 4: Grant API Permissions

1. Click **API permissions** in the left menu
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Choose **Application permissions**
5. Search and add these permissions:
   - `Calendars.Read` - Read calendar
   - `Calendars.ReadWrite` - Create/modify events
   - `User.Read.All` - Read user info
   - `Schedule.Read.All` - Read availability

6. Click **Grant admin consent for [Your Organization]**

## Step 5: Create .env File

Create a file at `/proxy/.env` with:

```env
# Microsoft Teams Integration
TEAMS_CLIENT_ID=<your-application-id>
TEAMS_CLIENT_SECRET=<your-client-secret>
TEAMS_TENANT_ID=<your-directory-id>
TEAMS_REQUESTER_EMAIL=priyankaben.atodariya@Ibm.com
TEAMS_RECIPIENT_EMAIL=Naicy.Rajput@ibm.com

# Enable Teams Auto-Meeting
ENABLE_TEAMS_MEETING=true
```

## Step 6: Install Dependencies

In the `/proxy` directory, run:

```bash
npm install @microsoft/microsoft-graph-client isomorphic-fetch dotenv
```

## How It Works

1. **On App Startup**: The application checks Teams calendar
2. **Find Available Slot**: Looks for first 30-min slot between 9am-5pm
3. **Create Meeting**: Automatically schedules meeting with Naicy.Rajput@ibm.com
4. **Confirmation**: Returns meeting details to the frontend

## Troubleshooting

**Error: "Invalid tenant ID"**
- Check your TEAMS_TENANT_ID matches Azure Portal

**Error: "No permissions"**
- Ensure admin has granted consent in Step 4

**Error: "Schedule.Read.All not working"**
- This requires Azure AD P2 or special configuration
- Alternative: Use `Calendars.Read` + search for free slots manually

## Testing

Once integrated, make a request to:
```
GET /api/teams/create-meeting
```

Expected response:
```json
{
  "success": true,
  "meetingId": "xxxxxxx",
  "subject": "Meeting with Naicy",
  "startTime": "2026-08-16T10:00:00Z",
  "endTime": "2026-08-16T10:30:00Z",
  "joinUrl": "https://teams.microsoft.com/..."
}
```
