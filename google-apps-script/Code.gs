/**
 * FITGUM Oman — Google Apps Script
 * Sheet: https://docs.google.com/spreadsheets/d/1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI
 *
 * HOW TO DEPLOY:
 * 1. Open the sheet above → Extensions → Apps Script
 * 2. Paste this entire code (replace everything) → Save (Ctrl+S)
 * 3. Deploy → New deployment → Web app
 *    Execute as: Me | Who has access: Anyone
 * 4. Copy the /exec URL → paste it in checkout.html DIRECT_SHEET_URL
 */

var SHEET_ID   = "1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI";
var SHEET_NAME = "Sheet1";

// ── COD Network ──────────────────────────────────────────────────────────────
var COD_API_TOKEN  = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLmNvZC5uZXR3b3JrXC9hcGlcL3YyXC9zZWxsZXJcL2FwaS10b2tlblwvZ2VuZXJhdGUiLCJpYXQiOjE3ODA2NjU0NjgsImV4cCI6MTc4MzI1NzQ2OCwibmJmIjoxNzgwNjY1NDY4LCJqdGkiOiJTZmNaTUlEYjF0ZGVncUFwIiwic3ViIjo1NDI4MiwicHJ2IjoiMmMxODI3MTgyNWFjM2Q1YzdiNjVkMjU0ZjBhNDMzNDU1MjFjNmE5ZiJ9.MEfHvvg-tAI0X0fjAglNU_3GwJv1FboR07VPT4VtJjU";
var COD_API_URL    = "https://api.cod.network/api/v2/seller/leads";
var COD_PRODUCT_SKU = "CGTSGM";
// ─────────────────────────────────────────────────────────────────────────────

/* ── Get sheet ── */
function getSheet_() {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["date","nom","Phone","City","Address","Quantity","Price","Status","SKU","COD_ID"]);
    sheet.getRange(1,1,1,10).setFontWeight("bold").setBackground("#cc0000").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/* ── Push lead to COD Network ── */
function pushToCodNetwork_(data) {
  try {
    var payload = JSON.stringify({
      full_name : data.name  || "Client",
      phone     : data.phone || "",
      country   : "Oman",
      city      : data.city  || "",
      address   : data.address || "",
      items     : [
        {
          sku      : COD_PRODUCT_SKU,
          quantity : parseInt(data.packageQty) || 1,
          price    : parseFloat(data.price)    || 15
        }
      ]
    });

    var options = {
      method      : "post",
      contentType : "application/json",
      headers     : {
        "Authorization" : "Bearer " + COD_API_TOKEN,
        "Accept"        : "application/json"
      },
      payload     : payload,
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(COD_API_URL, options);
    var result   = JSON.parse(response.getContentText());

    if (result.status === "success" && result.data && result.data.id) {
      return result.data.id; // COD Network lead ID
    }
    console.error("COD Network error:", response.getContentText());
    return null;
  } catch (err) {
    console.error("COD Network exception:", err);
    return null;
  }
}

/* ── Receive POST from checkout.html ── */
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    // 1. Save to Google Sheet
    var sheet  = getSheet_();
    var now    = Utilities.formatDate(new Date(), "Asia/Muscat", "dd/MM/yyyy HH:mm");

    // 2. Push to COD Network
    var codLeadId = pushToCodNetwork_(data);

    sheet.appendRow([
      now,
      data.name        || "",
      data.phone       || "",
      data.city        || "",
      data.address     || "",
      data.packageQty  || "",
      data.price       || "",
      (data.packageLabel || "") + " — COD",
      data.sku         || COD_PRODUCT_SKU,
      codLeadId        || "pending"
    ]);

    return json_({ ok: true, cod_id: codLeadId });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err) });
  }
}

/* ── Ping test ── */
function doGet() {
  return json_({ ok: true, message: "FITGUM endpoint is live ✓", sheet: SHEET_NAME });
}

/* ── Manual test ── */
function testOrder() {
  var result = pushToCodNetwork_({
    name       : "TEST من Cursor",
    phone      : "96891000001",
    city       : "مسقط",
    address    : "عنوان تجريبي",
    packageQty : 1,
    price      : 15
  });
  console.log("COD Lead ID:", result);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
