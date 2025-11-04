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
  staffer: string; // Email of admin who scanned the QR code
  name: string;   // Name from scanned QR code
  time: string;   // Timestamp of the scan
}

/**
 * Records a scan to Google Sheets via Google Apps Script Web App
 * @param name - Name from scanned QR code
 * @param stafferEmail - Email of the admin staffer who is scanning
 * @returns true if successful, false otherwise
 */
export async function recordScanToSheet(name: string, stafferEmail: string): Promise<boolean> {
  try {
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const record: ScanRecord = {
      staffer: stafferEmail || "Unknown",
      name: name || "Unknown",
      time: timestamp,
    };

    console.log("📊 Recording scan to Google Sheets:", record);

    const GOOGLE_APPS_SCRIPT_URL =
      process.env.EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL || "";

    if (!GOOGLE_APPS_SCRIPT_URL) {
      console.error(
        "⚠️ Google Apps Script URL not configured. Set EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL in your .env file."
      );
      return false;
    }

    console.log("📤 Sending request to:", GOOGLE_APPS_SCRIPT_URL);

    // ✅ Always send JSON
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(record),
    });

    const text = await response.text();

    try {
      const result = JSON.parse(text);
      if (result.success) {
        console.log("✅ Successfully recorded scan to Google Sheets");
        return true;
      } else {
        console.error("❌ Failed to record scan:", result.error);
        return false;
      }
    } catch {
      // If response is not JSON, still treat 200 OK as success
      if (response.ok) {
        console.log("✅ Successfully recorded scan (non-JSON response)");
        return true;
      }
      console.error("❌ Unexpected response:", text);
      return false;
    }
  } catch (error: any) {
    console.error("❌ Error recording scan to Google Sheets:", error);
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
