import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './ContentPage.css';

const sourceOrder = ['google_drive', 'tiktok', 'snapchat', 'instagram', 'twitter', 'youtube', 'dropbox', 'other'];
const platformOptions = [
  { value: '', label: 'كل المنصات' },
  { value: 'snapchat', label: 'سناب شات' },
  { value: 'tiktok', label: 'تيك توك' },
  { value: 'instagram', label: 'إنستقرام' },
  { value: 'twitter', label: 'X (تويتر)' },
  { value: 'youtube', label: 'يوتيوب' },
  { value: 'linkedin', label: 'لينكدإن' },
];
const ratingOptions = [
  { value: '', label: 'كل التقييمات' },
  { value: '5', label: 'ممتاز' },
  { value: '4', label: 'جيد' },
  { value: '3', label: 'مقبول' },
];
const monthOrder = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

const fmt = (v) => Number(v || 0).toLocaleString('en-US');
const pct = (part, total) => total ? Math.round((Number(part || 0) / Number(total || 1)) * 100) : 0;
const initial = (value = '?') => String(value || '?').trim().charAt(0) || '?';
const formatDate = (value) => value ? new Date(value).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const monthName = (value) => value ? new Date(value).toLocaleString('ar', { month: 'long' }) : '';
const avatarColors = (seed = '') => {
  const colors = [['#7c3aed','#3b82f6'], ['#0d8a6f','#16a34a'], ['#ec4899','#f97316'], ['#0891b2','#2563eb'], ['#dc2626','#f59e0b']];
  const sum = String(seed).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

function classifyUrl(url = '') {
  const u = String(url).toLowerCase().trim();
  if (!u) return 'other';
  if (u.includes('drive.google.com') || u.includes('docs.google.com')) return 'google_drive';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('snapchat.com')) return 'snapchat';
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'twitter';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('dropbox.com')) return 'dropbox';
  return 'other';
}

function sourceLabel(source) {
  return ({ google_drive: 'Google Drive', tiktok: 'TikTok', snapchat: 'Snapchat', instagram: 'Instagram', twitter: 'Twitter / X', youtube: 'YouTube', dropbox: 'Dropbox', other: 'أخرى' })[source] || source || 'أخرى';
}

function sourceIcon(source) {
  return ({ google_drive: 'D', tiktok: 'T', snapchat: 'S', instagram: 'I', twitter: 'X', youtube: 'Y', dropbox: 'D', other: '?' })[source] || '?';
}

function platformLabel(platform) {
  return ({ snapchat: 'سناب', tiktok: 'تيك توك', instagram: 'إنستا', twitter: 'X', youtube: 'يوتيوب', linkedin: 'لينكدإن' })[platform] || platform || '—';
}

function ratingText(rating) {
  const n = Number(rating || 0);
  if (n >= 5) return 'ممتاز';
  if (n >= 4) return 'جيد';
  if (n >= 3) return 'مقبول';
  return 'غير مقيّم';
}

function RatingStars({ rating }) {
  const count = Math.max(0, Math.min(5, Number(rating || 0)));
  if (!count) return <span className="rating-muted">—</span>;
  return <span className="rating-stars" title={ratingText(rating)}>{Array.from({ length: count }).map((_, i) => <span key={i}>★</span>)}</span>;
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`content-toast ${toast.type || 'success'}`} onClick={onClose}><Icon name={toast.type === 'danger' ? 'i-info' : 'i-check'} />{toast.message}</div>;
}

function normalizeContent(item) {
  const campaign = item.campaign || {};
  const influencer = item.influencer || {};
  const customer = item.customer || {};
  const url = item.content_url || item.publish_url || item.drive_url || item.proof_url || '';
  const source = item.source || classifyUrl(url);
  return {
    id: item.id,
    code: item.code || `CT-${String(item.id || 0).padStart(5, '0')}`,
    campaign_id: item.campaign_id,
    campaign_name: item.campaign_name || campaign.name || item.title || '—',
    customer_id: item.customer_id,
    customer_name: item.customer_name || customer.name || '—',
    influencer_id: item.influencer_id,
    influencer_name: item.influencer_name || influencer.name || '—',
    employee_name: item.employee_name || item.created_by || item.uploader_name || 'مدير النظام',
    platform: item.platform || influencer.platform || '',
    content_url: url,
    file_data: item.file_data || '',
    file_name: item.file_name || '',
    file_type: item.file_type || '',
    source,
    type: item.type || 'post',
    rating: item.rating || 0,
    scheduled_date: item.scheduled_date || item.published_date || item.created_at,
    month: item.month || monthName(item.scheduled_date || item.published_date || item.created_at),
    views_count: item.views_count || 0,
    likes_count: item.likes_count || 0,
    comments_count: item.comments_count || 0,
  };
}

