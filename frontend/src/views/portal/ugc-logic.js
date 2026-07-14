
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
      <!-- ═══ WELCOME HERO ═══ -->
      <div class="welcome-hero">
        <div class="ava">${escapeHTML((c.full_name || 'ا').charAt(0))}</div>
        <div style="flex:1;min-width:0">
          <h2>أهلاً ${escapeHTML((c.full_name || '').split(' ')[0])} 👋</h2>
          <div class="info">
            ${isNewCreator 
              ? `<strong>أهلاً بك في عائلة صناع UGC TikTok</strong> — أكمل خطواتك البسيطة لبدء استقبال الحملات` 
              : suggested.length > 0 
                ? `لديك <strong>${suggested.length}</strong> حملات مقترحة · ${activeApps.length} نشطة الآن` 
                : `${activeApps.length} حملة نشطة · ${pendingApps.length} طلب قيد المراجعة`
            }
          </div>
        </div>
        <div class="level-chip">${levelIcon} ${levelName}</div>
      </div>
      
      <!-- ═══ QUICK ACTIONS ROW ═══ -->
      <div class="qa-grid">
        ${profilePct < 100 ? `
          <button class="qa-card primary" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">
            <div class="qa-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
            <div class="qa-body">
              <div class="qa-title">أكمل ملفك</div>
              <div class="qa-meta">${profilePct}% مكتمل · ${profileChecklist.length - completedFields.length} حقول متبقية</div>
            </div>
            <svg class="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
        ` : ''}
        
        <button class="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">
          <div class="qa-icon" style="background:linear-gradient(135deg,#25f4ee,#0891b2)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg></div>
          <div class="qa-body">
            <div class="qa-title">تصفّح الحملات</div>
            <div class="qa-meta">${platformStats.activeCampaigns} حملة نشطة الآن</div>
          </div>
          <svg class="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        
        <button class="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;applications&quot;]').click()">
          <div class="qa-icon" style="background:linear-gradient(135deg,#fbbf24,#f59e0b)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
          <div class="qa-body">
            <div class="qa-title">طلباتي</div>
            <div class="qa-meta">${activeApps.length} نشط · ${pendingApps.length} قيد المراجعة</div>
          </div>
          <svg class="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        
        <button class="qa-card" onclick="document.querySelector('.nav-link[data-view=&quot;wallet&quot;]').click()">
          <div class="qa-icon" style="background:linear-gradient(135deg,#16a34a,#15803d)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg></div>
          <div class="qa-body">
            <div class="qa-title">المحفظة</div>
            <div class="qa-meta">${balance.available.toLocaleString('en-US')} ر.س متاح</div>
          </div>
          <svg class="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>
      
      <!-- ═══ KPI CARDS ═══ -->
      <div class="kpi-grid">
        <div class="kpi-card brand">
          <div class="label">رصيدك المتاح</div>
          <div class="value">${balance.available.toLocaleString('en-US')} <span style="font-size:14px;opacity:.7">ر.س</span></div>
          <div class="meta">${balance.pending > 0 ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block;vertical-align:-1px;margin-inline-end:3px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${balance.pending.toLocaleString('en-US')} ر.س معلّقة` : balance.available > 0 ? '<span style="color:#16a34a">●</span> جاهز للسحب' : 'ابدأ بأول حملة لكسب أرباح'}</div>
        </div>
        <div class="kpi-card">
          <div class="label">إجمالي الأرباح</div>
          <div class="value">${balance.total_earned.toLocaleString('en-US')}</div>
          <div class="meta">${balance.total_earned > 0 ? `منذ ${c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) : 'الانضمام'}` : 'لم تبدأ بعد'}</div>
        </div>
        <div class="kpi-card">
          <div class="label">حملات مكتملة</div>
          <div class="value">${completedCount}</div>
          <div class="meta">${nextLevel ? `${nextThreshold - completedCount} للوصول للمستوى ${nextLevelName}` : 'أعلى مستوى!'}</div>
        </div>
        <div class="kpi-card">
          <div class="label">معدّل الموافقة</div>
          <div class="value">${myApps.length > 0 ? Math.round((myApps.filter(a => a.status === 'accepted' || a.status === 'in_progress' || a.status === 'completed').length / myApps.length) * 100) : 0}<span style="font-size:14px;opacity:.7">%</span></div>
          <div class="meta">${myApps.length === 0 ? 'لم تتقدم لأي حملة بعد' : `من ${myApps.length} طلب تقدّمت لها`}</div>
        </div>
      </div>
      
      <!-- ═══ TRUST BADGES ═══ -->
      <div class="trust-bar">
        <div class="trust-bar-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          درجة الموثوقية · ${trustScore}/${trustBadges.length}
        </div>
        <div class="trust-bar-badges">
          ${trustBadges.map(b => `
            <div class="trust-badge ${b.active ? 'active' : ''}" title="${b.label}">
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
        <!-- ═══ PROFILE COMPLETION CHECKLIST ═══ -->
        <div class="ugc-section">
          <div class="ugc-section-head">
            <div class="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              خطواتك للبدء · ${profilePct}%
            </div>
            <button class="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">إكمال →</button>
          </div>
          <div class="checklist-card">
            <div class="checklist-progress">
              <div class="checklist-progress-bar" style="width:${profilePct}%"></div>
            </div>
            <div class="checklist-items">
              ${profileChecklist.map((item, idx) => {
                const done = item.value && (Array.isArray(item.value) ? item.value.length > 0 : true);
                return `
                  <div class="checklist-item ${done ? 'done' : ''}">
                    <div class="checklist-bullet">
                      ${done 
                        ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
                        : `<span>${idx+1}</span>`
                      }
                    </div>
                    <span class="checklist-label">${item.label}</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="checklist-footer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>إكمال الملف الشخصي يزيد فرص ترشيحك بنسبة <strong>3 أضعاف</strong></span>
            </div>
          </div>
        </div>
      ` : ''}
      
      ${nextLevel ? `
        <!-- ═══ LEVEL PROGRESSION ═══ -->
        <div class="level-progress-card">
          <div class="level-progress-head">
            <div class="level-progress-title">
              <span style="font-size:20px">${levelIcon}</span>
              <div>
                <div class="level-current">${levelName}</div>
                <div class="level-next">التالي: ${nextLevelName} ${{silver:'🥈',gold:'🥇',platinum:'💎',diamond:'💠'}[nextLevel]}</div>
              </div>
            </div>
            <div class="level-count">
              <strong>${completedCount}</strong><span style="opacity:0.5">/</span>${nextThreshold}
            </div>
          </div>
          <div class="level-bar">
            <div class="level-bar-fill" style="width:${levelProgress}%"></div>
            <div class="level-bar-milestones">
              ${levelOrder.map((lv, i) => {
                if(i === 0) return '';
                const pct = (levelThresholds[lv] / nextThreshold) * 100;
                if(pct > 100) return '';
                return `<div class="level-milestone ${i <= currentLevelIdx ? 'reached' : ''}" style="inset-inline-start:${pct}%"></div>`;
              }).join('')}
            </div>
          </div>
          <div class="level-perks">
            <span>المميزات القادمة:</span>
            ${{silver:['أولوية في الترشيح','badge مميّز'],gold:['تخفيض عمولة','حملات حصرية'],platinum:['دعم مخصص','منتجات مجانية'],diamond:['تعاون مباشر','badge ماسي']}[nextLevel || 'diamond'].map(p => `<span class="perk-chip">${p}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${pendingSubmissions.length > 0 || approvedSubmissions.length > 0 ? `
        <!-- ═══ SUBMISSIONS STATUS ═══ -->
        <div class="ugc-section">
          <div class="ugc-section-head">
            <div class="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              المحتوى المُقدَّم
            </div>
            <button class="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;content&quot;]').click()">عرض الكل →</button>
          </div>
          <div class="status-cards">
            ${pendingSubmissions.length > 0 ? `
              <div class="status-card warn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <div class="sc-v">${pendingSubmissions.length}</div>
                  <div class="sc-l">قيد المراجعة</div>
                </div>
              </div>
            ` : ''}
            ${approvedSubmissions.length > 0 ? `
              <div class="status-card good">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <div>
                  <div class="sc-v">${approvedSubmissions.length}</div>
                  <div class="sc-l">معتمد</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      ` : ''}
      
      ${myTransfers.length > 0 ? `
        <!-- ═══ RECENT EARNINGS (Finance Integration) ═══ -->
        <div class="ugc-section">
          <div class="ugc-section-head">
            <div class="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              مستحقاتك المالية الأخيرة
            </div>
            <button class="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;wallet&quot;]').click()">المحفظة →</button>
          </div>
          <div class="recent-transfers">
            ${myTransfers.map(t => {
              const stage = t.workflow_stage || (t.status === 'completed' ? 'complete' : 1);
              const stageLabel = {1:'قيد التحويل البنكي', 2:'قيد إصدار الفاتورة', 3:'قيد الإرسال', complete:'مدفوع ✓'}[stage] || 'قيد المعالجة';
              const stageColor = stage === 'complete' ? '#16a34a' : '#f59e0b';
              return `
                <div class="recent-transfer-row">
                  <div class="dot" style="background:${stageColor}"></div>
                  <div style="flex:1;min-width:0">
                    <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:2px">${escapeHTML(t.campaign_name || 'حملة UGC')}</div>
                    <div style="font-size:11px;color:var(--text-3)">${stageLabel} · ${t.created_at ? new Date(t.created_at).toLocaleDateString('en-GB') : '—'}</div>
                  </div>
                  <div style="text-align:end">
                    <div style="font-family:var(--font-display);font-weight:800;color:${stage === 'complete' ? '#16a34a' : 'var(--text)'};font-size:14px">${(t.amount_total||0).toLocaleString('en-US')}<span style="font-size:10px;opacity:.7;margin-inline-start:3px">ر.س</span></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- ═══ SUGGESTED CAMPAIGNS ═══ -->
      <div class="ugc-section">
        <div class="ugc-section-head">
          <div class="title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            حملات مقترحة لك
          </div>
          <button class="link-btn" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">عرض الكل →</button>
        </div>
        
        ${suggested.length === 0 ? `
          <div class="empty-rich">
            <div class="empty-rich-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            </div>
            <h3>${isNewCreator ? 'حملاتك القادمة تنتظر اكتمال ملفك' : 'لا توجد حملات مقترحة حالياً'}</h3>
            <p>${isNewCreator 
              ? `هناك <strong>${platformStats.activeCampaigns}</strong> حملة نشطة على المنصة. أكمل ملفك ليقوم النظام بترشيحك تلقائياً.`
              : 'تابع التحديثات اليومية أو حسّن ملفك لزيادة فرص الترشيح.'
            }</p>
            <div style="margin-top:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
              ${profilePct < 100 ? `<button class="btn-action primary" onclick="document.querySelector('.nav-link[data-view=&quot;profile&quot;]').click()">إكمال ملفي</button>` : ''}
              <button class="btn-action ghost" onclick="document.querySelector('.nav-link[data-view=&quot;campaigns&quot;]').click()">تصفّح جميع الحملات</button>
            </div>
          </div>
        ` : `
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:14px">
            ${suggested.map(s => renderCampaignCard(s.campaign, s.score)).join('')}
          </div>
        `}
      </div>
      
      ${isNewCreator ? `
        <!-- ═══ TIPS FOR NEW CREATORS ═══ -->
        <div class="ugc-section">
          <div class="ugc-section-head">
            <div class="title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.7.6 1 1.5 1 2.3h6c0-.8.3-1.7 1-2.3A7 7 0 0 0 12 2Z"/></svg>
              نصائح للبداية الناجحة
            </div>
          </div>
          <div class="tips-grid">
            <div class="tip-card">
              <div class="tip-num">١</div>
              <h4>أكمل ملفك بدقة</h4>
              <p>الملف المكتمل يضاعف فرصك في الترشيح ٣ مرات. خاصة TikTok handle وعدد المتابعين.</p>
            </div>
            <div class="tip-card">
              <div class="tip-num">٢</div>
              <h4>كن سريع التطبيق</h4>
              <p>الحملات النشطة لها مواعيد محددة. التقديم المبكر يزيد فرص القبول.</p>
            </div>
            <div class="tip-card">
              <div class="tip-num">٣</div>
              <h4>محتوى أصيل ومبدع</h4>
              <p>العلامات التجارية تقدّر الأسلوب الشخصي. لا تنسخ، ابتكر.</p>
            </div>
            <div class="tip-card">
              <div class="tip-num">٤</div>
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
      <div class="campaign-card" data-id="${campaign.id}" onclick="window._openCampaign('${campaign.id}')">
        <div class="head">
          <div style="flex:1">
            <div class="name">${escapeHTML(campaign.name || 'حملة')}</div>
            <div class="industry">${escapeHTML(campaign.industry || campaign.brand_name || '')}</div>
          </div>
          <span class="match-score ${scoreClass}">${score.total}%</span>
        </div>
        <div class="desc">${escapeHTML(campaign.description || campaign.objective || 'حملة تسويقية على TikTok')}</div>
        <div class="meta-row">
          <div class="meta-item">
            <div class="v">${(campaign.budget_per_creator || 500).toLocaleString('en-US')}</div>
            <div class="l">ر.س للمحتوى</div>
          </div>
          <div class="meta-item">
            <div class="v">${score.grade}</div>
            <div class="l">المطابقة</div>
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
      <div class="page-head">
        <div>
          <h1>الحملات المتاحة</h1>
          <div class="sub">حملات تتطابق مع ملفك الشخصي ومهاراتك</div>
        </div>
      </div>
      
      ${suggested.length === 0 ? `
        <div class="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          <h3>لا توجد حملات متاحة</h3>
          <p>الحملات النشطة ستظهر هنا تلقائياً عند توفرها. تأكد من اكتمال ملفك لزيادة فرصك.</p>
        </div>
      ` : `
        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(300px, 1fr));gap:14px">
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
      <div class="modal-head">
        <h3>${escapeHTML(campaign.name)}</h3>
        <button class="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span class="pill ${score.total >= 70 ? 'success' : score.total >= 50 ? 'info' : 'warning'}">
            <span class="dot"></span>مطابقة ${score.total}% • ${score.grade}
          </span>
          <span class="pill neutral"><span class="dot"></span>${escapeHTML(campaign.industry || 'متنوع')}</span>
        </div>
        
        <div style="margin-bottom:16px">
          <div style="font-size:11px;color:var(--text-3);letter-spacing:0.5px;font-family:var(--font-mono);margin-bottom:5px">الوصف</div>
          <div style="font-size:13.5px;line-height:1.7;color:var(--text-2)">${escapeHTML(campaign.description || campaign.objective || 'حملة تسويقية')}</div>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div style="background:var(--gray-50);padding:12px;border-radius:9px">
            <div style="font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);letter-spacing:0.5px;margin-bottom:4px">الميزانية</div>
            <div style="font-family:var(--font-display);font-size:19px;font-weight:700">${(campaign.budget_per_creator || 500).toLocaleString('en-US')} <span style="font-size:13px;opacity:.7">ر.س</span></div>
          </div>
          <div style="background:var(--gray-50);padding:12px;border-radius:9px">
            <div style="font-size:10.5px;color:var(--text-3);font-family:var(--font-mono);letter-spacing:0.5px;margin-bottom:4px">عدد المحتوى</div>
            <div style="font-family:var(--font-display);font-size:19px;font-weight:700">${campaign.content_count || 1} <span style="font-size:13px;opacity:.7">فيديو</span></div>
          </div>
        </div>
        
        <div style="background:var(--brand-50);border:1px solid var(--brand-200);padding:12px 14px;border-radius:9px;font-size:12px;color:var(--brand-800);line-height:1.6;margin-bottom:14px">
          <strong>تحليل المطابقة:</strong><br>
          المتابعون: ${score.breakdown.followers}/25 • التصنيف: ${score.breakdown.category}/25 • التفاعل: ${score.breakdown.engagement}/20 • الموقع: ${score.breakdown.location}/15
        </div>
        
        ${existing ? `
          <div style="text-align:center;padding:14px;background:var(--gray-50);border-radius:10px;font-size:13px">
            ✓ لقد تقدمت لهذه الحملة • الحالة: <strong>${getAppStatus(existing.status)}</strong>
          </div>
        ` : `
          <div class="field-group">
            <label>رسالة مختصرة للعميل (اختياري)</label>
            <textarea id="pitch-msg" rows="3" placeholder="لماذا أنت الأنسب لهذه الحملة؟"></textarea>
          </div>
        `}
      </div>
      <div class="modal-foot">
        <button class="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إغلاق</button>
        ${!existing ? `<button class="btn btn-success" onclick="window._applyToCampaign('${campaignId}')">تقديم طلب</button>` : ''}
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
      <div class="page-head">
        <div>
          <h1>طلباتي</h1>
          <div class="sub">جميع الحملات التي تقدمت لها وحالة كل طلب</div>
        </div>
      </div>
      
      ${myApps.length === 0 ? `
        <div class="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <h3>لم تتقدم لأي حملة بعد</h3>
          <p>تصفّح الحملات المتاحة وقدّم على ما يناسبك. ستظهر جميع طلباتك هنا.</p>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px">
          ${myApps.map(a => `
            <div class="card" style="display:flex;align-items:center;gap:14px">
              <div style="width:42px;height:42px;border-radius:11px;background:var(--brand-50);color:var(--brand-700);display:grid;place-items:center;flex-shrink:0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-family:var(--font-display);font-weight:700;font-size:14.5px;margin-bottom:3px">${escapeHTML(a.campaign_name || 'حملة')}</div>
                <div style="font-size:11.5px;color:var(--text-3);font-family:var(--font-mono)">طلبت في: ${new Date(a.applied_at).toLocaleDateString('en-GB')} • مطابقة ${a.match_score}%</div>
              </div>
              <div style="text-align:end">
                <span class="pill ${getAppPill(a.status)}"><span class="dot"></span>${getAppStatus(a.status)}</span>
                ${a.accepted_fee ? `<div style="font-family:var(--font-display);font-weight:700;font-size:15px;margin-top:5px">${a.accepted_fee.toLocaleString('en-US')} <span style="font-size:11px;opacity:.7">ر.س</span></div>` : ''}
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
      <div class="page-head">
        <div>
          <h1>محتوياتي</h1>
          <div class="sub">المحتوى الذي قمت بتسليمه للحملات</div>
        </div>
      </div>
      
      ${acceptedApps.length === 0 ? `
        <div class="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
          <h3>لا توجد حملات نشطة</h3>
          <p>عندما يتم قبول طلبك في حملة، ستتمكن من تسليم المحتوى من هنا.</p>
        </div>
      ` : acceptedApps.map(app => {
        const appSubmissions = submissions.filter(s => s.application_id === app.id);
        return `
          <div class="card" style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px">
              <div>
                <div style="font-family:var(--font-display);font-weight:700;font-size:16px;margin-bottom:3px">${escapeHTML(app.campaign_name || 'حملة')}</div>
                <div style="font-size:12px;color:var(--text-3)">المستحق: ${(app.accepted_fee || 0).toLocaleString('en-US')} ر.س</div>
              </div>
              <span class="pill ${getAppPill(app.status)}"><span class="dot"></span>${getAppStatus(app.status)}</span>
            </div>
            
            ${appSubmissions.length > 0 ? `
              <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
                ${appSubmissions.map(s => `
                  <div style="padding:10px 12px;background:var(--gray-50);border-radius:9px;display:flex;align-items:center;gap:10px">
                    <div style="width:30px;height:30px;border-radius:7px;background:#${s.status==='approved'?'dcfce7':s.status==='rejected'?'fee2e2':'fef3c7'};color:#${s.status==='approved'?'14532d':s.status==='rejected'?'991b1b':'92400e'};display:grid;place-items:center;flex-shrink:0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
                    </div>
                    <div style="flex:1;font-size:12.5px">
                      <div style="font-weight:600">إصدار ${s.version}</div>
                      <div style="font-size:11px;color:var(--text-3);font-family:var(--font-mono)">${new Date(s.submitted_at).toLocaleDateString('en-GB')}</div>
                    </div>
                    <span class="pill ${s.status==='approved'?'success':s.status==='rejected'?'danger':'warning'}" style="font-size:10px">
                      <span class="dot"></span>${s.status==='approved'?'معتمد':s.status==='rejected'?'مرفوض':'بانتظار المراجعة'}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${['accepted','in_progress'].includes(app.status) ? `
              <button class="btn btn-success" onclick="window._submitContent('${app.id}')" style="width:100%">
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
      <div class="modal-head">
        <h3>تسليم محتوى</h3>
        <button class="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div class="modal-body">
        <div class="field-group">
          <label>رابط TikTok <span style="color:#dc2626">*</span></label>
          <input type="url" id="sub-url" placeholder="https://www.tiktok.com/@user/video/..." dir="ltr" style="text-align:start;font-family:var(--font-mono);font-size:12px">
        </div>
        <div class="field-group">
          <label>الوصف / Caption</label>
          <textarea id="sub-caption" rows="3" placeholder="نص الـ caption للفيديو"></textarea>
        </div>
        <div class="field-group">
          <label>ملاحظات إضافية</label>
          <textarea id="sub-notes" rows="2" placeholder="أي معلومات تريد إضافتها للمراجع"></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إلغاء</button>
        <button class="btn btn-success" onclick="window._confirmSubmit('${appId}')">إرسال للمراجعة</button>
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
      <div class="page-head">
        <div>
          <h1>المحفظة</h1>
          <div class="sub">رصيدك، أرباحك، وحركات السحب</div>
        </div>
      </div>
      
      <div class="wallet-hero">
        <div class="label">الرصيد المتاح للسحب</div>
        <div class="amount">${balance.available.toLocaleString('en-US')}<span class="sar">ر.س</span></div>
        <div class="breakdown">
          <div class="item">
            <div class="l">معلّقة</div>
            <div class="v">${balance.pending.toLocaleString('en-US')}</div>
          </div>
          <div class="item">
            <div class="l">مسحوبة</div>
            <div class="v">${balance.paid.toLocaleString('en-US')}</div>
          </div>
          <div class="item">
            <div class="l">إجمالي</div>
            <div class="v">${balance.total_earned.toLocaleString('en-US')}</div>
          </div>
        </div>
      </div>
      
      ${balance.available > 0 ? `
        <button class="btn-primary" onclick="window._requestWithdrawal()" style="margin-bottom:18px">
          طلب سحب الرصيد
        </button>
      ` : ''}
      
      <h3 style="font-family:var(--font-display);font-size:16px;font-weight:700;margin-bottom:12px">سجل العمليات</h3>
      
      ${txns.length === 0 ? `
        <div class="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/></svg>
          <h3>لا توجد عمليات بعد</h3>
          <p>عند اعتماد محتوى من حملة، ستُضاف الأرباح هنا تلقائياً.</p>
        </div>
      ` : `
        <div class="txn-list">
          ${txns.map(t => {
            const isOut = t.type === 'withdrawal';
            const sign = isOut ? '-' : '+';
            return `
              <div class="txn-item">
                <div class="icon ${isOut ? 'out' : 'in'}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${isOut ? '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>' : '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>'}
                  </svg>
                </div>
                <div class="info">
                  <div class="desc">${escapeHTML(t.description || (t.type === 'earning' ? 'أرباح حملة' : 'سحب رصيد'))}</div>
                  <div class="date">${new Date(t.created_at).toLocaleDateString('en-GB')} • ${getTxnStatus(t)}</div>
                </div>
                <div class="amount ${isOut ? 'out' : 'in'}">
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
      <div class="modal-head">
        <h3>طلب سحب الرصيد</h3>
        <button class="modal-close" onclick="document.getElementById('modal-backdrop').classList.remove('show')">×</button>
      </div>
      <div class="modal-body">
        <div style="background:var(--brand-50);border:1px solid var(--brand-200);padding:12px 14px;border-radius:10px;margin-bottom:14px">
          <div style="font-size:11px;color:var(--brand-700);font-family:var(--font-mono);letter-spacing:0.5px;margin-bottom:3px">الرصيد المتاح</div>
          <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--brand-800)">${balance.available.toLocaleString('en-US')} <span style="font-size:14px">ر.س</span></div>
        </div>
        
        <div class="field-group">
          <label>المبلغ المطلوب سحبه</label>
          <input type="number" id="wd-amount" placeholder="100" min="100" max="${balance.available}" dir="ltr" style="text-align:start;font-family:var(--font-mono)">
          <div class="help">الحد الأدنى 100 ر.س — الحد الأقصى ${balance.available.toLocaleString('en-US')} ر.س</div>
        </div>
        
        <div style="background:var(--gray-50);padding:12px;border-radius:9px;margin-top:10px;font-size:12.5px;line-height:1.7">
          <strong>سيتم التحويل إلى:</strong><br>
          ${escapeHTML(c.bank_name || 'البنك')}<br>
          <span style="font-family:var(--font-mono);direction:ltr;display:inline-block">${escapeHTML(c.iban)}</span><br>
          المستفيد: ${escapeHTML(c.account_holder_name || c.full_name)}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-ghost" onclick="document.getElementById('modal-backdrop').classList.remove('show')">إلغاء</button>
        <button class="btn btn-success" onclick="window._confirmWithdrawal()">تأكيد الطلب</button>
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
      <div class="page-head">
        <div>
          <h1>ملفي الشخصي</h1>
          <div class="sub">معلوماتك الأساسية وبيانات التحويل</div>
        </div>
        <button class="btn btn-success" onclick="window._saveProfile()">حفظ التغييرات</button>
      </div>
      
      <div class="card" style="margin-bottom:14px">
        <h3 style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px">المعلومات الأساسية</h3>
        <div class="field-row">
          <div class="field-group">
            <label>الاسم الكامل</label>
            <input type="text" id="p-name" value="${escapeAttr(c.full_name || '')}">
          </div>
          <div class="field-group">
            <label>رقم الجوال</label>
            <input type="tel" value="${escapeAttr(c.phone || '')}" disabled dir="ltr" style="text-align:start;background:var(--gray-100)">
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>البريد الإلكتروني</label>
            <input type="email" id="p-email" value="${escapeAttr(c.email || '')}" dir="ltr" style="text-align:start">
          </div>
          <div class="field-group">
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
      
      <div class="card" style="margin-bottom:14px">
        <h3 style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px">معلومات TikTok</h3>
        <div class="field-row">
          <div class="field-group">
            <label>اسم الحساب</label>
            <input type="text" id="p-tiktok" value="${escapeAttr(c.tiktok_handle || '')}" dir="ltr" style="text-align:start" placeholder="@username">
          </div>
          <div class="field-group">
            <label>عدد المتابعين</label>
            <input type="number" id="p-followers" value="${c.tiktok_followers || 0}" dir="ltr" style="text-align:start">
          </div>
        </div>
        <div class="field-row">
          <div class="field-group">
            <label>متوسط المشاهدات</label>
            <input type="number" id="p-views" value="${c.tiktok_avg_views || 0}" dir="ltr" style="text-align:start">
          </div>
          <div class="field-group">
            <label>معدل التفاعل (%)</label>
            <input type="number" step="0.1" id="p-engagement" value="${c.engagement_rate || 0}" dir="ltr" style="text-align:start">
          </div>
        </div>
      </div>
      
      <div class="card">
        <h3 style="font-family:var(--font-display);font-size:15px;font-weight:700;margin-bottom:14px">بيانات التحويل البنكي</h3>
        <div class="field-row">
          <div class="field-group">
            <label>البنك</label>
            <select id="p-bank">
              <option value="">اختر البنك</option>
              ${['الراجحي','الأهلي السعودي','الرياض','سامبا','البلاد','العربي الوطني','ساب','الاستثمار','الانماء','الجزيرة','اخرى'].map(bank => `
                <option ${c.bank_name === bank ? 'selected' : ''}>${bank}</option>
              `).join('')}
            </select>
          </div>
          <div class="field-group">
            <label>اسم صاحب الحساب</label>
            <input type="text" id="p-account-name" value="${escapeAttr(c.account_holder_name || '')}">
          </div>
        </div>
        <div class="field-group">
          <label>IBAN</label>
          <input type="text" id="p-iban" value="${escapeAttr(c.iban || '')}" dir="ltr" style="text-align:start;font-family:var(--font-mono);font-size:12px" placeholder="SA00 0000 0000 0000 0000 0000">
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
