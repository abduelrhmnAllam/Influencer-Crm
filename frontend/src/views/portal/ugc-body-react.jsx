<body>

{/* ═══════════════════════════════════════════════════════
     AUTH SCREEN (Login / Register)
     ═══════════════════════════════════════════════════════ */}
<div className="auth-screen" id="auth-screen">
  
  {/* LEFT: Marketing Hero */}
  <div className="auth-hero">
    <div>
      <div className="brand">
        <div className="logo">S</div>
        <div className="text">
          <div className="n">SmartCode</div>
          <div className="s">Creators Network</div>
        </div>
      </div>
      
      <h1>انضم لشبكة صناع المحتوى الأكبر في السعودية</h1>
      <div className="lead">احصل على فرص حقيقية للعمل مع علامات تجارية كبرى. سجّل، اختر الحملات المناسبة، وأنشئ محتوى عالي الجودة بأرباح مستحقة.</div>
      
      <div className="features">
        <div className="feat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div>
            <div className="label">حملات يومية</div>
            <div className="desc">عشرات الحملات الجديدة شهرياً من علامات تجارية موثوقة</div>
          </div>
        </div>
        <div className="feat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><polyline points="12 6 12 12 14 14"/></svg>
          <div>
            <div className="label">دفعات سريعة</div>
            <div className="desc">استلم مستحقاتك خلال 7 أيام من اعتماد المحتوى</div>
          </div>
        </div>
        <div className="feat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div>
            <div className="label">نظام ولاء ومكافآت</div>
            <div className="desc">ارتقِ بالمستوى من برونزي إلى بلاتيني مع مكافآت إضافية</div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="stats">
      <div className="item">
        <div className="v" id="stat-creators">+2,500</div>
        <div className="l">صانع محتوى</div>
      </div>
      <div className="item">
        <div className="v">+226</div>
        <div className="l">حملة شهرياً</div>
      </div>
      <div className="item">
        <div className="v">+1M</div>
        <div className="l">ر.س مدفوعات</div>
      </div>
    </div>
  </div>
  
  {/* RIGHT: Auth Form */}
  <div className="auth-form-side">
    <div className="auth-form-wrap">
      <div className="auth-tabs">
        <button className="auth-tab active" id="tab-login-btn">تسجيل دخول</button>
        <button className="auth-tab" id="tab-register-btn">حساب جديد</button>
      </div>
      
      <div className="auth-error" id="auth-error"></div>
      
      {/* LOGIN */}
      <div className="auth-form tab-content active" id="login-form">
        <h2>أهلاً بعودتك 👋</h2>
        <div className="sub">سجّل دخولك للاطلاع على الحملات المتاحة ومستحقاتك</div>
        
        <div className="field-group">
          <label>رقم الجوال</label>
          <input type="tel" id="login-phone" placeholder="05XXXXXXXX" dir="ltr" style={{"textAlign":"start"}}/>
        </div>
        
        <div className="field-group">
          <label>كلمة المرور</label>
          <input type="password" id="login-password" placeholder="••••••••"/>
        </div>
        
        <button className="btn-primary" id="login-submit">دخول</button>
        
        <div className="auth-divider"><span>ليس لديك حساب؟</span></div>
        <button className="btn-ghost" id="switch-to-register" style={{"width":"100%"}}>إنشاء حساب صانع محتوى</button>
      </div>
      
      {/* REGISTER */}
      <div className="auth-form tab-content" id="register-form">
        <h2>أنشئ حسابك الآن 🎬</h2>
        <div className="sub">انضم لشبكة صناع محتوى TikTok وابدأ بكسب الدخل من شغفك</div>
        
        <div className="steps-indicator">
          <div className="step active" data-step="1">1</div>
          <div className="line"></div>
          <div className="step" data-step="2">2</div>
          <div className="line"></div>
          <div className="step" data-step="3">3</div>
        </div>
        
        {/* Step 1: Basic Info */}
        <div className="register-step" data-step="1">
          <div className="field-group">
            <label>الاسم الكامل <span style={{"color":"#dc2626"}}>*</span></label>
            <input type="text" id="reg-name" placeholder="مثال: أحمد محمد العمري"/>
          </div>
          <div className="field-group">
            <label>رقم الجوال <span style={{"color":"#dc2626"}}>*</span></label>
            <input type="tel" id="reg-phone" placeholder="05XXXXXXXX" dir="ltr" style={{"textAlign":"start"}}/>
            <div className="help">سيُستخدم لتسجيل الدخول والتواصل معك</div>
          </div>
          <div className="field-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="reg-email" placeholder="optional@example.com" dir="ltr" style={{"textAlign":"start"}}/>
          </div>
          <div className="field-group">
            <label>كلمة المرور <span style={{"color":"#dc2626"}}>*</span></label>
            <input type="password" id="reg-password" placeholder="6 أحرف على الأقل"/>
          </div>
          <button className="btn-primary" id="next-step-1">التالي ←</button>
        </div>
        
        {/* Step 2: Profile */}
        <div className="register-step" data-step="2" style={{"display":"none"}}>
          <div className="field-row">
            <div className="field-group">
              <label>المدينة</label>
              <select id="reg-city">
                <option value="">اختر المدينة</option>
                <option>الرياض</option>
                <option>جدة</option>
                <option>الدمام</option>
                <option>مكة</option>
                <option>المدينة</option>
                <option>الخبر</option>
                <option>الطائف</option>
                <option>تبوك</option>
                <option>أبها</option>
                <option>حائل</option>
                <option>القصيم</option>
                <option>الأحساء</option>
              </select>
            </div>
            <div className="field-group">
              <label>الجنس</label>
              <select id="reg-gender">
                <option value="">اختر</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
            </div>
          </div>
          
          <div className="field-row">
            <div className="field-group">
              <label>الفئة العمرية</label>
              <select id="reg-age">
                <option value="">اختر</option>
                <option>18-24</option>
                <option>25-34</option>
                <option>35-44</option>
                <option>45+</option>
              </select>
            </div>
            <div className="field-group">
              <label>اسم حساب TikTok</label>
              <input type="text" id="reg-tiktok" placeholder="@username" dir="ltr" style={{"textAlign":"start"}}/>
            </div>
          </div>
          
          <div className="field-group">
            <label>التصنيفات (اختر ما يناسبك)</label>
            <div className="chip-grid" id="reg-categories">
              <div className="chip-select" data-cat="lifestyle">نمط حياة</div>
              <div className="chip-select" data-cat="fashion">موضة</div>
              <div className="chip-select" data-cat="beauty">جمال</div>
              <div className="chip-select" data-cat="food">طعام</div>
              <div className="chip-select" data-cat="tech">تقنية</div>
              <div className="chip-select" data-cat="gaming">ألعاب</div>
              <div className="chip-select" data-cat="comedy">كوميديا</div>
              <div className="chip-select" data-cat="education">تعليم</div>
              <div className="chip-select" data-cat="sports">رياضة</div>
              <div className="chip-select" data-cat="travel">سفر</div>
              <div className="chip-select" data-cat="business">أعمال</div>
              <div className="chip-select" data-cat="family">عائلة</div>
            </div>
          </div>
          
          <div className="field-row">
            <div className="field-group">
              <label>عدد المتابعين</label>
              <input type="number" id="reg-followers" placeholder="50000" dir="ltr" style={{"textAlign":"start"}}/>
            </div>
            <div className="field-group">
              <label>متوسط المشاهدات</label>
              <input type="number" id="reg-views" placeholder="10000" dir="ltr" style={{"textAlign":"start"}}/>
            </div>
          </div>
          
          <div style={{"display":"flex","gap":"10px","marginTop":"14px"}}>
            <button className="btn-ghost" id="back-step-2" style={{"flex":"1"}}>→ السابق</button>
            <button className="btn-primary" id="next-step-2" style={{"flex":"1","marginTop":"0"}}>التالي ←</button>
          </div>
        </div>
        
        {/* Step 3: Banking */}
        <div className="register-step" data-step="3" style={{"display":"none"}}>
          <div style={{"background":"#eff6ff","border":"1px solid #bfdbfe","color":"#1e3a8a","padding":"11px 14px","borderRadius":"9px","fontSize":"12.5px","lineHeight":"1.6","marginBottom":"16px"}}>
            <strong>اختياري:</strong> يمكنك إضافة بيانات التحويل البنكي لاحقاً من الملف الشخصي. ولكن مطلوبة لاستلام المستحقات.
          </div>
          
          <div className="field-group">
            <label>اسم البنك</label>
            <select id="reg-bank">
              <option value="">اختر البنك</option>
              <option>الراجحي</option>
              <option>الأهلي السعودي</option>
              <option>الرياض</option>
              <option>سامبا</option>
              <option>البلاد</option>
              <option>العربي الوطني</option>
              <option>ساب</option>
              <option>الاستثمار</option>
              <option>الانماء</option>
              <option>الجزيرة</option>
              <option>اخرى</option>
            </select>
          </div>
          
          <div className="field-group">
            <label>رقم IBAN</label>
            <input type="text" id="reg-iban" placeholder="SA00 0000 0000 0000 0000 0000" dir="ltr" style={{"textAlign":"start","fontFamily":"var(--font-mono)","fontSize":"12px"}}/>
            <div className="help">يبدأ بـ SA متبوعاً بـ 22 رقم</div>
          </div>
          
          <div className="field-group">
            <label>اسم صاحب الحساب</label>
            <input type="text" id="reg-account-name" placeholder="كما هو في البطاقة"/>
          </div>
          
          <div style={{"background":"#fffbeb","border":"1px solid #fde68a","color":"#92400e","padding":"11px 14px","borderRadius":"9px","fontSize":"12px","lineHeight":"1.6","marginTop":"14px"}}>
            بالتسجيل، أنت توافق على <a href="#" style={{"color":"#92400e","textDecoration":"underline"}}>شروط الاستخدام</a> و<a href="#" style={{"color":"#92400e","textDecoration":"underline"}}>سياسة الخصوصية</a> الخاصة بـ Smart Code Creators.
          </div>
          
          <div style={{"display":"flex","gap":"10px","marginTop":"14px"}}>
            <button className="btn-ghost" id="back-step-3" style={{"flex":"1"}}>→ السابق</button>
            <button className="btn-primary" id="submit-register" style={{"flex":"1","marginTop":"0"}}>إنشاء الحساب ✓</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

