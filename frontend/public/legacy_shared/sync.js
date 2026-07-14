/* ===========================================================================
   Smart Code — Sync Layer (v1.0)
   ===========================================================================
   نظام مزامنة موحّد يضمن أن كل التعديلات تنعكس فوراً على:
   - كل التابات في نفس المتصفح (via BroadcastChannel)
   - كل الأجهزة المتصلة (via Cloud API or shared backend)
   - عبر إعادة التحميل (via localStorage cache)
   
   آلية العمل:
   1. كل عملية CRUD تُسجّل في "operations log" مع timestamp + device_id
   2. عند أي تغيير، يُبث event عبر BroadcastChannel للتابات الأخرى
   3. كل X ثانية، يُرفع log التغييرات للسيرفر (إذا متاح)
   4. كل X ثانية، يُسحب log التغييرات من السيرفر ويُدمج
   5. عند تعارض، last-write-wins بناءً على timestamp
   ============================================================================ */

(function(){
  'use strict';
  
  // === Configuration ===
  const SYNC_CONFIG = {
    deviceId: null,            // يُولّد تلقائياً
    channelName: 'sc-sync',    // BroadcastChannel name
    opsLogKey: 'sc_ops_log',   // المفتاح لـ operations log
    lastSyncKey: 'sc_last_sync',
    maxOpsLog: 300,            // أقصى عدد عمليات في الـ log (مخفّف لتفادي تجاوز التخزين)
    syncInterval: 5000,        // كل 5 ثواني
    cloudEnabled: false,       // عند توفر backend
    cloudEndpoint: null        // URL للـ API
  };
  
  // === Generate or retrieve device ID ===
  function getDeviceId(){
    let id = localStorage.getItem('sc_device_id');
    if(!id){
      id = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('sc_device_id', id);
    }
    return id;
  }
  
  SYNC_CONFIG.deviceId = getDeviceId();
  
  // === BroadcastChannel for cross-tab sync ===
  let channel = null;
  try {
    if(typeof BroadcastChannel !== 'undefined'){
      channel = new BroadcastChannel(SYNC_CONFIG.channelName);
    }
  } catch(e){
    console.warn('BroadcastChannel not supported');
  }
  
  // === Operations Log (records every change) ===
  // Strip heavy/base64 fields so the sync log never bloats localStorage
  const HEAVY_FIELDS = ['file_data','file_content','base64','data_url','dataUrl','thumbnail','preview','logo_data','image_data'];
  function stripHeavy(record){
    if(!record || typeof record !== 'object') return record;
    try {
      const clone = Array.isArray(record) ? record.slice() : Object.assign({}, record);
      for(const k in clone){
        if(HEAVY_FIELDS.indexOf(k) > -1){ clone[k] = '[omitted]'; continue; }
        const v = clone[k];
        if(typeof v === 'string' && v.length > 2000){ clone[k] = '[omitted:'+v.length+']'; }
        else if(v && typeof v === 'object'){ clone[k] = stripHeavy(v); }
      }
      return clone;
    } catch(e){ return { _id: record && record.id }; }
  }
  
  function getOpsLog(){
    try {
      return JSON.parse(localStorage.getItem(SYNC_CONFIG.opsLogKey) || '[]');
    } catch(e){ return []; }
  }
  
  function setOpsLog(log){
    // Trim if exceeds max
    if(log.length > SYNC_CONFIG.maxOpsLog){
      log = log.slice(-SYNC_CONFIG.maxOpsLog);
    }
    // Quota-resilient write: on overflow, trim aggressively and retry; never throw
    let attempt = log;
    for(let i = 0; i < 5; i++){
      try {
        localStorage.setItem(SYNC_CONFIG.opsLogKey, JSON.stringify(attempt));
        return;
      } catch(e){
        // QuotaExceededError — drop oldest half and retry
        if(attempt.length > 20){ attempt = attempt.slice(Math.floor(attempt.length/2)); }
        else { try { localStorage.removeItem(SYNC_CONFIG.opsLogKey); } catch(_){} return; }
      }
    }
  }
  
  function logOperation(op){
    const log = getOpsLog();
    log.push({
      ...op,
      device_id: SYNC_CONFIG.deviceId,
      timestamp: op.timestamp || new Date().toISOString(),
      id: 'op_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8)
    });
    setOpsLog(log);
    return log[log.length - 1];
  }
  
  // === Notify other tabs of changes ===
  function broadcast(type, payload){
    if(!channel) return;
    try {
      channel.postMessage({
        type: type,
        payload: payload,
        device_id: SYNC_CONFIG.deviceId,
        timestamp: new Date().toISOString()
      });
    } catch(e){ console.warn('Broadcast failed:', e); }
  }
  
  // === Listen for changes from other tabs ===
  const listeners = new Set();
  
  function onSync(callback){
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
  
  function notifyListeners(event){
    listeners.forEach(cb => {
      try { cb(event); }
      catch(e){ console.warn('Sync listener error:', e); }
    });
  }
  
  if(channel){
    channel.onmessage = function(e){
      const msg = e.data;
      // Ignore our own messages
      if(msg.device_id === SYNC_CONFIG.deviceId) return;
      
      window.SC_DEBUG&&console.log('[Sync] Received from other tab:', msg.type);
      notifyListeners(msg);
    };
  }
  
  // === Listen for localStorage changes from other tabs (legacy) ===
  window.addEventListener('storage', function(e){
    if(!e.key) return;
    if(!e.key.startsWith('sc_')) return;
    
    // Notify listeners about external change
    notifyListeners({
      type: 'storage_change',
      key: e.key,
      newValue: e.newValue,
      oldValue: e.oldValue,
      timestamp: new Date().toISOString()
    });
  });
  
  // === Cloud sync (when backend available) ===
  let syncInProgress = false;
  
  async function pushToCloud(){
    if(!SYNC_CONFIG.cloudEnabled || !SYNC_CONFIG.cloudEndpoint) return;
    if(syncInProgress) return;
    syncInProgress = true;
    
    try {
      const lastSync = localStorage.getItem(SYNC_CONFIG.lastSyncKey) || '0';
      const log = getOpsLog().filter(op => op.timestamp > lastSync);
      if(log.length === 0){ syncInProgress = false; return; }
      
      const response = await fetch(SYNC_CONFIG.cloudEndpoint + '/sync/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: SYNC_CONFIG.deviceId,
          operations: log
        })
      });
      
      if(response.ok){
        localStorage.setItem(SYNC_CONFIG.lastSyncKey, new Date().toISOString());
      }
    } catch(e){
      console.warn('[Sync] Cloud push failed:', e);
    } finally {
      syncInProgress = false;
    }
  }
  
  async function pullFromCloud(){
    if(!SYNC_CONFIG.cloudEnabled || !SYNC_CONFIG.cloudEndpoint) return;
    if(syncInProgress) return;
    syncInProgress = true;
    
    try {
      const lastSync = localStorage.getItem(SYNC_CONFIG.lastSyncKey) || '0';
      const response = await fetch(
        SYNC_CONFIG.cloudEndpoint + '/sync/pull?since=' + encodeURIComponent(lastSync) + '&device_id=' + SYNC_CONFIG.deviceId
      );
      
      if(response.ok){
        const data = await response.json();
        if(data.operations && data.operations.length > 0){
          // Apply remote operations
          data.operations.forEach(op => {
            notifyListeners({ type: 'remote_op', payload: op });
          });
        }
      }
    } catch(e){
      console.warn('[Sync] Cloud pull failed:', e);
    } finally {
      syncInProgress = false;
    }
  }
  
  // === Periodic sync ===
  let syncTimer = null;
  
  function startSync(){
    if(syncTimer) return;
    syncTimer = setInterval(() => {
      pushToCloud();
      pullFromCloud();
    }, SYNC_CONFIG.syncInterval);
  }
  
  function stopSync(){
    if(syncTimer){
      clearInterval(syncTimer);
      syncTimer = null;
    }
  }
  
  // === Configure cloud endpoint (called by app if backend available) ===
  function configureCloud(endpoint){
    SYNC_CONFIG.cloudEnabled = !!endpoint;
    SYNC_CONFIG.cloudEndpoint = endpoint;
    if(endpoint) startSync();
    else stopSync();
  }
  
  // === Public API ===
  window.SC = window.SC || {};
  window.SC.sync = {
    deviceId: SYNC_CONFIG.deviceId,
    
    // Log a CRUD operation
    logOperation: logOperation,
    
    // Get all logged operations
    getOpsLog: getOpsLog,
    
    // Clear ops log
    clearOpsLog: function(){
      localStorage.removeItem(SYNC_CONFIG.opsLogKey);
    },
    
    // Notify other tabs about a change
    broadcast: broadcast,
    
    // Subscribe to changes from other tabs/devices
    onSync: onSync,
    
    // Configure cloud sync
    configureCloud: configureCloud,
    
    // Manual sync trigger
    sync: async function(){
      await pushToCloud();
      await pullFromCloud();
    },
    
    // Check if cloud is enabled
    isCloudEnabled: () => SYNC_CONFIG.cloudEnabled,
    
    // Notify about a local change (called by api.js)
    notifyChange: function(table, action, recordId, record){
      // Never store heavy blobs (base64 files) in the sync log — they live in the entity store only
      const slim = stripHeavy(record);
      const op = logOperation({
        table: table,
        action: action,  // 'create', 'update', 'delete'
        record_id: recordId,
        record: slim
      });
      
      // Broadcast to OTHER tabs via BroadcastChannel
      broadcast('data_change', {
        table: table,
        action: action,
        record_id: recordId,
        record: slim,
        op_id: op.id
      });
      
      // Dispatch IN-TAB event for sidebar/page refresh
      // (ui.js listens for this and auto-refreshes badges)
      try {
        window.dispatchEvent(new CustomEvent('sc:data:change', {
          detail: { key: table, action: action, recordId: recordId, timestamp: Date.now() }
        }));
      } catch(e){}
      
      return op;
    }
  };
  
  // One-time repair: shrink any already-bloated ops log (strip heavy fields + trim)
  (function repairOpsLog(){
    try {
      const raw = localStorage.getItem(SYNC_CONFIG.opsLogKey);
      if(!raw) return;
      if(raw.length < 400000){ return; } // only act when it's large (~400KB+)
      let log = [];
      try { log = JSON.parse(raw) || []; } catch(e){ localStorage.removeItem(SYNC_CONFIG.opsLogKey); return; }
      log = log.slice(-SYNC_CONFIG.maxOpsLog).map(op => {
        if(op && op.record) op.record = stripHeavy(op.record);
        return op;
      });
      setOpsLog(log);
    } catch(e){ try { localStorage.removeItem(SYNC_CONFIG.opsLogKey); } catch(_){} }
  })();
  
  window.SC_DEBUG&&console.log('[Sync] Initialized — Device ID:', SYNC_CONFIG.deviceId);
})();
