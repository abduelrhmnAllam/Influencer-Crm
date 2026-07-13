import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';

const initialFilters = { status: '', type: '', source: '', group: '', category: '', q: '' };
const initialForm = {
  title: '', type: 'campaign', source: 'direct_client', customer_id: '', budget: '', influencer_count: '', goal: '', notes: '', priority: 'medium',
};

function statusColor(status) {
  return {
    new: '#3b82f6', under_review: '#8b5cf6', awaiting_completion: '#d97706', ready_for_nomination: '#0d8a6f',
    awaiting_internal_approval: '#d97706', awaiting_collection: '#d97706', stalled: '#dc2626', ready_for_campaign: '#16a34a', converted: '#16a34a',
  }[status] || '#64748b';
}

export default function RequestsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [options, setOptions] = useState({ types: {}, sources: {}, statuses: {}, groups: [], categories: [], customers: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/api/v1/requests').then(({ data }) => {
      setRows(data.data || []);
      setStats(data.stats || {});
      setOptions(data.options || { types: {}, sources: {}, statuses: {}, groups: [], categories: [], customers: [] });
    }).finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const q = filters.q.trim().toLowerCase();
    if (filters.group && row.group !== filters.group) return false;
    if (filters.category && row.category !== filters.category) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.type && row.type !== filters.type) return false;
    if (filters.source && row.source !== filters.source) return false;
    if (q && !JSON.stringify(row).toLowerCase().includes(q)) return false;
    return true;
  }), [rows, filters]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        source: form.source,
        customer_id: form.customer_id || null,
        priority: form.priority,
        brief: {
          project_name: form.title,
          goal: form.goal,
          budget: Number(form.budget || 0),
          influencer_count: Number(form.influencer_count || 0),
          notes: form.notes,
        },
      };
      const { data } = await api.post('/api/v1/requests', payload);
      setRows((current) => [data.data, ...current]);
      setForm(initialForm);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="requests-v5">
      <div className="req-hero">
        <div className="req-hero-grid">
          <div><h1>الطلبات</h1><div className="sub">مركز استقبال وتشغيل ومتابعة طلبات علاقات المؤثرين — من البريف حتى التحويل إلى حملة. نقطة البداية الرسمية لكل طلب.</div></div>
          <div className="req-hero-stats"><div className="req-hero-stat"><div className="v">{stats.total || 0}</div><div className="l">إجمالي</div></div><div className="req-hero-stat"><div className="v">{stats.new || 0}</div><div className="l">جديدة</div></div><div className="req-hero-stat"><div className="v">{stats.converted || 0}</div><div className="l">محوّلة</div></div></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>انقر أي مؤشر للتصفية · اضغط الطلب لفتح مركز التشغيل</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/request-users" className="sc-btn" style={{ fontSize: 12.5, padding: '9px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="i-users" /> مستخدمو الطلبات</Link>
          <Link to="/requests-portal" className="sc-btn" style={{ fontSize: 12.5, padding: '9px 14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>البوابة الخارجية</Link>
          <button className="btn btn-primary" type="button" onClick={() => setShowForm((value) => !value)} style={{ padding: '9px 18px', fontWeight: 700 }}><Icon name="i-plus" /> طلب جديد</button>
        </div>
      </div>

      <div className="kpi-grid">
        {[['إجمالي الطلبات', stats.total, '#0d8a6f', ''], ['جديدة', stats.new, '#3b82f6', 'new'], ['قيد المراجعة', stats.under_review, '#8b5cf6', 'under_review'], ['بانتظار الاستكمال', stats.awaiting_completion, '#d97706', 'awaiting_completion'], ['جاهزة للترشيح', stats.ready_for_nomination, '#0d8a6f', 'ready_for_nomination'], ['بانتظار الاعتماد', stats.awaiting_internal_approval, '#d97706', 'awaiting_internal_approval'], ['بانتظار التحصيل', stats.awaiting_collection, '#d97706', 'awaiting_collection'], ['متعثّرة', stats.stalled, '#dc2626', 'stalled'], ['جاهزة للتحويل', stats.ready_for_campaign, '#16a34a', 'ready_for_campaign'], ['محوّلة لحملات', stats.converted, '#16a34a', 'converted']].map(([label, value, color, statusKey]) => (
          <button type="button" key={label} className={`kpi${filters.status === statusKey ? ' active' : ''}`} style={{ '--c': color }} onClick={() => updateFilter('status', statusKey)}><div className="v">{value || 0}</div><div className="l">{label}</div></button>
        ))}
      </div>

      <div className="grp-tabs">{(options.groups || []).map((group) => <button type="button" className={`grp-tab${filters.group === group.key ? ' active' : ''}`} key={group.key} onClick={() => updateFilter('group', filters.group === group.key ? '' : group.key)}>{group.label} <span className="grp-n">{group.count}</span></button>)}</div>
      <div className="cat-chips"><span style={{ fontSize: 11.5, color: 'var(--text-3)', fontWeight: 700, alignSelf: 'center' }}>تصنيفات سريعة:</span>{(options.categories || []).map((cat) => <button type="button" className={`cat-chip${filters.category === cat.key ? ' active' : ''}`} style={{ '--cc': cat.color }} key={cat.key} onClick={() => updateFilter('category', filters.category === cat.key ? '' : cat.key)}>{cat.label} <b>{cat.count}</b></button>)}</div>

      <div className="req-toolbar">
        <input className="fld" id="f-q" placeholder="بحث سريع…" value={filters.q} onChange={(event) => updateFilter('q', event.target.value)} />
        <select className="fld" id="f-status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="">كل الحالات</option>{Object.entries(options.statuses || {}).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select>
        <select className="fld" id="f-type" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}><option value="">كل الأنواع</option>{Object.entries(options.types || {}).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select>
        <select className="fld" id="f-source" value={filters.source} onChange={(event) => updateFilter('source', event.target.value)}><option value="">كل المصادر</option>{Object.entries(options.sources || {}).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select>
        {Object.values(filters).some(Boolean) ? <button className="sc-btn" type="button" onClick={() => setFilters(initialFilters)} style={{ fontSize: 12 }}>مسح الفلاتر</button> : null}
      </div>

      {showForm ? <form className="req-create-form" onSubmit={submit}>
        <div className="fg"><label>اسم الطلب / المشروع <span className="req">*</span></label><input className="fld" required placeholder="مثال: حملة رمضان" value={form.title} onChange={(event) => updateForm('title', event.target.value)} /></div>
        <div className="req-form-grid"><div className="fg"><label>نوع الطلب</label><select className="fld" value={form.type} onChange={(event) => updateForm('type', event.target.value)}>{Object.entries(options.types || {}).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div><div className="fg"><label>مصدر الطلب</label><select className="fld" value={form.source} onChange={(event) => updateForm('source', event.target.value)}>{Object.entries(options.sources || {}).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></div></div>
        <div className="fg"><label>العميل المرتبط</label><select className="fld" value={form.customer_id} onChange={(event) => updateForm('customer_id', event.target.value)}><option value="">— بدون عميل / يُحدّد لاحقاً —</option>{(options.customers || []).map((customer) => <option value={customer.id} key={customer.id}>{customer.name}</option>)}</select></div>
        <div className="req-form-grid"><div className="fg"><label>الميزانية (ر.س)</label><input className="fld" type="number" inputMode="numeric" placeholder="50000" value={form.budget} onChange={(event) => updateForm('budget', event.target.value)} /></div><div className="fg"><label>عدد المؤثرين</label><input className="fld" type="number" inputMode="numeric" placeholder="5" value={form.influencer_count} onChange={(event) => updateForm('influencer_count', event.target.value)} /></div></div>
        <div className="fg"><label>هدف الحملة</label><input className="fld" placeholder="وعي / تحويلات / إطلاق منتج" value={form.goal} onChange={(event) => updateForm('goal', event.target.value)} /></div>
        <div className="fg"><label>ملاحظات أولية</label><textarea className="fld" rows="2" placeholder="أي تفاصيل مبدئية" value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} /></div>
        <div className="form-actions"><button type="button" onClick={() => setShowForm(false)}>إلغاء</button><button type="submit" className="primary" disabled={submitting}>{submitting ? 'جاري الإنشاء…' : 'إنشاء الطلب'}</button></div>
      </form> : null}

      {loading ? <div className="req-empty">جاري تحميل الطلبات…</div> : null}
      {!loading && filteredRows.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{filteredRows.map((row) => {
        const color = statusColor(row.status);
        return <button type="button" className="req-row" key={row.id} onClick={() => navigate(`/requests/${row.id}`)}>
          <div className="rr-main"><div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span className="rr-grp" style={{ background: `${row.group_color}1a`, color: row.group_color }}>{row.group_label}</span><span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13.5 }}>{row.title}</span></div><div style={{ fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 3 }}>{row.number} · {options.types?.[row.type] || row.type}</div><div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 5 }}>المنشئ: <b>{row.requested_by}</b> · العميل: <b>{row.customer_name}</b></div></div>
          <div className="rr-status"><span className="req-pill" style={{ background: `${color}1a`, color }}>{options.statuses?.[row.status] || row.status}</span><div style={{ fontSize: 10.5, color: 'var(--text-2)', marginTop: 5 }}>التالي: <b style={{ color: 'var(--brand-700)' }}>{row.next_label}</b></div><div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>المسؤول: {row.responsible}</div></div>
          <div className="rr-activity"><div className="rr-act-line"><span className="rr-dot" style={{ background: '#0d8a6f' }} /><div><span className="rr-act-k">آخر رد خارجي</span><div className="rr-act-v">{row.last_external_reply || '—'}</div></div></div><div className="rr-act-line"><span className="rr-dot" style={{ background: '#3b82f6' }} /><div><span className="rr-act-k">آخر إجراء داخلي</span><div className="rr-act-v">{row.last_internal_action || '—'}</div></div></div></div>
        </button>;
      })}</div> : null}
      {!loading && !filteredRows.length ? <div className="req-empty"><Icon name="i-inbox" /><div style={{ marginTop: 12, fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>لا طلبات مطابقة للفلتر</div><div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 4 }}>عدّل الفلاتر أو امسحها</div></div> : null}
    </div>
  );
}
