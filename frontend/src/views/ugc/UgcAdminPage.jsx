import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './UgcAdminPage.css';

const tabs = [
  { key: 'dashboard', label: 'نظرة عامة', icon: 'i-dashboard' },
  { key: 'creators', label: 'صناع المحتوى', icon: 'i-users', count: 'creators' },
  { key: 'match', label: 'المطابقة الذكية', icon: 'i-chart' },
  { key: 'applications', label: 'الطلبات', icon: 'i-file-check', count: 'applications' },
  { key: 'submissions', label: 'المحتوى', icon: 'i-video', count: 'submissions' },
  { key: 'packages', label: 'الباقات', icon: 'i-folder', count: 'packages' },
  { key: 'ucampaigns', label: 'حملات UGC', icon: 'i-megaphone', count: 'campaigns' },
  { key: 'payments', label: 'المدفوعات', icon: 'i-wallet' },
];

const levelLabels = { bronze: 'برونزي', silver: 'فضي', gold: 'ذهبي', platinum: 'بلاتيني', diamond: 'ماسي' };
const statusLabels = { active: 'نشط', verified: 'موثّق', pending: 'معلّق', approved: 'مقبول', rejected: 'مرفوض', in_review: 'قيد المراجعة', published: 'منشور', completed: 'مكتمل', draft: 'مسودة', delivering: 'التسليمات جارية', in_progress: 'قيد التنفيذ', cancelled: 'ملغاة', processing: 'جاري', paid: 'مدفوع' };
const txLabels = { pending: 'معلّق', completed: 'مكتمل', failed: 'فشل', processing: 'جاري' };
const money = (v) => `${Number(v || 0).toLocaleString('en-US')} ر.س`;
const fmt = (v) => Number(v || 0).toLocaleString('en-US');
const initial = (v = '?') => String(v || '?').trim().charAt(0) || '?';
const date = (v) => v ? new Date(v).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

function Pill({ status, children }) {
  return <span className={`ugc-pill ${status || 'draft'}`}><span className="dot" />{children || statusLabels[status] || status}</span>;
}
function LevelPill({ level }) { return <span className={`lvl-pill ${level}`}>{levelLabels[level] || level}</span>; }
function Toast({ toast, onClose }) { return toast ? <div className={`ugc-toast ${toast.type || 'success'}`} onClick={onClose}><Icon name={toast.type === 'danger' ? 'i-info' : 'i-check'} />{toast.message}</div> : null; }
function Empty({ title, text, icon = 'i-folder' }) { return <div className="ugc-empty"><Icon name={icon} /><h3>{title}</h3><p>{text}</p></div>; }

function Hero({ data, copyPortal, openPortal }) {
  const creators = data.creators || [];
  const apps = data.applications || [];
  const subs = data.submissions || [];
  const txns = data.transactions || [];
  const paid = txns.filter((t) => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + Number(t.amount || 0), 0);
  const portalLink = `${window.location.origin}/ugc-portal`;
  const stats = [
    [creators.length, 'صانع محتوى'],
    [creators.filter((c) => c.verification_status === 'verified').length, 'موثّق'],
    [apps.filter((a) => a.status === 'pending').length, 'طلبات معلّقة'],
    [subs.filter((s) => s.status === 'in_review').length, 'محتوى للمراجعة'],
    [`${(paid / 1000).toFixed(1)}K`, 'ر.س مدفوعة'],
  ];
  return <section className="ugc-hero">
    <div className="ugc-hero-top"><div className="ugc-hero-icon"><Icon name="i-video" /></div><div><h1>UGC — شبكة صناع المحتوى</h1><div className="sub">منصة متكاملة لإدارة آلاف صناع محتوى TikTok مع محرك مطابقة ذكي</div></div></div>
    <div className="ugc-hero-stats">{stats.map(([v, l]) => <div className="ugc-hero-stat" key={l}><div className="v">{v}</div><div className="l">{l}</div></div>)}</div>
    <div className="ugc-share-link"><Icon name="i-globe" /><span>رابط التسجيل العام:</span><code>{portalLink}</code><button onClick={() => copyPortal(portalLink)} type="button">نسخ</button><button onClick={openPortal} type="button">فتح</button></div>
  </section>;
}

function Tabs({ active, setActive, counts }) {
  return <div className="ugc-tabs">{tabs.map((tab) => <button type="button" key={tab.key} className={`ugc-tab ${active === tab.key ? 'active' : ''}`} onClick={() => setActive(tab.key)}><Icon name={tab.icon} />{tab.label}{tab.count ? <span className="count">{counts[tab.count] || 0}</span> : null}</button>)}</div>;
}

