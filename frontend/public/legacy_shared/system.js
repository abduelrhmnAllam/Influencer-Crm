/*
 * Smart Code v5 Pro - System Module
 * إدارة النسخ الاحتياطية + الإعدادات الفعالة + الأنشطة + التكامل
 */
(function(){
  
  // ============ ACTIVITY LOG ============
  function logActivity(type, action, target, details = {}){
    try {
      const logs = JSON.parse(localStorage.getItem('sc_activity_log') || '[]');
      const session = window.SC?.auth?.getSession();
      logs.unshift({
        id: 'LOG-' + Date.now() + '-' + Math.random().toString(36).substr(2,5),
        timestamp: new Date().toISOString(),
        type,       // create | update | delete | login | logout | import | export | backup | restore | system
        action,     // human-readable
        target,     // entity affected
        details,    // extra data
        user: session?.name || 'مجهول',
        user_id: session?.username || null,
        role: session?.role || null
      });
      // Keep last 1000 entries
      if(logs.length > 1000) logs.length = 1000;
      localStorage.setItem('sc_activity_log', JSON.stringify(logs));
    } catch(e){ console.warn('Activity log failed:', e); }
  }
  
  function getActivityLog(filter = {}){
    try {
      let logs = JSON.parse(localStorage.getItem('sc_activity_log') || '[]');
      if(filter.type) logs = logs.filter(l => l.type === filter.type);
      if(filter.user) logs = logs.filter(l => l.user === filter.user);
      if(filter.target) logs = logs.filter(l => (l.target||'').includes(filter.target));
      if(filter.since){
        const sinceTime = new Date(filter.since).getTime();
        logs = logs.filter(l => new Date(l.timestamp).getTime() >= sinceTime);
      }
      return logs.slice(0, filter.limit || 200);
    } catch(e){ return []; }
  }
  
  function clearActivityLog(){
    localStorage.setItem('sc_activity_log', JSON.stringify([]));
    logActivity('system', 'تم تفريغ سجل الأنشطة', 'activity_log');
  }
  
  // ============ BACKUPS ============
  const BACKUP_KEY = 'sc_backups';
  const MAX_BACKUPS = 10;  // Keep last 10 backups
  const AUTO_BACKUP_KEY = 'sc_auto_backup_settings';
  
  // ============ DATA ACCESS ============
  // FIX: All data uses sc_v5_ prefix (matches data.js STORAGE_PREFIX)
  const STORAGE_PREFIX = 'sc_v5_';
  
  function getAllData(){
    const data = {};
    const keys = ['customers','influencers','campaigns','transfers','daily_ads','ugc_creators','content','whatsapp_numbers','team','settings','activity_log','users'];
    keys.forEach(k => {
      // Prefer data layer (handles IDB-backed keys); fallback to direct localStorage
      let value = null;
      if(window.SC?.data?.get){
        value = window.SC.data.get(k, null);
      }
      if(value === null){
        let raw = localStorage.getItem(STORAGE_PREFIX + k);
        if(!raw) raw = localStorage.getItem('sc_' + k);
        if(raw) value = raw;  // Keep as string for serialization
      } else {
        value = JSON.stringify(value);  // Serialize to match format
      }
      if(value) data[k] = value;
    });
    return data;
  }
  
  function getDataStats(){
    const stats = {};
    const keys = ['customers','influencers','campaigns','transfers','daily_ads','content','team'];
    keys.forEach(k => {
      try {
        // Prefer data layer (handles IDB-backed keys)
        let items;
        if(window.SC?.data?.get){
          items = window.SC.data.get(k, null);
        }
        if(items === null || items === undefined){
          // Fallback to direct localStorage
          let raw = localStorage.getItem(STORAGE_PREFIX + k);
          if(!raw) raw = localStorage.getItem('sc_' + k);
          items = JSON.parse(raw || '[]');
        }
        stats[k] = Array.isArray(items) ? items.length : 0;
      } catch(e){ stats[k] = 0; }
    });
    return stats;
  }
  
  // ============ INDEXEDDB BACKUP STORE ============
  // localStorage has ~5MB limit. With 3MB+ of data, backups in localStorage 
  // cause QuotaExceededError. We use IndexedDB instead (~50MB+ quota).
  const IDB_NAME = 'smartcode_backups';
  const IDB_STORE = 'backups';
  const IDB_VERSION = 1;
  
  function openBackupDB(){
    return new Promise((resolve, reject) => {
      if(!('indexedDB' in window)) { reject(new Error('IndexedDB not supported')); return; }
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(IDB_STORE)){
          db.createObjectStore(IDB_STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  
  async function idbBackupSave(backup){
    const db = await openBackupDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([IDB_STORE], 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(backup);
      req.onsuccess = () => resolve(backup);
      req.onerror = () => reject(req.error);
    });
  }
  
  async function idbBackupList(){
    try {
      const db = await openBackupDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([IDB_STORE], 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch(e){ return []; }
  }
  
  async function idbBackupGet(id){
    const db = await openBackupDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([IDB_STORE], 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  
  async function idbBackupDelete(id){
    const db = await openBackupDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([IDB_STORE], 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
  
  async function idbBackupCleanup(maxKeep){
    const all = await idbBackupList();
    all.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    const toDelete = all.slice(maxKeep);
    for(const b of toDelete){
      await idbBackupDelete(b.id);
    }
    return toDelete.length;
  }
  
  // ============ BACKUP API ============
  // Now uses SC.storage (StorageManager) if available, falls back to IDB direct
  
  function createBackup(label = '', type = 'manual'){
    try {
      const data = getAllData();
      const stats = getDataStats();
      const session = window.SC?.auth?.getSession();
      const totalSize = Object.values(data).reduce((s,v) => s + (v?.length || 0), 0);
      
      const backup = {
        id: 'BAK-' + Date.now() + '-' + Math.random().toString(36).substr(2,5),
        created_at: new Date().toISOString(),
        type,
        label: label || `نسخة ${type === 'auto' ? 'تلقائية' : type === 'manual' ? 'يدوية' : 'تلقائية قبل عملية'}`,
        size_bytes: totalSize,
        size_kb: Math.round(totalSize / 1024),
        stats,
        user: session?.name || 'النظام',
        user_id: session?.username || 'system',
        data
      };
      
      // Prefer StorageManager (enterprise-grade)
      const storage = window.SC?.storage;
      if(storage?.backups?.save){
        storage.backups.save(backup)
          .then(() => storage.audit?.log({
            action: 'backup_created',
            entity_type: 'backup',
            entity_id: backup.id,
            description: backup.label,
            metadata: { size_kb: backup.size_kb, type, stats }
          }))
          .catch(err => console.warn('Backup save failed:', err));
      } else {
        // Fallback: direct IDB
        idbBackupSave(backup)
          .then(() => idbBackupCleanup(MAX_BACKUPS))
          .catch(err => console.warn('IDB backup failed:', err));
      }
      
      // Save metadata-only in localStorage for quick listing (small payload)
      try {
        const meta = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
        const metaEntry = {
          id: backup.id,
          created_at: backup.created_at,
          type: backup.type,
          label: backup.label,
          size_kb: backup.size_kb,
          stats: backup.stats,
          user: backup.user,
          user_id: backup.user_id
        };
        meta.unshift(metaEntry);
        if(meta.length > MAX_BACKUPS) meta.length = MAX_BACKUPS;
        localStorage.setItem(BACKUP_KEY, JSON.stringify(meta));
      } catch(e){
        // If even metadata fails, clear old metadata
        try { localStorage.removeItem(BACKUP_KEY); } catch(_){}
      }
      
      logActivity('backup', `تم إنشاء نسخة احتياطية: ${backup.label}`, backup.id, { size_kb: backup.size_kb, stats });
      
      return backup;
    } catch(e){
      console.error('Backup failed:', e);
      return null;
    }
  }
  
  function getBackups(){
    try {
      const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
      // Return without the full data (just metadata) for listing
      return backups.map(b => ({
        id: b.id,
        created_at: b.created_at,
        type: b.type,
        label: b.label,
        size_bytes: b.size_bytes,
        size_kb: b.size_kb,
        stats: b.stats,
        user: b.user
      }));
    } catch(e){ return []; }
  }
  
  function getBackup(backupId){
    // Metadata only (from localStorage). For full data, use getBackupWithData (async)
    try {
      const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
      return backups.find(b => b.id === backupId);
    } catch(e){ return null; }
  }
  
  // Async: get full backup (with data) from IndexedDB
  async function getBackupWithData(backupId){
    try {
      return await idbBackupGet(backupId);
    } catch(e){
      // Fallback: maybe it's old backup format still in localStorage
      const backup = getBackup(backupId);
      return backup && backup.data ? backup : null;
    }
  }
  
  // Restore from backup (async because IDB is async)
  async function restoreBackup(backupId){
    try {
      const backup = await getBackupWithData(backupId);
      if(!backup || !backup.data) return { ok: false, error: 'النسخة غير موجودة أو فارغة' };
      
      // Create a backup of current state before restoring (fire-and-forget)
      createBackup(`قبل استرجاع ${backup.label}`, 'pre_restore');
      
      // Restore all data — use correct STORAGE_PREFIX (sc_v5_)
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(STORAGE_PREFIX + key, value);
      });
      
      logActivity('restore', `تم استرجاع نسخة احتياطية: ${backup.label}`, backupId);
      
      return { ok: true, stats: backup.stats };
    } catch(e){
      console.error('Restore failed:', e);
      return { ok: false, error: e.message };
    }
  }
  
  function deleteBackup(backupId){
    try {
      // Delete from localStorage index
      let backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
      const backup = backups.find(b => b.id === backupId);
      backups = backups.filter(b => b.id !== backupId);
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
      
      // Delete from IndexedDB (fire-and-forget)
      idbBackupDelete(backupId).catch(() => {});
      
      if(backup) logActivity('backup', `تم حذف نسخة احتياطية: ${backup.label}`, backupId);
      return true;
    } catch(e){ return false; }
  }
  
  // Download backup as JSON file (async)
  async function downloadBackup(backupId){
    const backup = await getBackupWithData(backupId);
    if(!backup) return false;
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcode-backup-${backup.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }
  
  function uploadBackup(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const backup = JSON.parse(e.target.result);
          if(!backup.data || !backup.created_at){
            reject(new Error('ملف غير صالح — ليس نسخة احتياطية صحيحة'));
            return;
          }
          // Save it as a new backup
          const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) || '[]');
          backup.id = 'BAK-' + Date.now() + '-imported';
          backup.label = backup.label + ' (مستوردة)';
          backups.unshift(backup);
          if(backups.length > MAX_BACKUPS) backups.length = MAX_BACKUPS;
          localStorage.setItem(BACKUP_KEY, JSON.stringify(backups));
          logActivity('backup', `تم استيراد نسخة احتياطية: ${backup.label}`, backup.id);
          resolve(backup);
        } catch(e){ reject(e); }
      };
      reader.onerror = () => reject(new Error('فشلت قراءة الملف'));
      reader.readAsText(file);
    });
  }
  
  // ============ AUTO-BACKUP ============
  function getAutoBackupSettings(){
    try {
      return JSON.parse(localStorage.getItem(AUTO_BACKUP_KEY)) || {
        enabled: true,
        interval_hours: 1,
        last_backup: null
      };
    } catch(e){
      return { enabled: true, interval_hours: 1, last_backup: null };
    }
  }
  
  function setAutoBackupSettings(settings){
    localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(settings));
  }
  
  function checkAndRunAutoBackup(){
    const settings = getAutoBackupSettings();
    if(!settings.enabled) return false;
    
    const now = Date.now();
    const lastBackup = settings.last_backup ? new Date(settings.last_backup).getTime() : 0;
    const intervalMs = settings.interval_hours * 60 * 60 * 1000;
    
    if(now - lastBackup >= intervalMs){
      const backup = createBackup('نسخة تلقائية مجدولة', 'auto');
      if(backup){
        settings.last_backup = backup.created_at;
        setAutoBackupSettings(settings);
        return backup;
      }
    }
    return false;
  }
  
  // Run auto-backup check on load + every minute heartbeat
  setTimeout(() => {
    try { checkAndRunAutoBackup(); } catch(e){}
  }, 3000);
  
  // Heartbeat: check every 60 seconds to ensure auto-backup runs even on long sessions
  setInterval(() => {
    try { checkAndRunAutoBackup(); } catch(e){}
  }, 60 * 1000);
  
  // Also backup before page unload (only if more than 5 min since last)
  window.addEventListener('beforeunload', () => {
    try {
      const settings = getAutoBackupSettings();
      if(!settings.enabled) return;
      const lastBackup = settings.last_backup ? new Date(settings.last_backup).getTime() : 0;
      if(Date.now() - lastBackup > 5 * 60 * 1000){
        const b = createBackup('عند إغلاق الصفحة', 'auto');
        if(b){
          settings.last_backup = b.created_at;
          setAutoBackupSettings(settings);
        }
      }
    } catch(e){}
  });
  
  // ============ NOTIFICATIONS ============
  const NOTIF_KEY = 'sc_notifications';
  const NOTIF_SETTINGS_KEY = 'sc_notification_settings';
  
  // Default notification settings
  function getNotificationSettings(){
    try {
      return JSON.parse(localStorage.getItem(NOTIF_SETTINGS_KEY)) || {
        // In-app notifications
        inapp_enabled: true,
        inapp_new_transfer: true,
        inapp_transfer_receipt: true,
        inapp_transfer_completed: true,
        inapp_new_ad: false,
        inapp_low_data: true,
        inapp_backup_failed: true,
        
        // Email notifications (UI ready, requires backend integration)
        email_enabled: false,
        email_recipients: '',  // comma-separated
        email_new_transfer: true,
        email_transfer_completed: true,
        email_daily_summary: false,
        email_weekly_report: false,
        
        // Sound
        sound_enabled: true,
        
        // Toast position
        toast_position: 'top-right'
      };
    } catch(e){
      return { inapp_enabled: true, email_enabled: false };
    }
  }
  
  function setNotificationSettings(settings){
    localStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
    logActivity('update', 'تم تحديث إعدادات الإشعارات', 'notification_settings');
  }
  
  function getNotifications(filter = {}){
    try {
      let notifs = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      if(filter.unread) notifs = notifs.filter(n => !n.read);
      if(filter.type) notifs = notifs.filter(n => n.type === filter.type);
      return notifs.slice(0, filter.limit || 50);
    } catch(e){ return []; }
  }
  
  function addNotification(notif){
    try {
      const settings = getNotificationSettings();
      if(!settings.inapp_enabled) return null;
      
      // Check type-specific setting
      const typeKey = 'inapp_' + (notif.subtype || notif.type);
      if(settings[typeKey] === false) return null;
      
      const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const newNotif = {
        id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2,5),
        timestamp: new Date().toISOString(),
        read: false,
        type: notif.type || 'info',           // info | success | warning | danger
        subtype: notif.subtype || '',
        title: notif.title || '',
        message: notif.message || '',
        link: notif.link || null,
        icon: notif.icon || null,
        ...notif
      };
      notifications.unshift(newNotif);
      // Keep last 100
      if(notifications.length > 100) notifications.length = 100;
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
      
      // Send email if enabled and matched
      if(settings.email_enabled && settings.email_recipients){
        const emailTypeKey = 'email_' + (notif.subtype || notif.type);
        if(settings[emailTypeKey] !== false){
          // Queue email (would be sent by backend in production)
          queueEmail(settings.email_recipients, newNotif);
        }
      }
      
      // Trigger UI update if listener exists
      if(window.SC?.ui?.updateNotificationBadge){
        window.SC.ui.updateNotificationBadge();
      }
      
      return newNotif;
    } catch(e){
      console.warn('Notification failed:', e);
      return null;
    }
  }
  
  function markNotificationRead(id){
    try {
      const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const n = notifications.find(x => x.id === id);
      if(n) n.read = true;
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
      if(window.SC?.ui?.updateNotificationBadge) window.SC.ui.updateNotificationBadge();
      return true;
    } catch(e){ return false; }
  }
  
  function markAllNotificationsRead(){
    try {
      const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      notifications.forEach(n => n.read = true);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
      if(window.SC?.ui?.updateNotificationBadge) window.SC.ui.updateNotificationBadge();
      return true;
    } catch(e){ return false; }
  }
  
  function clearNotifications(){
    localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
    if(window.SC?.ui?.updateNotificationBadge) window.SC.ui.updateNotificationBadge();
    logActivity('system', 'تم تفريغ الإشعارات', 'notifications');
  }
  
  function deleteNotification(id){
    try {
      const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const filtered = notifications.filter(n => n.id !== id);
      localStorage.setItem(NOTIF_KEY, JSON.stringify(filtered));
      if(window.SC?.ui?.updateNotificationBadge) window.SC.ui.updateNotificationBadge();
      return true;
    } catch(e){ return false; }
  }
  
  function getUnreadCount(){
    try {
      const notifications = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      return notifications.filter(n => !n.read).length;
    } catch(e){ return 0; }
  }
  
  // Email queue (waiting for backend SMTP integration)
  function queueEmail(recipients, notif){
    try {
      const queue = JSON.parse(localStorage.getItem('sc_email_queue') || '[]');
      queue.push({
        id: 'EMAIL-' + Date.now(),
        queued_at: new Date().toISOString(),
        recipients: recipients,
        subject: notif.title,
        body: notif.message,
        notif_id: notif.id,
        status: 'pending'
      });
      if(queue.length > 200) queue.length = 200;
      localStorage.setItem('sc_email_queue', JSON.stringify(queue));
    } catch(e){}
  }
  
  function getEmailQueue(){
    try {
      return JSON.parse(localStorage.getItem('sc_email_queue') || '[]');
    } catch(e){ return []; }
  }
  
  // Test notification (for settings page)
  function sendTestNotification(){
    return addNotification({
      type: 'info',
      subtype: 'system',
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للتأكد من عمل النظام بشكل صحيح. الوقت الحالي: ' + new Date().toLocaleTimeString('ar-SA'),
      icon: 'bell'
    });
  }
  
  // ============ EXCEL PARSER (for influencer Excel files) ============
  function parseSubscribers(s){
    if(s === null || s === undefined || s === '' || s === 0) return 0;
    s = String(s).trim().toUpperCase().replace(/\s/g, '');
    try {
      if(s.includes('M')) return Math.floor(parseFloat(s.replace('M','')) * 1000000);
      if(s.includes('K')) return Math.floor(parseFloat(s.replace('K','')) * 1000);
      return parseInt(parseFloat(s));
    } catch(e){ return 0; }
  }
  
  function safeStr(v){
    if(v === null || v === undefined || v === 0 || v === '0') return '';
    return String(v).trim();
  }
  
  function safeNum(v){
    if(v === null || v === undefined || v === '' || v === '0' || v === 0) return 0;
    try { return parseInt(parseFloat(v)); } catch(e){ return 0; }
  }
  
  // Parse an Excel file (File object) and return normalized influencers array
  async function parseInfluencersExcel(file){
    return new Promise((resolve, reject) => {
      if(typeof XLSX === 'undefined'){
        reject(new Error('مكتبة قراءة Excel غير محملة'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          
          const allInfluencers = [];
          let snapCount = 0, ttCount = 0, otherSheets = 0;
          
          // Process each sheet
          wb.SheetNames.forEach(sheetName => {
            const ws = wb.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false });
            
            // Determine platform from sheet name
            let platform = null;
            const lowerName = sheetName.toLowerCase();
            if(sheetName.includes('سناب') || lowerName.includes('snap')) platform = 'snapchat';
            else if(sheetName.includes('تيك توك') || lowerName.includes('tiktok')) platform = 'tiktok';
            else if(sheetName.includes('انستا') || sheetName.includes('إنستا') || lowerName.includes('insta')) platform = 'instagram';
            else if(sheetName.includes('x') || sheetName.includes('تويتر') || lowerName.includes('twitter')) platform = 'twitter';
            else if(sheetName.includes('لينكد') || lowerName.includes('linked')) platform = 'linkedin';
            else if(sheetName.includes('يوتيوب') || lowerName.includes('youtube')) platform = 'youtube';
            
            // Skip dashboard/summary sheets
            if(sheetName.toLowerCase().includes('dashboard') || sheetName.includes('ملخص')) return;
            
            rows.forEach((row, idx) => {
              // Find influencer name field - try multiple variations
              const nameKeys = ['المشهور', ' المشهور', 'الاسم', 'name', 'اسم المشهور'];
              let name = '';
              for(const k of nameKeys){
                if(row[k]) { name = safeStr(row[k]); break; }
              }
              if(!name) return;
              
              // Phone
              const phoneKeys = ['رقم التواصل', 'رقم الجوال', 'phone', 'الهاتف'];
              let phone = '';
              for(const k of phoneKeys){ if(row[k]) { phone = safeStr(row[k]); break; } }
              
              // Classification
              const classKeys = ['تصنيف المشهور', 'التصنيف', 'classification', 'class'];
              let classification = 'C';
              for(const k of classKeys){ if(row[k]) { classification = safeStr(row[k]); break; } }
              
              // URL — depends on sheet
              const urlKeys = ['رابط السناب', 'رابط التيك توك', 'رابط الحساب', 'رابط الحساب ', 'URL', 'الرابط', 'رابط'];
              let url = '';
              for(const k of urlKeys){ if(row[k]) { url = safeStr(row[k]); break; } }
              
              // Other fields
              const employee = safeStr(row['اسم الموظف'] || row['الموظف'] || row['employee']);
              const license = safeStr(row['رقم الترخيص'] || row['license']);
              const gender = safeStr(row['الجنس'] || row['gender']) || 'ذكر';
              const subs = parseSubscribers(row['الاشتراكات'] || row['المتابعين'] || row['subs']);
              const region = safeStr(row['المنطقة'] || row['region']);
              const city = safeStr(row['المدينة'] || row['المدينة '] || row['city']);
              const address = safeStr(row['العنوان'] || row['address']);
              const shippingPhone = safeStr(row['رقم استلام الشحنات'] || row['shipping_phone']);
              const bank = safeStr(row['البنك'] || row['bank']);
              const iban = safeStr(row['رقم الحساب'] || row['iban']);
              const holder = safeStr(row['اسم صاحب الحساب'] || row['account_holder']);
              const rating = safeStr(row['التقييم'] || row['rating']);
              const showFace = safeStr(row['يظهر الوجه'] || row['يظهر وجهه']) === 'نعم';
              const isComplete = safeStr(row['اكتمال البيانات'] || row['إكتمال البيانات']) === 'مكتمل' 
                              || safeStr(row['اكتمال البيانات'] || row['إكتمال البيانات']) === 'نعم';
              
              // Content categories (Col 10, 11, 12)
              const cat1 = safeStr(row['المحتوى'] || row['المحتوى 1']);
              const cat2 = safeStr(row['المحتوى 1'] || row['المحتوى1']);
              const cat3 = safeStr(row['المحتوى2'] || row['المحتوى 2'] || row['المحتوى 3']);
              const allCats = [cat1, cat2, cat3].filter(c => c && c.trim()).join(', ');
              const primaryCat = cat1 || cat2 || cat3 || '';
              
              // Extract username from URL
              let username = '';
              const urlForUsername = url || '';
              const usernameMatch = urlForUsername.match(/\/([^\/\?]+)(?:\?|$)/);
              if(usernameMatch) username = usernameMatch[1].replace(/^@/, '').trim();
              
              // Pricing
              const homePrice = safeNum(row['منزلي']);
              const coveragePrice = safeNum(row['تغطية']);
              const sellPrice = safeNum(row['سعر البيع']);
              const coverageSellPrice = safeNum(row['سعر البيع.1'] || row['سعر البيع 2']);
              
              // Build influencer with CORRECT field names matching the data model
              const inf = {
                id: 'INF-X' + (idx+1).toString().padStart(4,'0') + '-' + Date.now().toString().slice(-4),
                name,
                username,
                phone,
                email: '',
                nationality: 'سعودي',
                gender: gender === 'انثى' ? 'أنثى' : gender,
                city,
                region,
                category: primaryCat,
                all_categories: allCats,
                suitable_for: primaryCat,
                classification: classification || 'C',
                show_face: showFace,  // FIXED: show_face (not shows_face)
                audience_age: '',
                gender_ratio: '',
                iban,
                bank_name: bank,
                account_holder: holder,
                shipping_phone: shippingPhone,
                address,
                from_db: false,
                total_subscribers: subs,
                platforms: [],
                engagement_rate: 0,
                total_campaigns: 0,
                rating,  // text: "جيد", "ممتاز", etc.
                is_complete: isComplete,  // FIXED: is_complete (not data_complete)
                license,  // FIXED: license (not license_number)
                status: 'active',
                notes: '',
                created_at: new Date().toISOString().substring(0, 10),
                employee_name: employee
              };
              
              // Add platform data if detected
              if(platform && (url || homePrice || sellPrice)){
                inf.platforms.push({
                  platform_id: 1,
                  platform_name: platform,
                  url,
                  subs,
                  views: 0,
                  home_cost: homePrice,
                  home_sell: sellPrice,
                  cov_cost: coveragePrice,
                  cov_sell: coverageSellPrice
                });
              }
              
              allInfluencers.push(inf);
              
              if(platform === 'snapchat') snapCount++;
              else if(platform === 'tiktok') ttCount++;
              else otherSheets++;
            });
          });
          
          // Merge duplicates by phone (cross-sheet same person on multiple platforms)
          const merged = {};
          allInfluencers.forEach(inf => {
            const key = inf.phone || inf.name.toLowerCase();
            if(!key) return;
            
            if(merged[key]){
              // Merge platforms
              inf.platforms.forEach(p => {
                const existingPlatformNames = merged[key].platforms.map(x => x.platform_name);
                if(!existingPlatformNames.includes(p.platform_name)){
                  merged[key].platforms.push(p);
                }
              });
              // Fill empty fields (use NEW field names)
              ['license','region','city','address','shipping_phone','bank_name','iban','account_holder','rating','category','all_categories','employee_name','username','nationality'].forEach(f => {
                if(!merged[key][f] && inf[f]) merged[key][f] = inf[f];
              });
              // Keep highest subs
              if(inf.total_subscribers > merged[key].total_subscribers){
                merged[key].total_subscribers = inf.total_subscribers;
              }
            } else {
              merged[key] = inf;
            }
          });
          
          const result = Object.values(merged);
          resolve({
            influencers: result,
            stats: {
              total_rows: allInfluencers.length,
              unique_influencers: result.length,
              snapchat: snapCount,
              tiktok: ttCount,
              other: otherSheets,
              sheets_processed: wb.SheetNames.length
            }
          });
        } catch(err){
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('فشلت قراءة الملف'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  // ============ IMPORT INFLUENCERS (from JSON file or Excel parsed array) ============
  function importInfluencers(jsonData, mode = 'merge'){
    try {
      let newInfluencers;
      if(typeof jsonData === 'string'){
        newInfluencers = JSON.parse(jsonData);
      } else {
        newInfluencers = jsonData;
      }
      if(!Array.isArray(newInfluencers)){
        return { ok: false, error: 'البيانات يجب أن تكون مصفوفة (Array)' };
      }
      
      // Create pre-import backup
      createBackup('قبل استيراد ملف المؤثرين', 'pre_import');
      
      // FIX: Use correct localStorage key (sc_v5_ prefix)
      const STORAGE_KEY = 'sc_v5_influencers';
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let stats = { added: 0, updated: 0, skipped: 0, errors: 0 };
      let final;
      
      if(mode === 'replace'){
        // Replace all
        final = newInfluencers;
        stats.added = newInfluencers.length;
      } else if(mode === 'merge'){
        // Merge by phone or ID
        const existingByKey = {};
        existing.forEach(e => {
          if(e.phone) existingByKey[e.phone] = e;
          if(e.id) existingByKey[e.id] = e;
        });
        
        newInfluencers.forEach(newInf => {
          try {
            const key = newInf.phone || newInf.id;
            if(existingByKey[key]){
              // Merge fields - keep existing values where new is empty
              const existingInf = existingByKey[key];
              Object.keys(newInf).forEach(field => {
                // Skip merging platforms here, handled separately
                if(field === 'platforms') return;
                if(newInf[field] !== null && newInf[field] !== undefined && newInf[field] !== '' && newInf[field] !== 0){
                  existingInf[field] = newInf[field];
                }
              });
              // Merge platforms array properly (not Object.assign which fails on arrays)
              if(Array.isArray(newInf.platforms) && newInf.platforms.length > 0){
                if(!Array.isArray(existingInf.platforms)) existingInf.platforms = [];
                newInf.platforms.forEach(p => {
                  const found = existingInf.platforms.find(ep => ep.platform_name === p.platform_name);
                  if(found){
                    // Update existing platform entry
                    Object.keys(p).forEach(k => {
                      if(p[k]) found[k] = p[k];
                    });
                  } else {
                    existingInf.platforms.push(p);
                  }
                });
              }
              stats.updated++;
            } else {
              existing.push(newInf);
              stats.added++;
            }
          } catch(e){
            stats.errors++;
            console.warn('Import row error:', e, newInf);
          }
        });
        final = existing;
      } else if(mode === 'add_only'){
        // Only add new, skip existing
        const existingIds = new Set();
        existing.forEach(e => {
          if(e.phone) existingIds.add(e.phone);
          if(e.id) existingIds.add(e.id);
        });
        newInfluencers.forEach(newInf => {
          const key = newInf.phone || newInf.id;
          if(!existingIds.has(key)){
            existing.push(newInf);
            stats.added++;
          } else {
            stats.skipped++;
          }
        });
        final = existing;
      }
      
      // SIMPLIFIED: SC.data.set now automatically migrates to IDB if quota exceeded
      // No need for manual cleanup - the storage layer handles everything
      const dataLayer = window.SC?.data;
      let saved = false;
      
      if(dataLayer?.set){
        // Use the data layer which has auto-migration to IDB on quota error
        saved = dataLayer.set('influencers', final);
      } else {
        // Fallback: direct localStorage with quota retry
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
          saved = true;
        } catch(err){
          if(err.name === 'QuotaExceededError'){
            // Aggressive cleanup
            try { localStorage.removeItem(BACKUP_KEY); } catch(_){}
            try {
              const log = JSON.parse(localStorage.getItem('sc_activity_log') || '[]');
              if(log.length > 50) localStorage.setItem('sc_activity_log', JSON.stringify(log.slice(-50)));
            } catch(_){}
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
              saved = true;
            } catch(_){
              const sizeKB = Math.round(JSON.stringify(final).length / 1024);
              return {
                ok: false,
                error: `الحجم كبير جداً (${sizeKB} KB) ولا يمكن الحفظ. تأكد من تحميل storage-manager.js.`
              };
            }
          } else {
            return { ok: false, error: err.message || 'فشل الحفظ' };
          }
        }
      }
      
      if(!saved){
        return { ok: false, error: 'فشل حفظ البيانات' };
      }
      
      logActivity('import', `تم استيراد ${stats.added + stats.updated} مؤثر`, 'influencers', stats);
      
      // Broadcast change to other tabs/components
      try {
        if(window.SC?.sync?.broadcast) window.SC.sync.broadcast('influencers', 'import', { count: final.length });
      } catch(e){}
      
      return { ok: true, stats, total: final.length };
    } catch(e){
      console.error('Import failed:', e);
      return { ok: false, error: e.message };
    }
  }
  
  // ============ SYSTEM SETTINGS (with effective changes) ============
  function getSettings(){
    try {
      return JSON.parse(localStorage.getItem('sc_settings')) || {};
    } catch(e){ return {}; }
  }
  
  function updateSettings(patch){
    try {
      const settings = getSettings();
      const updated = { ...settings, ...patch };
      localStorage.setItem('sc_settings', JSON.stringify(updated));
      
      // Apply settings to active UI
      applySettings(updated);
      
      logActivity('update', 'تم تحديث الإعدادات', 'settings', patch);
      return updated;
    } catch(e){
      console.error('Settings update failed:', e);
      return null;
    }
  }
  
  function applySettings(settings){
    // Apply theme if changed
    if(settings.theme){
      document.documentElement.setAttribute('data-theme', settings.theme);
    }
    // Apply RTL/LTR
    if(settings.language){
      const lang = settings.language === 'ar' ? 'ar' : 'en';
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    }
    // Update document title with company name
    if(settings.company_name){
      const baseTitle = document.title.split(' — ')[1] || document.title;
      document.title = settings.company_name + ' — ' + baseTitle;
    }
  }
  
  // ============ EXPORT ALL DATA (full system snapshot) ============
  function exportAllData(){
    const data = getAllData();
    const settings = getSettings();
    const stats = getDataStats();
    
    const fullExport = {
      version: '5.1.0',
      exported_at: new Date().toISOString(),
      exported_by: window.SC?.auth?.getSession()?.name || 'admin',
      stats,
      settings,
      data
    };
    
    const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().substring(0, 10);
    a.download = `smartcode-export-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logActivity('export', 'تم تصدير كامل بيانات النظام', 'all_data', { size_kb: Math.round(JSON.stringify(fullExport).length / 1024) });
    return true;
  }
  
  // ============ RESET SYSTEM ============
  function resetSystem(mode = 'demo'){
    // Always backup before reset
    createBackup(`قبل إعادة ضبط النظام (${mode})`, 'pre_restore');
    
    if(window.SC?.data?.reset){
      window.SC.data.reset(mode);
      logActivity('system', `تم إعادة ضبط النظام (${mode === 'demo' ? 'بيانات تجريبية' : 'بيانات فارغة'})`, 'system');
      return true;
    }
    return false;
  }
  
  // ============ EXPOSE ============
  window.SC = window.SC || {};
  
  // ============ CALENDAR & REMINDERS SYSTEM ============
  // نظام تقويم شخصي لكل موظف + جدولة إشعارات تلقائية
  
  /**
   * Get all calendar events for a specific user
   * Includes ads scheduled to them, plus manual events
   */
  function getCalendarEvents(userName, dateRange){
    if(!userName){
      const session = window.SC?.auth?.getSession?.();
      userName = session?.name;
    }
    if(!userName) return [];
    
    // Use SC.api if available for consistent data access
    let ads = [];
    if(window.SC?.api?.daily_ads?.list){
      ads = window.SC.api.daily_ads.list();
    } else {
      // Fallback: try multiple key prefixes
      const keys = ['sc_v5_daily_ads', 'sc_daily_ads'];
      for(const k of keys){
        const raw = localStorage.getItem(k);
        if(raw){
          try { ads = JSON.parse(raw); if(ads.length) break; } catch(e){}
        }
      }
    }
    
    const manualEvents = JSON.parse(localStorage.getItem('sc_calendar_events') || '[]');
    const events = [];
    
    // 1. Ads assigned to user → calendar events
    ads.forEach(ad => {
      const isAssigned = ad.employee_name === userName || 
                        ad.assigned_to === userName ||
                        ad.created_by === userName;
      if(!isAssigned) return;
      
      const dateStr = ad.scheduled_date || ad.ad_date;
      if(!dateStr) return;
      
      const dateTime = ad.ad_time ? `${dateStr}T${ad.ad_time}` : dateStr;
      
      events.push({
        id: 'ad-' + ad.id,
        type: 'ad',
        ad_id: ad.id,
        campaign_id: ad.campaign_id,
        title: ad.influencer_name || 'إعلان',
        subtitle: ad.campaign_name || '',
        customer_name: ad.customer_name,
        date: dateStr,
        time: ad.ad_time || null,
        dateTime: dateTime,
        status: ad.status || 'draft',
        platform: ad.platform,
        ad_type: ad.ad_type,
        assigned_to: userName,
        notes: ad.notes || '',
        url: 'campaign-detail.html?id=' + ad.campaign_id
      });
    });
    
    // 2. Manual events for this user
    manualEvents.forEach(ev => {
      if(ev.user_name === userName){
        events.push({
          id: 'event-' + ev.id,
          type: 'manual',
          ...ev,
          date: ev.date,
          time: ev.time || null,
          dateTime: ev.time ? `${ev.date}T${ev.time}` : ev.date,
          title: ev.title,
          subtitle: ev.description || '',
          assigned_to: userName
        });
      }
    });
    
    // 3. Filter by date range if provided
    if(dateRange){
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return events.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      });
    }
    
    return events.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  }
  
  /**
   * Add a manual calendar event for current user
   */
  function addCalendarEvent(event){
    const session = window.SC?.auth?.getSession?.();
    if(!session) return null;
    
    const events = JSON.parse(localStorage.getItem('sc_calendar_events') || '[]');
    const newEvent = {
      id: 'EV-' + Date.now(),
      user_name: session.name,
      user_id: session.username,
      title: event.title || 'حدث',
      description: event.description || '',
      date: event.date,
      time: event.time || null,
      type: event.type || 'meeting',
      created_at: new Date().toISOString()
    };
    events.push(newEvent);
    localStorage.setItem('sc_calendar_events', JSON.stringify(events));
    
    // Auto-schedule reminders for this event
    scheduleReminders({
      target_id: newEvent.id,
      target_type: 'event',
      target_title: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      user_name: session.name,
      user_email: session.email || ''
    });
    
    logActivity('create', `تم إضافة حدث: ${newEvent.title}`, 'calendar', { event_id: newEvent.id });
    return newEvent;
  }
  
  /**
   * Schedule reminders for an ad or event
   * Creates 3 reminders: 24h before, 1h before, at-time
   */
  function scheduleReminders(opts){
    const { target_id, target_type, target_title, date, time, user_name, user_email } = opts;
    
    if(!date || !user_name) return;
    
    const dateTime = time ? new Date(`${date}T${time}`) : new Date(date + 'T09:00');
    if(isNaN(dateTime.getTime())) return;
    
    const reminders = JSON.parse(localStorage.getItem('sc_reminders') || '[]');
    
    // Remove any existing reminders for this target (re-schedule case)
    const filtered = reminders.filter(r => r.target_id !== target_id);
    
    // Create new reminder triggers
    const triggers = [
      { type: '24h_before', offset: -24 * 60 * 60 * 1000, label: 'قبل 24 ساعة' },
      { type: '1h_before',  offset: -60 * 60 * 1000,      label: 'قبل ساعة' },
      { type: 'at_time',    offset: 0,                     label: 'الآن' }
    ];
    
    triggers.forEach(t => {
      const triggerAt = new Date(dateTime.getTime() + t.offset);
      // Only schedule future reminders
      if(triggerAt.getTime() <= Date.now()) return;
      
      filtered.push({
        id: 'REM-' + Date.now() + '-' + t.type,
        target_id,
        target_type,
        target_title,
        trigger_type: t.type,
        trigger_label: t.label,
        trigger_at: triggerAt.toISOString(),
        scheduled_for: dateTime.toISOString(),
        user_name,
        user_email,
        status: 'pending', // pending → sent → cancelled
        created_at: new Date().toISOString()
      });
    });
    
    localStorage.setItem('sc_reminders', JSON.stringify(filtered));
    return filtered.length;
  }
  
  /**
   * Get reminders for current user
   */
  function getReminders(userName, filter){
    const reminders = JSON.parse(localStorage.getItem('sc_reminders') || '[]');
    let result = reminders;
    
    if(userName){
      result = result.filter(r => r.user_name === userName);
    }
    
    if(filter === 'pending'){
      result = result.filter(r => r.status === 'pending');
    } else if(filter === 'sent'){
      result = result.filter(r => r.status === 'sent');
    } else if(filter === 'due'){
      const now = Date.now();
      result = result.filter(r => r.status === 'pending' && new Date(r.trigger_at).getTime() <= now);
    }
    
    return result.sort((a, b) => new Date(a.trigger_at) - new Date(b.trigger_at));
  }
  
  /**
   * Check for due reminders and trigger them (in-app notification + queue email)
   * Should be called periodically (every 1-5 minutes)
   */
  function processReminders(){
    const session = window.SC?.auth?.getSession?.();
    if(!session) return { processed: 0, failed: 0 };
    
    const reminders = JSON.parse(localStorage.getItem('sc_reminders') || '[]');
    const now = Date.now();
    let processed = 0;
    
    reminders.forEach(r => {
      if(r.status !== 'pending') return;
      if(r.user_name !== session.name) return;
      if(new Date(r.trigger_at).getTime() > now) return;
      
      // Trigger in-app notification
      addNotification({
        type: 'info',
        title: `تذكير: ${r.target_title}`,
        message: `موعد التنفيذ ${r.trigger_label} (${new Date(r.scheduled_for).toLocaleString('ar-SA')})`,
        link: r.target_type === 'ad' ? 'campaign-detail.html' : '#',
        reminder_id: r.id
      });
      
      // Queue email if user has email
      if(r.user_email){
        queueEmail({
          to: r.user_email,
          subject: `[Smart Code] تذكير: ${r.target_title}`,
          body: buildReminderEmailBody(r),
          reminder_id: r.id
        });
      }
      
      r.status = 'sent';
      r.sent_at = new Date().toISOString();
      processed++;
    });
    
    if(processed > 0){
      localStorage.setItem('sc_reminders', JSON.stringify(reminders));
    }
    
    return { processed, total_pending: reminders.filter(r => r.status === 'pending').length };
  }
  
  /**
   * Build HTML email body for reminder
   */
  function buildReminderEmailBody(reminder){
    const settings = getNotificationSettings();
    const companyName = settings.companyName || 'Smart Code';
    const scheduledDate = new Date(reminder.scheduled_for);
    
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px">
        <div style="background:linear-gradient(135deg,#0d8a6f,#065f46);color:#fff;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">${companyName}</h1>
          <p style="margin:8px 0 0;font-size:13px;opacity:0.9">نظام إدارة الإعلانات والحملات</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <div style="display:inline-block;background:#fef3c7;color:#92400e;padding:6px 12px;border-radius:6px;font-weight:600;font-size:12px;margin-bottom:16px">
            ${reminder.trigger_label}
          </div>
          <h2 style="margin:0 0 8px;color:#111827;font-size:18px">${reminder.target_title}</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px">موعد التنفيذ: <b>${scheduledDate.toLocaleString('ar-SA')}</b></p>
          
          <div style="background:#f9fafb;padding:16px;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:20px">
            <p style="margin:0;color:#374151;font-size:13px;line-height:1.6">
              تذكير تلقائي بموعد إعلانك المجدول. الرجاء مراجعة التفاصيل وتجهيز المحتوى قبل الموعد.
            </p>
          </div>
          
          <a href="#" style="display:inline-block;background:#0d8a6f;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            فتح النظام
          </a>
          
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:11px;margin:0">
            هذا إشعار تلقائي من ${companyName}. للتحكم في الإشعارات، انتقل للإعدادات.
          </p>
        </div>
      </div>
    `;
  }
  
  /**
   * Cancel scheduled reminders for a target (when ad is deleted/cancelled)
   */
  function cancelReminders(targetId){
    const reminders = JSON.parse(localStorage.getItem('sc_reminders') || '[]');
    let cancelled = 0;
    reminders.forEach(r => {
      if(r.target_id === targetId && r.status === 'pending'){
        r.status = 'cancelled';
        r.cancelled_at = new Date().toISOString();
        cancelled++;
      }
    });
    if(cancelled > 0){
      localStorage.setItem('sc_reminders', JSON.stringify(reminders));
    }
    return cancelled;
  }
  
  /**
   * Start auto-processor (runs every minute)
   */
  let reminderInterval = null;
  function startReminderProcessor(){
    if(reminderInterval) return;
    // Initial run
    processReminders();
    // Repeat every minute
    reminderInterval = setInterval(processReminders, 60 * 1000);
  }
  
  function stopReminderProcessor(){
    if(reminderInterval){
      clearInterval(reminderInterval);
      reminderInterval = null;
    }
  }
  
  /**
   * Email queue (for batch sending or future integration)
   */
  function queueEmail(emailData){
    const queue = JSON.parse(localStorage.getItem('sc_email_queue') || '[]');
    queue.push({
      id: 'EMAIL-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
      ...emailData,
      status: 'queued',
      queued_at: new Date().toISOString()
    });
    localStorage.setItem('sc_email_queue', JSON.stringify(queue));
    return queue[queue.length - 1];
  }
  
  function getQueuedEmails(filter){
    const queue = JSON.parse(localStorage.getItem('sc_email_queue') || '[]');
    if(filter === 'queued') return queue.filter(e => e.status === 'queued');
    if(filter === 'sent') return queue.filter(e => e.status === 'sent');
    return queue;
  }
  
  /**
   * Auto-schedule reminders for a new ad
   * Called from api.js when a new ad is created with scheduled_date
   */
  function autoScheduleAd(ad){
    if(!ad || !ad.scheduled_date && !ad.ad_date) return null;
    if(!ad.employee_name) return null;
    
    // Find user's email from users (auth system) — uses sc_users (not prefixed)
    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    const user = users.find(u => u.name === ad.employee_name);
    let userEmail = user?.email || '';
    
    // Fallback to team_members if no user found
    if(!userEmail){
      const teamMembers = JSON.parse(localStorage.getItem('sc_team_members') || '[]');
      const member = teamMembers.find(m => m.name === ad.employee_name);
      userEmail = member?.email || '';
    }
    
    const result = scheduleReminders({
      target_id: ad.id,
      target_type: 'ad',
      target_title: `${ad.influencer_name || 'إعلان'} — ${ad.campaign_name || 'حملة'}`,
      date: ad.scheduled_date || ad.ad_date,
      time: ad.ad_time,
      user_name: ad.employee_name,
      user_email: userEmail
    });
    
    return result;
  }
  
  /**
   * Auto-schedule reminders for a new task
   * Called from api.js when a new task is created with due_date
   */
  function autoScheduleTask(task){
    if(!task || !task.due_date) return null;
    if(!task.assigned_to) return null;
    
    // Find user's email
    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    const user = users.find(u => u.name === task.assigned_to);
    const userEmail = task.assigned_to_email || user?.email || '';
    
    return scheduleReminders({
      target_id: task.id,
      target_type: 'task',
      target_title: `مهمة: ${task.title}`,
      date: task.due_date,
      time: null,  // Tasks have date only, no specific time
      user_name: task.assigned_to,
      user_email: userEmail
    });
  }
  
  /**
   * Add a notification to a specific user's queue
   * Stored in user-specific localStorage key
   */
  function addNotificationForUser(userName, notif){
    if(!userName) return null;
    const key = 'sc_notifications_user_' + userName.replace(/\s+/g, '_');
    try {
      const notifications = JSON.parse(localStorage.getItem(key) || '[]');
      const newNotif = {
        id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2,5),
        timestamp: new Date().toISOString(),
        read: false,
        type: notif.type || 'info',
        title: notif.title || '',
        message: notif.message || '',
        link: notif.link || null,
        ...notif
      };
      notifications.unshift(newNotif);
      if(notifications.length > 100) notifications.length = 100;
      localStorage.setItem(key, JSON.stringify(notifications));
      
      // Also add to current user's notifications if it's them
      const session = window.SC?.auth?.getSession?.();
      if(session?.name === userName){
        addNotification(notif);
      }
      
      // Queue email for the user
      const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
      const user = users.find(u => u.name === userName);
      if(user?.email){
        queueEmail({
          to: user.email,
          subject: `[Smart Code] ${notif.title}`,
          body: buildTaskNotificationEmail(notif, userName)
        });
      }
      
      return newNotif;
    } catch(e){
      console.error('Failed to add user notification', e);
      return null;
    }
  }
  
  /**
   * Build email body for task notification
   */
  function buildTaskNotificationEmail(notif, userName){
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px">
        <div style="background:linear-gradient(135deg,#0d8a6f,#065f46);color:#fff;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:20px">Smart Code</h1>
          <p style="margin:8px 0 0;font-size:13px;opacity:0.9">نظام إدارة المهام والإسناد</p>
        </div>
        <div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb">
          <p style="color:#6b7280;font-size:13px;margin:0 0 16px">مرحباً ${userName}،</p>
          <h2 style="margin:0 0 8px;color:#111827;font-size:18px">${notif.title}</h2>
          <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px">${notif.message}</p>
          <a href="#" style="display:inline-block;background:#0d8a6f;color:#fff;padding:11px 22px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            عرض المهمة
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
          <p style="color:#9ca3af;font-size:11px;margin:0">
            هذا إشعار تلقائي. للتحكم في الإشعارات، انتقل لإعدادات حسابك.
          </p>
        </div>
      </div>
    `;
  }
  
  /**
   * Get notifications for a specific user
   */
  function getNotificationsForUser(userName){
    if(!userName) return [];
    const key = 'sc_notifications_user_' + userName.replace(/\s+/g, '_');
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return []; }
  }
  
  window.SC.system = {
    // Activity log
    logActivity,
    getActivityLog,
    clearActivityLog,
    
    // Backups
    createBackup,
    getBackups,
    getBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    uploadBackup,
    
    // Auto-backup
    getAutoBackupSettings,
    setAutoBackupSettings,
    checkAndRunAutoBackup,
    
    // Data management
    getAllData,
    getDataStats,
    importInfluencers,
    parseInfluencersExcel,
    exportAllData,
    resetSystem,
    
    // Settings (with effects)
    getSettings,
    updateSettings,
    applySettings,
    
    // Notifications
    getNotificationSettings,
    setNotificationSettings,
    getNotifications,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications,
    getUnreadCount,
    sendTestNotification,
    getEmailQueue,
    
    // Calendar & Reminders (NEW)
    getCalendarEvents,
    addCalendarEvent,
    scheduleReminders,
    autoScheduleAd,
    autoScheduleTask,
    addNotificationForUser,
    getNotificationsForUser,
    getReminders,
    processReminders,
    cancelReminders,
    startReminderProcessor,
    stopReminderProcessor,
    queueEmail,
    getQueuedEmails
  };
  
  // Apply settings on load
  try {
    const settings = getSettings();
    if(Object.keys(settings).length > 0) applySettings(settings);
  } catch(e){}
  
  // Auto-start reminder processor for logged-in users
  try {
    if(window.SC?.auth?.getSession?.()){
      startReminderProcessor();
    }
  } catch(e){}
  
  window.SC_DEBUG&&console.log('Smart Code System module loaded');
})();
