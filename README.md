# Google Sheets Data Logger for Google Tag Manager

This Google Apps Script allows you to log form submission data directly to a Google Sheet using Google Tag Manager. The script listens for `GET` or `POST` requests, processes the data, and writes it to the specified Google Sheet.

## Features

- **Easy Integration**: Seamlessly integrates with Google Tag Manager to log data to Google Sheets.
- **Timestamp Logging**: Automatically adds a timestamp to each logged entry.
- **Error Handling**: Includes basic error handling to ensure reliable data logging.

## Setup Instructions

### Step 1: Set Up Your Google Sheet

1. **Create a New Google Sheet**: Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. **Name Your Sheet**: Name your sheet, and ensure you have a sheet named `Sheet1` or update the script to match the name of your sheet.
3. **Set Up Headers**: In the first row of your sheet, add headers for the data you want to log. For example:
   - `Timestamp`
   - `Name`
   - `Email`
   - `Message`
   - Any other data you need to log

### Step 2: Add the Script to Google Apps Script

1. **Open Script Editor**: In your Google Sheet, click on `Extensions > Apps Script` to open the script editor.
2. **Copy the Script**: Copy the following script into the script editor:

    ```javascript
    // Usage
    // 1. Enter sheet name where data is to be written below
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
    ```

3. **Replace `SHEET_KEY`**: Replace the `SHEET_KEY` variable with your Google Sheet’s ID. You can find the ID in the URL of your Google Sheet. It’s the long string of characters between `/d/` and `/edit`.

4. **Save and Deploy**: Save your script and click on `Deploy > Test deployments` to run it initially. Then click on `Deploy > Manage deployments` and deploy the script as a web app. Make sure you set the permissions to "Anyone, even anonymous".

### Step 3: Set Up Google Tag Manager

To send data from Google Tag Manager to your Google Sheets via the script you just set up, follow these steps:

1. **Create a New Tag**:
    - In Google Tag Manager, click on `Tags > New` and choose `Tag Configuration > Custom Image`.
    - In the **Image URL** field, paste your Google Apps Script Web App URL.

    - Append the parameters you want to pass from Google Tag Manager to your Google Sheet in the URL, like this:

    ```
    https://script.google.com/macros/s/YOUR_SCRIPT_URL/exec?Name={{Form Name Variable}}&Email={{Form Email Variable}}&Message={{Form Message Variable}}
    ```

    - Replace `YOUR_SCRIPT_URL` with the URL of your deployed Google Apps Script.
    - Replace `{{Form Name Variable}}`, `{{Form Email Variable}}`, and `{{Form Message Variable}}` with the appropriate variables capturing the form data in Google Tag Manager.

2. **Create a Trigger**:
    - Under "Triggering," click on `Trigger Configuration` and select a trigger that captures the form submission or the event where you want to log data.
    - For example, you can create a `Form Submission` trigger if you're capturing data from a form, or use an existing trigger that fires when the desired event occurs.

3. **Test Your Tag**:
    - Use Google Tag Manager’s `Preview` mode to test your tag and ensure that data is being sent to your Google Sheets correctly.
    - Check your Google Sheet to see if the data appears as expected.

4. **Publish Your Tag**:
    - Once everything is working correctly, click `Submit` in Google Tag Manager to publish your changes.

### Example Usage

If your Google Sheet has the headers `Timestamp`, `Name`, `Email`, and `Message`, and your script is deployed, the data sent through your Google Tag Manager tag will be logged to your Google Sheet with a timestamp.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

If you have any suggestions or improvements, feel free to submit an issue or a pull request.

## Acknowledgments

- **Google Sheets**: For providing an easy-to-use platform for managing data.
- **Google Tag Manager**: For making it easy to manage tags across websites.
