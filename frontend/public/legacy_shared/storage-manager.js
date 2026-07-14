/* ============================================================
   SMART CODE — Enterprise Storage Manager
   
   Unified storage with quota management, monitoring, auto-cleanup
   
   Storage Tiers:
   - localStorage   → session/auth/preferences only (~5MB)
   - IndexedDB      → bulk data (customers, influencers, etc) (~50MB-2GB)
   - Cache API      → binary files (attachments, PDFs) (~unlimited)
   - OPFS           → large files when available (Chrome/Edge only)
   
   Capacity:
   - Single file:  2 GB max
   - Total batch:  10 GB max
   - Local cache:  5 GB target with 40% safety reserve
   ============================================================ */

(function(window){
'use strict';

const CONFIG = {
  // Quota limits
  MAX_SINGLE_FILE: 2 * 1024 * 1024 * 1024,      // 2 GB
  MAX_TOTAL_BATCH: 10 * 1024 * 1024 * 1024,     // 10 GB
  TARGET_CACHE: 5 * 1024 * 1024 * 1024,         // 5 GB
  SAFETY_RESERVE_PCT: 40,                        // 40% reserve
  WARNING_THRESHOLD_PCT: 70,                     // Warn at 70%
  CRITICAL_THRESHOLD_PCT: 85,                    // Critical at 85%
  
  // IndexedDB
  IDB_NAME: 'smartcode_storage',
  IDB_VERSION: 2,
  
  // Stores
  STORE_DATA: 'data',           // Bulk JSON data
  STORE_FILES: 'files',         // Binary attachments
  STORE_BACKUPS: 'backups',     // System backups
  STORE_TEMP: 'temp',           // Temporary/cache data (auto-cleaned)
  STORE_AUDIT: 'audit',         // Audit log entries
  
  // Cleanup
  TEMP_TTL_MS: 24 * 60 * 60 * 1000,             // 24 hours
  AUDIT_RETENTION_DAYS: 90,                     // Keep audit log 90 days
  MAX_BACKUPS: 20,                              // Keep last 20 backups
  
  // Chunking for large files (read in chunks to avoid OOM)
  CHUNK_SIZE: 8 * 1024 * 1024,                  // 8 MB chunks
};

let db = null;
let dbPromise = null;
let usageCache = null;
let usageCacheTime = 0;
const USAGE_CACHE_TTL = 5000;  // 5 seconds

/* ====================== DATABASE INIT ====================== */

function openDB(){
  if(db) return Promise.resolve(db);
  if(dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    if(!('indexedDB' in window)){
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }
    
    const req = indexedDB.open(CONFIG.IDB_NAME, CONFIG.IDB_VERSION);
    
    req.onupgradeneeded = (e) => {
      const database = e.target.result;
      const tx = e.target.transaction;
      
      // Data store (JSON records)
      if(!database.objectStoreNames.contains(CONFIG.STORE_DATA)){
        const store = database.createObjectStore(CONFIG.STORE_DATA, { keyPath: 'key' });
        store.createIndex('updated_at', 'updated_at', { unique: false });
      }
      
      // Files store (binary)
      if(!database.objectStoreNames.contains(CONFIG.STORE_FILES)){
        const store = database.createObjectStore(CONFIG.STORE_FILES, { keyPath: 'id' });
        store.createIndex('uploaded_at', 'uploaded_at', { unique: false });
        store.createIndex('owner', 'owner', { unique: false });
        store.createIndex('related_type', 'related_type', { unique: false });
      }
      
      // Backups store
      if(!database.objectStoreNames.contains(CONFIG.STORE_BACKUPS)){
        const store = database.createObjectStore(CONFIG.STORE_BACKUPS, { keyPath: 'id' });
        store.createIndex('created_at', 'created_at', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
      
      // Temp store
      if(!database.objectStoreNames.contains(CONFIG.STORE_TEMP)){
        const store = database.createObjectStore(CONFIG.STORE_TEMP, { keyPath: 'key' });
        store.createIndex('expires_at', 'expires_at', { unique: false });
      }
      
      // Audit log
      if(!database.objectStoreNames.contains(CONFIG.STORE_AUDIT)){
        const store = database.createObjectStore(CONFIG.STORE_AUDIT, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('user_id', 'user_id', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('severity', 'severity', { unique: false });
      }
    };
    
    req.onsuccess = () => {
      db = req.result;
      
      // Handle version changes from other tabs
      db.onversionchange = () => {
        db.close();
        db = null;
        dbPromise = null;
        console.warn('IndexedDB version changed in another tab. Please reload.');
      };
      
      resolve(db);
    };
    
    req.onerror = () => reject(req.error);
    req.onblocked = () => {
      console.warn('IndexedDB upgrade blocked. Please close other tabs.');
    };
  });
  
  return dbPromise;
}

/* ====================== STORE OPERATIONS ====================== */

async function dbGet(storeName, key){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(storeName, value){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readwrite');
    const req = tx.objectStore(storeName).put(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(storeName, key){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readwrite');
    const req = tx.objectStore(storeName).delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName, indexName, range){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readonly');
    const store = tx.objectStore(storeName);
    const target = indexName ? store.index(indexName) : store;
    const req = target.getAll(range);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function dbCount(storeName){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readonly');
    const req = tx.objectStore(storeName).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbClear(storeName){
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction([storeName], 'readwrite');
    const req = tx.objectStore(storeName).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/* ====================== QUOTA MONITORING ====================== */

async function getStorageUsage(forceFresh = false){
  // Use cache if recent
  if(!forceFresh && usageCache && (Date.now() - usageCacheTime) < USAGE_CACHE_TTL){
    return usageCache;
  }
  
  const usage = {
    available: false,
    quota: 0,
    used: 0,
    free: 0,
    used_pct: 0,
    free_pct: 100,
    safety_reserve: 0,
    usable: 0,
    status: 'ok',  // ok | warning | critical | full
    breakdown: {
      localStorage: 0,
      indexedDB: 0,
      cache: 0,
      data: 0,
      files: 0,
      backups: 0,
      temp: 0,
      audit: 0,
    },
    counts: {
      data: 0,
      files: 0,
      backups: 0,
      audit: 0,
    }
  };
  
  // Try StorageManager API (best estimate)
  if('storage' in navigator && navigator.storage.estimate){
    try {
      const estimate = await navigator.storage.estimate();
      usage.available = true;
      usage.quota = estimate.quota || 0;
      usage.used = estimate.usage || 0;
      usage.free = Math.max(0, usage.quota - usage.used);
      usage.used_pct = usage.quota > 0 ? (usage.used / usage.quota) * 100 : 0;
      usage.free_pct = 100 - usage.used_pct;
      usage.safety_reserve = usage.quota * (CONFIG.SAFETY_RESERVE_PCT / 100);
      usage.usable = Math.max(0, usage.quota - usage.safety_reserve - usage.used);
      
      if(estimate.usageDetails){
        usage.breakdown.indexedDB = estimate.usageDetails.indexedDB || 0;
        usage.breakdown.cache = estimate.usageDetails.caches || 0;
        usage.breakdown.localStorage = estimate.usageDetails.localStorage || 0;
      }
    } catch(e){
      console.warn('StorageManager.estimate() failed:', e);
    }
  }
  
  // Calculate localStorage size manually
  if(!usage.breakdown.localStorage){
    let lsSize = 0;
    try {
      for(let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        const val = localStorage.getItem(key);
        lsSize += (key.length + (val?.length || 0)) * 2; // UTF-16
      }
    } catch(e){}
    usage.breakdown.localStorage = lsSize;
  }
  
  // Get counts from IndexedDB
  try {
    usage.counts.data = await dbCount(CONFIG.STORE_DATA);
    usage.counts.files = await dbCount(CONFIG.STORE_FILES);
    usage.counts.backups = await dbCount(CONFIG.STORE_BACKUPS);
    usage.counts.audit = await dbCount(CONFIG.STORE_AUDIT);
    
    // Estimate sizes per store
    const data = await dbGetAll(CONFIG.STORE_DATA);
    usage.breakdown.data = data.reduce((s, r) => s + (JSON.stringify(r).length * 2), 0);
    
    const files = await dbGetAll(CONFIG.STORE_FILES);
    usage.breakdown.files = files.reduce((s, r) => s + (r.size || 0), 0);
    
    const backups = await dbGetAll(CONFIG.STORE_BACKUPS);
    usage.breakdown.backups = backups.reduce((s, r) => s + (JSON.stringify(r).length * 2), 0);
    
    const temp = await dbGetAll(CONFIG.STORE_TEMP);
    usage.breakdown.temp = temp.reduce((s, r) => s + (JSON.stringify(r).length * 2), 0);
    
    const audit = await dbGetAll(CONFIG.STORE_AUDIT);
    usage.breakdown.audit = audit.reduce((s, r) => s + (JSON.stringify(r).length * 2), 0);
  } catch(e){
    console.warn('Failed to count IndexedDB:', e);
  }
  
  // Determine status
  if(usage.used_pct >= CONFIG.CRITICAL_THRESHOLD_PCT) usage.status = 'critical';
  else if(usage.used_pct >= CONFIG.WARNING_THRESHOLD_PCT) usage.status = 'warning';
  else if(usage.free === 0) usage.status = 'full';
  else usage.status = 'ok';
  
  usageCache = usage;
  usageCacheTime = Date.now();
  
  return usage;
}

/* ====================== PERSISTENCE REQUEST ====================== */

async function requestPersistence(){
  if('storage' in navigator && navigator.storage.persist){
    try {
      const isPersisted = await navigator.storage.persisted();
      if(isPersisted) return true;
      
      const granted = await navigator.storage.persist();
      return granted;
    } catch(e){
      console.warn('Persistence request failed:', e);
      return false;
    }
  }
  return false;
}

/* ====================== AUTO-CLEANUP ====================== */

async function cleanupTempData(){
  try {
    const all = await dbGetAll(CONFIG.STORE_TEMP);
    const now = Date.now();
    let removed = 0;
    
    for(const item of all){
      if(item.expires_at && item.expires_at < now){
        await dbDelete(CONFIG.STORE_TEMP, item.key);
        removed++;
      }
    }
    return removed;
  } catch(e){
    console.warn('Cleanup temp failed:', e);
    return 0;
  }
}

async function cleanupAuditLog(){
  try {
    const cutoff = Date.now() - (CONFIG.AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const all = await dbGetAll(CONFIG.STORE_AUDIT);
    let removed = 0;
    
    for(const item of all){
      if(item.timestamp < cutoff){
        await dbDelete(CONFIG.STORE_AUDIT, item.id);
        removed++;
      }
    }
    return removed;
  } catch(e){
    console.warn('Cleanup audit failed:', e);
    return 0;
  }
}

async function cleanupOldBackups(){
  try {
    const all = await dbGetAll(CONFIG.STORE_BACKUPS);
    all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    const toRemove = all.slice(CONFIG.MAX_BACKUPS);
    for(const item of toRemove){
      await dbDelete(CONFIG.STORE_BACKUPS, item.id);
    }
    return toRemove.length;
  } catch(e){
    console.warn('Cleanup backups failed:', e);
    return 0;
  }
}

/**
 * Run all cleanup tasks. Returns summary.
 */
async function runFullCleanup(){
  const before = await getStorageUsage(true);
  
  const tempRemoved = await cleanupTempData();
  const auditRemoved = await cleanupAuditLog();
  const backupsRemoved = await cleanupOldBackups();
  
  // Reset cache
  usageCache = null;
  
  const after = await getStorageUsage(true);
  
  return {
    removed: {
      temp: tempRemoved,
      audit: auditRemoved,
      backups: backupsRemoved,
    },
    freed_bytes: Math.max(0, before.used - after.used),
    before: { used: before.used, used_pct: before.used_pct },
    after: { used: after.used, used_pct: after.used_pct },
  };
}

/* ====================== PUBLIC API ====================== */

const StorageManager = {
  CONFIG,
  
  // Lifecycle
  init: openDB,
  requestPersistence,
  
  // Quota
  getUsage: getStorageUsage,
  
  async checkQuota(requiredBytes){
    const usage = await getStorageUsage();
    const available = usage.usable;
    
    return {
      ok: available >= requiredBytes,
      available,
      required: requiredBytes,
      deficit: Math.max(0, requiredBytes - available),
      status: usage.status,
      used_pct: usage.used_pct,
    };
  },
  
  async validateFileSize(bytes){
    if(bytes > CONFIG.MAX_SINGLE_FILE){
      return {
        ok: false,
        error: `حجم الملف ${formatBytes(bytes)} يتجاوز الحد الأقصى المسموح (${formatBytes(CONFIG.MAX_SINGLE_FILE)})`,
      };
    }
    
    const quota = await this.checkQuota(bytes * 1.2); // 20% buffer
    if(!quota.ok){
      return {
        ok: false,
        error: `المساحة المتاحة (${formatBytes(quota.available)}) أقل من المطلوب (${formatBytes(quota.required)}). يُنصح بتنفيذ التنظيف.`,
      };
    }
    
    return { ok: true };
  },
  
  async validateBatchSize(totalBytes){
    if(totalBytes > CONFIG.MAX_TOTAL_BATCH){
      return {
        ok: false,
        error: `إجمالي الملفات ${formatBytes(totalBytes)} يتجاوز حد الدفعة (${formatBytes(CONFIG.MAX_TOTAL_BATCH)})`,
      };
    }
    return { ok: true };
  },
  
  // Cleanup
  cleanup: runFullCleanup,
  
  // Data ops (JSON records)
  data: {
    async get(key){
      const r = await dbGet(CONFIG.STORE_DATA, key);
      return r ? r.value : null;
    },
    async set(key, value){
      return dbPut(CONFIG.STORE_DATA, { key, value, updated_at: new Date().toISOString() });
    },
    async delete(key){
      return dbDelete(CONFIG.STORE_DATA, key);
    },
    async list(){
      return dbGetAll(CONFIG.STORE_DATA);
    },
  },
  
  // File ops (binary)
  files: {
    async put(id, blob, metadata = {}){
      const sizeValidation = await StorageManager.validateFileSize(blob.size);
      if(!sizeValidation.ok) throw new Error(sizeValidation.error);
      
      const file = {
        id,
        blob,
        size: blob.size,
        mime_type: blob.type || metadata.mime_type || 'application/octet-stream',
        filename: metadata.filename || id,
        related_type: metadata.related_type || null,
        related_id: metadata.related_id || null,
        owner: metadata.owner || null,
        hash: metadata.hash || null,
        uploaded_at: new Date().toISOString(),
        ...metadata,
      };
      
      return dbPut(CONFIG.STORE_FILES, file);
    },
    async get(id){
      return dbGet(CONFIG.STORE_FILES, id);
    },
    async getBlob(id){
      const f = await dbGet(CONFIG.STORE_FILES, id);
      return f?.blob || null;
    },
    async delete(id){
      return dbDelete(CONFIG.STORE_FILES, id);
    },
    async list(filter){
      const all = await dbGetAll(CONFIG.STORE_FILES);
      if(!filter) return all.map(f => ({ ...f, blob: undefined })); // Don't include blob in listing
      return all.filter(f => {
        if(filter.related_type && f.related_type !== filter.related_type) return false;
        if(filter.related_id && f.related_id !== filter.related_id) return false;
        if(filter.owner && f.owner !== filter.owner) return false;
        return true;
      }).map(f => ({ ...f, blob: undefined }));
    },
    async getURL(id){
      // Returns a blob URL for the file (revoke after use!)
      const blob = await this.getBlob(id);
      return blob ? URL.createObjectURL(blob) : null;
    },
  },
  
  // Backup ops
  backups: {
    async save(backup){
      return dbPut(CONFIG.STORE_BACKUPS, backup);
    },
    async get(id){
      return dbGet(CONFIG.STORE_BACKUPS, id);
    },
    async list(){
      const all = await dbGetAll(CONFIG.STORE_BACKUPS);
      return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    async delete(id){
      return dbDelete(CONFIG.STORE_BACKUPS, id);
    },
  },
  
  // Temp ops
  temp: {
    async set(key, value, ttlMs = CONFIG.TEMP_TTL_MS){
      return dbPut(CONFIG.STORE_TEMP, {
        key, value,
        created_at: Date.now(),
        expires_at: Date.now() + ttlMs,
      });
    },
    async get(key){
      const r = await dbGet(CONFIG.STORE_TEMP, key);
      if(!r) return null;
      if(r.expires_at && r.expires_at < Date.now()){
        await dbDelete(CONFIG.STORE_TEMP, key);
        return null;
      }
      return r.value;
    },
    async delete(key){
      return dbDelete(CONFIG.STORE_TEMP, key);
    },
    async clear(){
      return dbClear(CONFIG.STORE_TEMP);
    },
  },
  
  // Audit log
  audit: {
    async log(entry){
      const log = {
        timestamp: Date.now(),
        timestamp_iso: new Date().toISOString(),
        user_id: window.SC?.auth?.getSession()?.username || 'system',
        user_name: window.SC?.auth?.getSession()?.name || 'النظام',
        ip: 'local',
        action: entry.action,
        severity: entry.severity || 'info', // info | warning | error | critical
        entity_type: entry.entity_type || null,
        entity_id: entry.entity_id || null,
        description: entry.description || '',
        metadata: entry.metadata || {},
        user_agent: navigator.userAgent.substring(0, 200),
      };
      return dbPut(CONFIG.STORE_AUDIT, log);
    },
    async list(filter = {}){
      let all = await dbGetAll(CONFIG.STORE_AUDIT);
      
      if(filter.from) all = all.filter(e => e.timestamp >= filter.from);
      if(filter.to) all = all.filter(e => e.timestamp <= filter.to);
      if(filter.user_id) all = all.filter(e => e.user_id === filter.user_id);
      if(filter.action) all = all.filter(e => e.action === filter.action);
      if(filter.severity) all = all.filter(e => e.severity === filter.severity);
      
      all.sort((a, b) => b.timestamp - a.timestamp);
      
      if(filter.limit) all = all.slice(0, filter.limit);
      return all;
    },
    async export(){
      const all = await dbGetAll(CONFIG.STORE_AUDIT);
      return all.sort((a, b) => b.timestamp - a.timestamp);
    },
  },
  
  // Read large file in chunks (for files > 100MB)
  async readFileChunked(file, onProgress){
    const chunks = [];
    const total = file.size;
    let offset = 0;
    
    while(offset < total){
      const slice = file.slice(offset, Math.min(offset + CONFIG.CHUNK_SIZE, total));
      const buffer = await slice.arrayBuffer();
      chunks.push(new Uint8Array(buffer));
      offset += CONFIG.CHUNK_SIZE;
      
      if(onProgress){
        onProgress({
          loaded: Math.min(offset, total),
          total,
          percent: Math.round((Math.min(offset, total) / total) * 100),
        });
      }
    }
    
    // Combine chunks
    const totalLength = chunks.reduce((s, c) => s + c.length, 0);
    const combined = new Uint8Array(totalLength);
    let pos = 0;
    for(const chunk of chunks){
      combined.set(chunk, pos);
      pos += chunk.length;
    }
    return combined;
  },
};

/* ====================== HELPERS ====================== */

function formatBytes(bytes){
  if(bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024));
  return (bytes / Math.pow(1024, Math.min(i, units.length - 1))).toFixed(2) + ' ' + units[Math.min(i, units.length - 1)];
}

StorageManager.formatBytes = formatBytes;

/* ====================== AUTO-START ====================== */

window.SC = window.SC || {};
window.SC.storage = StorageManager;

// Initialize on load
openDB().then(async () => {
  window.SC_DEBUG&&console.log('[Storage] IndexedDB initialized');
  
  // Request persistence (prevents browser from clearing data)
  const persisted = await requestPersistence();
  window.SC_DEBUG&&console.log('[Storage] Persistence:', persisted ? 'granted' : 'not granted');
  
  // Initial cleanup of expired temp data
  setTimeout(() => cleanupTempData(), 5000);
  
  // Schedule periodic cleanup (every 6 hours while page is open)
  setInterval(() => runFullCleanup(), 6 * 60 * 60 * 1000);
  
}).catch(err => {
  console.error('[Storage] Failed to init IndexedDB:', err);
});

window.SC_DEBUG&&console.log('Smart Code Storage Manager loaded');

})(window);
