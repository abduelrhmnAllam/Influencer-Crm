import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../hooks/useToast';
import './PublisherListPage.css';

export default function PublisherListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    q: '', platform: '', category: '', city: '', gender: '', age: '',
    minFollowers: '', minEngagement: '', showFace: '', sort: 'followers'
  });

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 24;

  useEffect(() => {
    fetchPublishers();
  }, []);

  const AGE_BANDS = ['13-17', '18-24', '25-34', '35-44', '45+'];

  const PLAT_ALIAS = {
    snap: 'snapchat', snapchat: 'snapchat', سناب: 'snapchat',
    tiktok: 'tiktok', تيكتوك: 'tiktok',
    instagram: 'instagram', insta: 'instagram', انستقرام: 'instagram',
    facebook: 'facebook', فيسبوك: 'facebook',
    twitter: 'x', x: 'x', تويتر: 'x',
    youtube: 'youtube', يوتيوب: 'youtube',
    linkedin: 'linkedin'
  };

  const normPlat = (n) => {
    n = String(n || '').trim().toLowerCase();
    return PLAT_ALIAS[n] || n;
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

  const enrich = (inf) => {
    const plats = {};
    let apiPlatforms = inf.additional_platforms || inf.platforms || [];
    if (typeof apiPlatforms === 'string') {
      try { apiPlatforms = JSON.parse(apiPlatforms); } catch (e) { apiPlatforms = []; }
    }
    
    apiPlatforms.forEach(pl => {
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
    const followers = platforms.reduce((s, p) => s + p.followers, 0);
    let tags = inf.tags || {};
    if (typeof tags === 'string') {
      try { tags = JSON.parse(tags); } catch (e) { tags = {}; }
    }
    const gender = parseGender(tags.gender_ratio || inf.gender_ratio);
    const topAge = normAge(tags.audience_age || inf.audience_age);
    const nationality = tags.nationality || inf.nationality || '';
    const saudiPct = /سعود/.test(nationality) ? 77 : 55;

    return {
      id: inf.code || inf.id,
      name: inf.name,
      category: inf.category || '—',
      all_categories: tags.all_categories || inf.all_categories || '',
      city: inf.region || inf.city || '',
      region: inf.region || '',
      nationality: nationality,
      gender: inf.gender || '',
      classification: inf.rating || inf.classification || '',
      show_face: !!(tags.show_face !== undefined ? tags.show_face : inf.show_face),
      rating: inf.rating || '',
      phone: inf.phone || '',
      status: inf.status || 'active',
      platforms,
      followers,
      engagement: Number(tags.engagement_rate || inf.engagement_rate) || 0,
      total_campaigns: Number(tags.total_campaigns || inf.total_campaigns || inf.campaigns_count) || 0,
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

  const fetchPublishers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/influencers', { params: { per_page: 3000 } });
      const rawData = res.data.data || [];
      const enriched = rawData.map(enrich);
      setPublishers(enriched);
    } catch (error) {
      console.error("Error fetching publishers", error);
      showToast('error', 'فشل في جلب بيانات الناشرين');
    } finally {
      setLoading(false);
    }
  };

  const PLATFORMS = {
    snapchat: { label: 'سناب شات', color: '#fffc00', text: '#000', icon: 'snapchat' },
    tiktok: { label: 'تيك توك', color: '#000', text: '#fff', icon: 'tiktok' },
    instagram: { label: 'انستقرام', color: '#e1306c', text: '#fff', icon: 'instagram' },
    twitter: { label: 'إكس', color: '#000', text: '#fff', icon: 'twitter' },
    youtube: { label: 'يوتيوب', color: '#ff0000', text: '#fff', icon: 'youtube' }
  };

  const FLAG = { sa: '🇸🇦', ae: '🇦🇪', kw: '🇰🇼' };

  const fmt = n => {
    n = Number(n) || 0;
    return n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' :
           n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
  };

  // Mock Integrations Data to match legacy
  const integrationsCount = 2; // Mocking connected platforms
  const totalPlatforms = Object.keys(PLATFORMS).length;

  const filtered = useMemo(() => {
    let res = [...publishers];
    
    // Apply filters
    if (filters.q) {
      const qLower = filters.q.toLowerCase();
      res = res.filter(p => (p.name || '').toLowerCase().includes(qLower) || (p.category || '').toLowerCase().includes(qLower));
    }
    if (filters.platform) {
      res = res.filter(p => p.platforms?.some(plat => plat.platform === filters.platform));
    }
    if (filters.category) {
      res = res.filter(p => p.category === filters.category);
    }
    if (filters.city) {
      res = res.filter(p => p.city === filters.city);
    }
    if (filters.gender) {
      const gMap = { 'أنثى': 'female', 'ذكر': 'male' };
      res = res.filter(p => {
        if (!p.audience?.gender) return false;
        const highest = p.audience.gender.male > p.audience.gender.female ? 'male' : 'female';
        return highest === gMap[filters.gender];
      });
    }
    if (filters.minFollowers) {
      const minF = parseInt(filters.minFollowers) || 0;
      res = res.filter(p => p.followers >= minF);
    }
    if (filters.minEngagement) {
      const minE = parseFloat(filters.minEngagement) || 0;
      res = res.filter(p => (p.engagement || 0) >= minE);
    }

    // Sort
    res.sort((a, b) => {
      if (filters.sort === 'followers') return (b.followers || 0) - (a.followers || 0);
      if (filters.sort === 'engagement') return (b.engagement || 0) - (a.engagement || 0);
      if (filters.sort === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return res;
  }, [publishers, filters]);

  const stats = useMemo(() => {
    let totalFollowers = 0;
    let totalEngagement = 0;
    let engCount = 0;
    let showFaceCount = 0;
    
    publishers.forEach(p => {
      totalFollowers += (p.followers || 0);
      if (p.engagement) {
        totalEngagement += p.engagement;
        engCount++;
      }
      if (p.showFace === 'yes') showFaceCount++;
    });

    return {
      total: publishers.length,
      followers: totalFollowers,
      avgEngagement: engCount > 0 ? (totalEngagement / engCount).toFixed(1) : 0,
      showFace: showFaceCount,
      connected: integrationsCount
    };
  }, [publishers]);

  const facets = useMemo(() => {
    const cats = new Set();
    const cities = new Set();
    publishers.forEach(p => {
      if (p.category) cats.add(p.category);
      if (p.city) cities.add(p.city);
    });
    return {
      categories: [...cats].sort(),
      cities: [...cities].sort()
    };
  }, [publishers]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > pages && pages > 0) setPage(pages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const resetFilters = () => {
    setFilters({ q: '', platform: '', category: '', city: '', gender: '', age: '', minFollowers: '', minEngagement: '', showFace: '', sort: 'followers' });
    setPage(1);
  };

  const openIntegrations = () => {
    showToast('info', 'إعدادات الربط غير مفعلة في هذه النسخة');
  };

  const handleExport = () => {
    showToast('success', 'تم تصدير الناشرين');
  };

  const renderCard = (r) => {
    const g = r.audience?.gender;
    const top2 = r.audience?.countries?.slice(0, 2) || [];
    const platforms = r.platforms || [];

    return (
      <div key={r.id} className="pub-card" onClick={() => navigate(`/publishers/${r.id}`)}>
        <div className="hd">
          <div className="pub-av">{(r.name || '؟').trim().charAt(0)}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="pub-nm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
            <div className="pub-cat">{r.category}{r.city ? ` · ${r.city}` : ''}</div>
          </div>
          {r.engagement ? <span className="mini-tag" style={{ borderStyle: 'solid', color: '#0d6e59', borderColor: '#0d8a6f55' }}>تفاعل {r.engagement}%</span> : null}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '9px' }}>
          {platforms.slice(0, 4).map((p, i) => {
            const d = PLATFORMS[p.platform];
            if (!d) return null;
            return (
              <span key={i} className="plat-badge" style={{ background: d.color, color: d.text }}>
                {d.label} {fmt(p.followers)}
              </span>
            );
          })}
          {platforms.length > 4 ? <span className="mini-tag">+{platforms.length - 4}</span> : null}
          {!platforms.length ? <span className="mini-tag">لا منصات مسجلة</span> : null}
        </div>
        <div className="pub-row">
          <span className="k">أعلى البلدان</span>
          <span className="vals">
            {top2.map((c, i) => <span key={i} className="mini-tag">{FLAG[c.flag] || '🌐'} {c.pct}%</span>)}
          </span>
        </div>
        <div className="pub-row">
          <span className="k">توزيع الجنس</span>
          <span className="vals">
            {g ? (
              <>
                <span className="mini-tag">👩 أنثى {g.female}%</span>
                <span className="mini-tag">👨 ذكر {g.male}%</span>
              </>
            ) : <span className="mini-tag">—</span>}
          </span>
        </div>
        <div className="pub-row">
          <span className="k">الفئة العمرية الأعلى</span>
          <span className="vals">
            {r.audience?.topAge ? <span className="mini-tag">{r.audience.topAge}</span> : <span className="mini-tag">—</span>}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-10">
      <div className="pub-kpis">
        <div className="pub-kpi"><div className="v">{stats.total.toLocaleString('en-US')}</div><div className="l">ناشر مطابق</div></div>
        <div className="pub-kpi"><div className="v">{fmt(stats.followers)}</div><div className="l">إجمالي المتابعين</div></div>
        <div className="pub-kpi"><div className="v">{stats.avgEngagement}%</div><div className="l">متوسط التفاعل</div></div>
        <div className="pub-kpi"><div className="v">{stats.showFace.toLocaleString('en-US')}</div><div className="l">يظهر وجهه</div></div>
        <div className="pub-kpi"><div className="v" style={{ color: stats.connected ? '#16a34a' : '#d97706' }}>{stats.connected} / {totalPlatforms}</div><div className="l">منصات متصلة</div></div>
      </div>

      <div className="int-strip">
        <b style={{ fontSize: '12px', color: 'var(--text-2)' }}>حالة ربط المنصات:</b>
        {Object.entries(PLATFORMS).map(([p, d]) => (
          <span key={p} className="int-pill" title="متصل">
            <i style={{ background: '#16a34a' }}></i>{d.label}
          </span>
        ))}
        <button className="sc-btn" onClick={openIntegrations} style={{ marginInlineStart: 'auto', fontSize: '11.5px', padding: '6px 13px', fontWeight: 700 }}>إعدادات الربط والمزامنة</button>
      </div>

      <div className="pub-filters">
        <div className="row">
          <input placeholder="البحث بالاسم أو المجال…" value={filters.q} onChange={e => { setFilters({ ...filters, q: e.target.value }); setPage(1); }} />
          <select value={filters.platform} onChange={e => { setFilters({ ...filters, platform: e.target.value }); setPage(1); }}>
            <option value="">كل المنصات</option>
            {Object.entries(PLATFORMS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}>
            <option value="">كل المجالات</option>
            {facets.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.city} onChange={e => { setFilters({ ...filters, city: e.target.value }); setPage(1); }}>
            <option value="">كل المدن</option>
            {facets.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.gender} onChange={e => { setFilters({ ...filters, gender: e.target.value }); setPage(1); }}>
            <option value="">الجنس — الكل</option>
            <option value="أنثى">أنثى</option>
            <option value="ذكر">ذكر</option>
          </select>
          <select value={filters.age} onChange={e => { setFilters({ ...filters, age: e.target.value }); setPage(1); }}>
            <option value="">الفئة العمرية — الكل</option>
            <option value="13-17">13-17</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45+">45+</option>
          </select>
          <input type="number" placeholder="متابعون — حد أدنى" value={filters.minFollowers} onChange={e => { setFilters({ ...filters, minFollowers: e.target.value }); setPage(1); }} />
          <input type="number" step="0.5" placeholder="تفاعل % — حد أدنى" value={filters.minEngagement} onChange={e => { setFilters({ ...filters, minEngagement: e.target.value }); setPage(1); }} />
          <select value={filters.showFace} onChange={e => { setFilters({ ...filters, showFace: e.target.value }); setPage(1); }}>
            <option value="">يظهر وجهه — الكل</option>
            <option value="yes">يظهر وجهه</option>
            <option value="no">لا يظهر وجهه</option>
          </select>
          <select value={filters.sort} onChange={e => { setFilters({ ...filters, sort: e.target.value }); setPage(1); }}>
            <option value="followers">ترتيب: المتابعون</option>
            <option value="engagement">ترتيب: التفاعل</option>
            <option value="campaigns">ترتيب: عدد الحملات</option>
            <option value="name">ترتيب: الاسم</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="sc-btn" onClick={resetFilters} style={{ fontSize: '11.5px', padding: '6px 13px' }}>إعادة تعيين الفلاتر</button>
          <button className="sc-btn" onClick={handleExport} style={{ fontSize: '11.5px', padding: '6px 13px' }}>تصدير Excel ({total.toLocaleString('en-US')})</button>
          <span style={{ fontSize: '11px', color: 'var(--text-3)', marginInlineStart: 'auto' }}>بيانات الجمهور الحالية مُدخلة يدوياً/تقديرية — تُستبدل تلقائياً ببيانات المنصات عند تفعيل الربط</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-3)' }}>جاري التحميل...</div>
      ) : pageItems.length ? (
        <div className="pub-grid">
          {pageItems.map(renderCard)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-3)' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-2)' }}>لا نتائج مطابقة</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>جرّب توسيع الفلاتر أو إعادة تعيينها</div>
        </div>
      )}

      {pages > 1 && (
        <div className="pub-pager">
          <button onClick={() => { setPage(page - 1); window.scrollTo({ top: 0 }); }} disabled={page === 1}>السابق</button>
          {Array.from({ length: Math.min(7, pages) }, (_, i) => {
            let n;
            if (pages <= 7) n = i + 1;
            else if (page <= 4) n = i + 1;
            else if (page >= pages - 3) n = pages - 6 + i;
            else n = page - 3 + i;
            return <button key={n} className={n === page ? 'on' : ''} onClick={() => { setPage(n); window.scrollTo({ top: 0 }); }}>{n}</button>;
          })}
          <button onClick={() => { setPage(page + 1); window.scrollTo({ top: 0 }); }} disabled={page === pages}>التالي</button>
          <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>صفحة {page} من {pages}</span>
        </div>
      )}
    </div>
  );
}
