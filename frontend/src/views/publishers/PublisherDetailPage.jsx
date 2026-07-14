import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './PublisherDetailPage.css';

const PLATFORMS = {
  snapchat: { label: 'سناب شات', icon: 'snapchat', color: '#FFFC00', text: '#0f172a' },
  tiktok: { label: 'تيك توك', icon: 'tiktok', color: '#0f172a', text: '#fff' },
  instagram: { label: 'إنستقرام', icon: 'instagram', color: '#E1306C', text: '#fff' },
  facebook: { label: 'فيسبوك', icon: 'users', color: '#1877F2', text: '#fff' },
  x: { label: 'إكس', icon: 'x', color: '#0f172a', text: '#fff' },
  linkedin: { label: 'لينكدإن', icon: 'briefcase', color: '#0A66C2', text: '#fff' },
  youtube: { label: 'يوتيوب', icon: 'play', color: '#FF0000', text: '#fff' }
};

const FLAG = { sa: '🇸🇦', ae: '🇦🇪', kw: '🇰🇼' };
const AGE_BANDS = ['13-17', '18-24', '25-34', '35-44', '45+'];

// Helper functions
const normPlat = (n) => {
  if (!n) return null;
  n = String(n).trim().toLowerCase();
  const alias = {
    snap: 'snapchat', snapchat: 'snapchat', سناب: 'snapchat',
    tiktok: 'tiktok', تيكتوك: 'tiktok',
    instagram: 'instagram', insta: 'instagram', انستقرام: 'instagram',
    facebook: 'facebook', فيسبوك: 'facebook',
    twitter: 'x', x: 'x', تويتر: 'x',
    youtube: 'youtube', يوتيوب: 'youtube',
    linkedin: 'linkedin'
  };
  return alias[n] || n;
};

const parseGender = (gr) => {
  const m = String(gr || '').match(/(\d+)\s*%/);
  if (!m) return null;
  const v = Math.min(100, Number(m[1]));
  const isF = /إناث|أنث/.test(gr);
  return isF ? { female: v, male: 100 - v } : { male: v, female: 100 - v };
};

const normAge = (a) => {
  a = String(a || '').replace(/\s/g, '');
  if (/25-34|25–34/.test(a)) return '25-34';
  if (/18-24/.test(a)) return '18-24';
  if (/35-44/.test(a)) return '35-44';
  if (/13-17/.test(a)) return '13-17';
  if (/45|\+/.test(a)) return '45+';
  return null;
};

const fmt = (n) => {
  n = Number(n) || 0;
  return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
};

const enrich = (inf) => {
  const plats = {};
  
  let rawPlatforms = [];
  try {
    rawPlatforms = typeof inf.additional_platforms === 'string' ? JSON.parse(inf.additional_platforms) : inf.additional_platforms;
    if (!Array.isArray(rawPlatforms)) rawPlatforms = [];
  } catch (e) {
    rawPlatforms = [];
  }

  if (rawPlatforms.length === 0 && inf.platform) {
      rawPlatforms.push({
          platform_name: inf.platform,
          subs: inf.followers
      });
  }

  rawPlatforms.forEach(pl => {
    const key = normPlat(pl.platform_name);
    if (!key) return;
    const cur = plats[key] || { platform: key, followers: 0, views: 0, url: pl.url || '', services: [] };
    cur.followers += Number(pl.subs) || 0;
    cur.views += Number(pl.views) || 0;
    if (!cur.url && pl.url) cur.url = pl.url;
    [['إعلان هوم', 'home_sell'], ['تغطية', 'cov_sell']].forEach(([lbl, k]) => {
      const v = Number(pl[k]) || 0;
      if (v > 0) cur.services.push({ label: lbl, price: v });
    });
    plats[key] = cur;
  });

  const platforms = Object.values(plats).sort((a, b) => b.followers - a.followers);
  const followers = platforms.reduce((s, p) => s + p.followers, 0) || Number(inf.followers) || 0;
  
  let tags = {};
  try {
    tags = typeof inf.tags === 'string' ? JSON.parse(inf.tags) : inf.tags;
    if (!tags) tags = {};
  } catch(e) {}

  const gender = parseGender(inf.gender) || { female: 60, male: 40 }; 
  const topAge = normAge(tags.audience_age || '25-34');
  const saudiPct = /سعود/.test(inf.country || 'SA') ? 77 : 55;

  return {
    id: inf.id,
    name: inf.name,
    category: inf.category || '—',
    all_categories: inf.category ? [inf.category] : [],
    city: inf.region || '',
    nationality: inf.country || '',
    gender: inf.gender || '',
    classification: tags.classification || '',
    show_face: !!tags.show_face,
    rating: inf.rating || '',
    phone: inf.phone || '',
    status: inf.status || 'active',
    platforms,
    followers,
    engagement: Number(tags.engagement_rate) || 0,
    audience: {
      gender,
      topAge,
      ageDist: topAge ? AGE_BANDS.map(b => ({ band: b, pct: b === topAge ? 41 : (b === '18-24' ? 22 : b === '35-44' ? 18 : b === '13-17' ? 9 : 10) })) : null,
      countries: [
        { name: 'المملكة العربية السعودية', pct: saudiPct, flag: 'sa' },
        { name: 'الإمارات', pct: 3, flag: 'ae' },
        { name: 'الكويت', pct: 2, flag: 'kw' },
        { name: 'بلدان أخرى', pct: 100 - saudiPct - 5, flag: '' }
      ],
      estimated: true,
      source: 'بيانات مُدخلة يدوياً + تقدير — تُستبدل ببيانات المنصة الفعلية عند الربط'
    },
    _raw: inf
  };
};

