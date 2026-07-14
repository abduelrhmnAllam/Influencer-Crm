/* ===========================================================
   SMART CODE — Shared Helpers
   دوال مساعدة (تنسيق، تواريخ، إشعارات، الخ)
   =========================================================== */

(function(window){
'use strict';

window.SC = window.SC || {};

const helpers = {
  
  /* ====== Number formatting (English digits) ====== */
  
  formatNumber: function(n, decimals){
    if(n === null || n === undefined || isNaN(n)) return '0';
    const num = Number(n);
    if(decimals !== undefined){
      return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    return num.toLocaleString('en-US');
  },
  
  // Compact format: 1500 → 1.5K, 1500000 → 1.5M
  formatCompact: function(n){
    if(n === null || n === undefined || isNaN(n)) return '0';
    const num = Number(n);
    const abs = Math.abs(num);
    if(abs >= 1000000000) return (num/1000000000).toFixed(1).replace(/\.0$/,'') + 'B';
    if(abs >= 1000000) return (num/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
    if(abs >= 1000) return (num/1000).toFixed(1).replace(/\.0$/,'') + 'K';
    return String(Math.round(num));
  },
  
  formatMoney: function(amount, currency){
    if(amount === null || amount === undefined || isNaN(amount)) return '0 SAR';
    const num = Number(amount);
    const cur = currency || 'SAR';
    return num.toLocaleString('en-US') + ' ' + cur;
  },
  
  formatMoneyShort: function(amount){
    if(amount === null || amount === undefined || isNaN(amount)) return '0';
    const n = Number(amount);
    if(n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,'') + 'M';
    if(n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/,'') + 'K';
    return String(Math.round(n));
  },
  
  formatPercent: function(n, decimals){
    if(n === null || n === undefined) return '0%';
    if(decimals !== undefined) return Number(n).toFixed(decimals) + '%';
    return Math.round(Number(n)) + '%';
  },
  
  /* ════════════ UNIFIED VAT (ضريبة القيمة المضافة) — single source ════════════
     Default KSA rate 15%. mode: 'inclusive' (المبلغ شامل الضريبة) | 'exclusive' (غير شامل).
     Returns the full breakdown used everywhere amounts appear. */
  VAT_RATE: 15,
  vat: function(amount, mode, rate){
    const a = Number(amount) || 0;
    const r = (rate === undefined || rate === null) ? (this.VAT_RATE || 15) : Number(rate);
    let net, tax, gross;
    if(mode === 'exclusive'){            // المُدخل قبل الضريبة → نضيف الضريبة
      net = a; tax = a * r / 100; gross = net + tax;
    } else {                              // الافتراضي: شامل الضريبة → نستخرج الضريبة
      gross = a; net = a / (1 + r/100); tax = gross - net;
    }
    return {
      rate: r, mode: mode || 'inclusive',
      net: Math.round(net*100)/100,       // قبل الضريبة
      tax: Math.round(tax*100)/100,       // قيمة الضريبة
      gross: Math.round(gross*100)/100,   // الإجمالي شامل الضريبة
      transfer: Math.round(gross*100)/100 // المطلوب تحويله (شامل الضريبة)
    };
  },
  /** Compact HTML breakdown box — shows net · tax · gross · transfer */
  vatBreakdownHTML: function(amount, mode, rate){
    const b = this.vat(amount, mode, rate);
    const m = n => (Number(n)||0).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
    const row = (l,v,strong,color) => `<div style="display:flex;justify-content:space-between;padding:5px 0;${strong?'border-top:1px solid var(--border);margin-top:3px;padding-top:7px':''}"><span style="font-size:12px;color:${color||'var(--text-2)'};font-weight:${strong?800:600}">${l}</span><span style="font-family:var(--font-mono,monospace);font-size:${strong?13.5:12.5}px;font-weight:${strong?800:700};color:${color||'var(--text)'}">${m(v)} ر.س</span></div>`;
    return `<div class="sc-vat-box" style="background:var(--surface-2,#f8fafc);border:1px solid var(--border,#e2e8f0);border-radius:10px;padding:11px 14px">
      ${row('المبلغ قبل الضريبة', b.net)}
      ${row('ضريبة القيمة المضافة ('+b.rate+'%)', b.tax, false, '#d97706')}
      ${row('الإجمالي شامل الضريبة', b.gross, true)}
      ${row('المبلغ المطلوب تحويله', b.transfer, true, '#0d8a6f')}
    </div>`;
  },
  /** Reusable VAT input control: amount field + inclusive/exclusive toggle + live breakdown.
      Returns { html, attach(container)->{getValue()} }. Use in any money modal. */
  vatField: function(opts){
    opts = opts || {};
    const id = 'vat_'+Math.random().toString(36).slice(2,8);
    const initMode = opts.mode || 'inclusive';
    const initAmount = opts.amount != null ? opts.amount : '';
    const rate = opts.rate != null ? opts.rate : (this.VAT_RATE || 15);
    const label = opts.label || 'المبلغ (ر.س)';
    const html = `<div class="sc-vatfield" data-vat="${id}">
      <label style="display:block;font-size:12.5px;font-weight:700;color:var(--text-2);margin-bottom:6px">${label}</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:9px">
        <button type="button" class="vat-mode" data-mode="inclusive" data-for="${id}" style="flex:1;min-width:130px;padding:9px;border-radius:9px;border:1.5px solid ${initMode==='inclusive'?'#0d8a6f':'var(--border)'};background:${initMode==='inclusive'?'#0d8a6f':'var(--surface)'};color:${initMode==='inclusive'?'#fff':'var(--text-2)'};font-family:inherit;font-weight:700;font-size:12px;cursor:pointer">شامل الضريبة</button>
        <button type="button" class="vat-mode" data-mode="exclusive" data-for="${id}" style="flex:1;min-width:130px;padding:9px;border-radius:9px;border:1.5px solid ${initMode==='exclusive'?'#0d8a6f':'var(--border)'};background:${initMode==='exclusive'?'#0d8a6f':'var(--surface)'};color:${initMode==='exclusive'?'#fff':'var(--text-2)'};font-family:inherit;font-weight:700;font-size:12px;cursor:pointer">غير شامل الضريبة</button>
      </div>
      <input type="number" class="vat-amount" data-for="${id}" value="${initAmount}" placeholder="0" min="0" step="0.01" style="width:100%;box-sizing:border-box;padding:11px 14px;border:1px solid var(--border);border-radius:10px;font-family:inherit;font-size:14px;margin-bottom:10px">
      <input type="hidden" class="vat-mode-val" data-for="${id}" value="${initMode}">
      <input type="hidden" class="vat-rate-val" data-for="${id}" value="${rate}">
      <div class="vat-breakdown" data-for="${id}">${this.vatBreakdownHTML(initAmount||0, initMode, rate)}</div>
    </div>`;
    const self = this;
    function attach(root){
      root = root || document;
      const wrap = root.querySelector('[data-vat="'+id+'"]') || root;
      const amountEl = wrap.querySelector('.vat-amount');
      const modeEl = wrap.querySelector('.vat-mode-val');
      const rateEl = wrap.querySelector('.vat-rate-val');
      const bd = wrap.querySelector('.vat-breakdown');
      function refresh(){ bd.innerHTML = self.vatBreakdownHTML(Number(amountEl.value)||0, modeEl.value, Number(rateEl.value)||15); }
      amountEl.addEventListener('input', refresh);
      wrap.querySelectorAll('.vat-mode').forEach(b => b.addEventListener('click', () => {
        modeEl.value = b.dataset.mode;
        wrap.querySelectorAll('.vat-mode').forEach(x => {
          const on = x.dataset.mode === b.dataset.mode;
          x.style.background = on ? '#0d8a6f' : 'var(--surface)';
          x.style.color = on ? '#fff' : 'var(--text-2)';
          x.style.borderColor = on ? '#0d8a6f' : 'var(--border)';
        });
        refresh();
      }));
      return {
        getValue(){
          const amt = Number(amountEl.value)||0;
          const mode = modeEl.value;
          const b = self.vat(amt, mode, Number(rateEl.value)||15);
          return { input: amt, mode, rate: b.rate, net: b.net, tax: b.tax, gross: b.gross, transfer: b.transfer, amount: b.gross };
        }
      };
    }
    return { html, attach, id };
  },
  
  /* ====== Date formatting — All English ====== */
  
  formatDate: function(dateStr, opts){
    if(!dateStr) return '';
    try{
      const d = new Date(dateStr);
      if(isNaN(d)) return dateStr;
      
      const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      
      if(opts === 'short'){
        // 15 Jun 2026
        return d.getDate() + ' ' + MONTHS_EN[d.getMonth()] + ' ' + d.getFullYear();
      }
      if(opts === 'time'){
        const h = d.getHours();
        const m = String(d.getMinutes()).padStart(2,'0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return h12 + ':' + m + ' ' + ampm;
      }
      if(opts === 'full'){
        // Sun, 15 Jun 2026
        return DAYS_EN[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS_EN[d.getMonth()] + ' ' + d.getFullYear();
      }
      if(opts === 'datetime'){
        // 15 Jun 2026, 9:30 PM
        return d.getDate() + ' ' + MONTHS_EN[d.getMonth()] + ' ' + d.getFullYear() + ', ' + helpers.formatDate(dateStr, 'time');
      }
      // Default: 15 Jun 2026
      return d.getDate() + ' ' + MONTHS_EN[d.getMonth()] + ' ' + d.getFullYear();
    }catch(e){ return dateStr; }
  },
  
  relativeTime: function(dateStr){
    if(!dateStr) return '';
    try{
      const d = new Date(dateStr);
      if(isNaN(d)) return dateStr;
      const now = new Date();
      const diff = Math.floor((now - d) / 1000); // seconds
      
      if(diff < 60) return 'الآن';
      if(diff < 3600) return 'منذ ' + Math.floor(diff/60) + ' دقيقة';
      if(diff < 86400) return 'منذ ' + Math.floor(diff/3600) + ' ساعة';
      if(diff < 604800) return 'منذ ' + Math.floor(diff/86400) + ' يوم';
      if(diff < 2592000) return 'منذ ' + Math.floor(diff/604800) + ' أسبوع';
      return helpers.formatDate(dateStr);
    }catch(e){ return dateStr; }
  },
  
  /* ====== Avatar initial ====== */
  
  getInitial: function(name){
    if(!name) return '?';
    const t = String(name).trim();
    return t.charAt(0);
  },
  
  getAvatarColors: function(seed){
    const colors = [
      ['#0d8a6f','#047857'],['#7c3aed','#5b21b6'],['#ec4899','#9d174d'],
      ['#0891b2','#0e7490'],['#f59e0b','#dc2626'],['#16a34a','#15803d'],
      ['#3b82f6','#1e40af'],['#a855f7','#7e22ce'],['#06b6d4','#0891b2']
    ];
    let hash = 0;
    const s = String(seed||'X');
    for(let i=0; i<s.length; i++) hash = (hash*31 + s.charCodeAt(i)) | 0;
    return colors[Math.abs(hash) % colors.length];
  },
  
  /* ====== Status labels ====== */
  
  statusLabels: {
    // Customer
    active: 'نشط',
    inactive: 'غير نشط',
    
    // Campaign
    new: 'جديد',
    screening: 'قيد الترشيح',
    pending_client: 'بانتظار العميل',
    approved: 'موافقة',
    executing: 'قيد التنفيذ',
    rejected: 'مرفوض',
    completed: 'مكتمل',
    
    // Transfer
    pending: 'بانتظار التأكيد',
    quote_sent: 'عرض السعر مُرسل',
    confirmed: 'المالية أكّدت',
    receipt: 'إيصال مرفوع',
    tax_invoice: 'فاتورة ضريبية',
    
    // Common
    draft: 'مسودة',
    live: 'مباشر',
    review: 'مراجعة',
    scheduled: 'مجدول',
    reviewing: 'قيد المراجعة'
  },
  
  statusClass: function(status){
    return 'st-' + (status||'').replace(/[^a-z_]/g,'');
  },
  
  /* ====== Toast Notifications ====== */
  
  toast: function(message, type){
    type = type || 'success'; // success, error, info, warning
    let container = document.getElementById('sc-toast-container');
    if(!container){
      container = document.createElement('div');
      container.id = 'sc-toast-container';
      container.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none';
      document.body.appendChild(container);
    }
    
    const colors = {
      success: { bg:'#ecfdf5', border:'#a7f3d0', text:'#065f46', icon:'OK' },
      error:   { bg:'#fef2f2', border:'#fecaca', text:'#7f1d1d', icon:'X' },
      info:    { bg:'#eff6ff', border:'#bfdbfe', text:'#1e40af', icon:'ℹ' },
      warning: { bg:'#fffbeb', border:'#fde68a', text:'#78350f', icon:'!' }
    };
    const c = colors[type] || colors.success;
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events:auto;
      background:${c.bg};
      border:1px solid ${c.border};
      color:${c.text};
      padding:11px 16px;
      border-radius:10px;
      font-family:'IBM Plex Sans Arabic',system-ui,sans-serif;
      font-size:13.5px;
      font-weight:500;
      box-shadow:0 8px 24px rgba(15,23,42,.08);
      display:flex;
      align-items:center;
      gap:9px;
      min-width:240px;
      max-width:380px;
      animation:sc-toast-in .25s ease;
    `;
    // SECURITY: Use DOM API (textContent) instead of innerHTML to prevent XSS
    // Even if 'message' contains malicious HTML, it will be displayed as plain text
    const iconSpan = document.createElement('span');
    iconSpan.style.cssText = 'font-weight:700;font-size:16px';
    iconSpan.textContent = c.icon;  // c.icon is a controlled constant (✓ ✕ etc.) — safe
    
    const msgSpan = document.createElement('span');
    msgSpan.textContent = String(message);  // XSS-safe: textContent escapes everything
    
    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    container.appendChild(toast);
    
    // Auto-dismiss
    setTimeout(() => {
      toast.style.animation = 'sc-toast-out .2s ease forwards';
      setTimeout(() => toast.remove(), 200);
    }, 3000);
  },
  
  /* ====== Confirm dialog ====== */
  
  confirm: function(message, opts){
    opts = opts || {};
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:10000;display:grid;place-items:center;padding:20px;font-family:inherit';
      overlay.innerHTML = `
        <div style="background:#fff;border-radius:14px;padding:24px;max-width:420px;width:100%;box-shadow:0 24px 48px rgba(0,0,0,.15);text-align:center">
          <div style="margin-bottom:14px">${opts.icon ? `<div style="font-size:42px">${opts.icon}</div>` : '<svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.85"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'}</div>
          <h3 style="font-family:'Plus Jakarta Sans','IBM Plex Sans Arabic',sans-serif;font-size:18px;font-weight:700;margin-bottom:6px">${opts.title || 'تأكيد'}</h3>
          <p style="color:#475569;font-size:13.5px;line-height:1.6;margin-bottom:18px">${message}</p>
          <div style="display:flex;gap:8px;justify-content:center">
            <button class="sc-cancel" style="padding:9px 18px;border-radius:9px;border:1px solid #e5e9ee;background:#fff;font-family:inherit;font-size:13px;font-weight:600;color:#475569;cursor:pointer">${opts.cancelText || 'إلغاء'}</button>
            <button class="sc-ok" style="padding:9px 18px;border-radius:9px;border:none;background:${opts.danger ? '#dc2626' : '#0d8a6f'};color:#fff;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer">${opts.okText || 'تأكيد'}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      const cleanup = (result) => {
        document.body.removeChild(overlay);
        resolve(result);
      };
      overlay.querySelector('.sc-cancel').addEventListener('click', () => cleanup(false));
      overlay.querySelector('.sc-ok').addEventListener('click', () => cleanup(true));
      overlay.addEventListener('click', e => { if(e.target === overlay) cleanup(false); });
    });
  },
  
  /* ====== Modal helper ====== */
  
  modal: function(html, opts){
    opts = opts || {};
    return new Promise(resolve => {
      // Detect dark mode
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const bg     = isDark ? '#161b22' : '#ffffff';
      const border = isDark ? '#30363d' : '#e2e8f0';
      const text   = isDark ? '#f0f6fc' : '#0f172a';
      const text2  = isDark ? '#c9d1d9' : '#475569';
      const surf2  = isDark ? '#21262d' : '#f8fafc';
      
      // Normalize width: accept number, "380", "380px", etc.
      let widthVal = opts.width;
      if(typeof widthVal === 'number') widthVal = widthVal + 'px';
      else if(typeof widthVal === 'string'){
        if(!widthVal.endsWith('px') && !widthVal.endsWith('%') && !widthVal.endsWith('vw')) widthVal = widthVal + 'px';
      }
      else widthVal = '480px'; // Sensible default — compact
      
      const overlay = document.createElement('div');
      overlay.className = 'sc-modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:10000;display:grid;place-items:center;padding:16px;overflow:auto;font-family:inherit;animation:sc-fade-in .18s ease;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)';
      
      const box = document.createElement('div');
      box.className = 'sc-modal-box';
      box.setAttribute('lang', 'en-US');
      box.style.cssText = `background:${bg};border:1px solid ${border};border-radius:12px;max-width:${widthVal};width:100%;max-height:88vh;overflow:hidden;box-shadow:0 16px 48px rgba(0,0,0,.35);animation:sc-modal-in .22s ease;display:flex;flex-direction:column`;
      
      // Header — compact with bold X button
      const headerHtml = opts.title ? `
        <div style="padding:11px 14px 11px 11px;border-bottom:1px solid ${border};display:flex;align-items:center;justify-content:space-between;gap:10px;background:${surf2};flex-shrink:0">
          <h3 style="margin:0;font-size:13.5px;font-weight:700;color:${text};font-family:inherit;letter-spacing:-0.2px">${opts.title}</h3>
          <button class="sc-modal-close-x" type="button" aria-label="إغلاق" style="width:28px;height:28px;border-radius:7px;background:${isDark?'#30363d':'#f1f5f9'};border:1px solid ${border};color:${isDark?'#e6edf3':'#0f172a'};cursor:pointer;display:grid;place-items:center;font-family:inherit;transition:all .12s;padding:0">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ` : '';
      
      // Body
      const bodyHtml = `<div class="sc-modal-body" lang="en-US" style="padding:14px 16px;overflow-y:auto;flex:1;color:${text};font-size:13px">${html}</div>`;
      
      // Footer
      const okText = opts.okText !== undefined ? opts.okText : null;
      const cancelText = opts.cancelText !== undefined ? opts.cancelText : null;
      const danger = opts.danger;
      const kindBg = k => k==='danger' ? '#dc2626' : k==='ghost' ? 'transparent' : '#0d8a6f';
      const kindFg = k => k==='ghost' ? text2 : '#fff';
      const kindBd = k => k==='ghost' ? border : 'transparent';
      const actionsHtml = (Array.isArray(opts.actions) && opts.actions.length) ? `
        <div style="padding:10px 14px;border-top:1px solid ${border};display:flex;align-items:center;gap:7px;justify-content:flex-end;background:${surf2};flex-shrink:0">
          ${opts.actions.map((a,i) => `<button class="sc-modal-action" data-act="${i}" type="button" style="padding:7px 16px;background:${kindBg(a.kind)};border:1px solid ${kindBd(a.kind)};color:${kindFg(a.kind)};border-radius:7px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer">${a.label}</button>`).join('')}
        </div>` : '';
      const footerHtml = actionsHtml || ((okText || cancelText) ? `
        <div style="padding:10px 14px;border-top:1px solid ${border};display:flex;align-items:center;gap:7px;justify-content:flex-end;background:${surf2};flex-shrink:0">
          ${cancelText ? `<button class="sc-modal-cancel" type="button" style="padding:7px 16px;background:transparent;border:1px solid ${border};color:${text2};border-radius:7px;font-family:inherit;font-size:12.5px;font-weight:600;cursor:pointer">${cancelText}</button>` : ''}
          ${okText ? `<button class="sc-modal-ok" type="button" style="padding:7px 16px;background:${danger?'#dc2626':'#0d8a6f'};border:none;color:#fff;border-radius:7px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 1px 4px rgba(${danger?'220,38,38':'13,138,111'},0.3)">${okText}</button>` : ''}
        </div>
      ` : '');
      
      box.innerHTML = headerHtml + bodyHtml + footerHtml;
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      
      const close = (result) => {
        overlay.style.animation = 'sc-fade-out .14s ease forwards';
        document.removeEventListener('keydown', escHandler);
        setTimeout(() => {
          if(overlay.parentNode) overlay.parentNode.removeChild(overlay);
          resolve(result);
        }, 140);
      };
      
      box._close = close;
      
      overlay.addEventListener('click', e => { if(e.target === overlay) close(null); });
      const xBtn = box.querySelector('.sc-modal-close-x');
      if(xBtn){
        xBtn.addEventListener('click', () => close(null));
        xBtn.addEventListener('mouseenter', () => { xBtn.style.background = isDark ? '#3d444c' : '#e2e8f0'; });
        xBtn.addEventListener('mouseleave', () => { xBtn.style.background = isDark ? '#30363d' : '#f1f5f9'; });
      }
      box.querySelector('.sc-modal-cancel')?.addEventListener('click', () => close(null));
      
      box.querySelector('.sc-modal-ok')?.addEventListener('click', async () => {
        if(opts.onOk){
          const result = await opts.onOk(box);
          if(result !== false) close(true);
        } else {
          close(true);
        }
      });
      
      // actions[] support — each button's onClick may return false to stay open
      box.querySelectorAll('.sc-modal-action').forEach(btn => {
        btn.addEventListener('click', async () => {
          const a = opts.actions[+btn.dataset.act];
          if(!a) return;
          if(typeof a.onClick === 'function'){
            const r = await a.onClick(box, close);
            if(r !== false) close(r);
          } else { close(null); }
        });
      });
      
      const escHandler = e => { if(e.key === 'Escape'){ close(null); } };
      document.addEventListener('keydown', escHandler);
      
      // Fix date inputs and replace native date with custom
      setTimeout(() => {
        if(window.SC?.ui?.fixDateInputs) window.SC.ui.fixDateInputs();
        if(window.SC?.ui?.upgradeDateInputs) window.SC.ui.upgradeDateInputs(box);
      }, 30);
      
      if(opts.onMount) opts.onMount(box, close);
      
      return close;
    });
  },
  
  /* ====== Query string ====== */
  
  getQueryParam: function(name){
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(name);
    if(raw === null) return null;
    
    // SECURITY: For common ID parameters, validate format strictly
    // Prevents injection of malicious content via URL manipulation
    if(name === 'id' && window.SC?.security?.isValidId){
      return window.SC.security.isValidId(raw) ? raw : null;
    }
    
    // For other params, basic safety check (no control chars, max 500 chars)
    if(raw.length > 500) return null;
    if(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(raw)) return null;
    
    return raw;
  },
  
  // Get a strictly validated query param (use for IDs and structured data)
  getValidQueryParam: function(name, type){
    if(window.SC?.security?.getValidParam){
      return window.SC.security.getValidParam(name, type);
    }
    return this.getQueryParam(name);
  },
  
  setQueryParam: function(name, value){
    const url = new URL(window.location.href);
    if(value === null || value === '' || value === undefined){
      url.searchParams.delete(name);
    } else {
      url.searchParams.set(name, value);
    }
    window.history.replaceState({}, '', url);
  },
  
  /* ====== Debounce ====== */
  
  debounce: function(fn, wait){
    let t;
    return function(){
      const args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(ctx, args), wait);
    };
  },
  
  /* ====== Download as file ====== */
  
  downloadJSON: function(data, filename){
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  downloadCSV: function(rows, filename){
    if(!rows || !rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => {
        const v = r[h];
        if(v === null || v === undefined) return '';
        const s = String(v).replace(/"/g,'""');
        return s.includes(',') || s.includes('"') || s.includes('\n') ? '"'+s+'"' : s;
      }).join(','))
    ].join('\n');
    const blob = new Blob(['\ufeff'+csv], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
  
  /* ====== Escape HTML ====== */
  
  escape: function(str){
    if(str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  },
  
  /* ====== Normalize phone number to international format ====== */
  
  normalizePhone: function(phone){
    if(!phone) return '';
    // Remove all non-digits
    let p = String(phone).replace(/[^\d]/g,'');
    // Saudi number defaults
    if(p.startsWith('00966')) p = p.slice(2);
    else if(p.startsWith('966')) p = p;
    else if(p.startsWith('05')) p = '966' + p.slice(1);
    else if(p.startsWith('5') && p.length === 9) p = '966' + p;
    else if(p.startsWith('0') && p.length === 10) p = '966' + p.slice(1);
    return p;
  },
  
  /* ====== Send WhatsApp message ====== 
     Opens wa.me with phone + encoded message
     If phone empty → opens generic wa.me/?text= so user picks contact
     Always works on mobile + desktop  */
  
  sendWhatsApp: function(phone, message){
    const normalized = helpers.normalizePhone(phone);
    const encoded = encodeURIComponent(message || '');
    const url = normalized 
      ? `https://wa.me/${normalized}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return url;
  },
  
  /* ====== Open WhatsApp send modal with editable message ======
     opts: { phone, message, title, recipientName, fileName, onSent }
     Returns the message that was used  */
  
  whatsappModal: function(opts){
    opts = opts || {};
    const phone = opts.phone || '';
    const message = opts.message || '';
    const title = opts.title || 'إرسال عبر واتساب';
    const recipientName = opts.recipientName || '';
    const fileName = opts.fileName || '';
    
    return new Promise(resolve => {
      // Build modal body
      const escId = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g,'_');
      const phoneId = 'wa-phone-' + Date.now();
      const msgId = 'wa-msg-' + Date.now();
      
      const body = `
        <div style="display:flex;flex-direction:column;gap:14px">
          ${recipientName ? `
            <div style="display:flex;align-items:center;gap:11px;padding:11px 14px;background:var(--surface-2);border-radius:9px">
              <div style="width:36px;height:36px;border-radius:50%;background:#25d366;display:grid;place-items:center;color:#fff;flex-shrink:0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:14px;color:var(--text)">${helpers.escape(recipientName)}</div>
                ${fileName ? `<div style="font-size:11.5px;color:var(--text-3);font-family:var(--font-mono);margin-top:2px">${helpers.escape(fileName)}</div>` : ''}
              </div>
            </div>
          ` : ''}
          
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px">رقم الواتساب</label>
            <input id="${phoneId}" type="tel" value="${helpers.escape(phone)}" placeholder="05XXXXXXXX أو 9665XXXXXXXX" 
              style="width:100%;padding:10px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:var(--font-mono);font-size:13.5px;background:var(--surface);color:var(--text);direction:ltr;text-align:start">
            <div style="font-size:11px;color:var(--text-3);margin-top:5px">يتم تحويل الرقم تلقائياً للصيغة الدولية. اتركه فارغاً لتختار جهة الاتصال بنفسك.</div>
          </div>
          
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:6px">الرسالة</label>
            <textarea id="${msgId}" rows="6"
              style="width:100%;padding:11px 13px;border:1.5px solid var(--border);border-radius:8px;font-family:inherit;font-size:13px;line-height:1.65;background:var(--surface);color:var(--text);resize:vertical;min-height:120px">${helpers.escape(message)}</textarea>
            <div style="font-size:11px;color:var(--text-3);margin-top:5px">يمكنك تعديل الرسالة قبل الإرسال</div>
          </div>
          
          <div style="display:flex;align-items:flex-start;gap:9px;padding:10px 12px;background:#fef9c3;border:1px solid #fde047;border-radius:8px;color:#713f12;font-size:12px;line-height:1.55">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;margin-top:1px">
              <path d="M12 9v4M12 17h.01M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0z"/>
            </svg>
            <div>سيتم فتح واتساب مع نص الرسالة جاهز. <b>ارفق الإيصال/الفاتورة يدوياً</b> من محادثة واتساب بعد فتحها (لأن واتساب لا يدعم إرسال الملفات عبر الرابط).</div>
          </div>
        </div>
      `;
      
      helpers.modal(body, {
        title: title,
        okText: 'فتح واتساب',
        cancelText: 'إلغاء',
        width: 480,
        onOk: () => {
          const phoneInput = document.getElementById(phoneId);
          const msgInput = document.getElementById(msgId);
          const finalPhone = phoneInput ? phoneInput.value : '';
          const finalMsg = msgInput ? msgInput.value : message;
          
          helpers.sendWhatsApp(finalPhone, finalMsg);
          
          if(typeof opts.onSent === 'function'){
            try { opts.onSent({ phone: finalPhone, message: finalMsg }); } catch(e){}
          }
          
          resolve({ phone: finalPhone, message: finalMsg });
          return true;
        }
      });
    });
  }
};

// Inject required CSS animations
if(!document.getElementById('sc-helpers-styles')){
  const style = document.createElement('style');
  style.id = 'sc-helpers-styles';
  style.textContent = `
    @keyframes sc-toast-in { from { transform:translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }
    @keyframes sc-toast-out { to { transform:translateY(-10px); opacity:0 } }
    @keyframes sc-fade-in { from { opacity:0 } to { opacity:1 } }
    @keyframes sc-fade-out { to { opacity:0 } }
    @keyframes sc-modal-in { from { transform:scale(.95); opacity:0 } to { transform:scale(1); opacity:1 } }
  `;
  document.head.appendChild(style);
}

window.SC.helpers = helpers;
window.SC.h = helpers; // shorthand

console.log('Smart Code helpers loaded');

})(window);
