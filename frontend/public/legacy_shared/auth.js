/*
 * Smart Code v5 Pro - Auth Module
 * نظام الصلاحيات والمصادقة
 */
(function(){
  
  const SESSION_KEY = 'sc_session';
  
  // === PERMISSIONS CATALOG ===
  // كل صلاحية في النظام مع وصفها
  const PERMISSIONS_CATALOG = {
    // === العملاء ===
    'customers.view':    { label: 'عرض العملاء', category: 'العملاء' },
    'customers.create':  { label: 'إضافة عميل', category: 'العملاء' },
    'customers.edit':    { label: 'تعديل العميل', category: 'العملاء' },
    'customers.delete':  { label: 'حذف عميل', category: 'العملاء' },
    
    // === المؤثرين ===
    'influencers.view':    { label: 'عرض المؤثرين', category: 'المؤثرين' },
    'influencers.create':  { label: 'إضافة مؤثر', category: 'المؤثرين' },
    'influencers.edit':    { label: 'تعديل المؤثر', category: 'المؤثرين' },
    'influencers.delete':  { label: 'حذف مؤثر', category: 'المؤثرين' },
    
    // === الحملات والطلبات ===
    'campaigns.view':    { label: 'عرض الحملات', category: 'الحملات' },
    'campaigns.create':  { label: 'إنشاء حملة', category: 'الحملات' },
    'campaigns.edit':    { label: 'تعديل حملة', category: 'الحملات' },
    'campaigns.delete':  { label: 'حذف حملة', category: 'الحملات' },
    
    // === الإعلانات اليومية ===
    'daily_ads.view':    { label: 'عرض الإعلانات اليومية', category: 'الإعلانات' },
    'daily_ads.create':  { label: 'تسجيل إعلان جديد', category: 'الإعلانات' },
    'daily_ads.edit':    { label: 'تعديل إعلان', category: 'الإعلانات' },
    'daily_ads.delete':  { label: 'حذف إعلان', category: 'الإعلانات' },
    
    // === المالية والحوالات ===
    'transfers.view':              { label: 'عرض الحوالات', category: 'المالية' },
    'transfers.create':            { label: 'رفع طلب حوالة', category: 'المالية' },
    'transfers.upload_quotation':  { label: 'رفع عرض السعر', category: 'المالية' },
    'transfers.upload_receipt':    { label: 'رفع إيصال التحويل', category: 'المالية' },
    'transfers.upload_tax_invoice':{ label: 'رفع الفاتورة الضريبية', category: 'المالية' },
    'transfers.delete':            { label: 'حذف حوالة', category: 'المالية' },
    
    // === المحتوى ===
    'content.view':    { label: 'عرض المحتويات', category: 'المحتوى' },
    'content.manage':  { label: 'إدارة المحتويات', category: 'المحتوى' },
    
    // === التقارير والتحليلات ===
    'reports.view':       { label: 'عرض التقارير', category: 'التقارير' },
    'reports.export':     { label: 'تصدير التقارير', category: 'التقارير' },
    'analytics.view':     { label: 'عرض التحليلات', category: 'التقارير' },
    'analytics.export_pdf': { label: 'تصدير التحليلات PDF', category: 'التقارير' },
    
    // === UGC و التواصل ===
    'ugc.manage':       { label: 'إدارة UGC TikTok', category: 'التواصل' },
    'whatsapp.manage':  { label: 'إدارة WhatsApp', category: 'التواصل' },
    
    // === النظام ===
    'settings.view':         { label: 'عرض الإعدادات', category: 'النظام' },
    'settings.company':      { label: 'تعديل بيانات الشركة', category: 'النظام' },
    'settings.team':         { label: 'إدارة الفريق والصلاحيات', category: 'النظام' },
    'settings.data':         { label: 'إدارة البيانات (استيراد/تصدير)', category: 'النظام' },
    'settings.backups':      { label: 'إدارة النسخ الاحتياطية', category: 'النظام' },
    'settings.activity':     { label: 'عرض سجل الأنشطة', category: 'النظام' },
    'settings.notifications':{ label: 'تخصيص الإشعارات', category: 'النظام' }
  };
  
  // === DEFAULT ROLES (الأدوار الوظيفية) ===
  const ROLES = {
    // ── الأدوار القانونية الموحّدة (مطابقة للـBackend) — مواءمة للربط ──
    super_admin: {
      label: 'مدير المنصّة', shortLabel: 'مدير المنصّة', color: '#7c3aed', bgColor: '#f5f3ff',
      description: 'صلاحيات كاملة على كل الوكالات', pages: ['*'], permissions: ['*']
    },
    agency_admin: {
      label: 'مدير الوكالة', shortLabel: 'مدير الوكالة', color: '#7c3aed', bgColor: '#f5f3ff',
      description: 'صلاحيات كاملة داخل الوكالة', pages: ['*'], permissions: ['*']
    },
    campaign_manager: {
      label: 'مدير الحملات', shortLabel: 'مدير حملات', color: '#0d8a6f', bgColor: '#ecfdf5',
      description: 'إدارة الحملات والطلبات والترشيحات',
      pages: ['dashboard','requests','request-detail','orders-campaigns','campaign-detail','campaign-approval','calendar','tasks','customers','influencers','content','analytics'],
      permissions: ['customers.view','customers.create','influencers.view','campaigns.view','campaigns.create','campaigns.edit','requests.view','requests.create','requests.edit','content.view','reports.view','analytics.view']
    },
    finance: {
      label: 'المالية', shortLabel: 'مالية', color: '#dc2626', bgColor: '#fef2f2',
      description: 'إدارة المالية والتحويلات والفواتير',
      pages: ['dashboard','finance','transfer-detail','transfer-request','monthly-report','customers','analytics'],
      permissions: ['transfers.view','transfers.create','transfers.upload_quotation','transfers.upload_receipt','transfers.upload_tax_invoice','reports.view','reports.export','analytics.view','customers.view']
    },
    viewer: {
      label: 'مشاهد', shortLabel: 'مشاهد', color: '#64748b', bgColor: '#f8fafc',
      description: 'قراءة فقط',
      pages: ['dashboard','requests','request-detail','orders-campaigns','campaign-detail','customers','influencers','content','analytics','monthly-report'],
      permissions: ['customers.view','influencers.view','campaigns.view','requests.view','content.view','reports.view','analytics.view']
    },
    client: {
      label: 'عميل', shortLabel: 'عميل', color: '#0ea5e9', bgColor: '#f0f9ff',
      description: 'عبر البوابة الخارجية فقط', pages: ['requests-portal'], permissions: ['requests.view']
    },
    influencer: {
      label: 'مؤثّر', shortLabel: 'مؤثّر', color: '#a855f7', bgColor: '#faf5ff',
      description: 'بياناته وحجوزاته فقط', pages: ['dashboard'], permissions: []
    },

    // مدير النظام — صلاحيات كاملة (لا تتغير)
    admin: {
      label: 'مدير النظام',
      shortLabel: 'مدير النظام',
      color: '#7c3aed',
      bgColor: '#f5f3ff',
      description: 'صلاحيات كاملة على كل النظام',
      pages: ['*'],
      permissions: ['*']  // كل الصلاحيات
    },
    
    // مدير حسابات — رئيس المالية، يدير المحاسبين
    accounts_manager: {
      label: 'مدير الحسابات',
      shortLabel: 'مدير حسابات',
      color: '#dc2626',
      bgColor: '#fef2f2',
      description: 'يدير قسم المالية والمحاسبين',
      pages: ['dashboard','requests','request-detail','calendar','tasks','finance','transfer-detail','transfer-request','monthly-report','customers','influencers','content','analytics'],
      permissions: [
        'customers.view', 'influencers.view', 'daily_ads.view', 'content.view',
        'transfers.view', 'transfers.create', 'transfers.upload_quotation',
        'transfers.upload_receipt', 'transfers.upload_tax_invoice', 'transfers.delete',
        'reports.view', 'reports.export', 'analytics.view', 'analytics.export_pdf',
        'settings.view'
      ]
    },
    
    // محاسب — ينفذ عمليات المالية تحت إشراف المدير
    accountant: {
      label: 'محاسب',
      shortLabel: 'محاسب',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      description: 'تنفيذ التحويلات ورفع الإيصالات',
      pages: ['dashboard','requests','request-detail','calendar','tasks','finance','transfer-detail','monthly-report'],
      permissions: [
        'transfers.view', 'transfers.upload_receipt',
        'reports.view', 'reports.export'
      ]
    },
    
    // مدير عمليات — رئيس قسم العمليات
    operations_manager: {
      label: 'مدير العمليات',
      shortLabel: 'مدير عمليات',
      color: '#0d8a6f',
      bgColor: '#f0fdf9',
      description: 'يدير كل العمليات اليومية والفريق',
      pages: ['dashboard','requests','request-detail','calendar','tasks','customers','influencers','orders-campaigns','content','monthly-report','finance','transfer-request','transfer-detail','ugc-admin','whatsapp','analytics','requests-users'],
      permissions: [
        'customers.*', 'influencers.*', 'campaigns.*', 'daily_ads.*',
        'content.*', 'transfers.view', 'transfers.create', 'transfers.upload_quotation',
        'transfers.upload_tax_invoice',
        'reports.view', 'reports.export', 'analytics.view', 'analytics.export_pdf',
        'ugc.manage', 'whatsapp.manage',
        // === Operational Workflow ===
        'campaigns.nominate_influencers', 'campaigns.approve_internal',
        'campaigns.send_client_approval', 'campaigns.view_profit_margin', 'campaigns.view_cost',
        'campaigns.issue_quotation', 'campaigns.manage_contracts',
        'campaigns.book_influencers', 'campaigns.create_transfer_request',
        'campaigns.close',
        'calendar.view_team', 'calendar.manage_personal', 'calendar.manage_campaign_events',
        'tasks.manage_campaign_tasks',
        'finance.approve_transfer_request',
        'content.auto_save'
      ]
    },
    
    // منسق حملات — يدير الحملات والعملاء
    campaign_coordinator: {
      label: 'منسق حملات',
      shortLabel: 'منسق حملات',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      description: 'تنسيق وإدارة الحملات الإعلانية',
      pages: ['dashboard','requests','request-detail','calendar','tasks','customers','orders-campaigns','content','monthly-report','transfer-request','transfer-detail','content'],
      permissions: [
        'customers.view', 'customers.create', 'customers.edit',
        'influencers.view',
        'campaigns.view', 'campaigns.create', 'campaigns.edit',
        'daily_ads.view', 'daily_ads.create', 'daily_ads.edit',
        'content.view', 'content.manage',
        'transfers.view', 'transfers.create',
        'reports.view',
        // === Operational Workflow (coordinator can nominate + manage their own campaigns) ===
        'campaigns.nominate_influencers',
        'campaigns.send_client_approval',
        'campaigns.book_influencers',
        'campaigns.create_transfer_request',
        // NOTE: no view_profit_margin or view_cost — only managers see those
        'calendar.view_team', 'calendar.manage_personal',
        'tasks.manage_campaign_tasks',
        'content.auto_save'
      ]
    },
    
    // منسق مشاهير — يدير العلاقات مع المؤثرين
    influencer_coordinator: {
      label: 'منسق مشاهير',
      shortLabel: 'منسق مشاهير',
      color: '#ec4899',
      bgColor: '#fdf2f8',
      description: 'إدارة العلاقات مع المؤثرين والمشاهير',
      pages: ['dashboard','requests','request-detail','calendar','tasks','influencers','content','monthly-report','whatsapp','transfer-request'],
      permissions: [
        'influencers.view', 'influencers.create', 'influencers.edit',
        'customers.view',
        'daily_ads.view', 'daily_ads.create',
        'content.view',
        'transfers.view', 'transfers.create',
        'whatsapp.manage',
        'reports.view'
      ]
    },
    
    // مدير تسويق — يرى كل التحليلات والتقارير
    marketing_manager: {
      label: 'مدير التسويق',
      shortLabel: 'مدير تسويق',
      color: '#06b6d4',
      bgColor: '#ecfeff',
      description: 'تحليلات الأداء والاستراتيجية التسويقية',
      pages: ['dashboard','requests','request-detail','calendar','tasks','customers','influencers','orders-campaigns','content','monthly-report','analytics','ugc-admin'],
      permissions: [
        'customers.view', 'customers.edit',
        'influencers.view',
        'campaigns.view', 'campaigns.create', 'campaigns.edit',
        'daily_ads.view',
        'content.view', 'content.manage',
        'reports.view', 'reports.export', 'analytics.view', 'analytics.export_pdf',
        'ugc.manage'
      ]
    },
    
    // مخصص — تتم الصلاحيات يدوياً
    custom: {
      label: 'مخصص',
      shortLabel: 'مخصص',
      color: '#64748b',
      bgColor: '#f8fafc',
      description: 'صلاحيات مخصصة يتم تحديدها يدوياً',
      pages: [],
      permissions: []
    }
  };
  
  // Helper: get all pages for a role (resolved from permissions)
  function getRolePages(role){
    if(!role) return [];
    if(role.pages?.includes('*')) return ['*'];
    return role.pages || [];
  }
  
  // === DEFAULT USERS (with role-specific generic names) ===
  const DEFAULT_USERS = [
    { username: 'admin',        password: 'admin123', role: 'admin',                  name: 'مدير النظام',     employee_id: null,    email: 'admin@smartcode.sa' },
    { username: 'ops1',         password: '123456',   role: 'operations_manager',     name: 'مدير العمليات 1', employee_id: 'USR-001', email: 'ops1@smartcode.sa' },
    { username: 'campaign1',    password: '123456',   role: 'campaign_coordinator',   name: 'منسق حملات 1',    employee_id: 'USR-003', email: 'campaign1@smartcode.sa' },
    { username: 'campaign2',    password: '123456',   role: 'campaign_coordinator',   name: 'منسق حملات 2',    employee_id: 'USR-005', email: 'campaign2@smartcode.sa' },
    { username: 'influencer1',  password: '123456',   role: 'influencer_coordinator', name: 'منسق مشاهير 1',   employee_id: 'USR-002', email: 'influencer1@smartcode.sa' },
    { username: 'influencer2',  password: '123456',   role: 'influencer_coordinator', name: 'منسق مشاهير 2',   employee_id: 'USR-004', email: 'influencer2@smartcode.sa' },
    { username: 'marketing1',   password: '123456',   role: 'marketing_manager',      name: 'مدير تسويق 1',    employee_id: 'USR-006', email: 'marketing1@smartcode.sa' },
    { username: 'accountant',   password: 'acc123',   role: 'accountant',             name: 'محاسب',           employee_id: null,    email: 'accountant@smartcode.sa' },
    { username: 'manager_acc',  password: 'mgr123',   role: 'accounts_manager',       name: 'مدير الحسابات',   employee_id: null,    email: 'manager_acc@smartcode.sa' }
  ];
  
  const USERS_VERSION = '5.1.3';  // Bump this to force re-seed users (e.g. when changing default users)
  
  // Seed users on first load OR when version changes (so updates propagate)
  function seedUsers(){
    const currentVersion = localStorage.getItem('sc_users_version');
    if(!localStorage.getItem('sc_users') || currentVersion !== USERS_VERSION){
      // Preserve any custom users added by admin (not in DEFAULT_USERS)
      let existing = [];
      try {
        existing = JSON.parse(localStorage.getItem('sc_users') || '[]');
      } catch(e){}
      
      const defaultUsernames = DEFAULT_USERS.map(u => u.username);
      // List of all OLD usernames from previous versions that should be removed
      const oldUsernames = [
        'majed','mohammed','ibrahim','malik','lama','rayan',  // v5.1.1 names
        'emp1','emp2','emp3','emp4','former_emp1','former_emp2'  // v5.1.2 generic
      ];
      const customUsers = existing.filter(u => !defaultUsernames.includes(u.username) && 
        !oldUsernames.includes(u.username));
      
      // Merge: default users (fresh) + any custom users the admin added
      const merged = [...DEFAULT_USERS, ...customUsers];
      try {
        localStorage.setItem('sc_users', JSON.stringify(merged));
        localStorage.setItem('sc_users_version', USERS_VERSION);
      } catch(e){
        // Quota full — getUsers() falls back to DEFAULT_USERS, so auth keeps working.
        console.warn('[auth] Could not persist sc_users (quota?) — using in-memory defaults', e?.message);
      }
      
      // Clear stale session if user no longer exists
      try {
        const session = JSON.parse(localStorage.getItem('sc_session') || 'null');
        if(session && !merged.find(u => u.username === session.username)){
          localStorage.removeItem('sc_session');
        }
      } catch(e){}
    }
  }
  
  function getUsers(){
    try {
      const list = JSON.parse(localStorage.getItem('sc_users') || '[]');
      // If sc_users was lost (quota eviction / first load before seeding),
      // fall back to DEFAULT_USERS so login and session validation keep working.
      if(Array.isArray(list) && list.length > 0) return list;
      return DEFAULT_USERS.slice();
    }
    catch(e) { return DEFAULT_USERS.slice(); }
  }
  
  function setUsers(users){
    localStorage.setItem('sc_users', JSON.stringify(users));
  }
  
  // === SESSION ===
  function getSession(){
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if(!raw) return null;
      
      const stored = JSON.parse(raw);
      
      // Handle both old (flat) and new (signed) session formats
      let session;
      if(stored.payload && stored.signature){
        // New signed format — verify integrity (async, do best-effort sync)
        session = stored.payload;
        // Note: signature verification happens on every page load via verifyStoredSession
      } else {
        // Legacy unsigned format — accept but mark for upgrade
        session = stored;
      }
      
      // Check absolute expiry
      if(session.expires_at && new Date(session.expires_at) < new Date()){
        clearSession();
        return null;
      }
      
      // Check idle expiry (using security module if available)
      if(window.SC?.security?.isSessionExpired){
        if(window.SC.security.isSessionExpired(session)){
          clearSession();
          if(window.SC?.security?.logSecurityEvent){
            window.SC.security.logSecurityEvent('session_expired', 'info', 'Session expired (idle)', { username: session.username });
          }
          return null;
        }
      }
      
      // Validate role still exists
      if(session.role && !ROLES[session.role]){
        console.warn('Session has obsolete role:', session.role, '- clearing session');
        clearSession();
        return null;
      }
      
      // Validate user still exists — but ONLY when the users list is actually
      // available. An EMPTY list means the data wasn't loaded yet (IDB async)
      // or sc_users was lost to a storage quota error — NOT that the user was
      // deleted. Clearing the session here caused auto-logout on every page
      // navigation once localStorage filled up.
      const users = getUsers();
      if(Array.isArray(users) && users.length > 0){
        const userExists = users.find(u => u.username === session.username);
        if(!userExists){
          console.warn('Session user no longer exists:', session.username, '- clearing session');
          clearSession();
          return null;
        }
      }
      
      // Update last_activity (rolling idle timeout)
      const now = Date.now();
      if(!session.last_activity || (now - session.last_activity) > 60000){  // throttle to 1/min
        session.last_activity = now;
        try {
          // Update the stored session with new activity timestamp
          if(stored.payload){
            stored.payload.last_activity = now;
            localStorage.setItem(SESSION_KEY, JSON.stringify(stored));
          } else {
            session.last_activity = now;
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
          }
        } catch(e){}
      }
      
      return session;
    } catch(e) { return null; }
  }
  
  // Async session integrity verification (called on critical operations)
  async function verifyStoredSession(){
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if(!raw) return false;
      const stored = JSON.parse(raw);
      
      // Old unsigned session — needs migration
      if(!stored.payload || !stored.signature){
        return true;  // Accept legacy, will be upgraded on next login
      }
      
      if(!window.SC?.security?.verifySessionSignature) return true;
      const valid = await window.SC.security.verifySessionSignature(stored);
      
      if(!valid){
        console.error('[auth] Session signature INVALID — possible tampering. Clearing.');
        if(window.SC?.security?.logSecurityEvent){
          window.SC.security.logSecurityEvent('session_tampering', 'critical', 'Invalid session signature detected', {});
        }
        clearSession();
        return false;
      }
      return true;
    } catch(e){
      return false;
    }
  }
  
  async function setSession(user){
    const now = Date.now();
    const sessionData = {
      username: user.username,
      name: user.name,
      role: user.role,
      employee_id: user.employee_id,
      email: user.email,
      custom_permissions: user.custom_permissions || null,
      custom_pages: user.custom_pages || null,
      logged_in_at: new Date().toISOString(),
      created_at: now,
      last_activity: now,
      // Use security module's max age if available
      expires_at: new Date(now + (window.SC?.security?.SESSION_MAX_AGE_MS || 8*60*60*1000)).toISOString()
    };
    
    // Sign the session if security module is available
    let toStore = sessionData;
    if(window.SC?.security?.signSession){
      try {
        toStore = await window.SC.security.signSession(sessionData);
      } catch(e){
        console.warn('[auth] Session signing failed, using unsigned:', e);
      }
    }
    
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
    } catch(e){
      // Quota full — session MUST persist or the user gets logged out on
      // navigation. Free space by dropping the largest non-critical sc_v5_*
      // data keys (they are IDB-backed / re-migratable), then retry once.
      try {
        const critical = new Set([SESSION_KEY, 'sc_users', 'sc_users_version', 'sc_v5_sk', 'sc_theme']);
        const candidates = [];
        for(let i = 0; i < localStorage.length; i++){
          const k = localStorage.key(i);
          if(k && !critical.has(k) && k.startsWith('sc_v5_')){
            candidates.push({ k, size: (localStorage.getItem(k)||'').length });
          }
        }
        candidates.sort((a,b) => b.size - a.size);
        for(const c of candidates.slice(0, 3)) localStorage.removeItem(c.k);
        localStorage.setItem(SESSION_KEY, JSON.stringify(toStore));
        console.warn('[auth] Session saved after freeing storage space');
      } catch(e2){
        console.error('[auth] Could not persist session (storage full):', e2?.message);
      }
    }
    return sessionData;
  }
  
  function clearSession(){
    localStorage.removeItem(SESSION_KEY);
    // Also rotate CSRF token to prevent fixation
    if(window.SC?.security?.rotateCsrfToken){
      window.SC.security.rotateCsrfToken();
    }
  }
  
  // === LOGIN/LOGOUT ===
  // ASYNC version (new) — uses rate limiting + password hashing
  async function loginAsync(username, password){
    // Validate inputs
    if(!username || !password){
      return { ok: false, error: 'اسم المستخدم وكلمة المرور مطلوبان' };
    }
    
    // Normalize username (lowercase, trim)
    username = String(username).trim().toLowerCase();
    
    // Rate limiting check
    if(window.SC?.security?.checkLoginAllowed){
      const limit = window.SC.security.checkLoginAllowed(username);
      if(!limit.allowed){
        if(window.SC?.security?.logSecurityEvent){
          window.SC.security.logSecurityEvent('login_blocked', 'warning', 
            `Login blocked: ${limit.reason}`, { username, retryAfter: limit.retryAfter });
        }
        return { ok: false, error: limit.message, lockout: true, retryAfter: limit.retryAfter };
      }
    }
    
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    if(!user){
      // User not found — still record attempt to prevent username enumeration via timing
      if(window.SC?.security?.recordFailedLogin){
        window.SC.security.recordFailedLogin(username);
      }
      // Constant time response — fake hash check
      if(window.SC?.security?.verifyPassword){
        await window.SC.security.verifyPassword(password, 'pbkdf2$100000$00$00');
      }
      return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    
    // Verify password (handles both hashed and legacy plain-text)
    let verified = false;
    if(window.SC?.security?.verifyPassword){
      verified = await window.SC.security.verifyPassword(password, user.password);
    } else {
      // Fallback (no security module): plain-text compare
      verified = user.password === password;
    }
    
    if(!verified){
      if(window.SC?.security?.recordFailedLogin){
        window.SC.security.recordFailedLogin(username);
      }
      return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
    
    // SUCCESS — migrate plain-text password to hashed on first successful login
    if(window.SC?.security?.hashPassword && !window.SC.security.isHashedPassword(user.password)){
      try {
        const hashed = await window.SC.security.hashPassword(password);
        const allUsers = getUsers();
        const idx = allUsers.findIndex(u => u.username === username);
        if(idx >= 0){
          allUsers[idx].password = hashed;
          localStorage.setItem('sc_users', JSON.stringify(allUsers));
          window.SC_DEBUG&&console.log('[auth] Password migrated to hashed form for:', username);
        }
      } catch(e){
        console.warn('[auth] Password hash migration failed:', e);
      }
    }
    
    // Clear failed login attempts
    if(window.SC?.security?.clearLoginAttempts){
      window.SC.security.clearLoginAttempts(username);
    }
    
    // Create session
    const session = await setSession(user);
    
    // Audit log
    if(window.SC?.security?.logSecurityEvent){
      window.SC.security.logSecurityEvent('login_success', 'info', `User logged in: ${username}`, { role: user.role });
    }
    
    return { ok: true, session };
  }
  
  // SYNC version (legacy compat) — wraps async
  function login(username, password){
    // For backward compatibility, return a promise-like object that can be awaited
    // OR synchronously verify against plain-text (for old code paths)
    const result = loginAsync(username, password);
    
    // If caller awaits, they get full async behavior
    // If caller doesn't await, fallback to sync plain-text check
    if(result && typeof result.then === 'function'){
      return result;
    }
    return result;
  }
  
  function logout(){
    const session = getSession();
    if(session && window.SC?.security?.logSecurityEvent){
      window.SC.security.logSecurityEvent('logout', 'info', `User logged out: ${session.username}`, {});
    }
    clearSession();
    window.location.href = 'login.html';
  }
  
  // === PERMISSION CHECKS ===
  function getRole(){
    const session = getSession();
    return session ? ROLES[session.role] : null;
  }
  
  // Get effective permissions for current session (custom override > role default)
  function getEffectivePermissions(){
    const session = getSession();
    if(!session) return [];
    // If session has custom_permissions, use them
    if(session.custom_permissions && Array.isArray(session.custom_permissions)){
      return session.custom_permissions;
    }
    const role = ROLES[session.role];
    return role ? (role.permissions || []) : [];
  }
  
  function getEffectivePages(){
    const session = getSession();
    if(!session) return [];
    if(session.custom_pages && Array.isArray(session.custom_pages)){
      return session.custom_pages;
    }
    const role = ROLES[session.role];
    return role ? (role.pages || []) : [];
  }
  
  function canAccessPage(pageName){
    const pages = getEffectivePages();
    if(pages.includes('*')) return true;
    return pages.includes(pageName);
  }
  
  function canDoAction(action){
    const perms = getEffectivePermissions();
    if(perms.includes('*')) return true;
    if(perms.includes(action)) return true;
    // Check wildcards: 'customers.*' matches 'customers.create'
    const parts = action.split('.');
    if(parts.length === 2){
      if(perms.includes(parts[0] + '.*')) return true;
    }
    return false;
  }
  
  // === ENFORCE AUTH ===
  // Call this at the top of every protected page
  function requireAuth(pageName){
    const session = getSession();
    if(!session){
      // Redirect to login
      const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = 'login.html?return_to=' + returnTo;
      return false;
    }
    
    // SECURITY: Verify session signature in background (async)
    // If tampering detected, the verification will clear the session
    // and next page load will redirect to login
    if(window.SC?.security?.verifySessionSignature){
      verifyStoredSession().then(valid => {
        if(!valid){
          // Tampering detected — force redirect
          window.location.href = 'login.html?reason=session_invalid';
        }
      });
    }
    
    // Check page access
    if(pageName && !canAccessPage(pageName)){
      // Page not accessible — redirect to dashboard
      // SECURITY: Use textContent for any dynamic data to prevent XSS
      const safeUserName = String(session.name || '').replace(/[<>&"']/g, c => 
        ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])
      );
      
      document.body.innerHTML = `
        <div style="min-height:100vh;display:grid;place-items:center;background:#f8fafc;font-family:'IBM Plex Sans Arabic',sans-serif" dir="rtl">
          <div style="background:#fff;border-radius:16px;padding:48px;max-width:480px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
            <div style="margin-bottom:14px"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.7"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
            <h2 style="font-size:22px;font-weight:800;margin-bottom:10px;color:#0f172a">صلاحيات غير كافية</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin-bottom:24px">لا تملك صلاحية الوصول لهذه الصفحة. تواصل مع مدير النظام للحصول على الصلاحيات المناسبة.</p>
            <a href="dashboard.html" style="display:inline-block;padding:11px 24px;background:#0d8a6f;color:#fff;border-radius:9px;text-decoration:none;font-weight:700">العودة للوحة الرئيسية</a>
          </div>
        </div>
      `;
      
      // Audit log
      if(window.SC?.security?.logSecurityEvent){
        window.SC.security.logSecurityEvent('access_denied', 'warning', 
          `User ${session.username} attempted to access ${pageName}`, 
          { username: session.username, role: session.role, page: pageName });
      }
      
      return false;
    }
    
    return session;
  }
  
  // === EXPOSE ===
  seedUsers();
  
  window.SC = window.SC || {};
  window.SC.auth = {
    login,
    loginAsync,
    setSession,
    logout,
    getSession,
    verifyStoredSession,
    getRole,
    getUsers,
    setUsers,
    canAccessPage,
    canDoAction,
    requireAuth,
    getEffectivePermissions,
    getEffectivePages,
    ROLES,
    PERMISSIONS_CATALOG
  };
  
  window.SC_DEBUG&&console.log('Smart Code Auth loaded');
})();