{/* ═══════════════════════════════════════════════════════
     DASHBOARD (After Login)
     ═══════════════════════════════════════════════════════ */}
<div className="dashboard" id="dashboard">
  
  {/* TOP BAR */}
  <div className="creator-topbar">
    <div className="brand">
      <div className="logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{"position":"relative","zIndex":"1"}}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
      </div>
      <div className="text">
        <div className="n">SmartCode Creators</div>
        <div className="s">UGC TIKTOK NETWORK</div>
      </div>
    </div>
    <span className="sc-anchor" title="مدعوم من Smart Code Influencer CRM">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      منصة موثّقة
    </span>
    <div className="spacer"></div>
    <div className="user-chip" id="user-chip-btn">
      <span className="name" id="topbar-name">صانع محتوى</span>
      <div className="ava" id="topbar-ava">ا</div>
    </div>
  </div>
  
  {/* LAYOUT */}
  <div className="creator-layout">
    
    {/* SIDEBAR */}
    <aside className="creator-sidebar">
      <div className="nav-link active" data-view="home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span className="label-text">الرئيسية</span>
      </div>
      <div className="nav-link" data-view="campaigns">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        <span className="label-text">الحملات</span>
        <span className="badge" id="badge-campaigns">0</span>
      </div>
      <div className="nav-link" data-view="applications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <span className="label-text">طلباتي</span>
        <span className="badge" id="badge-applications">0</span>
      </div>
      <div className="nav-link" data-view="content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
        <span className="label-text">المحتوى</span>
      </div>
      <div className="nav-link" data-view="wallet">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
        <span className="label-text">المحفظة</span>
      </div>
      <div className="nav-link" data-view="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span className="label-text">حسابي</span>
      </div>
    </aside>
    
    {/* MAIN */}
    <main className="creator-main">
      
      {/* ═══ HOME VIEW ═══ */}
      <div className="view active" id="view-home">
        <div id="home-content"></div>
      </div>
      
      {/* ═══ CAMPAIGNS VIEW ═══ */}
      <div className="view" id="view-campaigns">
        <div id="campaigns-content"></div>
      </div>
      
      {/* ═══ APPLICATIONS VIEW ═══ */}
      <div className="view" id="view-applications">
        <div id="applications-content"></div>
      </div>
      
      {/* ═══ CONTENT VIEW ═══ */}
      <div className="view" id="view-content">
        <div id="content-content"></div>
      </div>
      
      {/* ═══ WALLET VIEW ═══ */}
      <div className="view" id="view-wallet">
        <div id="wallet-content"></div>
      </div>
      
      {/* ═══ PROFILE VIEW ═══ */}
      <div className="view" id="view-profile">
        <div id="profile-content"></div>
      </div>
    </main>
  </div>
</div>

{/* Modal placeholder */}
<div className="modal-backdrop" id="modal-backdrop">
  <div className="modal" id="modal-content"></div>
</div>

