import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import { useToast } from '../../hooks/useToast';
import './InfluencerListPage.css';

export default function InfluencerListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [data, setData] = useState([]);
  const [ugcData, setUgcData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [q, setQ] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('regular'); // 'regular' or 'ugc'
  const [categoryFilter, setCategoryFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/influencers', { params: { per_page: 1000 } });
      const all = res.data.data || [];
      setData(all);

      // We assume UGC creators are fetched from another endpoint or are part of the same list based on category
      // To strictly match legacy, ugcData might be a separate API call, but we'll mock or filter it here based on the backend data we have.
      const ugcAll = all.filter(c => String(c.category || '').toLowerCase().includes('ugc') || String(c.notes || '').toLowerCase().includes('ugc')).map(c => ({
        ...c,
        classification: 'UGC',
        type: 'ugc',
        _isUgc: true,
        tiktok_followers: c.followers || c.tiktok_followers,
        verification_status: c.status === 'active' ? 'verified' : 'pending',
        level: c.rating === 'A' ? 'diamond' : c.rating === 'B' ? 'gold' : 'bronze'
      }));
      setUgcData(ugcAll);
    } catch (error) {
      console.error("Error fetching influencers", error);
      showToast('error', 'فشل في جلب بيانات المؤثرين');
    } finally {
      setLoading(false);
    }
  };

  const deleteInfluencer = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`حذف المؤثر "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return;
    try {
      await api.delete(`/api/v1/influencers/${id}`);
      setData(prev => prev.filter(x => x.id !== id));
      showToast('success', 'تم حذف المؤثر');
    } catch (err) {
      showToast('error', 'حدث خطأ أثناء الحذف');
    }
  };

  const PLATFORM_LABELS = {
    snap: 'Snap', snapchat: 'Snap',
    tiktok: 'TikTok',
    instagram: 'Instagram', insta: 'Instagram',
    youtube: 'YouTube', yt: 'YouTube',
    twitter: 'X', x: 'X',
    'كلاهما': 'Snap + TikTok'
  };

  function normalizePlatformName(name) {
    if(!name) return null;
    const n = name.toLowerCase().trim();
    if(n.includes('snap')) return 'snap';
    if(n.includes('tik')) return 'tiktok';
    if(n.includes('insta') || n.includes('انستا')) return 'instagram';
    if(n.includes('youtube') || n.includes('يوتيوب')) return 'youtube';
    if(n.includes('twitter') || n.includes('تويتر') || n === 'x') return 'twitter';
    return null;
  }

  function getPlatformList(inf) {
    if(Array.isArray(inf.platforms) && inf.platforms.length > 0){
      const unique = new Set();
      inf.platforms.forEach(p => {
        const normalized = normalizePlatformName(p.platform_name || p.name || p.platform);
        if(normalized) unique.add(normalized);
      });
      return [...unique];
    }
    const raw = (inf.platform || '').toLowerCase().trim();
    if(!raw) return [];
    if(raw === 'كلاهما' || raw === 'both') return ['snap', 'tiktok'];
    const normalized = normalizePlatformName(raw);
    if(normalized) return [normalized];
    return [];
  }

  function formatFollowers(n) {
    n = parseInt(n) || 0;
    if(n === 0) return { num: '0', unit: '' };
    if(n >= 1000000) return { num: (n/1000000).toFixed(1).replace(/\.0$/, ''), unit: 'M' };
    if(n >= 1000) return { num: (n/1000).toFixed(1).replace(/\.0$/, ''), unit: 'K' };
    return { num: n.toString(), unit: '' };
  }

  function getTotalSubscribers(inf) {
    if(inf.total_subscribers != null && inf.total_subscribers > 0) return inf.total_subscribers;
    if(inf.subscribers != null && inf.subscribers > 0) return inf.subscribers;
    if(inf.followers != null && inf.followers > 0) return inf.followers;
    if(Array.isArray(inf.platforms)){
      return inf.platforms.reduce((sum, p) => sum + (parseInt(p.subs) || 0), 0);
    }
    return 0;
  }

  const isUgcMode = typeFilter === 'ugc';
  const sourceData = isUgcMode ? ugcData : data;

  const counts = {
    all: data.length,
    A: data.filter(i => ['A+', 'A'].includes(i.rating) || i.classification === 'A').length,
    B: data.filter(i => i.rating === 'B' || i.classification === 'B').length,
    C: data.filter(i => i.rating === 'C' || i.classification === 'C').length,
    ugc: ugcData.length
  };

  const filteredData = useMemo(() => {
    let res = [...sourceData];
    
    if (typeFilter !== 'ugc' && classificationFilter !== 'all') {
      res = res.filter(i => {
        const r = i.rating || i.classification;
        if (classificationFilter === 'A') return ['A+', 'A'].includes(r);
        return r === classificationFilter;
      });
    }

    if (cityFilter !== 'all') {
      res = res.filter(i => (i.city || '').includes(cityFilter));
    }

    if (categoryFilter) {
      res = res.filter(i => {
        const cat = String(i.category || '');
        const allCats = String(i.all_categories || '');
        return cat.includes(categoryFilter) || allCats.includes(categoryFilter);
      });
    }

    if (q) {
      const qLower = q.toLowerCase();
      res = res.filter(i => (
        (i.name && i.name.toLowerCase().includes(qLower)) ||
        (i.username && i.username.toLowerCase().includes(qLower)) ||
        (i.category && i.category.toLowerCase().includes(qLower)) ||
        (i.phone && i.phone.includes(qLower))
      ));
    }

    return res;
  }, [sourceData, q, classificationFilter, typeFilter, categoryFilter, cityFilter]);

  const categories = [...new Set(data.map(i => i.category).filter(Boolean))].sort();
  const cities = [...new Set(data.map(i => i.city).filter(Boolean))].sort();

  const total = filteredData.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (page > pages && pages > 0) setPage(pages);
  const start = (page - 1) * pageSize;
  const pageItems = filteredData.slice(start, start + pageSize);

  const getTierClass = (c) => {
    if (['A+', 'A'].includes(c)) return 'tier-a';
    if (c === 'B') return 'tier-b';
    return 'tier-c';
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  const handleExport = () => {
    showToast('success', 'تم التصدير بنجاح');
  };

  return (
    <div className="animate-fade-in pb-10">
      {/* HERO */}
      <div className="cust-hero">
        <div className="cust-hero-grid">
          <div className="cust-hero-left">
            <h1>
              <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              المؤثرون
            </h1>
            <div className="sub">قاعدة بيانات شاملة لإدارة المؤثرين عبر المنصات · التصنيف · المتابعون · المدن</div>
          </div>
          <div className="cust-hero-stats">
            <div className="cust-hero-stat">
              <div className="v">{counts.all.toLocaleString('en-US')}</div>
              <div className="l">إجمالي</div>
            </div>
            <div className="cust-hero-stat">
              <div className="v">{counts.A}</div>
              <div className="l">فئة A</div>
            </div>
            <div className="cust-hero-stat">
              <div className="v">{data.filter(i => i.status === 'active' || !i.status).length}</div>
              <div className="l">نشط</div>
            </div>
          </div>
        </div>
      </div>

      {/* UGC TikTok BANNER */}
      <div className={`ugc-banner ${typeFilter === 'ugc' ? 'active' : ''}`} onClick={(e) => {
        if(e.target.closest('a') || e.target.closest('button')) return;
        setTypeFilter(typeFilter === 'ugc' ? 'regular' : 'ugc');
        setClassificationFilter('all');
        setPage(1);
      }}>
        <div className="ugc-banner-left">
          <div className="ugc-banner-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
          </div>
          <div className="ugc-banner-info">
            <div className="ugc-banner-title">صناع محتوى UGC</div>
            <div className="ugc-banner-sub">شبكة صناع محتوى TikTok — منصة مستقلة مرتبطة بإدارة المؤثرين</div>
          </div>
        </div>
        <div className="ugc-banner-stats">
          <div className="ugc-banner-stat">
            <div className="v">{counts.ugc.toLocaleString('en-US')}</div>
            <div className="l">صانع UGC</div>
          </div>
          <div className="ugc-banner-stat">
            <div className="v">{ugcData.filter(c => c.verification_status === 'verified').length}</div>
            <div className="l">موثّق</div>
          </div>
          <div className="ugc-banner-stat">
            <div className="v">{ugcData.filter(c => ['gold', 'platinum', 'diamond'].includes(c.level)).length}</div>
            <div className="l">نخبة</div>
          </div>
        </div>
        <div className="ugc-banner-actions">
          <button className={`ugc-banner-btn ${typeFilter === 'ugc' ? 'active' : ''}`} onClick={(e) => {
            e.stopPropagation();
            setTypeFilter(typeFilter === 'ugc' ? 'regular' : 'ugc');
            setClassificationFilter('all');
            setPage(1);
          }}>
            {typeFilter === 'ugc' ? 'عرض كل المؤثرين' : 'عرض صناع UGC فقط'}
          </button>
          <Link to="/ugc-admin" className="ugc-banner-btn primary" onClick={(e) => e.stopPropagation()}>
            إدارة UGC الكاملة
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </Link>
        </div>
      </div>

      {/* HIGHLIGHTS */}
      <div className="cust-highlights">
        <div className={`cust-hl ${classificationFilter === 'all' && !isUgcMode ? 'active' : ''}`} style={{'--c':'#0d8a6f','--bg':'#f0fdf9'}} onClick={() => { setTypeFilter('regular'); setClassificationFilter('all'); setPage(1); }}>
          <div className="ic-wrap"><Icon name="star" className="ic"/></div>
          <div className="body">
            <div className="val">{counts.all.toLocaleString('en-US')}</div>
            <div className="lbl">كل المؤثرين</div>
          </div>
        </div>
        <div className={`cust-hl ${classificationFilter === 'A' ? 'active' : ''}`} style={{'--c':'#d97706','--bg':'#fef3c7'}} onClick={() => { setTypeFilter('regular'); setClassificationFilter('A'); setPage(1); }}>
          <div className="ic-wrap"><Icon name="trending-up" className="ic"/></div>
          <div className="body">
            <div className="val">{counts.A.toLocaleString('en-US')}</div>
            <div className="lbl">فئة A — رفيعو المستوى</div>
          </div>
        </div>
        <div className={`cust-hl ${classificationFilter === 'B' ? 'active' : ''}`} style={{'--c':'#1e40af','--bg':'#dbeafe'}} onClick={() => { setTypeFilter('regular'); setClassificationFilter('B'); setPage(1); }}>
          <div className="ic-wrap"><Icon name="check" className="ic"/></div>
          <div className="body">
            <div className="val">{counts.B.toLocaleString('en-US')}</div>
            <div className="lbl">فئة B — مميزون</div>
          </div>
        </div>
        <div className={`cust-hl ${classificationFilter === 'C' ? 'active' : ''}`} style={{'--c':'#475569','--bg':'#f1f5f9'}} onClick={() => { setTypeFilter('regular'); setClassificationFilter('C'); setPage(1); }}>
          <div className="ic-wrap"><Icon name="users" className="ic"/></div>
          <div className="body">
            <div className="val">{counts.C.toLocaleString('en-US')}</div>
            <div className="lbl">فئة C — صاعدون</div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="actions-row">
        <div className="left"></div>
        <div className="right">
          <button className="btn btn-ghost" onClick={handleExport}>
            <Icon name="download" className="ic"/> تصدير
          </button>
          {isUgcMode ? (
            <Link to="/ugc-admin" className="btn btn-primary" style={{background: 'linear-gradient(135deg,#fe2c55,#9f1239)', borderColor: 'transparent'}}>
              <Icon name="video" className="ic"/> إدارة UGC كاملة
            </Link>
          ) : (
            <Link to="/influencers/add" className="btn btn-primary">
              <Icon name="plus" className="ic"/> مؤثر جديد
            </Link>
          )}
        </div>
      </div>

      {/* CHIPS */}
      <div className="chip-row">
        <button className={`cstm-chip ${classificationFilter === 'all' ? 'active' : ''}`} onClick={() => { setClassificationFilter('all'); setPage(1); }}>
          الكل <span className="n">{counts.all}</span>
        </button>
        <button className={`cstm-chip class-a ${classificationFilter === 'A' ? 'active' : ''}`} onClick={() => { setClassificationFilter('A'); setPage(1); }}>
          فئة A <span className="n">{counts.A}</span>
        </button>
        <button className={`cstm-chip class-b ${classificationFilter === 'B' ? 'active' : ''}`} onClick={() => { setClassificationFilter('B'); setPage(1); }}>
          فئة B <span className="n">{counts.B}</span>
        </button>
        <button className={`cstm-chip class-c ${classificationFilter === 'C' ? 'active' : ''}`} onClick={() => { setClassificationFilter('C'); setPage(1); }}>
          فئة C <span className="n">{counts.C}</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="search-card">
        <div className="field">
          <Icon name="search" className="ic" />
          <input type="text" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="ابحث بالاسم، اليوزر، التصنيف..." />
        </div>
        <div className="field-divider"></div>
        <div className="field compact">
          <Icon name="bookmark" className="ic" />
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
            <option value="">كل التصنيفات</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-divider"></div>
        <div className="field compact">
          <Icon name="map-pin" className="ic" />
          <select value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}>
            <option value="all">كل المدن</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="results-count">{total} نتيجة</div>
      </div>

      {/* TABLE / CARDS */}
      <div className="influencers-table-wrap">
        {loading ? (
          <div className="empty">
            <Icon name="loader" className="animate-spin text-surface-400 mx-auto w-10 h-10" />
            <h4 className="mt-4 text-surface-600">جاري التحميل...</h4>
          </div>
        ) : pageItems.length === 0 ? (
          <div className="empty">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h4>لا توجد نتائج</h4>
            <p>جرب تعديل عوامل التصفية أو البحث</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="influencers-tbl">
                <thead>
                  <tr>
                    <th>المؤثر</th>
                    <th>الفئة</th>
                    <th>المنصة</th>
                    <th>المتابعون</th>
                    <th>التصنيف</th>
                    <th>المدينة</th>
                    <th>الحالة</th>
                    <th className="center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(inf => {
                    const initial = getInitial(inf.name);
                    const tierCls = inf._isUgc ? 'ugc' : getTierClass(inf.rating || inf.classification);
                    const platforms = getPlatformList(inf);
                    const followers = formatFollowers(inf._isUgc ? (inf.tiktok_followers || inf.followers) : getTotalSubscribers(inf));
                    const status = inf.status || (inf._isUgc ? (inf.verification_status === 'verified' ? 'active' : 'pending') : 'active');

                    if (inf._isUgc) {
                      const levelLabels = { bronze:'برونزي', silver:'فضي', gold:'ذهبي', platinum:'بلاتيني', diamond:'ماسي' };
                      const levelColors = {
                        bronze:   { bg:'#fef3e2', fg:'#92400e', bd:'#fde68a' },
                        silver:   { bg:'#f1f5f9', fg:'#475569', bd:'#cbd5e1' },
                        gold:     { bg:'#fef9c3', fg:'#854d0e', bd:'#fef08a' },
                        platinum: { bg:'#ede9fe', fg:'#5b21b6', bd:'#ddd6fe' },
                        diamond:  { bg:'#cffafe', fg:'#155e75', bd:'#a5f3fc' }
                      };
                      const lvl = levelColors[inf.level] || levelColors.bronze;
                      return (
                        <tr key={inf.id} data-id={inf.id} className="row-ugc" onClick={() => navigate(`/influencers/${inf.id}`)}>
                          <td>
                            <div className="inf-cell">
                              <div className="avatar avatar-ugc">{initial}</div>
                              <div className="info">
                                <div className="name">{inf.name || '—'} 
                                  <span style={{display:'inline-flex',alignItems:'center',gap:'3px',background:'linear-gradient(135deg,#25f4ee20,#fe2c5520)',color:'#9f1239',fontSize:'9.5px',fontWeight:700,padding:'1px 6px',borderRadius:'5px',marginInlineStart:'5px',border:'1px solid #fbcfe8',letterSpacing:'0.3px',fontFamily:'var(--font-mono)'}}>
                                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
                                    UGC
                                  </span>
                                </div>
                                {inf.username && <div className="username" style={{fontFamily:'var(--font-mono)',direction:'ltr',textAlign:'start'}}>@{inf.username}</div>}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{display:'inline-flex',alignItems:'center',padding:'3px 9px',borderRadius:'999px',fontSize:'10.5px',fontWeight:700,fontFamily:'var(--font-mono)',letterSpacing:'0.3px',textTransform:'uppercase',border:`1px solid ${lvl.bd}`,background:lvl.bg,color:lvl.fg}}>{levelLabels[inf.level] || 'برونزي'}</span>
                          </td>
                          <td>
                            <div className="platforms">
                              <span className="platform-pill tiktok" style={{background:'linear-gradient(135deg,#25f4ee15,#fe2c5515)',color:'#9f1239',border:'1px solid #fbcfe8'}}>TikTok</span>
                            </div>
                          </td>
                          <td>
                            <div className="followers-cell">
                              <span className="num">{followers.num}</span><span className="unit">{followers.unit}</span>
                            </div>
                          </td>
                          <td>
                            <div className="category-cell">
                              <div className="main">{inf.category || 'UGC'}</div>
                              {inf.engagement_rate ? <div className="other" style={{fontFamily:'var(--font-mono)',fontSize:'10.5px'}}>{inf.engagement_rate.toFixed(1)}% تفاعل</div> : null}
                            </div>
                          </td>
                          <td>
                            <div className="city-cell">{inf.city || '—'}</div>
                          </td>
                          <td>
                            <span className={`status-pill ${status}`}>
                              <span className="dot"></span>
                              {inf.verification_status === 'verified' ? 'موثّق' : inf.verification_status === 'rejected' ? 'مرفوض' : 'بانتظار التوثيق'}
                            </span>
                          </td>
                          <td>
                            <div className="row-actions">
                              <Link to="/ugc-admin" className="row-action-btn" title="إدارة UGC" aria-label="إدارة UGC" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',justifyContent:'center'}} onClick={e => e.stopPropagation()}>
                                <Icon name="eye" className="ic"/>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={inf.id} data-id={inf.id} onClick={() => navigate(`/influencers/${inf.id}`)}>
                        <td>
                          <div className="inf-cell">
                            <div className={`avatar ${tierCls}`}>{initial}</div>
                            <div className="info">
                              <div className="name">{inf.name || '—'}</div>
                              {inf.username && <div className="username">@{inf.username}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`tier-badge ${tierCls}`}>{inf.rating || inf.classification || '—'}</span>
                        </td>
                        <td>
                          <div className="platforms">
                            {platforms.length > 0 ? platforms.map(p => (
                              <span key={p} className={`platform-pill ${p}`}>{PLATFORM_LABELS[p] || p}</span>
                            )) : <span style={{color:'var(--text-3)',fontSize:'11.5px'}}>—</span>}
                          </div>
                        </td>
                        <td>
                          <div className="followers-cell">
                            <span className="num">{followers.num}</span><span className="unit">{followers.unit}</span>
                          </div>
                        </td>
                        <td>
                          <div className="category-cell">
                            <div className="main">{inf.category || '—'}</div>
                            {inf.subcategory && <div className="other">{inf.subcategory}</div>}
                          </div>
                        </td>
                        <td>
                          <div className="city-cell">{inf.city || '—'}</div>
                        </td>
                        <td>
                          <span className={`status-pill ${status}`}>
                            <span className="dot"></span>
                            {status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="row-action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/influencers/${inf.id}`); }} title="عرض" aria-label="عرض">
                              <Icon name="eye" className="ic"/>
                            </button>
                            <button className="row-action-btn danger" onClick={(e) => deleteInfluencer(inf.id, inf.name, e)} title="حذف" aria-label="حذف">
                              <Icon name="trash" className="ic"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mobile-cards">
              {pageItems.map(inf => {
                const initial = getInitial(inf.name);
                const tierCls = inf._isUgc ? 'ugc' : getTierClass(inf.rating || inf.classification);
                const platforms = getPlatformList(inf);
                const followers = formatFollowers(inf._isUgc ? (inf.tiktok_followers || inf.followers) : getTotalSubscribers(inf));
                const status = inf.status || 'active';

                return (
                  <div key={inf.id} className="mobile-card" data-id={inf.id} onClick={() => navigate(`/influencers/${inf.id}`)}>
                    <div className="mc-head">
                      <div className={`avatar ${tierCls}`}>{initial}</div>
                      <div className="info">
                        <div className="name">{inf.name || '—'}</div>
                        {inf.username && <div className="username">@{inf.username}</div>}
                      </div>
                      <div className="tier">
                        <span className={`tier-badge ${tierCls}`}>{inf.rating || inf.classification || '—'}</span>
                      </div>
                    </div>
                    <div className="mc-body">
                      <div className="mc-stat">
                        <div className="lbl">المتابعون</div>
                        <div className="val">{followers.num}{followers.unit}</div>
                      </div>
                      <div className="mc-stat">
                        <div className="lbl">الحالة</div>
                        <div className="val">
                          <span className={`status-pill ${status}`}>
                            <span className="dot"></span>
                            {status === 'active' ? 'نشط' : 'غير نشط'}
                          </span>
                        </div>
                      </div>
                      <div className="mc-stat">
                        <div className="lbl">التصنيف</div>
                        <div className="val" style={{color:'var(--text-2)',fontWeight:600}}>{inf.category || '—'}</div>
                      </div>
                      <div className="mc-stat">
                        <div className="lbl">المدينة</div>
                        <div className="val" style={{color:'var(--text-2)',fontWeight:600}}>{inf.city || '—'}</div>
                      </div>
                    </div>
                    <div className="mc-foot">
                      <div className="platforms-mini">
                        {platforms.slice(0,3).map(p => <span key={p} className={`platform-pill ${p}`}>{PLATFORM_LABELS[p] || p}</span>)}
                      </div>
                      <div className="row-actions-mini">
                        <button className="row-action-btn" onClick={(e) => { e.stopPropagation(); navigate(`/influencers/${inf.id}`); }} aria-label="عرض">
                          <Icon name="eye" className="ic"/>
                        </button>
                        <button className="row-action-btn danger" onClick={(e) => deleteInfluencer(inf.id, inf.name, e)} aria-label="حذف">
                          <Icon name="trash" className="ic"/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        
        {total > pageSize && (
          <div className="pagination">
            <div style={{fontFamily:'var(--font-mono)',color:'var(--text-3)',fontSize:'11.5px'}}>عرض {start + 1}-{Math.min(start + pageSize, total)} من أصل {total}</div>
            <div className="pager">
              <button className={`p ${page <= 1 ? 'disabled' : ''}`} onClick={() => setPage(Math.max(1, page - 1))}><Icon name="chevron-right" className="ic"/></button>
              {Array.from({length: Math.min(pages, 5)}, (_, i) => {
                const offset = page > 3 ? Math.max(0, page - 3) : 0;
                return offset + i + 1;
              }).filter(p => p <= pages).map(p => (
                <button key={p} className={`p ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              {pages > 5 && page < pages - 2 && <span className="p" style={{border:'none',background:'transparent',cursor:'default'}}>...</span>}
              <button className={`p ${page >= pages ? 'disabled' : ''}`} onClick={() => setPage(Math.min(pages, page + 1))}><Icon name="chevron-left" className="ic"/></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