function Hero({ total, sources, tiktok }) {
  return <section className="cnt-hero">
    <div className="cnt-hero-grid">
      <div className="cnt-hero-left">
        <h1><Icon name="i-video" />المحتوى</h1>
        <div className="sub">جميع روابط المحتويات المُدخلة في الإعلانات اليومية، مصنّفة حسب المصدر والمنصة</div>
      </div>
      <div className="cnt-hero-stats">
        <div className="cnt-hero-stat"><div className="v">{fmt(total)}</div><div className="l">محتوى</div></div>
        <div className="cnt-hero-stat"><div className="v">{fmt(sources)}</div><div className="l">مصدر</div></div>
        <div className="cnt-hero-stat"><div className="v">{fmt(tiktok)}</div><div className="l">TikTok</div></div>
      </div>
    </div>
  </section>;
}

function KpiRow({ counts, total }) {
  const cards = [
    { key: 'google_drive', label: 'Google Drive', className: 'src-google', icon: 'i-folder', color: '#4285F4' },
    { key: 'tiktok', label: 'TikTok', className: 'src-tiktok', icon: 'i-video', color: '#000' },
    { key: 'snapchat', label: 'Snapchat', className: 'src-snap', icon: 'i-video', color: '#FFFC00', darkIcon: true },
    { key: 'twitter', label: 'Twitter / X', className: 'src-twitter', icon: 'i-video', color: '#1DA1F2' },
    { key: 'all', label: 'إجمالي المحتويات', className: 'src-total', icon: 'i-folder', color: 'var(--brand-600)' },
  ];
  return <div className="kpi-row content-kpi-row">{cards.map((card) => {
    const value = card.key === 'all' ? total : counts[card.key] || 0;
    const percent = card.key === 'all' ? 100 : pct(value, total);
    return <article className={`kpi-card ${card.className}`} key={card.key}>
      <div className="top"><div className="label">{card.label}</div><div className="ic-wrap" style={{ background: card.color }}><Icon name={card.icon} style={card.darkIcon ? { color: '#000' } : undefined} /></div></div>
      <div className="val">{fmt(value)} {card.key !== 'all' ? <small>محتوى</small> : null}</div>
      <div className="meta">{percent}% من الإجمالي</div>
      <div className="pct-bar"><div style={{ width: `${percent}%`, background: card.color }} /></div>
    </article>;
  })}</div>;
}

function SourceChips({ counts, active, onChange }) {
  const visible = sourceOrder.filter((source) => counts[source]);
  return <div className="source-chips">
    <button type="button" className={`source-chip ${active === 'all' ? 'active' : ''}`} onClick={() => onChange('all')}>الكل <span className="n">{counts.all || 0}</span></button>
    {visible.map((source) => <button type="button" key={source} className={`source-chip ${active === source ? 'active' : ''}`} onClick={() => onChange(source)}>
      <span className={`src-icon ${source}`}>{sourceIcon(source)}</span>{sourceLabel(source)}<span className="n">{counts[source]}</span>
    </button>)}
  </div>;
}

