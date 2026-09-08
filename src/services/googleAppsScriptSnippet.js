export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * ഗ്രാമപഞ്ചായത്ത് സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ - സമഗ്ര പോർട്ടൽ ബാക്കെൻഡ്
 * Google Apps Script Backend Code (Code.gs)
 * =========================================================================
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏛️ പഞ്ചായത്ത് പോർട്ടൽ')
    .addItem('✨ 1. എല്ലാ ഷീറ്റുകളും കോളങ്ങളും നിർമ്മിക്കുക (Auto Setup)', 'setupSheetHeaders')
    .addToUi();
}

/**
 * Beneficiaries, Users എന്നീ 2 ഷീറ്റുകളും ഓട്ടോമാറ്റിക്കായി ഭംഗിയായി ക്രമീകരിക്കുന്നു (No Dummy Data)
 */
function setupSheetHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // -------------------------------------------------------------
  // 1. Beneficiaries Sheet Setup (16 Columns)
  // -------------------------------------------------------------
  var sheet1 = ss.getSheetByName("Beneficiaries") || ss.getSheets()[0];
  sheet1.setName("Beneficiaries");
  
  var beneficiaryHeaders = [
    "Beneficiary ID",      // Col A (1)
    "Name (Malayalam)",    // Col B (2)
    "Name (English)",      // Col C (3)
    "Gender",              // Col D (4)
    "Age",                 // Col E (5)
    "Ward",                // Col F (6)
    "Scheme Code",         // Col G (7)
    "Scheme Name",         // Col H (8)
    "House Name",          // Col I (9)
    "Mobile Number",       // Col J (10)
    "Status",              // Col K (11)
    "Updated At",          // Col L (12)
    "Updated By",          // Col M (13)
    "Sevana Status",       // Col N (14)
    "Sevana Synced At",    // Col O (15)
    "Sevana Synced By"     // Col P (16)
  ];
  
  var hRange1 = sheet1.getRange(1, 1, 1, beneficiaryHeaders.length);
  hRange1.setValues([beneficiaryHeaders]);
  hRange1.setFontWeight("bold").setFontColor("#FFFFFF").setBackground("#059669");
  hRange1.setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet1.setFrozenRows(1);
  sheet1.getRange("J:J").setNumberFormat("@");
  
  // -------------------------------------------------------------
  // 2. Users Sheet Setup (Admin, Employee, Ward Members)
  // -------------------------------------------------------------
  var sheet2 = ss.getSheetByName("Users") || ss.getSheetByName("WardMembers");
  if (!sheet2) {
    sheet2 = ss.insertSheet("Users");
  } else {
    sheet2.setName("Users");
  }
  
  var userHeaders = [
    "Ward",                // Col A (1) - വാർഡ് നമ്പർ (All / 1-25)
    "User Name",           // Col B (2) - പേര്
    "Mobile Number",       // Col C (3) - ലോഗിൻ 10 അക്ക നമ്പർ
    "Role",                // Col D (4) - Admin / Employee / Ward Member
    "Status",              // Col E (5) - Active / Inactive
    "Created At"           // Col F (6) - തീയതി
  ];
  
  var hRange2 = sheet2.getRange(1, 1, 1, userHeaders.length);
  hRange2.setValues([userHeaders]);
  hRange2.setFontWeight("bold").setFontColor("#FFFFFF").setBackground("#0F172A");
  hRange2.setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheet2.setFrozenRows(1);
  sheet2.getRange("C:C").setNumberFormat("@");
  
  SpreadsheetApp.flush();
  
  try {
    SpreadsheetApp.getUi().alert("വിജയകരം!", "രണ്ട് ഷീറ്റുകളും (Beneficiaries, Users) കോളങ്ങളും സജ്ജമാക്കി കഴിഞ്ഞു. 'Users' ഷീറ്റിൽ അഡ്മിൻ, ജീവനക്കാർ, വാർഡ് മെമ്പർമാർ എന്നിവരുടെ യഥാർത്ഥ മൊബൈൽ നമ്പറുകൾ നൽകാം.", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {}
  
  return { success: true, message: "Both sheets configured successfully" };
}

/**
 * GET Request
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : '';
    if (action === 'setupHeaders') return responseJSON(setupSheetHeaders());
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Fetch Users
    var userSheet = ss.getSheetByName("Users") || ss.getSheetByName("WardMembers");
    var users = [];
    if (userSheet && userSheet.getLastRow() > 1) {
      var uData = userSheet.getDataRange().getValues();
      for (var u = 1; u < uData.length; u++) {
        var uRow = uData[u];
        var uMobile = String(uRow[2] || '').trim().replace(/\\D/g, '');
        if (uMobile) {
          users.push({
            ward: String(uRow[0] || 'All').trim(),
            name: String(uRow[1] || '').trim(),
            mobile: uMobile,
            role: String(uRow[3] || 'Ward Member').trim(),
            status: String(uRow[4] || 'Active').trim(),
            created_at: uRow[5] ? new Date(uRow[5]).toISOString() : null
          });
        }
      }
    }
    
    // 2. Fetch Beneficiaries
    var sheet = ss.getSheetByName("Beneficiaries") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var beneficiaries = [];
    
    if (data && data.length > 1) {
      var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
      function getColIdx(names, defaultIdx) {
        for (var i = 0; i < names.length; i++) {
          var idx = headers.indexOf(names[i].toLowerCase());
          if (idx !== -1) return idx;
        }
        return defaultIdx;
      }
      
      var idCol = getColIdx(['beneficiary id', 'beneficiary_id', 'id', 'പെൻഷൻ നമ്പർ', 'id no'], 0);
      var nameMlCol = getColIdx(['name (malayalam)', 'name_ml', 'name', 'പേര്', 'ഗുണഭോക്താവിന്റെ പേര്'], 1);
      var nameEnCol = getColIdx(['name (english)', 'name_en', 'english name'], 2);
      var genderCol = getColIdx(['gender', 'ലിംഗം', 'sex'], 3);
      var ageCol = getColIdx(['age', 'വയസ്സ്'], 4);
      var wardCol = getColIdx(['ward', 'ward no', 'വാർഡ്', 'വാർഡ് നമ്പർ'], 5);
      var schemeCodeCol = getColIdx(['scheme code', 'scheme_code', 'code'], 6);
      var schemeNameCol = getColIdx(['scheme name', 'scheme_ml', 'scheme', 'പെൻഷൻ ഇനം'], 7);
      var houseCol = getColIdx(['house name', 'house_name', 'address', 'വീട്ടുപേര്'], 8);
      var mobileCol = getColIdx(['mobile number', 'mobile_no', 'mobile', 'phone', 'മൊബൈൽ നമ്പർ'], 9);
      var statusCol = getColIdx(['status', 'സ്റ്റാറ്റസ്'], 10);
      var updatedCol = getColIdx(['updated at', 'updated_at', 'timestamp'], 11);
      var updatedByCol = getColIdx(['updated by', 'updated_by', 'അപ്ഡേറ്റ് ചെയ്ത ആൾ'], 12);
      var sevanaStatusCol = getColIdx(['sevana status', 'sevana_status', 'സേവന സ്റ്റാറ്റസ്'], 13);
      var sevanaSyncedAtCol = getColIdx(['sevana synced at', 'sevana_synced_at', 'സേവന അപ്ഡേഷൻ സമയം'], 14);
      var sevanaSyncedByCol = getColIdx(['sevana synced by', 'sevana_synced_by', 'സേവന അപ്ഡേറ്റ് ചെയ്ത ആൾ'], 15);
      
      var rows = data.slice(1);
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var bid = String(row[idCol] || '').trim();
        if (!bid) continue;
        
        var mob = String(row[mobileCol] || '').trim();
        var st = String(row[statusCol] || '').trim().toLowerCase();
        if (!st) st = mob.length === 10 ? 'completed' : 'pending';
        var sevanaSt = String(row[sevanaStatusCol] || '').trim().toLowerCase();
        if (!sevanaSt) sevanaSt = 'pending';
        
        beneficiaries.push({
          row_index: i + 2,
          beneficiary_id: bid,
          name_ml: String(row[nameMlCol] || '').trim() || bid,
          name_en: String(row[nameEnCol] || '').trim(),
          gender: String(row[genderCol] || '').trim().toUpperCase(),
          age: Number(row[ageCol]) || '',
          ward: Number(row[wardCol]) || 1,
          scheme_code: String(row[schemeCodeCol] || '').trim() || 'IGNOAP',
          scheme_ml: String(row[schemeNameCol] || '').trim() || 'സാമൂഹ്യ സുരക്ഷാ പെൻഷൻ',
          scheme_en: '',
          house_name: String(row[houseCol] || '').trim(),
          mobile_no: mob,
          status: st,
          updated_at: row[updatedCol] ? new Date(row[updatedCol]).toISOString() : null,
          updated_by: String(row[updatedByCol] || '').trim(),
          sevana_status: sevanaSt,
          sevana_synced_at: row[sevanaSyncedAtCol] ? new Date(row[sevanaSyncedAtCol]).toISOString() : null,
          sevana_synced_by: String(row[sevanaSyncedByCol] || '').trim()
        });
      }
    }
    
    return responseJSON({ success: true, count: beneficiaries.length, data: beneficiaries, users: users });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

/**
 * POST Request
 */
function doPost(e) {
  try {
    var postData;
    if (e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("No payload provided");
    }
    
    var action = postData.action || '';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'setupHeaders') return responseJSON(setupSheetHeaders());
    
    // Admin Add / Update User
    if (action === 'addUser') {
      var userSheet = ss.getSheetByName("Users") || ss.getSheetByName("WardMembers");
      if (!userSheet) {
        setupSheetHeaders();
        userSheet = ss.getSheetByName("Users");
      }
      var ward = String(postData.ward || 'All').trim();
      var userName = String(postData.name || '').trim();
      var mobile = String(postData.mobile || '').trim().replace(/\\D/g, '');
      var role = String(postData.role || 'Ward Member').trim();
      var status = String(postData.status || 'Active').trim();
      
      var uData = userSheet.getDataRange().getValues();
      var existingRow = -1;
      for (var u = 1; u < uData.length; u++) {
        if (String(uData[u][2]).replace(/\\D/g, '') === mobile) {
          existingRow = u + 1;
          break;
        }
      }
      var now = new Date().toISOString();
      if (existingRow !== -1) {
        userSheet.getRange(existingRow, 1).setValue(ward);
        userSheet.getRange(existingRow, 2).setValue(userName);
        userSheet.getRange(existingRow, 4).setValue(role);
        userSheet.getRange(existingRow, 5).setValue(status);
      } else {
        userSheet.appendRow([ward, userName, "'" + mobile, role, status, now]);
      }
      return responseJSON({ success: true, message: "User saved successfully" });
    }
    
    // Employee Update Sevana Status
    if (action === 'updateSevanaStatus') {
      var sheet = ss.getSheetByName("Beneficiaries") || ss.getSheets()[0];
      var data = sheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
      function getColIdx(names, defaultIdx) {
        for (var i = 0; i < names.length; i++) {
          var idx = headers.indexOf(names[i].toLowerCase());
          if (idx !== -1) return idx;
        }
        return defaultIdx;
      }
      var idCol = getColIdx(['beneficiary id', 'beneficiary_id', 'id', 'പെൻഷൻ നമ്പർ', 'id no'], 0);
      var sevanaStatusCol = getColIdx(['sevana status', 'sevana_status', 'സേവന സ്റ്റാറ്റസ്'], 13);
      var sevanaSyncedAtCol = getColIdx(['sevana synced at', 'sevana_synced_at', 'സേവന അപ്ഡേഷൻ സമയം'], 14);
      var sevanaSyncedByCol = getColIdx(['sevana synced by', 'sevana_synced_by', 'സേവന അപ്ഡേറ്റ് ചെയ്ത ആൾ'], 15);
      
      var targetIds = Array.isArray(postData.beneficiary_ids) ? postData.beneficiary_ids : [postData.beneficiary_id];
      var newSevanaStatus = String(postData.sevana_status || 'synced').trim().toLowerCase();
      var syncedBy = String(postData.synced_by || 'Employee').trim();
      var now = new Date().toISOString();
      var updatedCount = 0;
      
      for (var i = 1; i < data.length; i++) {
        var rowId = String(data[i][idCol]).trim();
        if (targetIds.indexOf(rowId) !== -1) {
          var rowNumber = i + 1;
          if (sevanaStatusCol !== -1) sheet.getRange(rowNumber, sevanaStatusCol + 1).setValue(newSevanaStatus);
          if (sevanaSyncedAtCol !== -1) sheet.getRange(rowNumber, sevanaSyncedAtCol + 1).setValue(newSevanaStatus === 'synced' ? now : '');
          if (sevanaSyncedByCol !== -1) sheet.getRange(rowNumber, sevanaSyncedByCol + 1).setValue(newSevanaStatus === 'synced' ? syncedBy : '');
          updatedCount++;
        }
      }
      return responseJSON({ success: true, count: updatedCount, message: "Sevana status updated" });
    }
    
    // Member Update Mobile Number
    var beneficiary_id = String(postData.beneficiary_id || '').trim();
    var mobile_no = String(postData.mobile_no || '').trim();
    var updated_by = String(postData.updated_by || '').trim();
    
    var sheet = ss.getSheetByName("Beneficiaries") || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    function getColIdx(names, defaultIdx) {
      for (var i = 0; i < names.length; i++) {
        var idx = headers.indexOf(names[i].toLowerCase());
        if (idx !== -1) return idx;
      }
      return defaultIdx;
    }
    var idCol = getColIdx(['beneficiary id', 'beneficiary_id', 'id', 'പെൻഷൻ നമ്പർ', 'id no'], 0);
    var mobileCol = getColIdx(['mobile number', 'mobile_no', 'mobile', 'phone', 'മൊബൈൽ നമ്പർ'], 9);
    var statusCol = getColIdx(['status', 'സ്റ്റാറ്റസ്'], 10);
    var updatedCol = getColIdx(['updated at', 'updated_at', 'timestamp'], 11);
    var updatedByCol = getColIdx(['updated by', 'updated_by', 'അപ്ഡേറ്റ് ചെയ്ത ആൾ'], 12);
    
    var foundRow = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]).trim() === beneficiary_id) {
        foundRow = i + 1;
        break;
      }
    }
    if (foundRow === -1) throw new Error("Beneficiary not found: " + beneficiary_id);
    
    var now = new Date().toISOString();
    var newStatus = mobile_no.length === 10 ? 'completed' : 'pending';
    sheet.getRange(foundRow, mobileCol + 1).setValue(mobile_no);
    if (statusCol !== -1) sheet.getRange(foundRow, statusCol + 1).setValue(newStatus);
    if (updatedCol !== -1) sheet.getRange(foundRow, updatedCol + 1).setValue(now);
    if (updatedByCol !== -1 && updated_by) sheet.getRange(foundRow, updatedByCol + 1).setValue(updated_by);
    
    return responseJSON({ success: true, message: "Updated successfully" });
  } catch (error) {
    return responseJSON({ success: false, error: error.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
`;
