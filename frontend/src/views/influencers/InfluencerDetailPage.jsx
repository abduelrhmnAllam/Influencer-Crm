import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './InfluencerDetailPage.css';

const TIER_COLORS = { 'A+': 'tier-a', 'A': 'tier-a', 'B': 'tier-b', 'C': 'tier-c' };

const PLATFORMS = {
  snapchat: { label: 'سناب شات', icon: 'snapchat', color: '#FFFC00', text: '#000' },
  tiktok: { label: 'تيك توك', icon: 'tiktok', color: '#000', text: '#fff' },
  instagram: { label: 'إنستقرام', icon: 'instagram', color: '#E1306C', text: '#fff' },
  x: { label: 'إكس', icon: 'x', color: '#1DA1F2', text: '#fff' },
  twitter: { label: 'إكس', icon: 'x', color: '#1DA1F2', text: '#fff' },
  youtube: { label: 'يوتيوب', icon: 'play', color: '#FF0000', text: '#fff' },
  linkedin: { label: 'لينكدإن', icon: 'briefcase', color: '#0A66C2', text: '#fff' }
};

const fmt = (n) => {
  n = Number(n) || 0;
  return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
};

export default function InfluencerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inf, setInf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get(`/api/v1/influencers/${id}`)
      .then(res => setInf(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-16 text-surface-400 font-bold">جاري التحميل...</div>;
  if (!inf) return (
    <div className="text-center py-16 text-surface-900 font-bold">
      المؤثر غير موجود <br/> <Link to="/influencers" className="btn btn-primary mt-4 inline-block">العودة للقائمة</Link>
    </div>
  );

  const tcolor = TIER_COLORS[inf.rating] || 'tier-c';
  
  let platforms = [];
  try {
    platforms = typeof inf.additional_platforms === 'string' ? JSON.parse(inf.additional_platforms) : inf.additional_platforms;
    if (!Array.isArray(platforms)) platforms = [];
  } catch(e) {}
  
  if (platforms.length === 0 && inf.platform) {
    platforms.push({
      platform_name: inf.platform,
      url: `https://${inf.platform}.com/${inf.username}`,
      subs: inf.followers || 0,
      views: 0,
      home_sell: inf.sale_price || 0,
      cov_sell: inf.sale_price || 0,
      home_cost: inf.cost_price || 0,
      cov_cost: inf.cost_price || 0
    });
  }

  // Calculate profit
  const primaryPlatform = platforms.length > 0 ? platforms.reduce((prev, current) => (Number(prev.subs) > Number(current.subs)) ? prev : current) : null;
  const cost = Number(primaryPlatform?.home_cost || inf.cost_price || 0);
  const sell = Number(primaryPlatform?.home_sell || inf.sale_price || 0);
  const profit = sell - cost;
  const margin = sell > 0 ? Math.round((profit / sell) * 100) : 0;

  const handleEdit = () => navigate(`/influencers/${inf.id}/edit`);

  return (
    <div className="font-sans animate-fade-in pb-10">
      <div className="detail-head">
        <Link to="/influencers" className="back-link"><Icon name="arrow-right" /> العودة للقائمة</Link>
        <div className="flex gap-2">
          <Link to={`/publishers/${inf.id}`} className="back-link" style={{borderColor: '#0d8a6f', color: '#0d8a6f'}}>
            <Icon name="chart-bar" /> الملف التحليلي للناشر ↗
          </Link>
          <button className="btn btn-primary" onClick={handleEdit}><Icon name="pencil" /> تعديل البيانات</button>
        </div>
      </div>

      <div className="inf-hero">
        <div className="hero-row">
          <div className="hero-left">
            <div className={`hero-avatar ${tcolor}`}>{String(inf.name || '؟').charAt(0)}</div>
            <div className="hero-info">
              <h1>{inf.name}</h1>
              <div className="handle">@{inf.username || '—'}</div>
              <div className="hero-tags">
                <span className={`hero-tag ${tcolor.replace('tier', 'class')}`}>فئة {inf.rating}</span>
                <span className={`hero-tag ${inf.status === 'active' ? 'active' : ''}`}>{inf.status === 'active' ? 'نشط ومتاح' : 'غير نشط'}</span>
                {inf.category && <span className="hero-tag category">{inf.category}</span>}
                {inf.gender && <span className="hero-tag gender">{inf.gender === 'female' ? 'أنثى' : 'ذكر'}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="hero-kpis">
          <div className="hero-kpi">
            <span className="label">إجمالي المتابعين</span>
            <span className="val">{fmt(inf.followers)}</span>
          </div>
          <div className="hero-kpi purple">
            <span className="label">سعر البيع (متوسط)</span>
            <span className="val">{sell.toLocaleString('en-US')} <small>ر.س</small></span>
          </div>
          <div className="hero-kpi profit">
            <span className="label">هامش الربح المتوقع</span>
            <span className="val">{margin}%</span>
          </div>
          <div className="hero-kpi">
            <span className="label">إجمالي المكاسب منه</span>
            <span className="val">{(inf.total_earned || 0).toLocaleString('en-US')} <small>ر.س</small></span>
          </div>
        </div>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          الأسعار والبيانات الأساسية
        </button>
        <button className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
          الحملات <span className="badge">0</span>
        </button>
        <button className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
          الإعلانات اليومية <span className="badge">0</span>
        </button>
        <button className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>
          الحوالات المالية <span className="badge">0</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <h3 className="font-display text-[15px] font-bold mb-3 flex items-center gap-2">
                <Icon name="link" className="w-5 h-5 text-brand-600" /> المنصات وقوائم الأسعار
              </h3>
              <div className="platforms-grid">
                {platforms.length > 0 ? platforms.map((p, i) => {
                  const d = PLATFORMS[p.platform_name] || { label: p.platform_name, icon: 'globe', color: '#64748b', text: '#fff' };
                  const pCost = Number(p.home_cost) || 0;
                  const pSell = Number(p.home_sell) || 0;
                  const pProf = pSell - pCost;
                  const pMar = pSell > 0 ? Math.round((pProf / pSell) * 100) : 0;
                  return (
                    <div key={i} className="platform-card">
                      <div className="platform-card-h">
                        <div className="left">
                          <div className="platform-icon" style={{background: d.color, color: d.text}}>
                            <Icon name={d.icon} className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="platform-name">{d.label}</div>
                            <div className="text-[11px] text-surface-400 font-mono mt-0.5">مشاهدات: {fmt(p.views || 0)}</div>
                          </div>
                        </div>
                        <div className="platform-subs">{fmt(p.subs)} متابع</div>
                      </div>
                      <div className="pricing-grid">
                        <div className="pricing-item">
                          <div className="lbl">التكلفة (علينا)</div>
                          <div className="val">{pCost.toLocaleString('en-US')} <small>ر.س</small></div>
                        </div>
                        <div className="pricing-item sell">
                          <div className="lbl">سعر البيع</div>
                          <div className="val">{pSell.toLocaleString('en-US')} <small>ر.س</small></div>
                        </div>
                        <div className="pricing-item profit-rate" style={{gridColumn: '1 / -1'}}>
                          <div className="lbl">هامش الربح</div>
                          <div className="val">{pMar}% <small style={{fontWeight:400}}>({pProf.toLocaleString('en-US')} ر.س)</small></div>
                        </div>
                      </div>
                      {p.url && (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="platform-url">
                          <Icon name="link" /> <span>{p.url}</span>
                        </a>
                      )}
                    </div>
                  );
                }) : <div className="text-surface-400 text-sm">لا توجد منصات</div>}
              </div>
            </div>

            <div>
              <div className="info-section mb-4">
                <div className="info-section-h">
                  <div className="ic-wrap bg-surface-100 text-surface-600"><Icon name="user" /></div>
                  <h3>معلومات أساسية</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="info-item"><span className="lbl">الكود</span><span className="val font-mono">{inf.code || '—'}</span></div>
                  <div className="info-item"><span className="lbl">رقم الجوال</span><span className="val font-mono" style={{direction: 'ltr', textAlign: 'right'}}>{inf.phone || '—'}</span></div>
                  <div className="info-item"><span className="lbl">البريد الإلكتروني</span><span className="val">{inf.email || '—'}</span></div>
                  <div className="info-item"><span className="lbl">المدينة</span><span className="val">{inf.region || '—'}</span></div>
                  <div className="info-item"><span className="lbl">تاريخ الإضافة</span><span className="val font-mono">{(inf.created_at || '').substring(0, 10) || '—'}</span></div>
                </div>
              </div>

              <div className="info-section mb-4">
                <div className="info-section-h">
                  <div className="ic-wrap bg-amber-50 text-amber-600"><Icon name="credit-card" /></div>
                  <h3>البيانات البنكية</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="info-item"><span className="lbl">البنك</span><span className="val">{inf.bank_name || '—'}</span></div>
                  <div className="info-item"><span className="lbl">الآيبان</span><span className="val font-mono text-[11.5px]" style={{direction: 'ltr', textAlign: 'right'}}>{inf.iban || '—'}</span></div>
                  <div className="info-item"><span className="lbl">صاحب الحساب</span><span className="val">{inf.account_holder || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="info-section">
            <div className="info-section-h">
              <div className="ic-wrap bg-surface-100 text-surface-600"><Icon name="document-text" /></div>
              <h3>ملاحظات تشغيلية</h3>
            </div>
            <div className="text-[13.5px] leading-relaxed text-surface-700 whitespace-pre-wrap">
              {inf.notes || <span className="text-surface-400">لا توجد ملاحظات مسجلة</span>}
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
        <div className="empty-state">
          <Icon name="document-text" className="ic mx-auto" />
          <h4>لا توجد بيانات</h4>
          <p>لم يتم العثور على سجلات في هذا القسم حالياً.</p>
        </div>
      )}

    </div>
  );
}
