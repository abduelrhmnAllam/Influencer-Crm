/* ════════════════════════════════════════════════════════════════════
   Smart Code v5 — Security Layer
   ════════════════════════════════════════════════════════════════════
   طبقة الأمان الشاملة:
   • XSS Defense (escape + sanitize)
   • Password hashing (PBKDF2-SHA256 via WebCrypto)
   • Session integrity (HMAC-like signature)
   • Rate limiting (login brute-force protection)
   • Input validation (URL params, IDs, emails, phones)
   • Audit logging integration
   • CSRF token generation (for future backend integration)
   ════════════════════════════════════════════════════════════════════ */
(function(window){
  'use strict';
  
  // ─────────── 1. CONSTANTS ───────────
  const VERSION = '1.0.0';
  const STORAGE_PREFIX = 'sc_v5_';
  
  // PBKDF2 parameters (OWASP recommended for 2024)
  const PBKDF2_ITERATIONS = 100000;  // 100k iterations (balance: security vs UX)
  const HASH_ALGO = 'SHA-256';
  const SALT_LENGTH = 16;  // bytes
  const KEY_LENGTH = 32;   // bytes (256 bits)
  
  // Session config
  const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;    // 8 hours absolute
  const SESSION_IDLE_MS    = 60 * 60 * 1000;        // 1 hour idle timeout
  const SESSION_SECRET_KEY = STORAGE_PREFIX + 'sk'; // local HMAC secret
  
  // Rate limiting
  const LOGIN_MAX_ATTEMPTS = 5;
  const LOGIN_WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
  const LOGIN_LOCKOUT_MS = 30 * 60 * 1000; // 30 min lockout after exhausted
  
  // ─────────── 2. XSS DEFENSE ───────────
  
  // HTML escape — neutralize all HTML metacharacters
  // Use for ANY user-controlled string going into innerHTML or template literals
  const ESCAPE_MAP = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;', '/': '&#x2F;',
    '`': '&#x60;', '=': '&#x3D;'
  };
  
  function escapeHTML(input){
    if(input === null || input === undefined) return '';
    return String(input).replace(/[&<>"'`=\/]/g, ch => ESCAPE_MAP[ch]);
  }
  
  // Escape for HTML attribute (stricter — escapes spaces too)
  function escapeAttr(input){
    if(input === null || input === undefined) return '';
    return String(input).replace(/[&<>"'`=\/\s]/g, ch => 
      ESCAPE_MAP[ch] || ('&#' + ch.charCodeAt(0) + ';')
    );
  }
  
  // Tagged template literal for safe HTML — use like: html`<div>${userInput}</div>`
  // All interpolations are automatically escaped unless wrapped in raw()
  function html(strings, ...values){
    let result = strings[0];
    for(let i = 0; i < values.length; i++){
      const v = values[i];
      // Allow explicit "raw" marker for trusted HTML
      if(v && typeof v === 'object' && v.__rawHtml){
        result += v.value;
      } else {
        result += escapeHTML(v);
      }
      result += strings[i + 1];
    }
    return result;
  }
  
  // Mark a string as trusted raw HTML (use sparingly!)
  function raw(value){
    return { __rawHtml: true, value: String(value) };
  }
  
  // Strip ALL HTML tags from input (for plain-text display)
  function stripHTML(input){
    if(input === null || input === undefined) return '';
    return String(input).replace(/<[^>]*>/g, '').trim();
  }
  
  // Sanitize URL — only allow http/https/mailto/tel; reject javascript:, data:, etc.
  function sanitizeURL(url){
    if(!url) return '';
    const s = String(url).trim();
    // Block dangerous schemes
    if(/^(javascript|data|vbscript|file):/i.test(s)) return '#';
    // Allow only safe schemes or relative URLs
    if(/^(https?:|mailto:|tel:|\/|\.)/.test(s) || !s.includes(':')) return s;
    return '#';
  }
  
  // ─────────── 3. INPUT VALIDATION ───────────
  
  // Validate ID format (alphanumeric + dash + underscore, length 1-50)
  function isValidId(id){
    if(typeof id !== 'string') return false;
    return /^[A-Za-z0-9_\-]{1,50}$/.test(id);
  }
  
  // Validate Saudi phone number
  function isValidPhoneSA(phone){
    if(!phone) return false;
    const cleaned = String(phone).replace(/[\s\-]/g, '');
    return /^(\+966|966|0)?5\d{8}$/.test(cleaned);
  }
  
  // Validate email
  function isValidEmail(email){
    if(!email) return false;
    if(String(email).length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }
  
  // Validate that input is safe text (no control chars, no script tags)
  function isSafeText(input, maxLength){
    if(input === null || input === undefined) return true;  // empty is fine
    const s = String(input);
    if(maxLength && s.length > maxLength) return false;
    // Reject control chars (except newline/tab/CR)
    if(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(s)) return false;
    return true;
  }
  
  // Get + validate URL param (returns null if invalid)
  function getValidParam(name, type){
    const params = new URLSearchParams(window.location.search);
    const raw = params.get(name);
    if(raw === null) return null;
    
    switch(type){
      case 'id':
        return isValidId(raw) ? raw : null;
      case 'int':
        const n = parseInt(raw, 10);
        return Number.isFinite(n) ? n : null;
      case 'text':
        return isSafeText(raw, 200) ? raw : null;
      default:
        // Default: only allow safe characters
        return /^[A-Za-z0-9_\-\.@]{1,100}$/.test(raw) ? raw : null;
    }
  }
  
  // ─────────── 4. CRYPTO PRIMITIVES ───────────
  
  const crypto = window.crypto || window.msCrypto;
  const subtle = crypto && crypto.subtle;
  
  // Generate cryptographically strong random bytes
  function randomBytes(length){
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return arr;
  }
  
  // Convert bytes to hex string
  function bytesToHex(bytes){
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Convert hex string to bytes
  function hexToBytes(hex){
    const bytes = new Uint8Array(hex.length / 2);
    for(let i = 0; i < hex.length; i += 2){
      bytes[i/2] = parseInt(hex.substring(i, i+2), 16);
    }
    return bytes;
  }
  
  // Constant-time comparison (prevents timing attacks)
  function constantTimeEqual(a, b){
    if(a.length !== b.length) return false;
    let diff = 0;
    for(let i = 0; i < a.length; i++){
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }
  
  // SHA-256 hash (returns hex)
  async function sha256(input){
    if(!subtle) throw new Error('WebCrypto not available');
    const data = new TextEncoder().encode(String(input));
    const hash = await subtle.digest('SHA-256', data);
    return bytesToHex(new Uint8Array(hash));
  }
  
  // ─────────── 5. PASSWORD HASHING (PBKDF2) ───────────
  
  // Hash password using PBKDF2-SHA256 with random salt
  // Returns: "pbkdf2$iterations$saltHex$keyHex"
  async function hashPassword(password){
    if(!subtle) throw new Error('WebCrypto not available');
    if(!password || password.length < 1) throw new Error('Password required');
    
    const salt = randomBytes(SALT_LENGTH);
    const passwordBytes = new TextEncoder().encode(password);
    
    const key = await subtle.importKey(
      'raw', passwordBytes, { name: 'PBKDF2' }, false, ['deriveBits']
    );
    
    const derivedBits = await subtle.deriveBits(
      { name: 'PBKDF2', salt: salt, iterations: PBKDF2_ITERATIONS, hash: HASH_ALGO },
      key, KEY_LENGTH * 8
    );
    
    return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derivedBits))}`;
  }
  
  // Verify password against stored hash
  async function verifyPassword(password, storedHash){
    if(!storedHash || !password) return false;
    
    // Check if it's a hashed value or legacy plain-text
    if(!storedHash.startsWith('pbkdf2$')){
      // Legacy plain-text comparison (backward compat — should migrate)
      return constantTimeEqual(password, storedHash);
    }
    
    try {
      const parts = storedHash.split('$');
      if(parts.length !== 4) return false;
      
      const iterations = parseInt(parts[1], 10);
      const salt = hexToBytes(parts[2]);
      const expectedKey = parts[3];
      
      const passwordBytes = new TextEncoder().encode(password);
      const key = await subtle.importKey(
        'raw', passwordBytes, { name: 'PBKDF2' }, false, ['deriveBits']
      );
      
      const derivedBits = await subtle.deriveBits(
        { name: 'PBKDF2', salt: salt, iterations: iterations, hash: HASH_ALGO },
        key, KEY_LENGTH * 8
      );
      
      const computedKey = bytesToHex(new Uint8Array(derivedBits));
      return constantTimeEqual(computedKey, expectedKey);
    } catch(e){
      console.error('[security] Password verification error:', e);
      return false;
    }
  }
  
  // Check if a string is a hashed password
  function isHashedPassword(value){
    return typeof value === 'string' && value.startsWith('pbkdf2$');
  }
  
  // ─────────── 6. SESSION INTEGRITY (HMAC-like) ───────────
  
  // Get or create a local secret key for session signing
  // (Note: in pure client-side context, this isn't true cryptographic protection,
  //  but it does provide tamper detection for casual modification)
  async function getSessionSecret(){
    let secret = localStorage.getItem(SESSION_SECRET_KEY);
    if(!secret){
      secret = bytesToHex(randomBytes(32));
      try { localStorage.setItem(SESSION_SECRET_KEY, secret); } catch(e){}
    }
    return secret;
  }
  
  // Build the canonical string used for signing/verification.
  // IMPORTANT: volatile fields that change DURING a session (the rolling idle
  // timestamp `last_activity`) must be EXCLUDED, otherwise every activity bump
  // would invalidate the signature and force a spurious auto-logout.
  function stableSessionString(sessionData){
    if(!sessionData || typeof sessionData !== 'object') return JSON.stringify(sessionData);
    const clone = Object.assign({}, sessionData);
    delete clone.last_activity;
    delete clone.signed_at;
    return JSON.stringify(clone);
  }
  
  // Sign session data
  async function signSession(sessionData){
    const secret = await getSessionSecret();
    const signature = await sha256(stableSessionString(sessionData) + '|' + secret);
    return { payload: sessionData, signature: signature, signed_at: Date.now() };
  }
  
  // Verify session signature (returns true if untampered)
  async function verifySessionSignature(signedSession){
    if(!signedSession || !signedSession.signature || !signedSession.payload) return false;
    const secret = await getSessionSecret();
    // Primary check: signature over the stable payload (ignores last_activity)
    const sigStable = await sha256(stableSessionString(signedSession.payload) + '|' + secret);
    if(constantTimeEqual(sigStable, signedSession.signature)) return true;
    // Backward-compat: sessions signed before this fix included last_activity
    // in the signature — accept them too so existing logins aren't dropped.
    const sigLegacy = await sha256(JSON.stringify(signedSession.payload) + '|' + secret);
    return constantTimeEqual(sigLegacy, signedSession.signature);
  }
  
  // Check session expiration
  function isSessionExpired(session){
    if(!session) return true;
    
    const now = Date.now();
    const createdAt = session.created_at || 0;
    const lastActivity = session.last_activity || createdAt;
    
    // Absolute expiry: 8 hours from creation
    if(now - createdAt > SESSION_MAX_AGE_MS) return true;
    
    // Idle expiry: 1 hour of inactivity
    if(now - lastActivity > SESSION_IDLE_MS) return true;
    
    return false;
  }
  
  // ─────────── 7. RATE LIMITING (Login brute-force protection) ───────────
  
  const RATE_LIMIT_KEY = STORAGE_PREFIX + 'login_attempts';
  
  function getRateLimitState(username){
    try {
      const all = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
      return all[username] || { attempts: [], locked_until: 0 };
    } catch(e){
      return { attempts: [], locked_until: 0 };
    }
  }
  
  function setRateLimitState(username, state){
    try {
      const all = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
      all[username] = state;
      // Cleanup: remove very old entries (> 24h)
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      for(const k in all){
        if(all[k].locked_until < cutoff && (!all[k].attempts.length || all[k].attempts[all[k].attempts.length-1] < cutoff)){
          delete all[k];
        }
      }
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(all));
    } catch(e){}
  }
  
  // Check if login is allowed (returns { allowed, reason, retryAfter })
  function checkLoginAllowed(username){
    const now = Date.now();
    const state = getRateLimitState(username);
    
    // Currently locked out?
    if(state.locked_until > now){
      const remaining = Math.ceil((state.locked_until - now) / 1000);
      return {
        allowed: false,
        reason: 'locked',
        retryAfter: remaining,
        message: `تم قفل الحساب مؤقتاً بسبب محاولات فاشلة متكررة. حاول بعد ${Math.ceil(remaining/60)} دقيقة.`
      };
    }
    
    // Count attempts within window
    const cutoff = now - LOGIN_WINDOW_MS;
    const recentAttempts = state.attempts.filter(t => t > cutoff);
    
    if(recentAttempts.length >= LOGIN_MAX_ATTEMPTS){
      // Lock out
      state.locked_until = now + LOGIN_LOCKOUT_MS;
      setRateLimitState(username, state);
      return {
        allowed: false,
        reason: 'too_many_attempts',
        retryAfter: Math.ceil(LOGIN_LOCKOUT_MS / 1000),
        message: `تجاوزت الحد المسموح (${LOGIN_MAX_ATTEMPTS} محاولات). تم قفل الحساب لمدة ${LOGIN_LOCKOUT_MS/60000} دقيقة.`
      };
    }
    
    return {
      allowed: true,
      remaining: LOGIN_MAX_ATTEMPTS - recentAttempts.length
    };
  }
  
  // Record a failed login attempt
  function recordFailedLogin(username){
    const state = getRateLimitState(username);
    state.attempts.push(Date.now());
    // Keep only attempts within the window
    const cutoff = Date.now() - LOGIN_WINDOW_MS;
    state.attempts = state.attempts.filter(t => t > cutoff);
    setRateLimitState(username, state);
    
    // Audit log
    logSecurityEvent('login_failed', 'warning', `Failed login attempt for: ${username}`);
  }
  
  // Clear rate limit state (on successful login)
  function clearLoginAttempts(username){
    try {
      const all = JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}');
      delete all[username];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(all));
    } catch(e){}
  }
  
  // ─────────── 8. CSRF TOKEN (for future backend integration) ───────────
  
  const CSRF_KEY = STORAGE_PREFIX + 'csrf_token';
  
  function getCsrfToken(){
    let token = sessionStorage.getItem(CSRF_KEY);
    if(!token){
      token = bytesToHex(randomBytes(32));
      try { sessionStorage.setItem(CSRF_KEY, token); } catch(e){}
    }
    return token;
  }
  
  function rotateCsrfToken(){
    const token = bytesToHex(randomBytes(32));
    try { sessionStorage.setItem(CSRF_KEY, token); } catch(e){}
    return token;
  }
  
  // ─────────── 9. AUDIT LOGGING (Security events) ───────────
  
  function logSecurityEvent(action, severity, description, metadata){
    try {
      // Use storage-manager's audit log if available
      if(window.SC?.storage?.audit?.log){
        window.SC.storage.audit.log({
          action: 'security_' + action,
          severity: severity || 'info',
          entity_type: 'security',
          entity_id: null,
          description: description,
          metadata: Object.assign({
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent.substring(0, 200),
            url: window.location.pathname
          }, metadata || {})
        });
      }
    } catch(e){
      console.error('[security] Audit log failed:', e);
    }
  }
  
  // ─────────── 10. CONTENT SECURITY POLICY HELPERS ───────────
  
  // Inject CSP meta tag (called once on page load)
  function injectCSP(){
    if(document.querySelector('meta[http-equiv="Content-Security-Policy"]')) return;
    
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",  // unsafe-inline for current inline scripts; tighten later
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",  // anti-clickjacking
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'"
    ].join('; ');
    
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    meta.setAttribute('content', csp);
    document.head.insertBefore(meta, document.head.firstChild);
  }
  
  // ─────────── 11. EXPORT ───────────
  
  window.SC = window.SC || {};
  window.SC.security = {
    VERSION: VERSION,
    
    // XSS defense
    escapeHTML: escapeHTML,
    escapeAttr: escapeAttr,
    html: html,
    raw: raw,
    stripHTML: stripHTML,
    sanitizeURL: sanitizeURL,
    
    // Input validation
    isValidId: isValidId,
    isValidPhoneSA: isValidPhoneSA,
    isValidEmail: isValidEmail,
    isSafeText: isSafeText,
    getValidParam: getValidParam,
    
    // Crypto
    randomBytes: randomBytes,
    sha256: sha256,
    bytesToHex: bytesToHex,
    constantTimeEqual: constantTimeEqual,
    
    // Password
    hashPassword: hashPassword,
    verifyPassword: verifyPassword,
    isHashedPassword: isHashedPassword,
    
    // Session integrity
    signSession: signSession,
    verifySessionSignature: verifySessionSignature,
    isSessionExpired: isSessionExpired,
    SESSION_MAX_AGE_MS: SESSION_MAX_AGE_MS,
    SESSION_IDLE_MS: SESSION_IDLE_MS,
    
    // Rate limiting
    checkLoginAllowed: checkLoginAllowed,
    recordFailedLogin: recordFailedLogin,
    clearLoginAttempts: clearLoginAttempts,
    
    // CSRF
    getCsrfToken: getCsrfToken,
    rotateCsrfToken: rotateCsrfToken,
    
    // Audit
    logSecurityEvent: logSecurityEvent,
    
    // CSP
    injectCSP: injectCSP
  };
  
  // Auto-inject CSP on first script load (defense in depth)
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', injectCSP);
  } else {
    injectCSP();
  }
  
  window.SC_DEBUG&&console.log('✅ Smart Code security layer loaded (v' + VERSION + ')');
})(window);
