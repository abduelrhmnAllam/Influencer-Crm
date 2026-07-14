import React, { useState, useEffect } from 'react';
import { Icon } from '../../legacy/LegacyIconSprite';
import { useToast } from '../../hooks/useToast';
import api from '../../api/client';
import './InfluencerPortalPage.css';

// Using Google icon SVG
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" style={{display: 'block'}}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export default function InfluencerPortalPage() {
  const { showToast } = useToast();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // User state
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Form states
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Mock checking session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('inf_portal_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    // Mock Login Logic
    setTimeout(() => {
      if (loginId && loginPw) {
        const mockUser = {
          id: 1,
          name: 'المؤثر التجريبي',
          username: loginId,
          last_login_at: new Date().toISOString()
        };
        setUser(mockUser);
        setIsAuthenticated(true);
        localStorage.setItem('inf_portal_user', JSON.stringify(mockUser));
        showToast('success', 'تم تسجيل الدخول بنجاح');
      } else {
        setAuthError('البيانات غير صحيحة');
      }
      setAuthLoading(false);
    }, 1000);
  };

  const handleGoogleAuth = () => {
    setAuthError('');
    setAuthLoading(true);
    // In a real app, you would redirect to Google OAuth or use a popup
    setTimeout(() => {
      const mockUser = {
        id: 2,
        name: 'مستخدم جوجل',
        username: 'google_user',
        last_login_at: new Date().toISOString()
      };
      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('inf_portal_user', JSON.stringify(mockUser));
      showToast('success', 'تم التسجيل / الدخول بواسطة جوجل بنجاح');
      setAuthLoading(false);
    }, 1200);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('inf_portal_user');
    setActiveTab('home');
    setLoginId('');
    setLoginPw('');
  };

  if (!isAuthenticated) {
    return (
      <div className="portal-app" dir="rtl">
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-logo">SC</div>
            <h1 className="auth-title">بوابة المؤثرين</h1>
            <p className="auth-sub">سجّل دخولك لمتابعة حملاتك ومستحقاتك المالية</p>

            {authError && <div className="auth-err">{authError}</div>}

            <button className="google-auth-btn" onClick={handleGoogleAuth} disabled={authLoading}>
              <GoogleIcon />
              المتابعة باستخدام حساب جوجل
            </button>

            <div className="auth-divider"><span>أو</span></div>

            <form onSubmit={handleLogin}>
              <div className="portal-form-group">
                <label className="portal-form-label">اسم المستخدم / الجوال / البريد</label>
                <input 
                  type="text" 
                  className="portal-form-input" 
                  placeholder="مثال: inf1" 
                  value={loginId} 
                  onChange={e => setLoginId(e.target.value)} 
                  disabled={authLoading}
                />
              </div>
              <div className="portal-form-group">
                <label className="portal-form-label">كلمة المرور</label>
                <input 
                  type="password" 
                  className="portal-form-input" 
                  placeholder="••••••" 
                  value={loginPw} 
                  onChange={e => setLoginPw(e.target.value)} 
                  disabled={authLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width: '100%'}}
                disabled={authLoading}
              >
                {authLoading ? 'جاري التحقق...' : 'دخول'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-app portal-shell animate-fade-in" dir="rtl">
      <div className="portal-topbar">
        <div className="portal-topbar-left">
          <div className="portal-topbar-logo">SC</div>
          <div className="portal-topbar-title">
            <span className="name-text">بوابة المؤثرين</span>
            <span className="sub">Smart Code</span>
          </div>
        </div>
        <div className="portal-topbar-right">
          <div className="portal-topbar-user">
            <div className="portal-topbar-avatar">{String(user?.name || 'م').charAt(0)}</div>
            <span className="portal-topbar-user-name">{user?.name}</span>
          </div>
          <button className="portal-topbar-btn" title="تسجيل خروج" onClick={handleLogout}>
            <Icon name="logout" className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="portal-nav-tabs">
        {['home', 'campaigns', 'tasks', 'transfers', 'invoices', 'profile'].map(tab => (
          <button key={tab} className={`portal-nav-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'home' ? 'الرئيسية' : 
             tab === 'campaigns' ? 'حملاتي' : 
             tab === 'tasks' ? 'الإعلانات المطلوبة' : 
             tab === 'transfers' ? 'التحويلات' : 
             tab === 'invoices' ? 'الفواتير' : 'بياناتي'}
          </button>
        ))}
      </nav>

      <main className="portal-main-content">
        {activeTab === 'home' && (
          <div className="animate-fade-in">
            <div className="portal-hero">
              <h1>أهلاً، {user?.name} 👋</h1>
              <p>هذه لوحة المتابعة الكاملة لحملاتك ومستحقاتك المالية مع Smart Code</p>
            </div>

            <div className="portal-kpi-grid">
              <div className="portal-kpi-pill">
                <div className="portal-kpi-label">الحملات النشطة</div>
                <div className="portal-kpi-value num">0</div>
                <div className="portal-kpi-extra">من إجمالي 0 حملة</div>
              </div>
              <div className="portal-kpi-pill">
                <div className="portal-kpi-label">تم استلامها</div>
                <div className="portal-kpi-value num text-success-600">0 ر.س</div>
                <div className="portal-kpi-extra">0 تحويل إجمالاً</div>
              </div>
              <div className="portal-kpi-pill">
                <div className="portal-kpi-label">بانتظار رفع فاتورتك</div>
                <div className="portal-kpi-value num text-warning-600">0 ر.س</div>
                <div className="portal-kpi-extra">ارفع الفاتورة لتسلّم المبلغ</div>
              </div>
            </div>

            <div className="portal-section">
              <div className="portal-section-head">
                <h3 className="portal-section-title">تنبيهات تحتاج انتباهك</h3>
              </div>
              <div className="portal-section-body">
                <div className="portal-alerts-grid">
                  <div className="portal-alert warning">
                    <div className="portal-alert-icon"><Icon name="exclamation" className="w-5 h-5" /></div>
                    <div className="portal-alert-body">
                      <div className="portal-alert-title">بيانات الحساب البنكي غير مكتملة</div>
                      <div className="portal-alert-msg">يرجى استكمال بيانات الآيبان لنتمكن من تحويل مستحقاتك في وقتها.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="portal-section">
              <div className="portal-section-head">
                <h3 className="portal-section-title">حالة الملف الشخصي</h3>
              </div>
              <div className="portal-section-body">
                <div className="portal-detail-rows">
                  <div className="portal-detail-row">
                    <div className="portal-detail-label">اكتمال الملف</div>
                    <div className="portal-detail-value"><span className="px-2 py-1 bg-warning-50 text-warning-700 rounded-full text-[11px] font-bold border border-warning-200">يحتاج إكمال</span></div>
                  </div>
                  <div className="portal-detail-row">
                    <div className="portal-detail-label">البيانات البنكية</div>
                    <div className="portal-detail-value"><span className="px-2 py-1 bg-danger-50 text-danger-700 rounded-full text-[11px] font-bold border border-danger-200">غير مكتملة</span></div>
                  </div>
                  <div className="portal-detail-row">
                    <div className="portal-detail-label">مهام قيد التنفيذ</div>
                    <div className="portal-detail-value"><span className="num font-bold">0</span> إعلان</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'home' && (
          <div className="portal-empty animate-fade-in">
            <Icon name="document-text" className="w-10 h-10 mx-auto text-surface-300 mb-2" />
            <div className="font-bold text-surface-900 mb-1">لا توجد بيانات</div>
            <div className="text-sm">لم يتم العثور على سجلات في هذا القسم.</div>
          </div>
        )}
      </main>
    </div>
  );
}
