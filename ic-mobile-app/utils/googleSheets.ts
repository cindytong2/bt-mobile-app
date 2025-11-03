/**
 * Utility functions for writing to Google Sheets
 * Uses Google Apps Script Web App for simplicity
 * 
 * To set up:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Q7y8Rla2N4hnYfDzHdmjnUdaNGB0DuifLXDQHDG3R4U/edit
 * 2. Go to Extensions > Apps Script
 * 3. Create a script with doPost function (see googleAppsScript.ts for code)
 * 4. Deploy as web app and copy the URL
 * 5. Set EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL in your .env file
 */

interface ScanRecord {
  name: string;
  time: string;
}

/**
 * Records a scan to Google Sheets via Google Apps Script Web App
 * @param name - Name from scanned QR code
 * @returns true if successful, false otherwise
 */
export async function recordScanToSheet(name: string): Promise<boolean> {
  try {
    // Format timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const record: ScanRecord = {
      name: name || 'Unknown',
      time: timestamp,
    };

    console.log('📊 Recording scan to Google Sheets:', record);
    
    // Get Google Apps Script Web App URL from environment variable
    const GOOGLE_APPS_SCRIPT_URL = process.env.EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL || '';
    
    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error('⚠️ Google Apps Script URL not configured. Set EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL in your .env file.');
      console.error('   See GOOGLE_SHEETS_SETUP.md for setup instructions.');
      return false;
    }
    
    // Validate URL format
    if (!GOOGLE_APPS_SCRIPT_URL.includes('script.google.com')) {
      console.error('❌ Invalid Google Apps Script URL. URL should contain "script.google.com"');
      console.error('   Current URL:', GOOGLE_APPS_SCRIPT_URL);
      return false;
    }
    
    console.log('📤 Sending request to:', GOOGLE_APPS_SCRIPT_URL);
    
    // Google Apps Script web apps often require URL-encoded form data
    // and need redirects to be followed
    const formData = new URLSearchParams();
    formData.append('name', record.name);
    formData.append('time', record.time);
    
    // Try POST with form data first (most compatible)
    let response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // Important: follow redirects
      body: formData.toString(),
    });
    
    // If form data doesn't work, try JSON
    if (!response.ok && (response.status === 401 || response.status === 403)) {
      console.log('⚠️ Form data request failed, trying JSON format...');
      response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(record),
      });
    }
    
    if (response.ok) {
      try {
        const result = await response.json();
        if (result.success) {
          console.log('✅ Successfully recorded scan to Google Sheets');
          return true;
        } else {
          console.error('❌ Failed to record scan:', result.error);
          return false;
        }
      } catch (jsonError) {
        // If response is not JSON, check if it's text
        const text = await response.text();
        if (text.includes('success') || response.status === 200) {
          console.log('✅ Successfully recorded scan to Google Sheets (non-JSON response)');
          return true;
        } else {
          console.error('❌ Unexpected response format:', text);
          return false;
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to record scan. Status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication error. Please check:');
        console.error('   1. The Google Apps Script is deployed as a web app');
        console.error('   2. The deployment has "Anyone" access (or correct permissions)');
        console.error('   3. The URL is correct and points to the /exec endpoint (not /dev)');
        console.error('   4. See GOOGLE_SHEETS_SETUP.md for detailed setup instructions');
      } else if (response.status === 404) {
        console.error('❌ URL not found. Please verify the Google Apps Script URL is correct.');
      } else {
        console.error('❌ Error response:', errorText.substring(0, 200));
      }
      return false;
    }
  } catch (error: any) {
    console.error('❌ Error recording scan to Google Sheets:', error.message || error);
    console.error('   Full error:', error);
    return false;
  }
}

/**
 * Alternative: Direct Google Sheets API v4 using REST (requires service account)
 * This is more complex but doesn't require a backend
 */
export async function recordScanDirectAPI(name: string): Promise<boolean> {
  // This would require:
  // 1. Service account JSON credentials
  // 2. JWT token generation
  // 3. OAuth2 token exchange
  // 4. Append row to sheet
  
  // Implementation would go here if using direct API
  // For now, using the Apps Script approach is simpler
  
  return false;
}

