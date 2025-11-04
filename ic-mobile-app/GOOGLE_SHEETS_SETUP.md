# Google Sheets Integration Setup

This guide explains how to set up Google Sheets integration to record QR code scans.

## Setup Steps

### 1. Create Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Q7y8Rla2N4hnYfDzHdmjnUdaNGB0DuifLXDQHDG3R4U/edit
2. Go to **Extensions** > **Apps Script**
3. Replace the default code with the following:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Handle both JSON and URL-encoded form data
    let data;
    if (e.postData && e.postData.contents) {
      try {
        // Try parsing as JSON first
        data = JSON.parse(e.postData.contents);
      } catch (jsonError) {
        // If not JSON, try URL-encoded parameters
        data = e.parameter;
      }
    } else {
      // Fallback to parameters (from URL-encoded form data)
      data = e.parameter;
    }
    
    // Get the next available row
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;
    
    // Write to columns: A = Staffer, B = Name, C = Time
    sheet.getRange(nextRow, 1).setValue(data.staffer || 'Unknown');
    sheet.getRange(nextRow, 2).setValue(data.name || 'Unknown');
    sheet.getRange(nextRow, 3).setValue(data.time || new Date().toLocaleString());
    
    // Return JSON response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Attendance Tracker Web App is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

4. Click **Save** (Ctrl+S or Cmd+S)
5. Give the project a name (e.g., "Attendance Tracker")

### 2. Deploy as Web App

1. Click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Configure the deployment:
   - **Description**: "Attendance Tracker API"
   - **Execute as**: **Me (your email)** - This is important!
   - **Who has access**: **Anyone** - This is critical! Must be "Anyone" (not "Anyone with Google account")
4. Click **Deploy**
5. **Authorize the script** when prompted (if first time):
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" > "Go to Attendance Tracker (unsafe)" if you see a warning
   - Click "Allow"
   - **Important**: Authorize access for the script to write to your Google Sheet
6. **IMPORTANT**: Copy the Web App URL - it should look like:
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   ⚠️ Make sure you copy the URL that ends with `/exec`, NOT `/dev`
   - `/exec` is for production deployments
   - `/dev` is for development and won't work from external apps

**⚠️ CRITICAL SETTINGS FOR FIXING 401/403 ERRORS:**
- **Execute as**: Must be set to "Me" (your email), not "User accessing the web app"
- **Who has access**: Must be set to "Anyone" (not "Anyone with Google account" or "Only myself")
- After changing these settings, you **must re-deploy** (click "Deploy" again or "New version")

### 3. Configure Environment Variable

1. Create a `.env` file in the root of your project (if it doesn't exist)
2. Add the following line:
   ```
   EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
   Replace `YOUR_SCRIPT_ID` with the actual Web App URL from step 2
3. Make sure your `.env` file is in `.gitignore` to keep your URL private

### 4. Restart Your Development Server

After setting up the environment variable, restart your Expo development server:
```bash
npm start
```

## Testing

1. Log in with `admin@businesstoday.org`
2. Navigate to the QR scanner
3. Scan a QR code
4. Check the Google Sheet to verify the entry was recorded

## Troubleshooting

### Common Issues:

1. **401 Unauthorized / "Page Not Found" error**:
   - ✅ Make sure you copied the URL ending with `/exec` (not `/dev`)
   - ✅ Verify the deployment has "Anyone" access
   - ✅ Re-deploy the web app and copy the new URL
   - ✅ Check that the script has been authorized (you should have clicked "Allow" when deploying)

2. **403 Forbidden**:
   - ✅ Make sure the web app is deployed with "Anyone" access
   - ✅ Try re-deploying with a new version

3. **"Google Apps Script URL not configured"**:
   - ✅ Make sure `EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL` is set in your `.env` file
   - ✅ Restart your Expo dev server after adding the environment variable

4. **Sheet not updating**:
   - ✅ Check the Apps Script execution logs: View > Executions
   - ✅ Verify the script is deployed (not just saved)
   - ✅ Make sure you're using the `/exec` endpoint, not `/dev`

5. **Still not working?**:
   - Check your `.env` file location - it should be in the project root (same level as `package.json`)
   - Verify the URL format: `https://script.google.com/macros/s/YOUR_ID/exec`
   - Try testing the URL directly in a browser (should show "Attendance Tracker Web App is running")
   - Re-deploy the script and get a fresh URL

## Security Note

For production, consider:
- Using "Anyone with Google account" instead of "Anyone"
- Implementing authentication in your Apps Script
- Using a backend API instead of directly calling Apps Script

