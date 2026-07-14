import React from 'react';

export default function UgcAuthScreen() {
  return (
    <>
<div className="ugc-auth-screen" id="auth-screen">
  
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
    </>
  );
}