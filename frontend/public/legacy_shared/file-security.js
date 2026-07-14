/* ============================================================
   SMART CODE — File Security Layer
   
   Multi-layer file validation:
   1. Extension whitelist
   2. MIME type validation
   3. Magic bytes (file signature) verification
   4. Size limits
   5. Content scanning for malicious patterns
   6. Macro detection (XLSX with VBA)
   7. Hash calculation for integrity
   ============================================================ */

(function(window){
'use strict';

const SECURITY = {
  // Allowed extensions per category
  ALLOWED_EXTENSIONS: {
    spreadsheet: ['.xlsx', '.xls', '.xlsm', '.csv', '.tsv'],
    document: ['.pdf', '.docx', '.doc', '.txt', '.rtf'],
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    data: ['.json', '.xml'],
    archive: ['.zip'],
  },
  
  // Blocked extensions (executables, scripts)
  BLOCKED_EXTENSIONS: [
    '.exe', '.dll', '.bat', '.cmd', '.com', '.scr', '.pif', '.msi',
    '.ps1', '.psm1', '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh',
    '.hta', '.cpl', '.lnk', '.reg', '.inf', '.app', '.deb', '.rpm',
    '.dmg', '.pkg', '.run', '.bin', '.sh', '.bash', '.zsh',
    '.jar', '.war', '.apk', '.ipa',
    '.php', '.asp', '.aspx', '.jsp', '.cgi',
    '.htm', '.html',  // Block HTML to prevent XSS via uploads
  ],
  
  // MIME type whitelist (must match)
  ALLOWED_MIME: {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.macroEnabled.12': '.xlsm',
    'application/vnd.ms-excel': '.xls',
    'text/csv': '.csv',
    'application/csv': '.csv',
    'text/tab-separated-values': '.tsv',
    'application/json': '.json',
    'text/plain': '.txt',
    'application/pdf': '.pdf',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
  },
  
  // Magic bytes / file signatures (first bytes of file)
  // Format: { signature: 'description' }
  MAGIC_BYTES: {
    // Office formats
    '504B0304': 'ZIP/XLSX/DOCX',          // PK\x03\x04
    '504B0506': 'ZIP empty',               // PK\x05\x06
    '504B0708': 'ZIP spanned',             // PK\x07\x08
    'D0CF11E0A1B11AE1': 'Old Office (DOC/XLS)', // OLE Compound File
    
    // Documents
    '25504446': 'PDF',                     // %PDF
    
    // Images
    'FFD8FF': 'JPEG',
    '89504E470D0A1A0A': 'PNG',
    '474946383761': 'GIF87a',
    '474946383961': 'GIF89a',
    '52494646': 'WEBP/RIFF',
    
    // Text formats — these don't have magic bytes but we accept anyway
    // JSON, CSV, TXT validated by content
    
    // SVG: starts with <?xml or <svg
  },
  
  // Dangerous content patterns to scan for
  MALICIOUS_PATTERNS: [
    /<script[\s>]/gi,
    /javascript:/gi,
    /on(?:click|load|error|mouseover|focus|blur)=/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
    /document\.cookie/gi,
    /window\.location/gi,
    /\\x[0-9a-f]{2}/gi,  // Encoded characters
    /[\x00-\x08\x0E-\x1F\x7F]/g,  // Control characters in text files
  ],
  
  // Size limits
  MAX_SIZE_BY_TYPE: {
    image: 50 * 1024 * 1024,           // 50 MB for images
    spreadsheet: 500 * 1024 * 1024,    // 500 MB for spreadsheets
    document: 200 * 1024 * 1024,       // 200 MB for documents
    archive: 1 * 1024 * 1024 * 1024,   // 1 GB for archives
    data: 100 * 1024 * 1024,           // 100 MB for JSON/XML
    default: 2 * 1024 * 1024 * 1024,   // 2 GB absolute max
  },
};

/* ====================== HELPERS ====================== */

function getExtension(filename){
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.substring(idx).toLowerCase() : '';
}

function getCategoryFromExtension(ext){
  for(const [cat, exts] of Object.entries(SECURITY.ALLOWED_EXTENSIONS)){
    if(exts.includes(ext)) return cat;
  }
  return null;
}

function getMaxSizeForCategory(category){
  return SECURITY.MAX_SIZE_BY_TYPE[category] || SECURITY.MAX_SIZE_BY_TYPE.default;
}

async function getMagicBytes(file, byteCount = 16){
  const slice = file.slice(0, byteCount);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function matchesMagicBytes(hex, signature){
  return hex.startsWith(signature);
}

async function calculateHash(file, algorithm = 'SHA-256'){
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch(e){
    console.warn('Hash calculation failed:', e);
    return null;
  }
}

/* ====================== VALIDATION LAYERS ====================== */

/**
 * Layer 1: Filename and extension validation
 */
function validateFilename(filename){
  if(!filename || typeof filename !== 'string'){
    return { ok: false, layer: 1, reason: 'اسم الملف غير صحيح' };
  }
  
  // Filename length
  if(filename.length > 255){
    return { ok: false, layer: 1, reason: 'اسم الملف طويل جداً (>255 حرف)' };
  }
  
  // Suspicious patterns in filename
  if(/[<>"|?*\x00-\x1F]/.test(filename)){
    return { ok: false, layer: 1, reason: 'اسم الملف يحتوي على رموز غير مسموحة' };
  }
  
  // Double extension (e.g., file.pdf.exe)
  const parts = filename.split('.');
  if(parts.length > 2){
    for(let i = 1; i < parts.length - 1; i++){
      const fakeExt = '.' + parts[i].toLowerCase();
      if(SECURITY.BLOCKED_EXTENSIONS.includes(fakeExt)){
        return { ok: false, layer: 1, reason: `امتداد مزدوج مشبوه (${fakeExt})` };
      }
    }
  }
  
  // Extension whitelist
  const ext = getExtension(filename);
  
  if(SECURITY.BLOCKED_EXTENSIONS.includes(ext)){
    return { ok: false, layer: 1, reason: `نوع الملف ${ext} غير مسموح (قائمة الحظر)` };
  }
  
  const category = getCategoryFromExtension(ext);
  if(!category){
    return { ok: false, layer: 1, reason: `نوع الملف ${ext} غير مدعوم في النظام` };
  }
  
  return { ok: true, layer: 1, ext, category };
}

/**
 * Layer 2: MIME type validation
 */
function validateMimeType(file, ext){
  const mime = file.type;
  
  // Empty MIME is acceptable for some types (CSV, JSON sometimes have no MIME)
  if(!mime){
    if(['.csv', '.tsv', '.json', '.txt'].includes(ext)) return { ok: true, layer: 2 };
    return { ok: false, layer: 2, reason: 'نوع MIME فارغ ومطلوب لهذا النوع' };
  }
  
  // MIME must be in allowed list
  const expectedExt = SECURITY.ALLOWED_MIME[mime];
  
  if(!expectedExt){
    return { ok: false, layer: 2, reason: `نوع MIME غير مسموح: ${mime}` };
  }
  
  // MIME should match extension (lenient check)
  // Some browsers return different MIMEs; we just ensure MIME is in whitelist
  
  return { ok: true, layer: 2, mime };
}

/**
 * Layer 3: Magic bytes verification
 */
async function validateMagicBytes(file, ext){
  const hex = await getMagicBytes(file, 16);
  
  // Required signatures per type
  const expectations = {
    '.xlsx': ['504B0304'],
    '.xlsm': ['504B0304'],
    '.zip': ['504B0304', '504B0506', '504B0708'],
    '.docx': ['504B0304'],
    '.xls': ['D0CF11E0A1B11AE1'],
    '.doc': ['D0CF11E0A1B11AE1'],
    '.pdf': ['25504446'],
    '.jpg': ['FFD8FF'],
    '.jpeg': ['FFD8FF'],
    '.png': ['89504E470D0A1A0A'],
    '.gif': ['474946383761', '474946383961'],
    '.webp': ['52494646'],
  };
  
  const expected = expectations[ext];
  
  // Text formats — no magic bytes required
  if(['.csv', '.tsv', '.json', '.txt', '.svg'].includes(ext)){
    // For SVG, check it starts with <?xml or <svg
    if(ext === '.svg'){
      const slice = file.slice(0, 200);
      const text = await slice.text();
      if(!/^[\s\uFEFF]*<\?xml|^[\s\uFEFF]*<svg/i.test(text)){
        return { ok: false, layer: 3, reason: 'محتوى SVG غير صالح' };
      }
    }
    return { ok: true, layer: 3 };
  }
  
  if(!expected){
    // No expectation defined → pass
    return { ok: true, layer: 3 };
  }
  
  const matched = expected.some(sig => matchesMagicBytes(hex, sig));
  
  if(!matched){
    return {
      ok: false,
      layer: 3,
      reason: `توقيع الملف لا يطابق الامتداد ${ext}. التوقيع: ${hex.substring(0, 16)}`,
    };
  }
  
  return { ok: true, layer: 3, signature: hex.substring(0, 16) };
}

/**
 * Layer 4: Size validation
 */
function validateSize(file, category){
  if(file.size === 0){
    return { ok: false, layer: 4, reason: 'الملف فارغ' };
  }
  
  const maxSize = getMaxSizeForCategory(category);
  
  if(file.size > maxSize){
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    return {
      ok: false,
      layer: 4,
      reason: `حجم الملف (${sizeMB} MB) يتجاوز الحد المسموح لهذا النوع (${maxMB} MB)`,
    };
  }
  
  return { ok: true, layer: 4 };
}

/**
 * Layer 5: Content scanning for malicious patterns (text files only)
 */
async function scanContent(file, ext){
  // Only scan text-based formats
  const textFormats = ['.csv', '.tsv', '.json', '.txt', '.svg'];
  if(!textFormats.includes(ext)) return { ok: true, layer: 5, scanned: false };
  
  // Read first 1MB only (performance)
  const sampleSize = Math.min(file.size, 1024 * 1024);
  const slice = file.slice(0, sampleSize);
  const text = await slice.text();
  
  const findings = [];
  for(const pattern of SECURITY.MALICIOUS_PATTERNS){
    const matches = text.match(pattern);
    if(matches && matches.length > 0){
      findings.push({
        pattern: pattern.source,
        count: matches.length,
        sample: matches[0].substring(0, 50),
      });
    }
  }
  
  if(findings.length > 0){
    return {
      ok: false,
      layer: 5,
      reason: `محتوى مشبوه تم اكتشافه (${findings.length} نمط)`,
      findings,
    };
  }
  
  return { ok: true, layer: 5, scanned: true };
}

/**
 * Layer 6: Macro detection in Office files
 */
async function detectMacros(file, ext){
  if(!['.xlsm', '.xls', '.doc', '.docx'].includes(ext)){
    return { ok: true, layer: 6, scanned: false };
  }
  
  // XLSM extension implies macros
  if(ext === '.xlsm'){
    return {
      ok: true,
      layer: 6,
      scanned: true,
      warning: 'ملف XLSM يحتوي على وحدات ماكرو. سيتم تجاهل الماكرو عند المعالجة.',
    };
  }
  
  // For XLS/DOC, we'd need full parsing to detect macros — skip detailed scan
  return { ok: true, layer: 6, scanned: false };
}

/* ====================== MAIN VALIDATION ====================== */

/**
 * Run all security layers on a file
 * Returns: { ok, file_info, layers, warnings, errors }
 */
async function validateFile(file, options = {}){
  const result = {
    ok: true,
    filename: file.name,
    size: file.size,
    mime_type: file.type,
    layers: {},
    warnings: [],
    errors: [],
    hash: null,
  };
  
  try {
    // Layer 1: Filename + extension
    const layer1 = validateFilename(file.name);
    result.layers.filename = layer1;
    if(!layer1.ok){
      result.ok = false;
      result.errors.push(layer1);
      return result;  // Hard fail
    }
    result.ext = layer1.ext;
    result.category = layer1.category;
    
    // Layer 2: MIME
    const layer2 = validateMimeType(file, layer1.ext);
    result.layers.mime = layer2;
    if(!layer2.ok){
      result.ok = false;
      result.errors.push(layer2);
      // Don't return — continue to gather all issues
    }
    
    // Layer 3: Magic bytes
    const layer3 = await validateMagicBytes(file, layer1.ext);
    result.layers.signature = layer3;
    if(!layer3.ok){
      result.ok = false;
      result.errors.push(layer3);
    }
    
    // Layer 4: Size
    const layer4 = validateSize(file, layer1.category);
    result.layers.size = layer4;
    if(!layer4.ok){
      result.ok = false;
      result.errors.push(layer4);
    }
    
    // Layer 5: Content scan (only for text)
    const layer5 = await scanContent(file, layer1.ext);
    result.layers.content = layer5;
    if(!layer5.ok){
      result.ok = false;
      result.errors.push(layer5);
    }
    
    // Layer 6: Macro detection
    const layer6 = await detectMacros(file, layer1.ext);
    result.layers.macros = layer6;
    if(layer6.warning) result.warnings.push(layer6.warning);
    
    // Hash calculation (for integrity tracking) — only if all passed
    if(result.ok && options.computeHash !== false){
      // Skip hash for very large files (>500MB) to avoid blocking
      if(file.size < 500 * 1024 * 1024){
        result.hash = await calculateHash(file);
      }
    }
  } catch(err){
    result.ok = false;
    result.errors.push({ layer: 0, reason: 'فحص الملف فشل: ' + err.message });
  }
  
  return result;
}

/**
 * Validate multiple files (batch)
 */
async function validateBatch(files){
  const results = [];
  let totalSize = 0;
  
  for(const file of files){
    const r = await validateFile(file);
    results.push(r);
    totalSize += file.size;
  }
  
  // Check total batch size
  if(window.SC?.storage?.validateBatchSize){
    const batchCheck = await window.SC.storage.validateBatchSize(totalSize);
    if(!batchCheck.ok){
      results.batch_error = batchCheck.error;
    }
  }
  
  return {
    files: results,
    total_size: totalSize,
    all_passed: results.every(r => r.ok),
    pass_count: results.filter(r => r.ok).length,
    fail_count: results.filter(r => !r.ok).length,
  };
}

/* ====================== PUBLIC API ====================== */

const FileSecurity = {
  SECURITY,
  validateFile,
  validateBatch,
  
  // Individual layer functions (exposed for advanced use)
  validateFilename,
  validateMimeType,
  validateMagicBytes,
  validateSize,
  scanContent,
  detectMacros,
  
  calculateHash,
  getExtension,
  getCategoryFromExtension,
  
  // Format helpers
  formatErrors(result){
    if(result.ok) return null;
    return result.errors.map(e => `Layer ${e.layer}: ${e.reason}`).join('\n');
  },
  
  /**
   * Quick check — returns just true/false with reason
   */
  async quickCheck(file){
    const r = await validateFile(file, { computeHash: false });
    return {
      ok: r.ok,
      reason: r.ok ? null : (r.errors[0]?.reason || 'فشل الفحص الأمني'),
      warnings: r.warnings,
    };
  },
};

window.SC = window.SC || {};
window.SC.security = FileSecurity;

window.SC_DEBUG&&console.log('Smart Code File Security loaded');

})(window);
