/* ═══════════════════════════════════════════════════════════════════════
   Smart Code — Backend API Adapter (طبقة ربط الواجهة بـ Laravel)
   جسر تدريجي: يعمل بعلَم تشغيل (feature flag). افتراضياً متوقّف،
   فيبقى النظام يعمل على localStorage حتى يُفعَّل الـBackend.
   عند التفعيل: مصادقة JWT + نداءات API حقيقية + حالات تحميل/خطأ/إعادة محاولة.
   ═══════════════════════════════════════════════════════════════════════ */
(function (window) {
  'use strict';
  const SC = window.SC = window.SC || {};

  const CFG = {
    BASE: (function () { try { return localStorage.getItem('sc_api_base') || ''; } catch (e) { return ''; } })(), // مثال: https://api.smartcode.sa
    TOKEN_KEY: 'sc_api_token',
    PORTAL_TOKEN_KEY: 'sc_portal_token',
    FLAG_KEY: 'sc_use_backend',
    TIMEOUT: 15000,
    RETRIES: 2,
  };

  const backend = {
    enabled() { try { return localStorage.getItem(CFG.FLAG_KEY) === '1' && !!CFG.BASE; } catch (e) { return false; } },
    enable(base) { try { if (base) localStorage.setItem('sc_api_base', base); localStorage.setItem(CFG.FLAG_KEY, '1'); CFG.BASE = base || CFG.BASE; } catch (e) {} },
    disable() { try { localStorage.setItem(CFG.FLAG_KEY, '0'); } catch (e) {} },
    base() { return CFG.BASE; },

    getToken() { try { return localStorage.getItem(CFG.TOKEN_KEY); } catch (e) { return null; } },
    setToken(t) { try { t ? localStorage.setItem(CFG.TOKEN_KEY, t) : localStorage.removeItem(CFG.TOKEN_KEY); } catch (e) {} },
    getPortalToken() { try { return localStorage.getItem(CFG.PORTAL_TOKEN_KEY); } catch (e) { return null; } },
    setPortalToken(t) { try { t ? localStorage.setItem(CFG.PORTAL_TOKEN_KEY, t) : localStorage.removeItem(CFG.PORTAL_TOKEN_KEY); } catch (e) {} },
  };

  /* ── عميل HTTP مع مهلة + إعادة محاولة + توحيد الأخطاء ── */
  async function request(method, path, body, opts) {
    opts = opts || {};
    const url = (CFG.BASE || '') + '/api/v1' + path;
    const headers = { 'Accept': 'application/json' };
    if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const tok = backend.getToken();
    if (tok && !opts.portal) headers['Authorization'] = 'Bearer ' + tok;
    if (opts.portal) headers['X-Portal-Token'] = opts.portalToken || backend.getPortalToken() || '';

    let attempt = 0, lastErr;
    while (attempt <= CFG.RETRIES) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), opts.timeout || CFG.TIMEOUT);
      try {
        const res = await fetch(url, {
          method, headers, signal: ctrl.signal,
          body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        });
        clearTimeout(timer);
        const text = await res.text();
        let data; try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
        if (!res.ok) {
          const err = new Error((data && data.message) || ('HTTP ' + res.status));
          err.status = res.status; err.data = data;
          // 401 → جلسة منتهية
          if (res.status === 401 && !opts.portal) backend.setToken(null);
          // 4xx لا تُعاد المحاولة عليها (عدا 408/429)
          if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) throw err;
          lastErr = err;
        } else {
          return data;
        }
      } catch (e) {
        clearTimeout(timer);
        lastErr = e;
        if (e.status && e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 429) throw e;
      }
      attempt++;
      if (attempt <= CFG.RETRIES) await new Promise(r => setTimeout(r, 400 * attempt)); // backoff
    }
    throw lastErr || new Error('تعذّر الاتصال بالخادم');
  }

  SC.http = {
    get: (p, o) => request('GET', p, null, o),
    post: (p, b, o) => request('POST', p, b, o),
    put: (p, b, o) => request('PUT', p, b, o),
    del: (p, o) => request('DELETE', p, null, o),
  };

  /* ── مصادقة ── */
  backend.login = async function (username, password) {
    const data = await SC.http.post('/auth/login', { username, password });
    const tok = data && (data.access_token || data.token);
    if (tok) backend.setToken(tok);
    if (data && data.user) { try { localStorage.setItem('sc_api_user', JSON.stringify(data.user)); } catch (e) {} }
    return data;
  };
  backend.logout = async function () { try { await SC.http.post('/auth/logout'); } catch (e) {} backend.setToken(null); try { localStorage.removeItem('sc_api_user'); } catch (e) {} };
  backend.me = () => SC.http.get('/auth/me');
  backend.user = function () { try { return JSON.parse(localStorage.getItem('sc_api_user') || 'null'); } catch (e) { return null; } };
  backend.role = function () { const u = backend.user(); return u ? u.role : null; };
  backend.portalLogin = async function (code) {
    const data = await SC.http.post('/portal/login', {}, { portal: true, portalToken: code });
    if (data && data.user) backend.setPortalToken(code);
    return data;
  };

  /* ── حماية الصفحات حسب الدور (من الخادم: التوكن + الدور المخزّن) ── */
  SC.guard = {
    requirePage(allowedRoles) {
      if (!backend.enabled()) return true; // الوضع المحلي: الحماية عبر SC.auth
      const tok = backend.getToken();
      if (!tok) { SC.guard._toLogin(); return false; }
      if (Array.isArray(allowedRoles) && allowedRoles.length) {
        const role = backend.role();
        if (role && role !== 'super_admin' && !allowedRoles.includes(role)) {
          try { document.body.innerHTML = '<div style="padding:60px;text-align:center;font-family:system-ui;direction:rtl"><h2>غير مصرّح</h2><p style="color:#64748b">دورك لا يملك صلاحية هذه الصفحة.</p><a href="dashboard.html">العودة للوحة التحكم</a></div>'; } catch (e) {}
          return false;
        }
      }
      return true;
    },
    _toLogin() { try { const rt = encodeURIComponent(location.pathname.split('/').pop()); location.href = 'login.html?returnTo=' + rt; } catch (e) {} },
  };

  /* ── الترطيب: جلب البيانات من الـAPI إلى مخزن SC.data ليقرأها العرض الحالي ──
     يُبقي localStorage كـ cache عرض فقط؛ مصدر الحقيقة هو الـAPI. */
  SC.remote = {
    // يجلب قائمة من endpoint ويكتبها في مخزن SC.data تحت storeKey
    async hydrate(storeKey, endpoint, mapFn) {
      const res = await SC.http.get(endpoint);
      // استجابة Laravel: إمّا paginate {data:[...]} أو مصفوفة مباشرة أو {data:[...]}
      let rows = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : (res && res.data && Array.isArray(res.data.data) ? res.data.data : []));
      if (mapFn) rows = rows.map(mapFn);
      try {
        if (window.SC.data && typeof window.SC.data.set === 'function') {
          await window.SC.data.set(storeKey, rows);
        }
      } catch (e) {}
      return rows;
    },
    get: (endpoint) => SC.http.get(endpoint),
    create: (endpoint, body) => SC.http.post(endpoint, body),
    update: (endpoint, body) => SC.http.put(endpoint, body),
    remove: (endpoint) => SC.http.del(endpoint),
  };

  /* ── مثال ربط مورد (نمط يُعمَّم على بقية الموارد) ──
     يُظهر حالات: تحميل/خطأ/فارغ/إعادة محاولة. */
  SC.backendRequests = {
    list: (params) => SC.http.get('/requests' + (params ? ('?' + new URLSearchParams(params)) : '')),
    get: (id) => SC.http.get('/requests/' + id),
    create: (payload) => SC.http.post('/requests', payload),
    update: (id, patch) => SC.http.put('/requests/' + id, patch),
    remove: (id) => SC.http.del('/requests/' + id),
  };

  /* ── مساعدات حالات الواجهة (تحميل/خطأ/إعادة محاولة) ── */
  SC.ui = SC.ui || {};
  SC.uiState = {
    loading(el, msg) { if (el) el.innerHTML = '<div style="padding:30px;text-align:center;color:#94a3b8"><div class="sc-spinner" style="width:26px;height:26px;border:3px solid #e2e8f0;border-top-color:#0d8a6f;border-radius:50%;margin:0 auto 10px;animation:scspin .8s linear infinite"></div>' + (msg || 'جاري التحميل…') + '</div>'; },
    error(el, msg, retryFn) {
      if (!el) return;
      el.innerHTML = '<div style="padding:28px;text-align:center;color:#dc2626"><div style="font-weight:800;margin-bottom:6px">تعذّر تحميل البيانات</div><div style="font-size:12.5px;color:#64748b">' + (msg || '') + '</div><button id="sc-retry" style="margin-top:14px;padding:9px 18px;background:#0d8a6f;color:#fff;border:none;border-radius:9px;font-weight:700;cursor:pointer">إعادة المحاولة</button></div>';
      const b = el.querySelector('#sc-retry'); if (b && retryFn) b.onclick = retryFn;
    },
    empty(el, msg) { if (el) el.innerHTML = '<div style="padding:36px;text-align:center;color:#94a3b8;font-size:13px">' + (msg || 'لا بيانات') + '</div>'; },
  };
  // حقن أنيميشن الدوّار مرة واحدة
  try { if (!document.getElementById('sc-spin-style')) { const st = document.createElement('style'); st.id = 'sc-spin-style'; st.textContent = '@keyframes scspin{to{transform:rotate(360deg)}}'; document.head.appendChild(st); } } catch (e) {}

  SC.backend = backend;
  // إشعار التهيئة (للتشخيص)
  try { if (backend.enabled()) console.log('SC backend adapter: ON →', CFG.BASE); } catch (e) {}
})(window);