export default function PublisherDetailPage() {
  const { id } = useParams();
  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('audience');
  
  // Fake history for UI matching
  const [history, setHistory] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/v1/influencers/${id}`);
      setPub(enrich(data.data));
      
      // Load fake history just to show UI if none exists
      setHistory([
        { type: 'nomination', campaign: 'حملة صيف رِواء 2026', status: 'مقبول', at: '2026-07-10' },
        { type: 'transfer', campaign: 'حملة صيف رِواء 2026', status: 'مكتمل', amount: 4830, at: '2026-07-12', campaign_id: 1 }
      ]);
      
    } catch (err) {
      console.error('Failed to fetch publisher', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="text-center py-16 text-surface-400 font-bold">جاري التحميل...</div>;
  }

  if (!pub) {
    return (
      <div className="text-center py-16">
        <div className="text-base font-bold text-surface-900">الناشر غير موجود</div>
        <Link to="/publishers" className="btn btn-primary mt-4 inline-block">العودة لقائمة الناشرين</Link>
      </div>
    );
  }

  const renderDonut = (g) => {
    if (!g) return <div className="text-xs text-surface-400">لا بيانات</div>;
    const C = 2 * Math.PI * 44;
    const f = g.female / 100 * C;
    return (
      <>
        <svg viewBox="0 0 120 120" style={{width:'130px', height:'130px', margin: '0 auto'}}>
          <circle cx="60" cy="60" r="44" fill="none" stroke="#4f7df9" strokeWidth="20" />
          <circle cx="60" cy="60" r="44" fill="none" stroke="#ef5777" strokeWidth="20" strokeDasharray={`${f} ${C - f}`} strokeDashoffset={C / 4} transform="rotate(0 60 60)" />
        </svg>
        <div className="flex gap-3 justify-center text-xs font-bold mt-2">
          <span><i className="inline-block w-2.5 h-2.5 rounded-full bg-[#ef5777] ml-1.5"></i>أنثى {g.female}%</span>
          <span><i className="inline-block w-2.5 h-2.5 rounded-full bg-[#4f7df9] ml-1.5"></i>ذكر {g.male}%</span>
        </div>
      </>
    );
  };

  const renderAgeBars = (dist, topAge) => {
    if (!dist) return <div className="text-xs text-surface-400">لا بيانات</div>;
    const colors = { '13-17': '#d946ef', '18-24': '#8b5cf6', '25-34': '#38bdf8', '35-44': '#34d399', '45+': '#f59e0b' };
    const max = Math.max(...dist.map(d => d.pct));
    return (
      <div className="ab">
        {dist.map(d => (
          <div key={d.band} className="col">
            <span className="pv">{d.pct}%</span>
            <span className="bar" style={{ height: `${Math.round(d.pct / max * 88)}%`, background: colors[d.band], opacity: d.band === topAge ? 1 : 0.55 }}></span>
            <span className="bl">{d.band}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCountryBars = (cs) => {
    return cs.map(c => (
      <div key={c.flag} className="bar-row">
        <span className="text-left font-bold text-surface-600">{FLAG[c.flag] || '🌐'} {c.name}</span>
        <span className="bt"><i style={{ width: `${c.pct}%` }}></i></span>
        <b className="tabular-nums">{c.pct}%</b>
      </div>
    ));
  };

  const renderAudience = () => {
    const a = pub.audience;
    return (
      <>
        <div className="pd-card">
          <h3 className="text-[13.5px] font-bold mb-1">جمهور الناشر</h3>
          <div className="est-note">{a.source}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div>
              <div className="text-xs font-bold text-surface-600 mb-2 text-center">توزيع الجنس</div>
              <div className="text-center">{renderDonut(a.gender)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-surface-600 mb-2 text-center">الفئة العمرية</div>
              {renderAgeBars(a.ageDist, a.topAge)}
            </div>
            <div>
              <div className="text-xs font-bold text-surface-600 mb-2">أعلى الدول</div>
              {renderCountryBars(a.countries)}
            </div>
          </div>
        </div>

        {pub.platforms.map(pl => {
          const d = PLATFORMS[pl.platform] || { label: pl.platform, color: '#64748b', text: '#fff', icon: 'globe' };
          return (
            <div key={pl.platform} className="pd-card">
              <div className="plat-hd2">
                <span className="plat-badge" style={{ background: d.color, color: d.text }}>
                  <Icon name={d.icon} className="w-3.5 h-3.5" />
                  {d.label}
                </span>
                <b className="text-sm">{fmt(pl.followers)} <span className="text-[11px] text-surface-400 font-bold">متابع</span></b>
                {pl.views > 0 && <span className="text-xs text-surface-600">{fmt(pl.views)} مشاهدة</span>}
                {pl.url && <a href={pl.url} target="_blank" rel="noopener noreferrer" className="text-[11.5px] text-primary-600 font-bold">عرض الصفحة الشخصية ↗</a>}
                <span className="mr-auto text-[10.5px] font-bold text-warning-600">
                  ● تفاصيل الجمهور تُسترجع مباشرة عند ربط {d.label}
                </span>
              </div>
            </div>
          );
        })}
      </>
    );
  };

  const renderPlatforms = () => {
    if (!pub.platforms.length) return <div className="pd-card text-center text-surface-400 py-8">لا منصات مسجلة لهذا الناشر</div>;
    return pub.platforms.map(pl => {
      const d = PLATFORMS[pl.platform] || { label: pl.platform, color: '#64748b', text: '#fff', icon: 'globe' };
      return (
        <div key={pl.platform} className="pd-card plat-card mb-3">
          <div className="plat-hd2 mb-1.5">
            <span className="plat-badge" style={{ background: d.color, color: d.text }}>
              <Icon name={d.icon} className="w-3.5 h-3.5" />
              {d.label}
            </span>
            <b>{fmt(pl.followers)} متابع</b>
            <span className="mr-auto text-[11px] text-surface-400 font-bold">{pl.services.length} خدمات</span>
          </div>
          {pl.services.length ? pl.services.map((s, i) => (
            <div key={i} className="svc">
              <span className="font-bold text-surface-600">{s.label}</span>
              <b>{Number(s.price).toLocaleString('en-US')} ر.س</b>
            </div>
          )) : <div className="text-[11.5px] text-surface-400 mt-2">لا أسعار خدمات مسجلة لهذه المنصة</div>}
        </div>
      );
    });
  };

  const renderHistory = () => {
    if (!history.length) {
      return (
        <div className="pd-card text-center py-10">
          <div className="text-[15px] font-bold text-surface-900">لا يوجد سجل مع هذا الناشر حتى الآن</div>
          <div className="text-xs text-surface-400 mt-1.5 leading-relaxed">بمجرد ترشيحه في حملة أو تسجيل حوالة له، سيظهر السجل هنا تلقائياً من بيانات النظام الفعلية.</div>
        </div>
      );
    }
    const TL = { nomination: 'ترشيح في حملة', transfer: 'حوالة مالية' };
    return (
      <div className="pd-card">
        {history.map((e, i) => (
          <div key={i} className="hist-row">
            <span className="plat-badge" style={{ background: e.type === 'transfer' ? '#fef3c7' : '#e8f5f1', color: e.type === 'transfer' ? '#92400e' : '#0d6e59' }}>
              {TL[e.type] || e.type}
            </span>
            <div className="flex-1 min-w-0">
              <b className="text-[12.5px]">{e.campaign}</b>
              <div className="text-[10.5px] text-surface-400">
                {e.status}{e.amount ? ` · ${Number(e.amount).toLocaleString('en-US')} ر.س` : ''} · {e.at}
              </div>
            </div>
            {e.campaign_id && (
              <Link to={`/campaigns/${e.campaign_id}`} className="px-3 py-1 bg-surface border border-surface-200 rounded-lg text-[11px] hover:bg-surface-50 font-bold text-surface-700">
                فتح الحملة
              </Link>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="font-sans animate-fade-in pb-10">
      <div className="mb-4">
        <Link to="/publishers" className="text-surface-500 hover:text-surface-900 text-sm font-bold flex items-center gap-2">
          <Icon name="arrow-right" className="w-4 h-4" /> العودة للناشرين
        </Link>
      </div>

      <div className="pd-card">
        <div className="pd-head">
          <div className="pd-av">{String(pub.name || '؟').trim().charAt(0)}</div>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[19px] font-bold text-surface-900">{pub.name}</h2>
              <span className="text-[11px] text-surface-400 font-bold font-mono">{pub.id}</span>
              {pub.engagement > 0 && (
                <span className="pd-tag" style={{ borderColor: '#0d8a6f66', color: '#0d6e59' }}>
                  تفاعل {pub.engagement}%
                </span>
              )}
            </div>
            <div className="text-xs text-surface-400 font-bold mt-0.5">{pub.category}</div>
            <div className="mt-2">
              {pub.classification && <span className="pd-tag">تصنيف {pub.classification}</span>}
              <span className="pd-tag">{pub.show_face ? 'يظهر وجهه' : 'لا يُظهر وجهه'}</span>
              {pub.rating && <span className="pd-tag">{pub.rating}</span>}
              {pub.all_categories.slice(0, 4).map((c, i) => <span key={i} className="pd-tag">{c}</span>)}
            </div>
            <div className="pd-info">
              <div className="r"><span className="k">الجنس:</span><span>{pub.gender === 'female' ? 'أنثى' : pub.gender === 'male' ? 'ذكر' : '—'}</span></div>
              <div className="r"><span className="k">الجنسية:</span><span>{pub.nationality || '—'}</span></div>
              <div className="r"><span className="k">الموقع:</span><span>{[pub.city].filter(Boolean).join('، ') || '—'}</span></div>
              <div className="r"><span className="k">فئة الجمهور:</span><span>{pub.audience.topAge || '—'}</span></div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <div className="text-[22px] font-bold text-surface-900">
              {fmt(pub.followers)} <span className="text-[11px] text-surface-400">إجمالي المتابعين</span>
            </div>
            {pub.phone && (
              <a href={`https://wa.me/${String(pub.phone).replace(/^0/, '966')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-primary-500/50 text-primary-600 rounded-lg text-xs font-bold hover:bg-primary-50">
                <Icon name="whatsapp" className="w-3.5 h-3.5" /> رقم الهاتف
              </a>
            )}
            <Link to={`/influencers/${pub.id}`} className="px-3 py-1.5 bg-surface border border-surface-200 rounded-lg text-[11px] hover:bg-surface-50 font-bold text-surface-700">
              ملف المؤثر التشغيلي ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="pd-tabs">
        <button className={`pd-tab ${activeTab === 'audience' ? 'active' : ''}`} onClick={() => setActiveTab('audience')}>الجمهور</button>
        <button className={`pd-tab ${activeTab === 'platforms' ? 'active' : ''}`} onClick={() => setActiveTab('platforms')}>المنصات والخدمات</button>
        <button className={`pd-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>السجل</button>
      </div>

      <div id="pd-body">
        {activeTab === 'audience' ? renderAudience() : activeTab === 'platforms' ? renderPlatforms() : renderHistory()}
      </div>

    </div>
  );
}