function SearchCard({ filters, setFilters, view, setView, months, employees, total }) {
  const change = (key, value) => setFilters((old) => ({ ...old, [key]: value }));
  return <div className="search-card content-search-card">
    <div className="field"><Icon name="i-search" /><input value={filters.q} onChange={(e) => change('q', e.target.value)} placeholder="ابحث بالمؤثر، الحملة، الموظف، الرابط..." /></div>
    <div className="field-divider" />
    <div className="field compact"><Icon name="i-video" /><select value={filters.platform} onChange={(e) => change('platform', e.target.value)}>{platformOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
    <div className="field compact"><Icon name="i-calendar" /><select value={filters.month} onChange={(e) => change('month', e.target.value)}><option value="">كل الشهور</option>{months.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
    <div className="field compact"><Icon name="i-users" /><select value={filters.employee} onChange={(e) => change('employee', e.target.value)}><option value="">كل الموظفين</option>{employees.map((e) => <option key={e} value={e}>{e}</option>)}</select></div>
    <div className="field compact"><Icon name="i-star" /><select value={filters.rating} onChange={(e) => change('rating', e.target.value)}>{ratingOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
    <div className="view-toggle">
      <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><Icon name="i-dashboard" />بطاقات</button>
      <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><Icon name="i-list" />جدول</button>
    </div>
    <div className="results-count">{fmt(total)} نتيجة</div>
  </div>;
}

function ContentCard({ item, copy }) {
  const [c1, c2] = avatarColors(item.influencer_id || item.influencer_name);
  const url = item.content_url || item.file_data;
  const open = () => { if (url) window.open(url, '_blank', 'noopener,noreferrer'); };
  return <article className="content-card" onClick={open}>
    <div className={`card-preview ${item.platform || ''}`}>
      {item.file_data && item.file_type?.startsWith?.('image/') ? <img src={item.file_data} alt="" /> : null}
      <div className="platform-bg-icon">{sourceIcon(item.source)}</div>
      <div className="source-badge"><span className={`src-icon ${item.source}`}>{sourceIcon(item.source)}</span>{item.file_data ? 'ملف مرفوع' : sourceLabel(item.source)}</div>
      {Number(item.rating) > 0 ? <div className="rating-badge"><RatingStars rating={item.rating} /></div> : null}
      {item.platform ? <div className="platform-pill-overlay">{platformLabel(item.platform)}</div> : null}
    </div>
    <div className="card-body">
      <div className="card-influencer-row">
        <div className="card-ava" style={{ '--c1': c1, '--c2': c2 }}>{initial(item.influencer_name)}</div>
        <div className="info"><div className="name">{item.influencer_name}</div><div className="sub">{item.employee_name}</div></div>
      </div>
      <a href={item.campaign_id ? `/campaigns/${item.campaign_id}` : '#'} onClick={(e) => e.stopPropagation()} className="card-campaign">{item.campaign_name} ←</a>
      <div className="card-meta">
        <div className="left"><div className="item"><Icon name="i-calendar" />{formatDate(item.scheduled_date)}</div></div>
        <div className="card-actions">
          {item.content_url ? <button type="button" className="copy-btn" onClick={(e) => { e.stopPropagation(); copy(item.content_url); }}><Icon name="i-copy" />نسخ</button> : null}
          {url ? <a href={url} target="_blank" rel="noreferrer" className="open-btn" onClick={(e) => e.stopPropagation()}><Icon name="i-eye" />{item.file_data && !item.content_url ? 'عرض الملف' : 'فتح'}</a> : null}
        </div>
      </div>
    </div>
  </article>;
}

function GridView({ items, copy }) {
  return <div className="content-grid">{items.map((item) => <ContentCard key={`${item.id}-${item.content_url}`} item={item} copy={copy} />)}</div>;
}

function TableView({ items, copy }) {
  return <div className="content-table-wrap"><div className="table-scroll"><table className="ct-tbl"><thead><tr>
    <th>المصدر</th><th>المؤثر</th><th>الحملة</th><th>الموظف</th><th>التاريخ</th><th>المنصة</th><th>التقييم</th><th>الرابط</th><th></th>
  </tr></thead><tbody>{items.map((item) => {
    const [c1, c2] = avatarColors(item.influencer_id || item.influencer_name);
    const url = item.content_url || item.file_data;
    return <tr key={`${item.id}-${item.content_url}`} onClick={() => url && window.open(url, '_blank', 'noopener,noreferrer')}>
      <td><div className="table-source"><span className={`src-icon-mini ${item.source}`}>{sourceIcon(item.source)}</span><span>{sourceLabel(item.source)}</span></div></td>
      <td><div className="influencer-mini"><div className="ava" style={{ '--c1': c1, '--c2': c2 }}>{initial(item.influencer_name)}</div><div className="name">{item.influencer_name}</div></div></td>
      <td className="campaign-td">{item.campaign_name}</td>
      <td>{item.employee_name}</td>
      <td className="date-td">{formatDate(item.scheduled_date)}</td>
      <td><span className={`platform-pill ${item.platform}`}>{platformLabel(item.platform)}</span></td>
      <td><RatingStars rating={item.rating} /></td>
      <td><div className="url-cell">{url ? <a href={url} target="_blank" rel="noreferrer" className="url-text" onClick={(e) => e.stopPropagation()}>{item.content_url ? `${item.content_url.substring(0, 42)}...` : `📎 ${item.file_name || 'ملف مرفوع'}`}</a> : '—'}</div></td>
      <td><div className="row-actions">{item.content_url ? <button type="button" className="row-action-btn copy" title="نسخ الرابط" onClick={(e) => { e.stopPropagation(); copy(item.content_url); }}><Icon name="i-copy" /></button> : null}{url ? <a href={url} target="_blank" rel="noreferrer" className="row-action-btn open" title="فتح" onClick={(e) => e.stopPropagation()}><Icon name="i-eye" /></a> : null}</div></td>
    </tr>;
  })}</tbody></table></div></div>;
}

export default function ContentPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', source: 'all', platform: '', month: '', employee: '', rating: '' });
  const pageSize = 24;

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/api/v1/contents', { params: { per_page: 100 } })
      .then(({ data }) => {
        const rows = data?.data?.data || data?.data || [];
        if (alive) setItems(rows.map(normalizeContent));
      })
      .catch((error) => showToast(error.response?.data?.message || 'تعذر تحميل مكتبة المحتوى', 'danger'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [showToast]);

  useEffect(() => { setPage(1); }, [filters, view]);

  const counts = useMemo(() => {
    const out = { all: items.length };
    items.forEach((item) => { out[item.source] = (out[item.source] || 0) + 1; });
    return out;
  }, [items]);

  const months = useMemo(() => [...new Set(items.map((i) => i.month).filter(Boolean))].sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)), [items]);
  const employees = useMemo(() => [...new Set(items.map((i) => i.employee_name).filter(Boolean))].sort(), [items]);

  const filtered = useMemo(() => items.filter((item) => {
    if (filters.source !== 'all' && item.source !== filters.source) return false;
    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.month && item.month !== filters.month) return false;
    if (filters.employee && item.employee_name !== filters.employee) return false;
    if (filters.rating && Number(item.rating || 0) < Number(filters.rating)) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      const hay = `${item.influencer_name} ${item.campaign_name} ${item.employee_name} ${item.customer_name} ${item.code} ${item.content_url}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [items, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const copy = useCallback((url) => {
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('تم نسخ الرابط');
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(() => showToast('تم نسخ الرابط')).catch(fallback);
    else fallback();
  }, [showToast]);

  return <div className="content-page-v5">
    <Toast toast={toast} onClose={() => setToast(null)} />
    <Hero total={items.length} sources={sourceOrder.filter((s) => counts[s]).length} tiktok={counts.tiktok || 0} />
    <KpiRow counts={counts} total={items.length} />
    <SourceChips counts={counts} active={filters.source} onChange={(source) => setFilters((old) => ({ ...old, source }))} />
    <SearchCard filters={filters} setFilters={setFilters} view={view} setView={setView} months={months} employees={employees} total={filtered.length} />
    {loading ? <div className="empty-state content-loading"><Icon name="i-folder" /><h4>جاري تحميل المحتوى...</h4></div> : pageItems.length === 0 ? <div className="empty-state content-loading"><Icon name="i-folder" /><h4>لا توجد محتويات</h4><p>لم يتم العثور على محتويات بهذه الفلاتر</p></div> : view === 'grid' ? <GridView items={pageItems} copy={copy} /> : <TableView items={pageItems} copy={copy} />}
    {!loading && filtered.length > pageSize ? <div className="pagination content-pagination">
      <div className="page-meta">عرض {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} من أصل {filtered.length}</div>
      <div className="pager">
        <button className={`p ${page <= 1 ? 'disabled' : ''}`} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))}><Icon name="i-chevron-right" /></button>
        {Array.from({ length: Math.min(pages, 7) }).map((_, i) => <button key={i + 1} className={`p ${page === i + 1 ? 'active' : ''}`} type="button" onClick={() => setPage(i + 1)}>{i + 1}</button>)}
        <button className={`p ${page >= pages ? 'disabled' : ''}`} type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))}><Icon name="i-chevron-left" /></button>
      </div>
    </div> : null}
  </div>;
}