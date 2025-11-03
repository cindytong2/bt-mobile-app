/**
 * Google Apps Script Web App Handler
 * 
 * To set this up:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1Q7y8Rla2N4hnYfDzHdmjnUdaNGB0DuifLXDQHDG3R4U/edit
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with the script below
 * 4. Save and deploy as a web app with "Execute as: Me" and "Who has access: Anyone"
 * 5. Copy the web app URL and set it as EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL in your .env file
 * 
 * Google Apps Script Code:
 * 
 * function doPost(e) {
 *   try {
 *     const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *     const data = JSON.parse(e.postData.contents);
 *     
 *     // Get the next available row
 *     const lastRow = sheet.getLastRow();
 *     const nextRow = lastRow + 1;
 *     
 *     // Write name in column A and time in column B
 *     sheet.getRange(nextRow, 1).setValue(data.name);
 *     sheet.getRange(nextRow, 2).setValue(data.time);
 *     
 *     return ContentService.createTextOutput(JSON.stringify({success: true}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   } catch (error) {
 *     return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()}))
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * 
 * function doGet(e) {
 *   return ContentService.createTextOutput('Attendance Tracker Web App is running');
 * }
 */

export const GOOGLE_APPS_SCRIPT_INSTRUCTIONS = `
To enable Google Sheets recording, you need to set up a Google Apps Script Web App:

1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Create a new script with the doPost function
4. Deploy as a web app
5. Copy the web app URL
6. Set EXPO_PUBLIC_GOOGLE_APPS_SCRIPT_URL in your .env file
`;

