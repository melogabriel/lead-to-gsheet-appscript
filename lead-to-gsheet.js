// Usage
// 1. Enter sheet name where data is to be written below
// 1. Enter sheet name and key where data is to be written below
var SHEET_NAME = 'Sheet1';
var SHEET_KEY = 'your-sheet-key';

var SCRIPT_PROP = PropertiesService.getScriptProperties();

function doGet(e){
return handleResponse(e);
}

function doPost(e){
return handleResponse(e);
}

function handleResponse(e) {
var lock = LockService.getPublicLock();
lock.waitLock(30000);

try {
var doc = SpreadsheetApp.openById(SHEET_KEY);
var sheet = doc.getSheetByName(SHEET_NAME);
var headRow = e.parameter.header_row || 1;
var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
var nextRow = sheet.getLastRow()+1;
var row = [];
for (var i = 0; i < headers.length; i++) {
  if (headers[i] === 'Timestamp') {
    row.push(new Date());
  } else {
    // Use header name to get data from the parameters
    row.push(e.parameter[headers[i]] || ''); // Default to empty string if parameter is missing
  }
}
sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

return ContentService
.createTextOutput(JSON.stringify({'result':'success', 'row': nextRow}))
.setMimeType(ContentService.MimeType.JSON);
} catch(e){
return ContentService
.createTextOutput(JSON.stringify({'result':'error', 'error': e}))
.setMimeType(ContentService.MimeType.JSON);
} finally {
lock.releaseLock();
}
}