function Dashboard({ data }) {
  const creators = data.creators || [], apps = data.applications || [], subs = data.submissions || [], txns = data.transactions || [];
  const recent = creators.filter((c) => new Date(c.registered_at) > new Date(Date.now() - 7 * 86400000));
  const pendingPay = txns.filter((t) => t.type === 'credit' && t.status === 'pending');
  const pendingAmount = pendingPay.reduce((s, t) => s + Number(t.amount || 0), 0);
  const avgEng = creators.length ? creators.reduce((s, c) => s + Number(c.engagement_rate || 0), 0) / creators.length : 0;
  const levels = creators.reduce((o, c) => ({ ...o, [c.level]: (o[c.level] || 0) + 1 }), {});
  const statRows = [
    ['جديد هذا الأسبوع', recent.length, 'صانع محتوى مسجّل'],
    ['المحتوى المعتمد', subs.filter((s) => ['approved', 'published'].includes(s.status)).length, `من ${subs.length} إجمالي`],
    ['مدفوعات معلّقة', money(pendingAmount), `${pendingPay.length} حوالة`],
    ['معدل التفاعل', `${avgEng.toFixed(1)}%`, 'متوسط الشبكة'],
  ];
  return <>
    <div className="ugc-stats">{statRows.map(([l, v, m]) => <div className="ugc-stat" key={l}><div className="l">{l}</div><div className="v">{v}</div><div className="m">{m}</div></div>)}</div>
    <div className="ugc-two-col"><section className="ugc-panel"><h3><Icon name="i-star" />توزيع المستويات</h3>{Object.entries(levelLabels).map(([lvl, label]) => <div className="ugc-level-row" key={lvl}><LevelPill level={lvl} /><span className="bar"><i style={{ width: `${creators.length ? ((levels[lvl] || 0) / creators.length) * 100 : 0}%` }} /></span><b>{levels[lvl] || 0}</b></div>)}</section><section className="ugc-panel"><h3><Icon name="i-clock" />آخر المسجّلين</h3>{creators.slice(-5).reverse().map((c) => <div className="ugc-mini-row" key={c.id}><span className="ava">{initial(c.full_name)}</span><span><b>{c.full_name}</b><small>{c.city} · {c.handle}</small></span><LevelPill level={c.level} /></div>)}</section></div>
  </>;
}

