/**
 * FITGUM Oman — Google Apps Script
 * Sheet: https://docs.google.com/spreadsheets/d/1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI
 *
 * HOW TO DEPLOY:
 * 1. Open the sheet above
 * 2. Extensions → Apps Script
 * 3. Paste this entire code (replace everything)
 * 4. Save (Ctrl+S)
 * 5. Deploy → New deployment → Web app
 *    Execute as: Me | Who has access: Anyone
 * 6. Copy the /exec URL → paste it in fitgum-config.js DEFAULT_URL
 */

var SHEET_ID   = "1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI";
var SHEET_NAME = "Sheet1"; // first tab — change if yours is named differently

/* ── Get sheet — tries active first (container-bound), falls back to ID ── */
function getSheet_() {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0]; // fallback: first tab

  /* Ensure header row exists */
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["date","nom","Phone","City","Address","Quantity","Price","Status"]);
    sheet.getRange(1,1,1,8).setFontWeight("bold").setBackground("#cc0000").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* ── Receive POST from checkout.html ── */
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    var sheet = getSheet_();
    var now   = Utilities.formatDate(new Date(), "Asia/Muscat", "dd/MM/yyyy HH:mm");

    sheet.appendRow([
      now,                              // date
      data.name    || "",               // nom
      data.phone   || "",               // Phone
      data.city    || "",               // City
      data.address || "",               // Address
      data.packageQty   || "",          // Quantity
      data.price        || "",          // Price
      (data.packageLabel || "") + " — " + (data.source || "fitgum")  // Status
    ]);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

/* ── Ping test (open /exec URL in browser to verify it's live) ── */
function doGet() {
  return json_({ ok: true, message: "FITGUM endpoint is live ✓", sheet: SHEET_NAME });
}

/* ── Manual test row ── */
function testOrder() {
  var sheet = getSheet_();
  var now   = Utilities.formatDate(new Date(), "Asia/Muscat", "dd/MM/yyyy HH:mm");
  sheet.appendRow([now, "TEST اسم", "96891234567", "مسقط", "عنوان تجريبي", 2, 27, "علبتين — fitgum-test"]);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
