/**
 * رابط Google Apps Script — ضعه هنا بعد النشر (ينتهي بـ /exec)
 * أو استخدم setup-sheet.html لحفظه تلقائياً في المتصفح
 */
(function () {
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
