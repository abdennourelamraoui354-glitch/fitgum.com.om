/**
 * FITGUM Leads — Google Sheet
 * Sheet: https://docs.google.com/spreadsheets/d/1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI
 *
 * يستقبل:
 * - سالم WhatsApp (name, telephone, city, country, sku)
 * - Landing checkout (name, phone, city, address, packageQty, price, packageLabel)
 */

var SHEET_ID   = '1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI';
var SHEET_NAME = 'Sheet1';

function getSheet_() {
  var ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
    var sheet = getSheet_();
    var now   = Utilities.formatDate(new Date(), 'Asia/Muscat', 'dd/MM/yyyy HH:mm');

    var phone = data.telephone || data.phone || '';
    var sku   = data.sku || '';
    var pkg   = data.package || data.packageLabel || '';
    var qty   = data.packageQty || '';
    var price = data.price || '';
    var source = data.source || (sku ? 'salem-whatsapp' : 'fitgum-landing');

    sheet.appendRow([
      now,
      data.name || '',
      phone,
      data.city || '',
      data.country || '',
      data.address || '',
      sku,
      pkg,
      qty,
      price,
      source
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, msg: 'FITGUM live' });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
