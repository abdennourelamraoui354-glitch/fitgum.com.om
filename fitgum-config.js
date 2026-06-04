/**
 * رابط Google Apps Script — ضعه هنا بعد النشر (ينتهي بـ /exec)
 *
 * كيفية تحديث هذا الرابط:
 * 1. افتح الشيت: https://docs.google.com/spreadsheets/d/1SJB6-0vh1nLpMNYu6x80mmNObUcCeE9Wx5qS-vRvuZI
 * 2. Extensions → Apps Script
 * 3. الصق كود google-apps-script/Code.gs كاملاً
 * 4. Deploy → New deployment → Web app → Execute as: Me | Anyone
 * 5. انسخ رابط /exec والصقه هنا في DEFAULT_URL
 */
(function () {
  /* ⚠️ استبدل هذا بالرابط الجديد بعد Deploy */
  var DEFAULT_URL = "https://script.google.com/macros/s/AKfycbwL03MmvNKTE77WKUeq64iKQDySQE87CLuyu5YhuLPmdbMm--w1PVTfQ8_1pXIqoYCxBA/exec";
  var stored = "";
  try {
    stored = localStorage.getItem("fitgum_sheet_url") || "";
  } catch (e) {}

  var url = stored.trim();
  if (!url || url.indexOf("script.google") === -1) {
    url = DEFAULT_URL;
  }

  window.FITGUM_CONFIG = { SHEET_URL: url };
})();