function Filters({ filters, setFilters, cities }) {
  const update = (key, value) => setFilters((old) => ({ ...old, [key]: value }));
  return <div className="ugc-filters"><div className="ugc-filters-row"><input className="ugc-search" value={filters.search} onChange={(e) => update('search', e.target.value)} placeholder="ابحث بالاسم، الحساب، المدينة أو التصنيف..." /><select value={filters.city} onChange={(e) => update('city', e.target.value)}><option value="">كل المدن</option>{cities.map((c) => <option key={c} value={c}>{c}</option>)}</select><select value={filters.level} onChange={(e) => update('level', e.target.value)}><option value="">كل المستويات</option>{Object.entries(levelLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><select value={filters.gender} onChange={(e) => update('gender', e.target.value)}><option value="">الجنس</option><option value="female">نساء</option><option value="male">رجال</option></select><button type="button" className="clear" onClick={() => setFilters({ search: '', city: '', gender: '', level: '' })}>مسح</button></div></div>;
}

function Creators({ creators }) {
  const [filters, setFilters] = useState({ search: '', city: '', gender: '', level: '' });
  const cities = useMemo(() => [...new Set(creators.map((c) => c.city).filter(Boolean))], [creators]);
  const filtered = creators.filter((c) => {
    if (filters.city && c.city !== filters.city) return false;
    if (filters.gender && c.gender !== filters.gender) return false;
    if (filters.level && c.level !== filters.level) return false;
    if (filters.search) {
      const h = `${c.full_name} ${c.handle} ${c.city} ${(c.categories || []).join(' ')}`.toLowerCase();
      if (!h.includes(filters.search.toLowerCase())) return false;
    }
    return true;
  });
  return <><Filters filters={filters} setFilters={setFilters} cities={cities} /><div className="ugc-section-head"><h2>صناع المحتوى</h2><span className="ugc-results-count">{filtered.length} نتيجة</span></div><div className="ugc-creators-grid">{filtered.map((c) => <article className="ugc-creator-card" key={c.id}><LevelPill level={c.level} /><div className="top"><div className="ava">{initial(c.full_name)}</div><div className="info"><div className="name">{c.full_name}</div><div className="handle">{c.handle}</div></div></div><div className="stats-row"><div className="s-item"><div className="v">{fmt(c.followers_count)}</div><div className="l">متابع</div></div><div className="s-item"><div className="v">{c.engagement_rate}%</div><div className="l">تفاعل</div></div><div className="s-item"><div className="v">{c.completed_jobs}</div><div className="l">مهمة</div></div></div><div className="meta-row"><span className="city">{c.city}</span><Pill status={c.verification_status}>{c.verification_status === 'verified' ? 'موثّق' : statusLabels[c.verification_status]}</Pill></div></article>)}</div></>;
}

function Match({ matches }) {
  const scoreClass = (s) => s >= 85 ? 'excellent' : s >= 72 ? 'good' : s >= 55 ? 'fair' : 'poor';
  return <section className="ugc-match-panel"><div className="ugc-match-header"><Icon name="i-chart" /><h3>المطابقة الذكية</h3><span className="badge">AI READY</span></div><div className="ugc-match-grid">{matches.map((m) => <div className="ugc-match-row" key={m.creator_id}><div className={`ugc-match-score ${scoreClass(m.score)}`}>{m.score}</div><div className="ugc-match-info"><div className="name">{m.creator_name} <small>{m.handle}</small></div><div className="meta"><span>{m.city}</span><span>مناسب لـ {m.recommended_for}</span></div><div className="breakdown">{Object.entries(m.breakdown || {}).map(([k, v]) => <span className="b-item" key={k}>{k}: {v}</span>)}</div></div><LevelPill level={m.level} /></div>)}</div></section>;
}

function Applications({ rows, decide }) {
  return <><div className="ugc-section-head"><h2>طلبات الانضمام</h2></div>{rows.length ? rows.map((row) => <div className="ugc-app-card" key={row.id}><div className="ugc-app-row"><div className="ava">{initial(row.creator_name)}</div><div className="body"><div className="name">{row.creator_name}</div><div className="meta">{row.city} · {row.category} · {date(row.submitted_at)}</div><p>{row.message}</p></div><Pill status={row.status} /><div className="ugc-app-actions"><button className="ugc-btn-sm ugc-btn-approve" onClick={() => decide(row.id, 'approved')} type="button">قبول</button><button className="ugc-btn-sm ugc-btn-reject" onClick={() => decide(row.id, 'rejected')} type="button">رفض</button></div></div></div>) : <Empty title="لا توجد طلبات" text="كل طلبات الانضمام تمت مراجعتها." icon="i-file-check" />}</>;
}

function Submissions({ rows, setStatus }) {
  return <><div className="ugc-section-head"><h2>مراجعة المحتوى</h2></div>{rows.map((row) => <div className="ugc-app-card" key={row.id}><div className="ugc-app-row"><div className="ava">{initial(row.creator_name)}</div><div className="body"><div className="name">{row.campaign_name}</div><div className="meta">{row.creator_name} · {row.platform} · {date(row.submitted_at)} · Score {row.score}%</div><a href={row.video_url} target="_blank" rel="noreferrer" className="ugc-link">فتح المحتوى</a></div><Pill status={row.status} /><div className="ugc-app-actions"><button className="ugc-btn-sm ugc-btn-approve" onClick={() => setStatus(row.id, 'approved')} type="button">اعتماد</button><button className="ugc-btn-sm ugc-btn-reject" onClick={() => setStatus(row.id, 'rejected')} type="button">رفض</button><button className="ugc-btn-sm ugc-btn-view" onClick={() => setStatus(row.id, 'published')} type="button">منشور</button></div></div></div>)}</>;
}

function Packages({ rows }) {
  return <><div className="ugc-section-head"><h2>الباقات</h2></div><div className="ugc-creators-grid">{rows.map((p) => <article className="ugc-creator-card ugc-package" key={p.id}><div className="top"><div className="ava"><Icon name="i-folder" /></div><div className="info"><div className="name">{p.name}</div><div className="handle">{p.pkg_type} · {p.duration_days} days</div></div></div><div className="stats-row"><div className="s-item"><div className="v">{p.videos_count}</div><div className="l">فيديو</div></div><div className="s-item"><div className="v">{money(p.price_sell)}</div><div className="l">بيع</div></div><div className="s-item"><div className="v">{money(p.price_cost)}</div><div className="l">تكلفة</div></div></div><p>{p.description}</p><Pill status={p.status} /></article>)}</div></>;
}

function Campaigns({ rows, update }) {
  return <><div className="ugc-section-head"><h2>حملات UGC</h2></div><div className="ugc-campaign-list">{rows.map((c) => { const done = (c.creators || []).filter((x) => x.delivery_status === 'published').length; const total = (c.creators || []).length; const progress = total ? Math.round((done / total) * 100) : 0; const sell = (c.creators || []).reduce((s, x) => s + Number(x.price_sell || 0), 0); const cost = (c.creators || []).reduce((s, x) => s + Number(x.price_cost || 0), 0); return <article className="uc-card" key={c.id}><div><h3>{c.name} <small>{c.id}</small></h3><p>العميل: <b>{c.customer_name}</b> · باقة: {c.package_name} · {total} صانع</p></div><div className="uc-metrics"><span><small>بيع</small><b className="good">{money(sell)}</b></span><span><small>تكلفة</small><b>{money(cost)}</b></span><span className="uc-progress"><small>المنشور {done}/{total}</small><i><em style={{ width: `${progress}%` }} /></i></span><select value={c.status} onChange={(e) => update(c.id, e.target.value)}><option value="draft">مسودة</option><option value="in_progress">قيد التنفيذ</option><option value="delivering">التسليمات جارية</option><option value="completed">مكتملة</option><option value="cancelled">ملغاة</option></select></div></article>; })}</div></>;
}

function Payments({ rows }) {
  const totalPaid = rows.filter((t) => t.type === 'credit' && t.status === 'completed').reduce((s, t) => s + Number(t.amount || 0), 0);
  const pending = rows.filter((t) => t.type === 'credit' && t.status === 'pending');
  return <><div className="ugc-stats"><div className="ugc-stat"><div className="l">إجمالي المدفوع</div><div className="v">{money(totalPaid)}</div><div className="m">لصناع المحتوى</div></div><div className="ugc-stat"><div className="l">بانتظار الدفع</div><div className="v">{money(pending.reduce((s, t) => s + Number(t.amount || 0), 0))}</div><div className="m">{pending.length} حوالة</div></div><div className="ugc-stat"><div className="l">إجمالي العمليات</div><div className="v">{rows.length}</div><div className="m">معاملة مالية</div></div></div>{rows.map((tx) => <div className="ugc-app-card" key={tx.id}><div className="ugc-app-row"><div className="ava">{initial(tx.creator_name)}</div><div className="body"><div className="name">{tx.creator_name}</div><div className="meta">{tx.description} · {date(tx.created_at)}</div></div><div className="ugc-amount">+{money(tx.amount)}</div><Pill status={tx.status}>{txLabels[tx.status]}</Pill></div></div>)}</>;
}

export default function UgcAdminPage() {
  const [data, setData] = useState({ creators: [], applications: [], submissions: [], packages: [], campaigns: [], transactions: [], matches: [] });
  const [active, setActive] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => { setToast({ message, type }); window.setTimeout(() => setToast(null), 2300); }, []);
  const load = useCallback(() => { setLoading(true); api.get('/api/v1/ugc-admin/overview').then(({ data: res }) => setData(res.data || {})).catch((e) => showToast(e.response?.data?.message || 'تعذر تحميل UGC', 'danger')).finally(() => setLoading(false)); }, [showToast]);
  useEffect(() => { load(); }, [load]);
  const counts = { creators: data.creators?.length, applications: data.applications?.filter((x) => x.status === 'pending').length, submissions: data.submissions?.filter((x) => x.status === 'in_review').length, packages: data.packages?.length, campaigns: data.campaigns?.filter((x) => !['completed', 'cancelled'].includes(x.status)).length };
  const postAction = (promise) => promise.then((res) => { showToast(res.data?.message || 'تم الحفظ'); load(); }).catch((e) => showToast(e.response?.data?.message || 'فشل الحفظ', 'danger'));
  const decide = (id, decision) => postAction(api.post(`/api/v1/ugc-admin/applications/${id}/decision`, { decision }));
  const setSubmission = (id, status) => postAction(api.post(`/api/v1/ugc-admin/submissions/${id}/status`, { status }));
  const setCampaign = (id, status) => postAction(api.post(`/api/v1/ugc-admin/campaigns/${id}/status`, { status }));
  const copyPortal = (link) => navigator.clipboard?.writeText(link).then(() => showToast('تم نسخ الرابط')).catch(() => showToast('تعذر النسخ', 'danger'));
  return <div className="ugc-admin-page"><Toast toast={toast} onClose={() => setToast(null)} /><Hero data={data} copyPortal={copyPortal} openPortal={() => window.open('/ugc-portal', '_blank')} /><Tabs active={active} setActive={setActive} counts={counts} />{loading ? <Empty title="جاري التحميل" text="يتم تحميل بيانات UGC الآن..." icon="i-refresh" /> : <>{active === 'dashboard' && <Dashboard data={data} />}{active === 'creators' && <Creators creators={data.creators || []} />}{active === 'match' && <Match matches={data.matches || []} />}{active === 'applications' && <Applications rows={data.applications || []} decide={decide} />}{active === 'submissions' && <Submissions rows={data.submissions || []} setStatus={setSubmission} />}{active === 'packages' && <Packages rows={data.packages || []} />}{active === 'ucampaigns' && <Campaigns rows={data.campaigns || []} update={setCampaign} />}{active === 'payments' && <Payments rows={data.transactions || []} />}</>}</div>;
}