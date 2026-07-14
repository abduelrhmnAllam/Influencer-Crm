import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../hooks/useToast';
import './UgcAdminPage.css';

export default function UgcAdminPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Data states
  const [creators, setCreators] = useState([]);
  const [applications, setApplications] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);

  // Filter states
  const [creatorFilters, setCreatorFilters] = useState({ search: '', city: '', gender: '', level: '', verifiedOnly: false });
  const [matchFilters, setMatchFilters] = useState({ campaignId: '', minScore: 70 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real app these would be proper API calls to specific endpoints
      // For legacy parity we simulate fetching all these lists
      // Assuming api endpoints exist, or we mock them if not available in current backend
      const [resC, resA, resS, resT, resP, resCamp, resAllCamps] = await Promise.allSettled([
        api.get('/api/v1/ugc_creators').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/ugc_applications').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/ugc_submissions').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/ugc_transactions').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/ugc_packages').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/ugc_campaigns').catch(() => ({ data: { data: [] } })),
        api.get('/api/v1/campaigns').catch(() => ({ data: { data: [] } }))
      ]);

      setCreators(resC.status === 'fulfilled' ? resC.value.data.data || [] : []);
      setApplications(resA.status === 'fulfilled' ? resA.value.data.data || [] : []);
      setSubmissions(resS.status === 'fulfilled' ? resS.value.data.data || [] : []);
      setTransactions(resT.status === 'fulfilled' ? resT.value.data.data || [] : []);
      setPackages(resP.status === 'fulfilled' ? resP.value.data.data || [] : []);
      setCampaigns(resCamp.status === 'fulfilled' ? resCamp.value.data.data || [] : []);
      setAllCampaigns(resAllCamps.status === 'fulfilled' ? resAllCamps.value.data.data || [] : []);

    } catch (err) {
      console.error(err);
      showToast('error', 'فشل في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const updateTabCounts = () => ({
    creators: creators.length,
    applications: applications.filter(a => a.status === 'pending').length,
    submissions: submissions.filter(s => s.status === 'in_review').length,
    packages: packages.length,
    campaigns: campaigns.filter(x => x.status !== 'completed' && x.status !== 'cancelled').length
  });

  const counts = updateTabCounts();
  const publicLink = window.location.origin + '/ugc-portal';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicLink).then(() => showToast('success', 'تم نسخ الرابط'));
  };

  const getLevelLabel = (lvl) => {
    const m = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', diamond: 'ماسي' };
    return m[lvl] || lvl;
  };

  const renderHero = () => {
    const pendingApps = applications.filter(a => a.status === 'pending').length;
    const inReviewSubs = submissions.filter(s => s.status === 'in_review').length;
    const totalEarnings = transactions.filter(t => t.type === 'credit' && t.status === 'completed')
      .reduce((s, t) => s + (t.amount || 0), 0);

    return (
      <div className="ugc-hero">
        <div className="ugc-hero-top">
          <div className="ugc-hero-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="m23 7-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h1>UGC — شبكة صناع المحتوى</h1>
            <div className="sub">منصة متكاملة لإدارة آلاف صناع محتوى TikTok مع محرك مطابقة ذكي</div>
          </div>
        </div>

        <div className="ugc-hero-stats">
          <div className="ugc-hero-stat">
            <div className="v">{creators.length.toLocaleString('en-US')}</div>
            <div className="l">صانع محتوى</div>
          </div>
          <div className="ugc-hero-stat">
            <div className="v">{creators.filter(c => c.verification_status === 'verified').length.toLocaleString('en-US')}</div>
            <div className="l">موثّق</div>
          </div>
          <div className="ugc-hero-stat">
            <div className="v">{pendingApps}</div>
            <div className="l">طلبات معلّقة</div>
          </div>
          <div className="ugc-hero-stat">
            <div className="v">{inReviewSubs}</div>
            <div className="l">محتوى للمراجعة</div>
          </div>
          <div className="ugc-hero-stat">
            <div className="v">{(totalEarnings / 1000).toFixed(1)}K</div>
            <div className="l">ر.س مدفوعة</div>
          </div>
        </div>

        <div className="ugc-share-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>رابط التسجيل العام:</span>
          <code>{publicLink}</code>
          <button onClick={handleCopyLink}>نسخ</button>
          <button onClick={() => window.open(publicLink, '_blank')}>فتح</button>
        </div>
      </div>
    );
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'dashboard', label: 'نظرة عامة', icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg> },
      { id: 'creators', label: 'صناع المحتوى', count: counts.creators, icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
      { id: 'match', label: 'المطابقة الذكية', icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
      { id: 'applications', label: 'الطلبات', count: counts.applications, icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
      { id: 'submissions', label: 'المحتوى', count: counts.submissions, icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg> },
      { id: 'packages', label: 'الباقات', count: counts.packages, icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
      { id: 'ucampaigns', label: 'حملات UGC', count: counts.campaigns, icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg> },
      { id: 'payments', label: 'المدفوعات', icon: <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> }
    ];

    return (
      <div className="ugc-tabs">
        {tabs.map(t => (
          <button key={t.id} className={`ugc-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.count !== undefined && <span className="count">{t.count}</span>}
          </button>
        ))}
      </div>
    );
  };

  const DashboardTab = () => {
    const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 7);
    const recentCreators = creators.filter(c => new Date(c.registered_at || c.created_at) > last7Days);
    const pendingPayments = transactions.filter(t => t.type === 'credit' && t.status === 'pending');
    const pendingAmount = pendingPayments.reduce((s, t) => s + (t.amount || 0), 0);
    const approvedSubs = submissions.filter(s => s.status === 'approved').length;

    const levels = { bronze: 0, silver: 0, gold: 0, platinum: 0, diamond: 0 };
    creators.forEach(c => { if (levels[c.level] !== undefined) levels[c.level]++; });

    return (
      <div>
        <div className="ugc-stats">
          <div className="ugc-stat">
            <div className="l">جديد هذا الأسبوع</div>
            <div className="v">{recentCreators.length}</div>
            <div className="m">صانع محتوى مسجّل</div>
          </div>
          <div className="ugc-stat">
            <div className="l">المحتوى المعتمد</div>
            <div className="v">{approvedSubs.toLocaleString('en-US')}</div>
            <div className="m">من {submissions.length} إجمالي</div>
          </div>
          <div className="ugc-stat">
            <div className="l">مدفوعات معلّقة</div>
            <div className="v">{pendingAmount.toLocaleString('en-US')}</div>
            <div className="m">{pendingPayments.length} حوالة</div>
          </div>
          <div className="ugc-stat">
            <div className="l">معدل التفاعل</div>
            <div className="v">{creators.length > 0 ? (creators.reduce((s, c) => s + (c.engagement_rate || 0), 0) / creators.length).toFixed(1) : 0}%</div>
            <div className="m">متوسط الشبكة</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              توزيع المستويات
            </h3>
            {Object.entries(levels).map(([lvl, n]) => (
              <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={`lvl-pill ${lvl}`}>{getLevelLabel(lvl)}</span>
                <div style={{ flex: 1, background: 'var(--gray-100)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--brand-500)', width: `${creators.length > 0 ? (n / creators.length) * 100 : 0}%`, transition: 'width .3s' }}></div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, minWidth: '30px', textAlign: 'start' }}>{n}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              آخر المسجّلين
            </h3>
            {[...creators].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 5).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#25f4ee,#fe2c55)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '13px' }}>
                  {(c.full_name || '?').charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.full_name || 'بدون اسم'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', direction: 'ltr', textAlign: 'start' }}>{c.tiktok_handle || c.phone || ''}</div>
                </div>
                <span className={`lvl-pill ${c.level || 'bronze'}`}>{getLevelLabel(c.level)}</span>
              </div>
            ))}
            {creators.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>لا يوجد بعد</div>}
          </div>
        </div>
      </div>
    );
  };

  const CreatorsTab = () => {
    const filtered = creators.filter(c => {
      const f = creatorFilters;
      if (f.search) {
        const q = f.search.toLowerCase();
        const hay = ((c.full_name || '') + ' ' + (c.tiktok_handle || '') + ' ' + (c.phone || '') + ' ' + (c.email || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.city && c.city !== f.city) return false;
      if (f.gender && c.gender !== f.gender) return false;
      if (f.level && c.level !== f.level) return false;
      if (f.verifiedOnly && c.verification_status !== 'verified') return false;
      return true;
    });

    return (
      <div>
        <div className="ugc-filters">
          <div className="ugc-filters-row">
            <input type="text" className="ugc-search" placeholder="ابحث بالاسم، الحساب، أو الجوال..." value={creatorFilters.search} onChange={e => setCreatorFilters({ ...creatorFilters, search: e.target.value })} />
            <select value={creatorFilters.city} onChange={e => setCreatorFilters({ ...creatorFilters, city: e.target.value })}>
              <option value="">كل المدن</option>
              <option value="الرياض">الرياض</option>
              <option value="جدة">جدة</option>
              <option value="الدمام">الدمام</option>
              <option value="مكة">مكة</option>
              <option value="المدينة">المدينة</option>
            </select>
            <select value={creatorFilters.gender} onChange={e => setCreatorFilters({ ...creatorFilters, gender: e.target.value })}>
              <option value="">كل الفئات</option>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            <select value={creatorFilters.level} onChange={e => setCreatorFilters({ ...creatorFilters, level: e.target.value })}>
              <option value="">كل المستويات</option>
              <option value="bronze">برونزي</option>
              <option value="silver">فضي</option>
              <option value="gold">ذهبي</option>
              <option value="platinum">بلاتيني</option>
              <option value="diamond">ماسي</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--text-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={creatorFilters.verifiedOnly} onChange={e => setCreatorFilters({ ...creatorFilters, verifiedOnly: e.target.checked })} />
              الموثّقين فقط
            </label>
            <button className="clear" onClick={() => setCreatorFilters({ search: '', city: '', gender: '', level: '', verifiedOnly: false })}>مسح الفلاتر</button>
            <span className="ugc-results-count">{filtered.length} من {creators.length}</span>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            <h3>لا توجد نتائج</h3>
            <p>غيّر الفلاتر أو شارك رابط البوابة لاستقطاب المزيد من الصناع.</p>
          </div>
        ) : (
          <div className="ugc-creators-grid">
            {filtered.map(c => {
              const followers = (c.tiktok_followers || 0);
              const followersK = followers >= 1000 ? (followers / 1000).toFixed(1) + 'K' : followers;
              return (
                <div key={c.id} className="ugc-creator-card" onClick={() => showToast('info', 'سيتم فتح تفاصيل الصانع في المستقبل')}>
                  <span className={`level lvl-pill ${c.level || 'bronze'}`}>{getLevelLabel(c.level)}</span>
                  <div className="top">
                    <div className="ava">{(c.full_name || '?').charAt(0)}</div>
                    <div className="info">
                      <div className="name">{c.full_name || 'بدون اسم'}</div>
                      <div className="handle">{c.tiktok_handle || '@' + (c.phone || '').slice(-9)}</div>
                    </div>
                  </div>
                  <div className="stats-row">
                    <div className="s-item">
                      <div className="v">{followersK}</div>
                      <div className="l">متابع</div>
                    </div>
                    <div className="s-item">
                      <div className="v">{(c.engagement_rate || 0).toFixed(1)}%</div>
                      <div className="l">تفاعل</div>
                    </div>
                    <div className="s-item">
                      <div className="v">{c.completed_campaigns || 0}</div>
                      <div className="l">حملة</div>
                    </div>
                  </div>
                  <div className="meta-row">
                    <span className="city">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                      {c.city || 'غير محدد'}
                    </span>
                    <span className={`ugc-pill ${c.verification_status === 'verified' ? 'verified' : c.verification_status === 'rejected' ? 'rejected' : 'pending'}`}>
                      <span className="dot"></span>{c.verification_status === 'verified' ? 'موثّق' : c.verification_status === 'rejected' ? 'مرفوض' : 'بانتظار التوثيق'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', fontSize: '9.5px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    <span style={{ flex: 1, textAlign: 'center', background: '#f3e8ff', color: '#6d28d9', padding: '4px 6px', borderRadius: '7px' }}>منزلي {c.prices?.home_sell ? Number(c.prices.home_sell).toLocaleString('en-US') : 'حدّد السعر'}</span>
                    <span style={{ flex: 1, textAlign: 'center', background: '#ede9fe', color: '#5b21b6', padding: '4px 6px', borderRadius: '7px' }}>تغطية {c.prices?.cov_sell ? Number(c.prices.cov_sell).toLocaleString('en-US') : 'حدّد السعر'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const MatchTab = () => {
    return (
      <div>
        <div className="ugc-match-panel">
          <div className="ugc-match-header">
            <h3>محرك المطابقة الذكية</h3>
            <span className="badge">AI</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '14px', lineHeight: 1.6 }}>
            النظام يقيّم كل صانع محتوى مقابل الحملة عبر 6 معايير: المتابعون (25%) + التصنيف (25%) + التفاعل (20%) + الموقع (15%) + الأداء السابق (10%) + التوفر (5%).
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={matchFilters.campaignId} onChange={e => setMatchFilters({ ...matchFilters, campaignId: e.target.value })} style={{ flex: 1, minWidth: '200px', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '9px', background: 'var(--gray-50)', fontFamily: 'inherit', fontSize: '13px' }}>
              <option value="">اختر حملة...</option>
              {allCampaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
            </select>
            <select value={matchFilters.minScore} onChange={e => setMatchFilters({ ...matchFilters, minScore: parseInt(e.target.value) })} style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: '9px', background: 'var(--gray-50)', fontFamily: 'inherit', fontSize: '13px' }}>
              <option value="0">كل النتائج</option>
              <option value="50">50%+</option>
              <option value="70">70%+ (مطابقة جيدة)</option>
              <option value="85">85%+ (ممتاز)</option>
            </select>
            <button className="btn btn-primary" onClick={() => showToast('info', 'محرك المطابقة غير متصل حاليا')}>حساب المطابقة</button>
          </div>
        </div>
      </div>
    );
  };

  const getAppStatus = (s) => {
    const m = {
      invited: 'مدعو', pending: 'بانتظار المراجعة', approved: 'مقبول',
      rejected: 'مرفوض', accepted: 'تم القبول', declined: 'تم الرفض'
    };
    return m[s] || s;
  };

  const ApplicationsTab = () => {
    const apps = [...applications].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return (
      <div>
        <div className="ugc-section-head">
          <h2>طلبات الانضمام للحملات</h2>
        </div>
        {apps.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            <h3>لا توجد طلبات</h3>
            <p>ستظهر هنا طلبات الانضمام من صناع المحتوى عبر البوابة الخارجية.</p>
          </div>
        ) : (
          apps.map(app => {
            const creator = creators.find(c => c.id === app.creator_id);
            const campaign = allCampaigns.find(c => c.id === app.campaign_id);
            if (!creator) return null;
            return (
              <div key={app.id} className="ugc-app-card">
                <div className="ugc-app-row">
                  <div className="ava">{(creator.full_name || '?').charAt(0)}</div>
                  <div className="body">
                    <div className="name">{creator.full_name} &rarr; {campaign?.name || 'حملة محذوفة'}</div>
                    <div className="meta">
                      {creator.tiktok_handle || ''} &middot; {(creator.tiktok_followers || 0).toLocaleString('en-US')} متابع
                      {app.proposed_fee ? ` · ${app.proposed_fee.toLocaleString('en-US')} ر.س` : ''}
                    </div>
                  </div>
                  <span className={`ugc-pill ${app.status}`}><span className="dot"></span>{getAppStatus(app.status)}</span>
                  <div className="ugc-app-actions">
                    {app.status === 'pending' || app.status === 'invited' ? (
                      <>
                        <button className="ugc-btn-sm ugc-btn-approve">قبول</button>
                        <button className="ugc-btn-sm ugc-btn-reject">رفض</button>
                      </>
                    ) : null}
                    <button className="ugc-btn-sm ugc-btn-view">عرض</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const getSubStatus = (s) => {
    const m = {
      draft: 'مسودة', in_review: 'قيد المراجعة', approved: 'معتمد',
      rejected: 'مرفوض', revision_requested: 'يحتاج تعديل'
    };
    return m[s] || s;
  };

  const SubmissionsTab = () => {
    const subs = [...submissions].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return (
      <div>
        <div className="ugc-section-head">
          <h2>المحتوى المُسلَّم</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="ugc-pill in_review"><span className="dot"></span>{subs.filter(s => s.status === 'in_review').length} قيد المراجعة</span>
            <span className="ugc-pill approved"><span className="dot"></span>{subs.filter(s => s.status === 'approved').length} معتمد</span>
          </div>
        </div>

        {subs.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>
            <h3>لا توجد مساهمات بعد</h3>
            <p>سيظهر هنا كل محتوى TikTok المرفوع من صناع المحتوى لمراجعته واعتماده.</p>
          </div>
        ) : (
          subs.map(sub => {
            const creator = creators.find(c => c.id === sub.creator_id);
            if (!creator) return null;
            const app = applications.find(a => a.id === sub.application_id);
            const revisions = (sub.revisions || []).length;
            return (
              <div key={sub.id} className="ugc-app-card">
                <div className="ugc-app-row">
                  <div className="ava">{(creator.full_name || '?').charAt(0)}</div>
                  <div className="body">
                    <div className="name">
                      {creator.full_name}
                      {revisions > 0 && <span style={{ background: '#eff6ff', color: '#1e3a8a', fontSize: '10px', padding: '1px 6px', borderRadius: '999px', marginInlineStart: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>v{revisions + 1}</span>}
                    </div>
                    <div className="meta">
                      {app?.campaign_name ? <strong>{app.campaign_name} · </strong> : null}
                      {sub.tiktok_url ? <a href={sub.tiktok_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'var(--brand-600)', fontFamily: 'var(--font-mono)', fontSize: '11px', direction: 'ltr', display: 'inline-block', verticalAlign: 'middle' }}>{sub.tiktok_url.substring(0, 40)}...</a> : <span style={{ color: 'var(--text-3)' }}>لم يُرفع رابط بعد</span>}
                      {sub.files && sub.files.length ? ` · ${sub.files.length} ملف` : ''}
                    </div>
                  </div>
                  <span className={`ugc-pill ${sub.status}`}><span className="dot"></span>{getSubStatus(sub.status)}</span>
                  <div className="ugc-app-actions">
                    <button className="ugc-btn-sm ugc-btn-view">تفاصيل</button>
                    {sub.status === 'in_review' ? (
                      <>
                        <button className="ugc-btn-sm ugc-btn-approve">اعتماد</button>
                        <button className="ugc-btn-sm" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>طلب تعديل</button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  const PackagesTab = () => {
    const pkgs = [...packages].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const PKG_TYPES = { home: 'منزلي', cov: 'تغطية', mixed: 'مختلط' };
    const money = v => Number(v || 0).toLocaleString('en-US');

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>باقات UGC الجاهزة — تُستخدم عند إنشاء حملات UGC لتسعير موحّد</div>
          <button className="sc-btn sc-btn-primary" style={{ fontSize: '12.5px' }}>+ باقة جديدة</button>
        </div>
        {pkgs.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
            <h3>لا باقات بعد</h3>
            <p>أنشئ أول باقة (مثال: 3 فيديوهات منزلي) لتسعير حملات UGC بسرعة.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '12px' }}>
            {pkgs.map(p => {
              const margin = p.price_sell > 0 ? Math.round((p.price_sell - p.price_cost) / p.price_sell * 100) : 0;
              const mC = margin >= 20 ? '#16a34a' : margin >= 10 ? '#d97706' : '#dc2626';
              return (
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '13px', padding: '15px', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{PKG_TYPES[p.pkg_type] || p.pkg_type} · {p.videos_count} فيديو · {p.duration_days || 14} يوم</div>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', background: p.status === 'active' ? '#dcfce7' : 'var(--surface-2)', color: p.status === 'active' ? '#15803d' : 'var(--text-3)' }}>{p.status === 'active' ? 'نشطة' : 'موقوفة'}</span>
                  </div>
                  {p.description && <div style={{ fontSize: '11.5px', color: 'var(--text-2)', marginTop: '8px', lineHeight: 1.6 }}>{p.description}</div>}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginTop: '12px' }}>
                    <div style={{ background: 'var(--surface-2)', borderRadius: '9px', padding: '8px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: 'var(--text-3)' }}>البيع</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: '#16a34a' }}>{money(p.price_sell)}</div></div>
                    <div style={{ background: 'var(--surface-2)', borderRadius: '9px', padding: '8px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: 'var(--text-3)' }}>التكلفة</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--text-2)' }}>{money(p.price_cost)}</div></div>
                    <div style={{ background: 'var(--surface-2)', borderRadius: '9px', padding: '8px', textAlign: 'center' }}><div style={{ fontSize: '9px', color: 'var(--text-3)' }}>الهامش</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: mC }}>{margin}%</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: '7px', marginTop: '12px' }}>
                    <button className="sc-btn sc-btn-ghost" style={{ fontSize: '11.5px', flex: 1 }}>تعديل</button>
                    <button className="sc-btn sc-btn-ghost" style={{ fontSize: '11.5px', color: '#dc2626' }}>حذف</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const CampaignsTab = () => {
    const camps = [...campaigns].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const UC_STATUS = { draft: ['مسودة', '#64748b'], in_progress: ['قيد التنفيذ', '#d97706'], delivering: ['التسليمات جارية', '#3b82f6'], completed: ['مكتملة', '#16a34a'], cancelled: ['ملغاة', '#dc2626'] };
    const money = v => Number(v || 0).toLocaleString('en-US');

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>مسار مستقل بالكامل عن حملات المؤثرين — بآلية إسناد ومتابعة تشغيلية خاصة</div>
          <button className="sc-btn sc-btn-primary" style={{ fontSize: '12.5px' }}>+ حملة UGC جديدة</button>
        </div>
        {camps.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l18-5v12L3 14v-3z" /></svg>
            <h3>لا حملات UGC بعد</h3>
            <p>أنشئ أول حملة: اختر العميل والباقة وأسنِد صنّاع المحتوى وتابع التسليمات.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '11px' }}>
            {camps.map(c => {
              const crs = c.creators || [];
              const done = crs.filter(x => x.delivery_status === 'published').length;
              const prog = crs.length ? Math.round(done / crs.length * 100) : 0;
              const [stL, stC] = UC_STATUS[c.status] || [c.status, '#64748b'];
              const tSell = crs.reduce((s, x) => s + (Number(x.price_sell) || 0), 0);
              const tCost = crs.reduce((s, x) => s + (Number(x.price_cost) || 0), 0);
              return (
                <div key={c.id} className="uc-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '13px', padding: '14px 16px', cursor: 'pointer', transition: 'all .12s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text)' }}>{c.name} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-3)' }}>{c.id}</span></div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px' }}>العميل: <b style={{ color: 'var(--text-2)' }}>{c.customer_name || '—'}</b>{c.package_name ? ' · باقة: ' + c.package_name : ''} · {crs.length} صانع</div>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: 'var(--text-3)' }}>بيع</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '12.5px', color: '#16a34a' }}>{money(tSell)}</div></div>
                      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '9px', color: 'var(--text-3)' }}>تكلفة</div><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12.5px', color: 'var(--text-2)' }}>{money(tCost)}</div></div>
                      <div style={{ minWidth: '130px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: 'var(--text-3)', marginBottom: '3px' }}><span>المنشور {done}/{crs.length}</span><span>{prog}%</span></div>
                        <div style={{ height: '6px', background: 'var(--surface-2)', borderRadius: '99px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${prog}%`, background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius: '99px' }}></div></div>
                      </div>
                      <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '4px 11px', borderRadius: '999px', background: `${stC}1a`, color: stC }}>{stL}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const PaymentsTab = () => {
    const txns = [...transactions].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    const totalPaid = txns.filter(t => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0);
    const pending = txns.filter(t => t.type === 'credit' && t.status === 'pending');
    const pendingAmount = pending.reduce((s, t) => s + (t.amount || 0), 0);

    const getTxStatus = (s) => {
      const m = { pending: 'معلّق', completed: 'مكتمل', failed: 'فشل', processing: 'جاري' };
      return m[s] || s;
    };

    return (
      <div>
        <div className="ugc-stats">
          <div className="ugc-stat">
            <div className="l">إجمالي المدفوع</div>
            <div className="v">{totalPaid.toLocaleString('en-US')}</div>
            <div className="m">ر.س لصناع المحتوى</div>
          </div>
          <div className="ugc-stat">
            <div className="l">بانتظار الدفع</div>
            <div className="v">{pendingAmount.toLocaleString('en-US')}</div>
            <div className="m">{pending.length} حوالة</div>
          </div>
          <div className="ugc-stat">
            <div className="l">إجمالي العمليات</div>
            <div className="v">{txns.length}</div>
            <div className="m">معاملة مالية</div>
          </div>
        </div>

        <div className="ugc-section-head">
          <h2>سجل المعاملات</h2>
        </div>

        {txns.length === 0 ? (
          <div className="ugc-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
            <h3>لا توجد معاملات</h3>
            <p>ستظهر هنا كل المدفوعات والحوالات لصناع المحتوى.</p>
          </div>
        ) : (
          txns.slice(0, 50).map(tx => {
            const creator = creators.find(c => c.id === tx.creator_id);
            return (
              <div key={tx.id} className="ugc-app-card">
                <div className="ugc-app-row">
                  <div className="ava">{(creator?.full_name || '?').charAt(0)}</div>
                  <div className="body">
                    <div className="name">{creator?.full_name || 'صانع محذوف'}</div>
                    <div className="meta">{tx.description || tx.type} · {new Date(tx.created_at).toLocaleDateString('en-GB')}</div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: tx.type === 'credit' ? '#16a34a' : '#dc2626' }}>{tx.type === 'credit' ? '+' : '-'}{(tx.amount || 0).toLocaleString('en-US')} ر.س</div>
                    <span className={`ugc-pill ${tx.status}`}><span className="dot"></span>{getTxStatus(tx.status)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-10">
      {renderHero()}
      {renderTabs()}

      <div className="ugc-tab-content active">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'creators' && <CreatorsTab />}
            {activeTab === 'match' && <MatchTab />}
            {activeTab === 'applications' && <ApplicationsTab />}
            {activeTab === 'submissions' && <SubmissionsTab />}
            {activeTab === 'packages' && <PackagesTab />}
            {activeTab === 'ucampaigns' && <CampaignsTab />}
            {activeTab === 'payments' && <PaymentsTab />}
          </>
        )}
      </div>
    </div>
  );
}