<script>
(function(){
function __start(){
  if(typeof window.SC === 'undefined' || !window.SC.api){
    return setTimeout(__start, 50);
  }
  
  if(window.SC.data?.ready && !window.__sc_data_loaded__){
    return window.SC.data.ready.then(function(){
      window.__sc_data_loaded__ = true;
      __start();
    }).catch(function(){ window.__sc_data_loaded__ = true; __start(); });
  }
  
  const api = SC.api;
  const security = SC.security;
  const ugc_auth = api.ugc_auth;
  
  // ═══ STATE ═══
  const state = {
    currentCreator: null,
    activeView: 'home',
    registerStep: 1,
    selectedCategories: []
  };
  
  function escapeHTML(s){ return security ? security.escapeHTML(s) : (s+'').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
  function escapeAttr(s){ return security ? security.escapeAttr(s) : escapeHTML(s); }
  
  // ═══ TOAST ═══
  function toast(msg, type='info', duration=3000){
    const existing = document.querySelector('.toast');
    if(existing) existing.remove();
    
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }
  
  // ═══ INITIAL CHECK: Are we logged in? ═══
  function init(){
    const session = ugc_auth.getSession();
    if(session){
      state.currentCreator = ugc_auth.getCurrentCreator();
      if(state.currentCreator){
        showDashboard();
        return;
      }
    }
    showAuth();
  }
  
  function showAuth(){
    document.getElementById('auth-screen').style.display = 'grid';
    document.getElementById('dashboard').classList.remove('show');
  }
  
  function showDashboard(){
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('dashboard').classList.add('show');
    
    updateTopbar();
    updateBadges();
    renderView(state.activeView);
  }
  
  function updateTopbar(){
    if(!state.currentCreator) return;
    document.getElementById('topbar-name').textContent = state.currentCreator.full_name || '';
    document.getElementById('topbar-ava').textContent = (state.currentCreator.full_name || 'ا').charAt(0);
  }
  
  function updateBadges(){
    if(!state.currentCreator) return;
    const suggested = api.ugc_matching.getSuggestedCampaigns(state.currentCreator.id);
    document.getElementById('badge-campaigns').textContent = suggested.length;
    
    const myApps = api.ugc_applications.list().filter(a => a.creator_id === state.currentCreator.id);
    document.getElementById('badge-applications').textContent = myApps.length;
  }
  
  // ═══ AUTH TABS ═══
  document.getElementById('tab-login-btn').addEventListener('click', () => switchAuthTab('login'));
  document.getElementById('tab-register-btn').addEventListener('click', () => switchAuthTab('register'));
  document.getElementById('switch-to-register').addEventListener('click', () => switchAuthTab('register'));
  
  function switchAuthTab(tab){
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    if(tab === 'login'){
      document.getElementById('tab-login-btn').classList.add('active');
      document.getElementById('login-form').classList.add('active');
    } else {
      document.getElementById('tab-register-btn').classList.add('active');
      document.getElementById('register-form').classList.add('active');
    }
    document.getElementById('auth-error').classList.remove('show');
  }
  
  // ═══ LOGIN ═══
  document.getElementById('login-submit').addEventListener('click', async () => {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value;
    const errEl = document.getElementById('auth-error');
    
    if(!phone || !password){
      errEl.textContent = 'الرجاء إدخال رقم الجوال وكلمة المرور';
      errEl.classList.add('show');
      return;
    }
    
    const btn = document.getElementById('login-submit');
    btn.disabled = true;
    btn.textContent = 'جاري الدخول...';
    
    try {
      const result = await ugc_auth.login(phone, password);
      state.currentCreator = result.creator;
      toast('تم تسجيل الدخول بنجاح', 'success');
      showDashboard();
    } catch(e){
      errEl.textContent = e.message || 'فشل تسجيل الدخول';
      errEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = 'دخول';
    }
  });
  
  // ═══ REGISTER ═══
  document.querySelectorAll('#reg-categories .chip-select').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      const cat = chip.dataset.cat;
      if(state.selectedCategories.includes(cat)){
        state.selectedCategories = state.selectedCategories.filter(c => c !== cat);
      } else {
        state.selectedCategories.push(cat);
      }
    });
  });
  
  function goToStep(s){
    state.registerStep = s;
    document.querySelectorAll('.register-step').forEach(el => el.style.display = 'none');
    document.querySelector(`.register-step[data-step="${s}"]`).style.display = 'block';
    
    document.querySelectorAll('.steps-indicator .step').forEach((el, idx) => {
      el.classList.remove('active', 'done');
      const stepNum = parseInt(el.dataset.step);
      if(stepNum < s) el.classList.add('done');
      else if(stepNum === s) el.classList.add('active');
    });
    document.querySelectorAll('.steps-indicator .line').forEach((el, idx) => {
      el.classList.toggle('done', idx < s - 1);
    });
  }
  
  document.getElementById('next-step-1').addEventListener('click', () => {
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const errEl = document.getElementById('auth-error');
    
    if(!name || !phone || !password){
      errEl.textContent = 'الاسم والجوال وكلمة المرور مطلوبة';
      errEl.classList.add('show');
      return;
    }
    if(password.length < 6){
      errEl.textContent = 'كلمة المرور 6 أحرف على الأقل';
      errEl.classList.add('show');
      return;
    }
    errEl.classList.remove('show');
    goToStep(2);
  });
  
  document.getElementById('back-step-2').addEventListener('click', () => goToStep(1));
  document.getElementById('next-step-2').addEventListener('click', () => goToStep(3));
  document.getElementById('back-step-3').addEventListener('click', () => goToStep(2));
  
  document.getElementById('submit-register').addEventListener('click', async () => {
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('submit-register');
    btn.disabled = true;
    btn.textContent = 'جاري التسجيل...';
    
    try {
      const payload = {
        full_name: document.getElementById('reg-name').value.trim(),
        phone: document.getElementById('reg-phone').value.trim(),
        email: document.getElementById('reg-email').value.trim() || null,
        password: document.getElementById('reg-password').value,
        city: document.getElementById('reg-city').value || null,
        gender: document.getElementById('reg-gender').value || null,
        age_range: document.getElementById('reg-age').value || null,
        tiktok_handle: document.getElementById('reg-tiktok').value.trim() || null,
        tiktok_followers: parseInt(document.getElementById('reg-followers').value) || 0,
        tiktok_avg_views: parseInt(document.getElementById('reg-views').value) || 0,
        categories: state.selectedCategories,
        bank_name: document.getElementById('reg-bank').value || null,
        iban: document.getElementById('reg-iban').value.trim().replace(/\s/g, '').toUpperCase() || null,
        account_holder_name: document.getElementById('reg-account-name').value.trim() || null
      };
      
      const creator = await ugc_auth.register(payload);
      
      // Auto-login
      const result = await ugc_auth.login(payload.phone, payload.password);
      state.currentCreator = result.creator;
      
      toast('مرحباً بك في شبكة Smart Code Creators!', 'success');
      showDashboard();
    } catch(e){
      errEl.textContent = e.message || 'فشل التسجيل';
      errEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.textContent = 'إنشاء الحساب ✓';
    }
  });
  
  // ═══ NAVIGATION ═══
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
      state.activeView = view;
      renderView(view);
    });
  });
  
  // User chip → logout menu
  document.getElementById('user-chip-btn').addEventListener('click', () => {
    if(confirm('هل تريد تسجيل الخروج؟')){
      ugc_auth.logout();
      state.currentCreator = null;
      showAuth();
      toast('تم تسجيل الخروج', 'info');
    }
  });
  
  // ═══ VIEW RENDERERS ═══
  function renderView(view){
    switch(view){
      case 'home': renderHome(); break;
      case 'campaigns': renderCampaigns(); break;
      case 'applications': renderApplications(); break;
      case 'content': renderContent(); break;
      case 'wallet': renderWallet(); break;
      case 'profile': renderProfile(); break;
    }
  }
  
  // ═══ HOME ═══
  function renderHome(){
    const c = state.currentCreator;
    const balance = api.ugc_wallet.getBalance(c.id);
    const myApps = api.ugc_applications.list().filter(a => a.creator_id === c.id);
    const suggested = api.ugc_matching.getSuggestedCampaigns(c.id, 6);
    const activeApps = myApps.filter(a => ['accepted','in_progress','pending_review'].includes(a.status));
    const pendingApps = myApps.filter(a => a.status === 'pending');
    const mySubmissions = (api.ugc_submissions?.list?.() || []).filter(s => s.creator_id === c.id);
    const pendingSubmissions = mySubmissions.filter(s => s.status === 'in_review');
    const approvedSubmissions = mySubmissions.filter(s => s.status === 'approved');
    
    // Get recent transfers (integration with main finance system)
    const myTransfers = (api.transfers?.list?.({direction:'outgoing'}) || [])
      .filter(t => t.ugc_creator_id === c.id || (t.recipient_iban && t.recipient_iban === c.iban))
      .sort((a,b) => new Date(b.created_at||0) - new Date(a.created_at||0))
      .slice(0, 4);
    
    // Level data
    const levelName = { bronze:'برونزي', silver:'فضي', gold:'ذهبي', platinum:'بلاتيني', diamond:'ماسي' }[c.level] || 'برونزي';
    const levelIcon = { bronze:'🥉', silver:'🥈', gold:'🥇', platinum:'💎', diamond:'💠' }[c.level] || '🥉';
    const levelOrder = ['bronze','silver','gold','platinum','diamond'];
    const currentLevelIdx = levelOrder.indexOf(c.level || 'bronze');
    const nextLevel = currentLevelIdx < 4 ? levelOrder[currentLevelIdx + 1] : null;
    const nextLevelName = nextLevel ? { silver:'فضي', gold:'ذهبي', platinum:'بلاتيني', diamond:'ماسي' }[nextLevel] : null;
    const levelThresholds = { bronze:0, silver:3, gold:10, platinum:25, diamond:50 };
    const completedCount = c.completed_campaigns || 0;
    const nextThreshold = nextLevel ? levelThresholds[nextLevel] : levelThresholds.diamond;
    const levelProgress = Math.min(100, Math.round((completedCount / Math.max(1, nextThreshold)) * 100));
    
    // Profile completeness with itemized checklist
    const profileChecklist = [
      { key:'full_name', label:'الاسم الكامل', value: c.full_name },
      { key:'phone', label:'رقم الجوال', value: c.phone },
      { key:'email', label:'البريد الإلكتروني', value: c.email },
      { key:'city', label:'المدينة', value: c.city },
      { key:'gender', label:'الجنس', value: c.gender },
      { key:'categories', label:'الفئات المهتمة', value: c.categories && c.categories.length > 0 ? c.categories : null },
      { key:'tiktok_handle', label:'حساب TikTok', value: c.tiktok_handle },
      { key:'tiktok_followers', label:'عدد المتابعين', value: c.tiktok_followers },
      { key:'iban', label:'IBAN البنكي', value: c.iban },
      { key:'bank_name', label:'اسم البنك', value: c.bank_name }
    ];
    const completedFields = profileChecklist.filter(f => f.value && (Array.isArray(f.value) ? f.value.length > 0 : true));
    const profilePct = Math.round((completedFields.length / profileChecklist.length) * 100);
    const isNewCreator = (c.completed_campaigns || 0) === 0 && myApps.length === 0;
    
    // Trust badges
    const trustBadges = [
      { active: profilePct === 100, label: 'ملف مكتمل', icon: 'check' },
      { active: c.tiktok_handle && c.tiktok_followers > 0, label: 'TikTok مربوط', icon: 'video' },
      { active: c.iban && c.bank_name, label: 'بنك معتمد', icon: 'bank' },
      { active: c.verification_status === 'verified' || c.verified, label: 'موثّق', icon: 'shield' }
    ];
    const trustScore = trustBadges.filter(b => b.active).length;
    
    // Platform stats for social proof (when no personal data yet)
    const platformStats = (() => {
      const allCreators = api.ugc_creators?.list?.() || [];
      const allCampaigns = api.campaigns?.list?.() || [];
      return {
        activeCampaigns: allCampaigns.filter(c => c.status === 'active' || c.status === 'in_progress').length,
        totalCreators: allCreators.length,
        completedThisMonth: 0 // will be calculated if needed
      };
    })();
    
    document.getElementById('home-content').innerHTML = `
      {/* ═══ WELCOME HERO ═══ */}
      <div className="welcome-hero">
        <div className="ava">${escapeHTML((c.full_name || 'ا').charAt(0))}</div>
        <div style={{"flex":"1","minWidth":"0"}}>
          <h2>أهلاً ${escapeHTML((c.full_name || '').split(' ')[0])} 👋</h2>
          <div className="info">
            ${isNewCreator 
              ? `<strong>أهلاً بك في عائلة صناع UGC TikTok</strong> — أكمل خطواتك البسيطة لبدء استقبال الحملات` 
              : suggested.length > 0 
                ? `لديك <strong>${suggested.length}</strong> حملات مقترحة · ${activeApps.length} نشطة الآن` 
                : `${activeApps.length} حملة نشطة · ${pendingApps.length} طلب قيد المراجعة`
            }
          </div>
        </div>
        <div className="level-chip">${levelIcon} ${levelName}</div>
      </div>
      
      {/* ═══ QUICK ACTIONS ROW ═══ */}
      <div className="qa-grid">
        ${profilePct < 100 ? `
          <button className="qa-card primary" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">
            <div className="qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div className="qa-body">
              <div className="qa-title">أكمل ملفك</div>
              <div className="qa-meta">${profilePct}% مكتمل · ${profileChecklist.length - completedFields.length} حقول متبقية</div>
            </div>
            <svg className="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        ` : ''}
        
        <button className="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">
          <div className="qa-icon" style={{"background":"linear-gradient(135deg,#25f4ee,#0891b2)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>
          <div className="qa-body">
            <div className="qa-title">تصفّح الحملات</div>
            <div className="qa-meta">${platformStats.activeCampaigns} حملة نشطة الآن</div>
          </div>
          <svg className="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        
        <button className="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;applications&quot;]').click()">
          <div className="qa-icon" style={{"background":"linear-gradient(135deg,#fbbf24,#f59e0b)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
          <div className="qa-body">
            <div className="qa-title">طلباتي</div>
            <div className="qa-meta">${activeApps.length} نشط · ${pendingApps.length} قيد المراجعة</div>
          </div>
          <svg className="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        
        <button className="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;wallet&quot;]').click()">
          <div className="qa-icon" style={{"background":"linear-gradient(135deg,#16a34a,#15803d)"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg></div>
          <div className="qa-body">
            <div className="qa-title">المحفظة</div>
            <div className="qa-meta">${balance.available.toLocaleString('en-US')} ر.س متاح</div>
          </div>
          <svg className="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
      
      {/* ═══ KPI CARDS ═══ */}
      <div className="kpi-grid">
        <div className="kpi-card brand">
          <div className="label">رصيدك المتاح</div>
          <div className="value">${balance.available.toLocaleString('en-US')} <span style={{"fontSize":"14px","opacity":".7"}}>ر.س</span></div>
          <div className="meta">${balance.pending > 0 ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style={{"display":"inline-block","verticalAlign":"-1px","marginInlineEnd":"3px"}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${balance.pending.toLocaleString('en-US')} ر.س معلّقة` : balance.available > 0 ? '<span style={{"color":"#16a34a"}}>●</span> جاهز للسحب' : 'ابدأ بأول حملة لكسب أرباح'}</div>
        </div>
        <div className="kpi-card">
          <div className="label">إجمالي الأرباح</div>
          <div className="value">${balance.total_earned.toLocaleString('en-US')}</div>
          <div className="meta">${balance.total_earned > 0 ? `منذ ${c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) : 'الانضمام'}` : 'لم تبدأ بعد'}</div>
        </div>
        <div className="kpi-card">
          <div className="label">حملات مكتملة</div>
          <div className="value">${completedCount}</div>
          <div className="meta">${nextLevel ? `${nextThreshold - completedCount} للوصول للمستوى ${nextLevelName}` : 'أعلى مستوى!'}</div>
        </div>
        <div className="kpi-card">
          <div className="label">معدّل الموافقة</div>
          <div className="value">${myApps.length > 0 ? Math.round((myApps.filter(a => a.status === 'accepted' || a.status === 'in_progress' || a.status === 'completed').length / myApps.length) * 100) : 0}<span style={{"fontSize":"14px","opacity":".7"}}>%</span></div>
          <div className="meta">${myApps.length === 0 ? 'لم تتقدم لأي حملة بعد' : `من ${myApps.length} طلب تقدّمت لها`}</div>
        </div>
      </div>
      
      {/* ═══ TRUST BADGES ═══ */}
      <div className="trust-bar">
        <div className="trust-bar-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          درجة الموثوقية · ${trustScore}/${trustBadges.length}
        </div>
        <div className="trust-bar-badges">
          ${trustBadges.map(b => `
            <div className="trust-badge ${b.active ? 'active' : ''}" title="${b.label}">
              ${b.active 
                ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' 
                : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>'
              }
              <span>${b.label}</span>
            </div>
          `).join('')}
        </div>
      </div>
      
      ${profilePct < 100 ? `
        {/* ═══ PROFILE COMPLETION CHECKLIST ═══ */}
        <div className="ugc-section">
          <div className="ugc-section-head">
            <div className="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              خطواتك للبدء · ${profilePct}%
            </div>
            <button className="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">إكمال →</button>
          </div>
          <div className="checklist-card">
            <div className="checklist-progress">
              <div className="checklist-progress-bar" style={{"width":"${profilePct}%"}}></div>
            </div>
            <div className="checklist-items">
              ${profileChecklist.map((item, idx) => {
                const done = item.value && (Array.isArray(item.value) ? item.value.length > 0 : true);
                return `
                  <div className="checklist-item ${done ? 'done' : ''}">
                    <div className="checklist-bullet">
                      ${done 
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                        : `<span>${idx+1}</span>`
                      }
                    </div>
                    <span className="checklist-label">${item.label}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div className="checklist-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>إكمال الملف الشخصي يزيد فرص ترشيحك بنسبة <strong>3 أضعاف</strong></span>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${nextLevel ? `
        {/* ═══ LEVEL PROGRESSION ═══ */}
        <div className="level-progress-card">
          <div className="level-progress-head">
            <div className="level-progress-title">
              <span style={{"fontSize":"20px"}}>${levelIcon}</span>
              <div>
                <div className="level-current">${levelName}</div>
                <div className="level-next">التالي: ${nextLevelName} ${{silver:'🥈',gold:'🥇',platinum:'💎',diamond:'💠'}[nextLevel]}</div>
              </div>
            </div>
            <div className="level-count">
              <strong>${completedCount}</strong><span style={{"opacity":"0.5"}}>/</span>${nextThreshold}
            </div>
          </div>
          <div className="level-bar">
            <div className="level-bar-fill" style={{"width":"${levelProgress}%"}}></div>
            <div className="level-bar-milestones">
              ${levelOrder.map((lv, i) => {
                if(i === 0) return '';
                const pct = (levelThresholds[lv] / nextThreshold) * 100;
                if(pct > 100) return '';
                return `<div className="level-milestone ${i <= currentLevelIdx ? 'reached' : ''}" style={{"insetInlineStart":"${pct}%"}}></div>`;
              }).join('')}
            </div>
          </div>
          <div className="level-perks">
            <span>المميزات القادمة:</span>
            ${{silver:['أولوية في الترشيح','badge مميّز'],gold:['تخفيض عمولة','حملات حصرية'],platinum:['دعم مخصص','منتجات مجانية'],diamond:['تعاون مباشر','badge ماسي']}[nextLevel || 'diamond'].map(p => `<span className="perk-chip">${p}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${pendingSubmissions.length > 0 || approvedSubmissions.length > 0 ? `
        {/* ═══ SUBMISSIONS STATUS ═══ */}
        <div className="ugc-section">
          <div className="ugc-section-head">
            <div className="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              المحتوى المُقدَّم
            </div>
            <button className="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;content&quot;]').click()">عرض الكل →</button>
          </div>
          <div className="status-cards">
            ${pendingSubmissions.length > 0 ? `
              <div className="status-card warn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <div className="sc-v">${pendingSubmissions.length}</div>
                  <div className="sc-l">قيد المراجعة</div>
                </div>
              </div>
            ` : ''}
            ${approvedSubmissions.length > 0 ? `
              <div className="status-card good">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <div className="sc-v">${approvedSubmissions.length}</div>
                  <div className="sc-l">معتمد</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      ${myTransfers.length > 0 ? `
        {/* ═══ RECENT EARNINGS (Finance Integration) ═══ */}
        <div className="ugc-section">
          <div className="ugc-section-head">
            <div className="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              مستحقاتك المالية الأخيرة
            </div>
            <button className="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;wallet&quot;]').click()">المحفظة →</button>
          </div>
          <div className="recent-transfers">
            ${myTransfers.map(t => {
              const stage = t.workflow_stage || (t.status === 'completed' ? 'complete' : 1);
              const stageLabel = {1:'قيد التحويل البنكي', 2:'قيد إصدار الفاتورة', 3:'قيد الإرسال', complete:'مدفوع ✓'}[stage] || 'قيد المعالجة';
              const stageColor = stage === 'complete' ? '#16a34a' : '#f59e0b';
              return `
                <div className="recent-transfer-row">
                  <div className="dot" style={{"background":"${stageColor}"}}></div>
                  <div style={{"flex":"1","minWidth":"0"}}>
                    <div style={{"fontSize":"13px","fontWeight":"600","color":"var(--text)","marginBottom":"2px"}}>${escapeHTML(t.campaign_name || 'حملة UGC')}</div>
                    <div style={{"fontSize":"11px","color":"var(--text-3)"}}>${stageLabel} · ${t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '—'}</div>
                  </div>
                  <div style={{"textAlign":"end"}}>
                    <div style={{"fontFamily":"var(--font-display)","fontWeight":"800","color":"${stage === 'complete' ? '#16a34a' : 'var(--text)'}","fontSize":"14px"}}>${(t.amount_total||0).toLocaleString('en-US')}<span style={{"fontSize":"10px","opacity":".7","marginInlineStart":"3px"}}>ر.س</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      {/* ═══ SUGGESTED CAMPAIGNS ═══ */}
      <div className="ugc-section">
        <div className="ugc-section-head">
          <div className="title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            حملات مقترحة لك
          </div>
          <button className="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">عرض الكل →</button>
        </div>
        
        ${suggested.length === 0 ? `
          <div className="empty-rich">
            <div className="empty-rich-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
            <h3>${isNewCreator ? 'حملاتك القادمة تنتظر اكتمال ملفك' : 'لا توجد حملات مقترحة حالياً'}</h3>
            <p>${isNewCreator 
              ? `هناك <strong>${platformStats.activeCampaigns}</strong> حملة نشطة على المنصة. أكمل ملفك ليقوم النظام بترشيحك تلقائياً.`
              : 'تابع التحديثات اليومية أو حسّن ملفك لزيادة فرص الترشيح.'
            }</p>
            <div style={{"marginTop":"14px","display":"flex","gap":"8px","justifyContent":"center","flexWrap":"wrap"}}>
              ${profilePct < 100 ? `<button className="btn-action primary" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">إكمال ملفي</button>` : ''}
              <button className="btn-action ghost" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">تصفّح جميع الحملات</button>
            </div>
          </div>
        ` : `
          <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill, minmax(280px, 1fr))","gap":"14px"}}>
            ${suggested.map(s => renderCampaignCard(s.campaign, s.score)).join('')}
          </div>
        `}
      </div>
      
      ${isNewCreator ? `
        {/* ═══ TIPS FOR NEW CREATORS ═══ */}
        <div className="ugc-section">
          <div className="ugc-section-head">
            <div className="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3h6c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2Z"/></svg>
              نصائح للبداية الناجحة
            </div>
          </div>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-num">١</div>
              <h4>أكمل ملفك بدقة</h4>
              <p>الملف المكتمل يضاعف فرصك في الترشيح ٣ مرات. خاصة TikTok handle وعدد المتابعين.</p>
            </div>
            <div className="tip-card">
              <div className="tip-num">٢</div>
              <h4>كن سريع التطبيق</h4>
              <p>الحملات النشطة لها مواعيد محددة. التقديم المبكر يزيد فرص القبول.</p>
            </div>
            <div className="tip-card">
              <div className="tip-num">٣</div>
              <h4>محتوى أصيل ومبدع</h4>
              <p>العلامات التجارية تقدّر الأسلوب الشخصي. لا تنسخ، ابتكر.</p>
            </div>
            <div className="tip-card">
              <div className="tip-num">٤</div>
              <h4>التزم بالمواعيد</h4>
              <p>تسليم المحتوى في الوقت المحدد يبني سمعة قوية ويرفع مستواك.</p>
            </div>
          </div>
        </div>
      ` : ''}
      
    `;
  }
  
  function renderCampaignCard(campaign, score){
    const scoreClass = score.total >= 70 ? 'excellent' : score.total >= 50 ? 'good' : 'fair';
    return `
      <div className="campaign-card" data-id="${campaign.id}" onclick="window._openCampaign('${campaign.id}')">
        <div className="head">
          <div style={{"flex":"1"}}>
            <div className="name">${escapeHTML(campaign.name || 'حملة')}</div>
            <div className="industry">${escapeHTML(campaign.industry || campaign.brand_name || '')}</div>
          </div>
          <span className="match-score ${scoreClass}">${score.total}%</span>
        </div>
        <div className="desc">${escapeHTML(campaign.description || campaign.objective || 'حملة تسويقية على TikTok')}</div>
        <div className="meta-row">
          <div className="meta-item">
            <div className="v">${(campaign.budget_per_creator || 500).toLocaleString('en-US')}</div>
            <div className="l">ر.س للمحتوى</div>
          </div>
          <div className="meta-item">
            <div className="v">${score.grade}</div>
            <div className="l">المطابقة</div>
          </div>
        </div>
      </div>
    `;
  }
  
  // ═══ CAMPAIGNS VIEW ═══
  function renderCampaigns(){
    const c = state.currentCreator;
    const suggested = api.ugc_matching.getSuggestedCampaigns(c.id, 50);
    
    document.getElementById('campaigns-content').innerHTML = `
      <div className="page-head">
        <div>
          <h1>الحملات المتاحة</h1>
          <div className="sub">حملات تتطابق مع ملفك الشخصي ومهاراتك</div>
        </div>
      </div>
      
      ${suggested.length === 0 ? `
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <h3>لا توجد حملات متاحة</h3>
          <p>الحملات النشطة ستظهر هنا تلقائياً عند توفرها. تأكد من اكتمال ملفك لزيادة فرصك.</p>
        </div>
      ` : `
        <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fill, minmax(300px, 1fr))","gap":"14px"}}>
          ${suggested.map(s => renderCampaignCard(s.campaign, s.score)).join('')}
        </div>
      `}
    `;
  }
  
  window._openCampaign = function(campaignId){
    const campaign = api.campaigns.get(campaignId);
    if(!campaign) return;
    
    const c = state.currentCreator;
    const score = api.ugc_matching.scoreCreator(c, campaign);
    const existing = api.ugc_applications.list().find(a => a.creator_id === c.id && a.campaign_id === campaignId);
    
    const content = `
      <div className="modal-head">
        <h3>${escapeHTML(campaign.name)}</h3>
        <button className="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div className="modal-body">
        <div style={{"display":"flex","alignItems":"center","gap":"12px","marginBottom":"14px"}}>
          <span className="pill ${score.total >= 70 ? 'success' : score.total >= 50 ? 'info' : 'warning'}">
            <span className="dot"></span>مطابقة ${score.total}% • ${score.grade}
          </span>
          <span className="pill neutral"><span className="dot"></span>${escapeHTML(campaign.industry || 'متنوع')}</span>
        </div>
        
        <div style={{"marginBottom":"16px"}}>
          <div style={{"fontSize":"11px","color":"var(--text-3)","letterSpacing":"0.5px","fontFamily":"var(--font-mono)","marginBottom":"5px"}}>الوصف</div>
          <div style={{"fontSize":"13.5px","lineHeight":"1.7","color":"var(--text-2)"}}>${escapeHTML(campaign.description || campaign.objective || 'حملة تسويقية')}</div>
        </div>
        
        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"12px","marginBottom":"14px"}}>
          <div style={{"background":"var(--gray-50)","padding":"12px","borderRadius":"9px"}}>
            <div style={{"fontSize":"10.5px","color":"var(--text-3)","fontFamily":"var(--font-mono)","letterSpacing":"0.5px","marginBottom":"4px"}}>الميزانية</div>
            <div style={{"fontFamily":"var(--font-display)","fontSize":"19px","fontWeight":"700"}}>${(campaign.budget_per_creator || 500).toLocaleString('en-US')} <span style={{"fontSize":"13px","opacity":".7"}}>ر.س</span></div>
          </div>
          <div style={{"background":"var(--gray-50)","padding":"12px","borderRadius":"9px"}}>
            <div style={{"fontSize":"10.5px","color":"var(--text-3)","fontFamily":"var(--font-mono)","letterSpacing":"0.5px","marginBottom":"4px"}}>عدد المحتوى</div>
            <div style={{"fontFamily":"var(--font-display)","fontSize":"19px","fontWeight":"700"}}>${campaign.content_count || 1} <span style={{"fontSize":"13px","opacity":".7"}}>فيديو</span></div>
          </div>
        </div>
        
        <div style={{"background":"var(--brand-50)","border":"1px solid var(--brand-200)","padding":"12px 14px","borderRadius":"9px","fontSize":"12px","color":"var(--brand-800)","lineHeight":"1.6","marginBottom":"14px"}}>
          <strong>تحليل المطابقة:</strong><br/>
          المتابعون: ${score.breakdown.followers}/25 • التصنيف: ${score.breakdown.category}/25 • التفاعل: ${score.breakdown.engagement}/20 • الموقع: ${score.breakdown.location}/15
        </div>
        
        ${existing ? `
          <div style={{"textAlign":"center","padding":"14px","background":"var(--gray-50)","borderRadius":"10px","fontSize":"13px"}}>
            ✓ لقد تقدمت لهذه الحملة • الحالة: <strong>${getAppStatus(existing.status)}</strong>
          </div>
        ` : `
          <div className="field-group">
            <label>رسالة مختصرة للعميل (اختياري)</label>
            <textarea id="pitch-msg" rows="3" placeholder="لماذا أنت الأنسب لهذه الحملة؟"></textarea>
          </div>
        `}
      </div>
      <div className="modal-foot">
        <button className="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إغلاق</button>
        ${!existing ? `<button className="btn btn-success" onclick="window._applyToCampaign('${campaignId}')">تقديم طلب</button>` : ''}
      </div>
    `;
    
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-backdrop').classList.add('show');
  };
  
  window._applyToCampaign = function(campaignId){
    try {
      const pitch = document.getElementById('pitch-msg')?.value || '';
      api.ugc_apps.apply(state.currentCreator.id, campaignId, { pitch_message: pitch });
      document.getElementById('modal-backdrop').classList.remove('show');
      toast('تم إرسال طلبك بنجاح. سيتم مراجعته قريباً', 'success');
      updateBadges();
      renderView(state.activeView);
    } catch(e){
      toast(e.message, 'error');
    }
  };
  
  function getAppStatus(s){
    const map = {
      pending_review: 'قيد المراجعة',
      nominated: 'مرشّح',
      accepted: 'مقبول',
      rejected: 'مرفوض',
      in_progress: 'جاري التنفيذ',
      pending_payment: 'بانتظار الدفع',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    };
    return map[s] || s;
  }
  
  function getAppPill(s){
    const pills = {
      pending_review: 'warning',
      nominated: 'info',
      accepted: 'success',
      rejected: 'danger',
      in_progress: 'info',
      pending_payment: 'warning',
      completed: 'success',
      cancelled: 'neutral'
    };
    return pills[s] || 'neutral';
  }
  
  // ═══ APPLICATIONS VIEW ═══
  function renderApplications(){
    const c = state.currentCreator;
    const myApps = api.ugc_applications.list()
      .filter(a => a.creator_id === c.id)
      .sort((a,b) => new Date(b.applied_at) - new Date(a.applied_at));
    
    document.getElementById('applications-content').innerHTML = `
      <div className="page-head">
        <div>
          <h1>طلباتي</h1>
          <div className="sub">جميع الحملات التي تقدمت لها وحالة كل طلب</div>
        </div>
      </div>
      
      ${myApps.length === 0 ? `
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <h3>لم تتقدم لأي حملة بعد</h3>
          <p>تصفّح الحملات المتاحة وقدّم على ما يناسبك. ستظهر جميع طلباتك هنا.</p>
        </div>
      ` : `
        <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
          ${myApps.map(a => `
            <div className="card" style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <div style={{"width":"42px","height":"42px","borderRadius":"11px","background":"var(--brand-50)","color":"var(--brand-700)","display":"grid","placeItems":"center","flexShrink":"0"}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>
              <div style={{"flex":"1","minWidth":"0"}}>
                <div style={{"fontFamily":"var(--font-display)","fontWeight":"700","fontSize":"14.5px","marginBottom":"3px"}}>${escapeHTML(a.campaign_name || 'حملة')}</div>
                <div style={{"fontSize":"11.5px","color":"var(--text-3)","fontFamily":"var(--font-mono)"}}>طلبت في: ${new Date(a.applied_at).toLocaleDateString('en-GB')} • مطابقة ${a.match_score}%</div>
              </div>
              <div style={{"textAlign":"end"}}>
                <span className="pill ${getAppPill(a.status)}"><span className="dot"></span>${getAppStatus(a.status)}</span>
                ${a.accepted_fee ? `<div style={{"fontFamily":"var(--font-display)","fontWeight":"700","fontSize":"15px","marginTop":"5px"}}>${a.accepted_fee.toLocaleString('en-US')} <span style={{"fontSize":"11px","opacity":".7"}}>ر.س</span></div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `}
    `;
  }
  
  // ═══ CONTENT VIEW ═══
  function renderContent(){
    const c = state.currentCreator;
    const myApps = api.ugc_applications.list().filter(a => a.creator_id === c.id);
    const acceptedApps = myApps.filter(a => ['accepted','in_progress','pending_review','completed'].includes(a.status));
    const submissions = api.ugc_submissions.list().filter(s => s.creator_id === c.id);
    
    document.getElementById('content-content').innerHTML = `
      <div className="page-head">
        <div>
          <h1>محتوياتي</h1>
          <div className="sub">المحتوى الذي قمت بتسليمه للحملات</div>
        </div>
      </div>
      
      ${acceptedApps.length === 0 ? `
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
          <h3>لا توجد حملات نشطة</h3>
          <p>عندما يتم قبول طلبك في حملة، ستتمكن من تسليم المحتوى من هنا.</p>
        </div>
      ` : acceptedApps.map(app => {
        const appSubmissions = submissions.filter(s => s.application_id === app.id);
        return `
          <div className="card" style={{"marginBottom":"12px"}}>
            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start","gap":"12px","marginBottom":"14px"}}>
              <div>
                <div style={{"fontFamily":"var(--font-display)","fontWeight":"700","fontSize":"16px","marginBottom":"3px"}}>${escapeHTML(app.campaign_name || 'حملة')}</div>
                <div style={{"fontSize":"12px","color":"var(--text-3)"}}>المستحق: ${(app.accepted_fee || 0).toLocaleString('en-US')} ر.س</div>
              </div>
              <span className="pill ${getAppPill(app.status)}"><span className="dot"></span>${getAppStatus(app.status)}</span>
            </div>
            
            ${appSubmissions.length > 0 ? `
              <div style={{"display":"flex","flexDirection":"column","gap":"8px","marginBottom":"12px"}}>
                ${appSubmissions.map(s => `
                  <div style={{"padding":"10px 12px","background":"var(--gray-50)","borderRadius":"9px","display":"flex","alignItems":"center","gap":"10px"}}>
                    <div style={{"width":"30px","height":"30px","borderRadius":"7px","background":"#${s.status==='approved'?'dcfce7':s.status==='rejected'?'fee2e2':'fef3c7'}","color":"#${s.status==='approved'?'14532d':s.status==='rejected'?'991b1b':'92400e'}","display":"grid","placeItems":"center","flexShrink":"0"}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
                    </div>
                    <div style={{"flex":"1","fontSize":"12.5px"}}>
                      <div style={{"fontWeight":"600"}}>إصدار ${s.version}</div>
                      <div style={{"fontSize":"11px","color":"var(--text-3)","fontFamily":"var(--font-mono)"}}>${new Date(s.submitted_at).toLocaleDateString('en-GB')}</div>
                    </div>
                    <span className="pill ${s.status==='approved'?'success':s.status==='rejected'?'danger':'warning'}" style={{"fontSize":"10px"}}>
                      <span className="dot"></span>${s.status==='approved'?'معتمد':s.status==='rejected'?'مرفوض':'بانتظار المراجعة'}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${['accepted','in_progress'].includes(app.status) ? `
              <button className="btn btn-success" onclick="window._submitContent('${app.id}')" style={{"width":"100%"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                تسليم محتوى جديد
              </button>
            ` : ''}
          </div>
        `;
      }).join('')}
    `;
  }
  
  window._submitContent = function(appId){
    const content = `
      <div className="modal-head">
        <h3>تسليم محتوى</h3>
        <button className="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div className="modal-body">
        <div className="field-group">
          <label>رابط TikTok <span style={{"color":"#dc2626"}}>*</span></label>
          <input type="url" id="sub-url" placeholder="https://www.tiktok.com/@user/video/..." dir="ltr" style={{"textAlign":"start","fontFamily":"var(--font-mono)","fontSize":"12px"}}/>
        </div>
        <div className="field-group">
          <label>الوصف / Caption</label>
          <textarea id="sub-caption" rows="3" placeholder="نص الـ caption للفيديو"></textarea>
        </div>
        <div className="field-group">
          <label>ملاحظات إضافية</label>
          <textarea id="sub-notes" rows="2" placeholder="أي معلومات تريد إضافتها للمراجع"></textarea>
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إلغاء</button>
        <button className="btn btn-success" onclick="window._confirmSubmit('${appId}')">إرسال للمراجعة</button>
      </div>
    `;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-backdrop').classList.add('show');
  };
  
  window._confirmSubmit = function(appId){
    const url = document.getElementById('sub-url').value.trim();
    if(!url){
      toast('رابط TikTok مطلوب', 'error');
      return;
    }
    try {
      api.ugc_apps.submitContent(appId, {
        tiktok_url: url,
        caption: document.getElementById('sub-caption').value.trim(),
        description: document.getElementById('sub-notes').value.trim()
      });
      document.getElementById('modal-backdrop').classList.remove('show');
      toast('تم تسليم المحتوى. سيتم مراجعته قريباً', 'success');
      renderView(state.activeView);
    } catch(e){ toast(e.message, 'error'); }
  };
  
  // ═══ WALLET VIEW ═══
  function renderWallet(){
    const c = state.currentCreator;
    const balance = api.ugc_wallet.getBalance(c.id);
    const txns = api.ugc_wallet.getTransactions(c.id);
    
    document.getElementById('wallet-content').innerHTML = `
      <div className="page-head">
        <div>
          <h1>المحفظة</h1>
          <div className="sub">رصيدك، أرباحك، وحركات السحب</div>
        </div>
      </div>
      
      <div className="wallet-hero">
        <div className="label">الرصيد المتاح للسحب</div>
        <div className="amount">${balance.available.toLocaleString('en-US')}<span className="sar">ر.س</span></div>
        <div className="breakdown">
          <div className="item">
            <div className="l">معلّقة</div>
            <div className="v">${balance.pending.toLocaleString('en-US')}</div>
          </div>
          <div className="item">
            <div className="l">مسحوبة</div>
            <div className="v">${balance.paid.toLocaleString('en-US')}</div>
          </div>
          <div className="item">
            <div className="l">إجمالي</div>
            <div className="v">${balance.total_earned.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
      
      ${balance.available > 0 ? `
        <button className="btn-primary" onclick="window._requestWithdrawal()" style={{"marginBottom":"18px"}}>
          طلب سحب الرصيد
        </button>
      ` : ''}
      
      <h3 style={{"fontFamily":"var(--font-display)","fontSize":"16px","fontWeight":"700","marginBottom":"12px"}}>سجل العمليات</h3>
      
      ${txns.length === 0 ? `
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/></svg>
          <h3>لا توجد عمليات بعد</h3>
          <p>عند اعتماد محتوى من حملة، ستُضاف الأرباح هنا تلقائياً.</p>
        </div>
      ` : `
        <div className="txn-list">
          ${txns.map(t => {
            const isOut = t.type === 'withdrawal';
            const sign = isOut ? '-' : '+';
            return `
              <div className="txn-item">
                <div className="icon ${isOut ? 'out' : 'in'}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${isOut ? '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>' : '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'}
                  </svg>
                </div>
                <div className="info">
                  <div className="desc">${escapeHTML(t.description || (t.type === 'earning' ? 'أرباح حملة' : 'سحب رصيد'))}</div>
                  <div className="date">${new Date(t.created_at).toLocaleDateString('en-GB')} • ${getTxnStatus(t)}</div>
                </div>
                <div className="amount ${isOut ? 'out' : 'in'}">
                  ${sign}${parseFloat(t.amount).toLocaleString('en-US')} ر.س
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    `;
  }
  
  function getTxnStatus(t){
    if(t.type === 'earning'){
      return t.status === 'available' ? 'متاح للسحب' : 'معلّق';
    }
    if(t.type === 'withdrawal'){
      const map = { pending:'قيد المعالجة', completed:'تم التحويل', cancelled:'ملغي' };
      return map[t.status] || t.status;
    }
    return t.status || '';
  }
  
  window._requestWithdrawal = function(){
    const balance = api.ugc_wallet.getBalance(state.currentCreator.id);
    const c = state.currentCreator;
    
    if(!c.iban){
      toast('يجب إضافة IBAN في الملف الشخصي أولاً', 'error');
      return;
    }
    
    const content = `
      <div className="modal-head">
        <h3>طلب سحب الرصيد</h3>
        <button className="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div className="modal-body">
        <div style={{"background":"var(--brand-50)","border":"1px solid var(--brand-200)","padding":"12px 14px","borderRadius":"10px","marginBottom":"14px"}}>
          <div style={{"fontSize":"11px","color":"var(--brand-700)","fontFamily":"var(--font-mono)","letterSpacing":"0.5px","marginBottom":"3px"}}>الرصيد المتاح</div>
          <div style={{"fontFamily":"var(--font-display)","fontSize":"24px","fontWeight":"800","color":"var(--brand-800)"}}>${balance.available.toLocaleString('en-US')} <span style={{"fontSize":"14px"}}>ر.س</span></div>
        </div>
        
        <div className="field-group">
          <label>المبلغ المطلوب سحبه</label>
          <input type="number" id="wd-amount" placeholder="100" min="100" max="${balance.available}" dir="ltr" style={{"textAlign":"start","fontFamily":"var(--font-mono)"}}/>
          <div className="help">الحد الأدنى 100 ر.س — الحد الأقصى ${balance.available.toLocaleString('en-US')} ر.س</div>
        </div>
        
        <div style={{"background":"var(--gray-50)","padding":"12px","borderRadius":"9px","marginTop":"10px","fontSize":"12.5px","lineHeight":"1.7"}}>
          <strong>سيتم التحويل إلى:</strong><br/>
          ${escapeHTML(c.bank_name || 'البنك')}<br/>
          <span style={{"fontFamily":"var(--font-mono)","direction":"ltr","display":"inline-block"}}>${escapeHTML(c.iban)}</span><br/>
          المستفيد: ${escapeHTML(c.account_holder_name || c.full_name)}
        </div>
      </div>
      <div className="modal-foot">
        <button className="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إلغاء</button>
        <button className="btn btn-success" onclick="window._confirmWithdrawal()">تأكيد الطلب</button>
      </div>
    `;
    document.getElementById('modal-content').innerHTML = content;
    document.getElementById('modal-backdrop').classList.add('show');
  };
  
  window._confirmWithdrawal = function(){
    const amt = parseFloat(document.getElementById('wd-amount').value);
    try {
      api.ugc_wallet.requestWithdrawal(state.currentCreator.id, amt);
      document.getElementById('modal-backdrop').classList.remove('show');
      toast('تم استلام طلب السحب. سيتم التحويل خلال 7 أيام', 'success');
      renderView(state.activeView);
    } catch(e){ toast(e.message, 'error'); }
  };
  
  // ═══ PROFILE VIEW ═══
  function renderProfile(){
    const c = state.currentCreator;
    
    document.getElementById('profile-content').innerHTML = `
      <div className="page-head">
        <div>
          <h1>ملفي الشخصي</h1>
          <div className="sub">معلوماتك الأساسية وبيانات التحويل</div>
        </div>
        <button className="btn btn-success" onclick="window._saveProfile()">حفظ التغييرات</button>
      </div>
      
      <div className="card" style={{"marginBottom":"14px"}}>
        <h3 style={{"fontFamily":"var(--font-display)","fontSize":"15px","fontWeight":"700","marginBottom":"14px"}}>المعلومات الأساسية</h3>
        <div className="field-row">
          <div className="field-group">
            <label>الاسم الكامل</label>
            <input type="text" id="p-name" value="${escapeAttr(c.full_name || '')}"/>
          </div>
          <div className="field-group">
            <label>رقم الجوال</label>
            <input type="tel" value="${escapeAttr(c.phone || '')}" disabled dir="ltr" style={{"textAlign":"start","background":"var(--gray-100)"}}/>
          </div>
        </div>
        <div className="field-row">
          <div className="field-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="p-email" value="${escapeAttr(c.email || '')}" dir="ltr" style={{"textAlign":"start"}}/>
          </div>
          <div className="field-group">
            <label>المدينة</label>
            <select id="p-city">
              <option value="">اختر المدينة</option>
              ${['الرياض','جدة','الدمام','مكة','المدينة','الخبر','الطائف','تبوك','أبها','حائل','القصيم','الأحساء'].map(city => `
                <option ${c.city === city ? 'selected' : ''}>${city}</option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
      
      <div className="card" style={{"marginBottom":"14px"}}>
        <h3 style={{"fontFamily":"var(--font-display)","fontSize":"15px","fontWeight":"700","marginBottom":"14px"}}>معلومات TikTok</h3>
        <div className="field-row">
          <div className="field-group">
            <label>اسم الحساب</label>
            <input type="text" id="p-tiktok" value="${escapeAttr(c.tiktok_handle || '')}" dir="ltr" style={{"textAlign":"start"}} placeholder="@username"/>
          </div>
          <div className="field-group">
            <label>عدد المتابعين</label>
            <input type="number" id="p-followers" value="${c.tiktok_followers || 0}" dir="ltr" style={{"textAlign":"start"}}/>
          </div>
        </div>
        <div className="field-row">
          <div className="field-group">
            <label>متوسط المشاهدات</label>
            <input type="number" id="p-views" value="${c.tiktok_avg_views || 0}" dir="ltr" style={{"textAlign":"start"}}/>
          </div>
          <div className="field-group">
            <label>معدل التفاعل (%)</label>
            <input type="number" step="0.1" id="p-engagement" value="${c.engagement_rate || 0}" dir="ltr" style={{"textAlign":"start"}}/>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{"fontFamily":"var(--font-display)","fontSize":"15px","fontWeight":"700","marginBottom":"14px"}}>بيانات التحويل البنكي</h3>
        <div className="field-row">
          <div className="field-group">
            <label>البنك</label>
            <select id="p-bank">
              <option value="">اختر البنك</option>
              ${['الراجحي','الأهلي السعودي','الرياض','سامبا','البلاد','العربي الوطني','ساب','الاستثمار','الانماء','الجزيرة','اخرى'].map(bank => `
                <option ${c.bank_name === bank ? 'selected' : ''}>${bank}</option>
              `).join('')}
            </select>
          </div>
          <div className="field-group">
            <label>اسم صاحب الحساب</label>
            <input type="text" id="p-account-name" value="${escapeAttr(c.account_holder_name || '')}"/>
          </div>
        </div>
        <div className="field-group">
          <label>IBAN</label>
          <input type="text" id="p-iban" value="${escapeAttr(c.iban || '')}" dir="ltr" style={{"textAlign":"start","fontFamily":"var(--font-mono)","fontSize":"12px"}} placeholder="SA00 0000 0000 0000 0000 0000"/>
        </div>
      </div>
    `;
  }
  
  window._saveProfile = function(){
    const c = state.currentCreator;
    const update = {
      full_name: document.getElementById('p-name').value.trim(),
      email: document.getElementById('p-email').value.trim() || null,
      city: document.getElementById('p-city').value || null,
      tiktok_handle: document.getElementById('p-tiktok').value.trim() || null,
      tiktok_followers: parseInt(document.getElementById('p-followers').value) || 0,
      tiktok_avg_views: parseInt(document.getElementById('p-views').value) || 0,
      engagement_rate: parseFloat(document.getElementById('p-engagement').value) || 0,
      bank_name: document.getElementById('p-bank').value || null,
      account_holder_name: document.getElementById('p-account-name').value.trim() || null,
      iban: document.getElementById('p-iban').value.trim().replace(/\s/g,'').toUpperCase() || null
    };
    api.ugc_creators.update(c.id, update);
    state.currentCreator = api.ugc_creators.get(c.id);
    updateTopbar();
    toast('تم حفظ التغييرات', 'success');
  };
  
  // Close modal on backdrop click
  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if(e.target.id === 'modal-backdrop'){
      document.getElementById('modal-backdrop').classList.remove('show');
    }
  });
  
  init();
}

__start();
})();
</script>
</body>
