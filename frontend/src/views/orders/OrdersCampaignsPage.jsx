import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './OrdersCampaignsPage.css';

const statuses = [
  { key: 'draft', label: 'مسودة', color: '#64748b', icon: 'i-file-check' },
  { key: 'active', label: 'نشطة', color: '#f59e0b', icon: 'i-clock' },
  { key: 'paused', label: 'متوقفة', color: '#3b82f6', icon: 'i-clock' },
  { key: 'completed', label: 'مكتملة', color: '#16a34a', icon: 'i-check' },
  { key: 'cancelled', label: 'ملغاة', color: '#dc2626', icon: 'i-x' },
];
const statusLabels = Object.fromEntries(statuses.map((s) => [s.key, s.label]));
const fmt = (v) => Number(v || 0).toLocaleString('en-US');
const money = (v) => `${fmt(v)} ر.س`;
const date = (v) => v ? new Date(v).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const initial = (v = '?') => String(v || '?').trim().charAt(0) || '?';
const colors = (seed = '') => {
  const palette = [['#0d8a6f', '#14b8a6'], ['#7c3aed', '#3b82f6'], ['#f59e0b', '#ef4444'], ['#0891b2', '#2563eb'], ['#be185d', '#ec4899']];
  const sum = String(seed).split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return palette[sum % palette.length];
};

function Toast({ toast, onClose }) {
  return toast ? <div className={`orders-toast ${toast.type || 'success'}`} onClick={onClose}><Icon name={toast.type === 'danger' ? 'i-info' : 'i-check'} />{toast.message}</div> : null;
}

function Hero({ campaigns }) {
  const active = campaigns.filter((c) => c.status === 'active').length;
  const completed = campaigns.filter((c) => c.status === 'completed').length;
  return <section className="cmp-hero"><div className="cmp-hero-grid"><div className="cmp-hero-left"><h1><Icon name="i-inbox" />الحملات</h1><div className="sub">إدارة دورة حياة الحملات من الطلب حتى التنفيذ — مع ربط العملاء والمؤثرين والإعلانات</div></div><div className="cmp-hero-stats"><div className="cmp-hero-stat"><div className="v">{campaigns.length}</div><div className="l">إجمالي</div></div><div className="cmp-hero-stat"><div className="v">{active}</div><div className="l">نشط</div></div><div className="cmp-hero-stat"><div className="v">{completed}</div><div className="l">مكتمل</div></div></div></div></section>;
}

function Pipeline({ counts, current, setStatus }) {
  return <div className="cmp-pipeline">{statuses.map((s) => <button type="button" key={s.key} className={`pipe-step ${current === s.key ? 'active' : ''}`} onClick={() => setStatus(current === s.key ? 'all' : s.key)}><span className="pipe-icon" style={{ '--c': s.color }}><Icon name={s.icon} /></span><span className="pipe-num">{counts[s.key] || 0}</span><span className="pipe-lbl">{s.label}</span></button>)}</div>;
}

function Highlights({ counts, current, setStatus }) {
  const cards = [
    { key: 'all', label: 'كل الحملات', value: counts.all || 0, color: '#0d8a6f', bg: '#f0fdf9', icon: 'i-inbox' },
    { key: 'active', label: 'قيد التنفيذ', value: counts.active || 0, color: '#f59e0b', bg: '#fffbeb', icon: 'i-clock' },
    { key: 'paused', label: 'متوقفة', value: counts.paused || 0, color: '#3b82f6', bg: '#eff6ff', icon: 'i-clock' },
    { key: 'completed', label: 'مكتمل', value: counts.completed || 0, color: '#16a34a', bg: '#f0fdf4', icon: 'i-check' },
  ];
  return <div className="cust-highlights orders-highlights">{cards.map((card) => <button type="button" key={card.key} className={`cust-hl ${current === card.key ? 'active' : ''}`} style={{ '--c': card.color, '--bg': card.bg }} onClick={() => setStatus(current === card.key ? 'all' : card.key)}><span className="ic-wrap"><Icon name={card.icon} /></span><span className="body"><span className="val">{card.value}</span><span className="lbl">{card.label}</span></span></button>)}</div>;
}

function Filters({ search, setSearch, total, openNew }) {
  return <><div className="orders-page-head"><p className="page-sub">إدارة دورة حياة الحملات الإعلانية — مع ربط العميل والمؤثرين.</p><button className="orders-btn primary" type="button" onClick={openNew}><Icon name="i-plus" /> حملة جديدة</button></div><div className="orders-filters"><div className="field field-search"><Icon name="i-search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم الحملة أو العميل..." /></div><div className="results-count">{total} حملة</div></div></>;
}

function StatusChips({ counts, current, setStatus }) {
  return <div className="orders-status-bar"><button className={`chip ${current === 'all' ? 'active' : ''}`} onClick={() => setStatus('all')} type="button"><span className="dot" />الجميع <span className="n">{counts.all || 0}</span></button>{statuses.map((s) => <button type="button" key={s.key} className={`chip ${current === s.key ? 'active' : ''}`} onClick={() => setStatus(s.key)}><span className="dot" />{s.label} <span className="n">{counts[s.key] || 0}</span></button>)}</div>;
}

function CampaignTable({ rows, customersById, openEdit, removeCampaign, updateStatus }) {
  if (!rows.length) return <div className="orders-empty"><Icon name="i-inbox" /><h4>لا توجد حملات</h4><p>أضف حملة جديدة لتبدأ</p></div>;
  return <div className="orders-table-wrap"><div className="table-scroll"><table className="orders-tbl"><thead><tr><th>الرقم</th><th>الحملة</th><th>العميل</th><th>المنسق</th><th>النوع</th><th>الميزانية</th><th>المؤثرين</th><th>المدة</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>{rows.map((c) => { const customer = c.customer || customersById[c.customer_id] || {}; const [c1, c2] = colors(c.customer_id || customer.name); const duration = c.start_date && c.end_date ? Math.max(1, Math.round((new Date(c.end_date) - new Date(c.start_date)) / 86400000) + 1) : Number(c.metadata?.duration_days || 7); return <tr key={c.id}><td><span className="cell-id">{c.code || c.id}</span></td><td><div className="campaign-name">{c.name}</div><div className="campaign-sub">{(c.tags || []).join('، ') || c.metadata?.social_networks || 'إنستقرام، تيك توك'}</div></td><td><div className="cell-entity"><span className="ava" style={{ '--c1': c1, '--c2': c2 }}>{initial(customer.name)}</span><span className="info"><span className="n">{customer.name || '—'}</span></span></div></td><td>{c.coordinator?.name || c.metadata?.leader_name || '—'}</td><td>{c.metadata?.type || 'حملة كاملة'}</td><td><span className="cell-amount">{money(c.budget)}</span></td><td><b className="mono">{c.influencers_count || 0}</b></td><td>{duration} يوم</td><td><select className={`cell-status st-${c.status}`} value={c.status || 'active'} onChange={(e) => updateStatus(c, e.target.value)}>{statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></td><td><div className="cell-actions"><button className="act-btn" type="button" onClick={() => window.location.href = `/campaigns/${c.id}`} title="عرض"><Icon name="i-eye" /></button><button className="act-btn" type="button" onClick={() => openEdit(c)} title="تعديل"><Icon name="i-edit" /></button><button className="act-btn danger" type="button" onClick={() => removeCampaign(c)} title="حذف"><Icon name="i-trash" /></button></div></td></tr>; })}</tbody></table></div></div>;
}

function CampaignModal({ campaign, customers, users, onClose, onSave }) {
  const isEdit = Boolean(campaign?.id);
  const defaultStart = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState(() => ({
    name: campaign?.name || '', customer_id: campaign?.customer_id || '', type: campaign?.metadata?.type || 'حملة كاملة', coordinator_id: campaign?.coordinator_id || '', start_date: campaign?.start_date || defaultStart, end_date: campaign?.end_date || '', budget: campaign?.budget || 10000, total_sale: campaign?.total_sale || campaign?.budget || 10000, total_cost: campaign?.total_cost || 0, social_networks: campaign?.metadata?.social_networks || (campaign?.tags || []).join('، ') || 'إنستقرام', influencers_count: campaign?.influencers_count || 1, audience: campaign?.metadata?.audience || 'الرياض', status: campaign?.status || 'active', description: campaign?.description || '', objectives: campaign?.objectives || '', notes: campaign?.notes || ''
  }));
  const set = (k, v) => setForm((old) => ({ ...old, [k]: v }));
  const submit = (e) => { e.preventDefault(); onSave({ ...form, customer_id: Number(form.customer_id), coordinator_id: form.coordinator_id ? Number(form.coordinator_id) : null, budget: Number(form.budget || 0), total_sale: Number(form.total_sale || form.budget || 0), total_cost: Number(form.total_cost || 0), metadata: { type: form.type, social_networks: form.social_networks, audience: form.audience, duration_days: form.influencers_count, legacy_page: 'orders-campaigns' }, tags: String(form.social_networks || '').split(/[،,]/).map((x) => x.trim()).filter(Boolean) }); };
  return <div className="orders-modal-backdrop"><form className="orders-modal" onSubmit={submit}><div className="modal-head"><h3>{isEdit ? 'تعديل الحملة' : 'حملة جديدة'}</h3><button type="button" onClick={onClose}><Icon name="i-x" /></button></div><div className="modal-grid"><label className="full">اسم الحملة<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label><label className="full">العميل<select required value={form.customer_id} onChange={(e) => set('customer_id', e.target.value)}><option value="">— اختر العميل —</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>نوع الحملة<select value={form.type} onChange={(e) => set('type', e.target.value)}><option>إعلان منزلي</option><option>تغطية</option><option>حملة كاملة</option><option>UGC</option></select></label><label>منسق الحملة<select value={form.coordinator_id || ''} onChange={(e) => set('coordinator_id', e.target.value)}><option value="">— اختر —</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name || u.username}</option>)}</select></label><label>تاريخ البداية<input type="date" value={form.start_date || ''} onChange={(e) => set('start_date', e.target.value)} /></label><label>تاريخ النهاية<input type="date" value={form.end_date || ''} onChange={(e) => set('end_date', e.target.value)} /></label><label>المنصات<input value={form.social_networks} onChange={(e) => set('social_networks', e.target.value)} /></label><label>الجمهور المستهدف<input value={form.audience} onChange={(e) => set('audience', e.target.value)} /></label><label>الميزانية<input type="number" value={form.budget} onChange={(e) => set('budget', e.target.value)} /></label><label>إجمالي البيع<input type="number" value={form.total_sale} onChange={(e) => set('total_sale', e.target.value)} /></label><label>إجمالي التكلفة<input type="number" value={form.total_cost} onChange={(e) => set('total_cost', e.target.value)} /></label><label>عدد المؤثرين<input type="number" value={form.influencers_count} onChange={(e) => set('influencers_count', e.target.value)} /></label><label>الحالة<select value={form.status} onChange={(e) => set('status', e.target.value)}>{statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label><label className="full">الوصف<textarea value={form.description} onChange={(e) => set('description', e.target.value)} /></label><label className="full">الأهداف<textarea value={form.objectives} onChange={(e) => set('objectives', e.target.value)} /></label><label className="full">ملاحظات<textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} /></label></div><div className="modal-footer"><button type="button" className="orders-btn" onClick={onClose}>إلغاء</button><button type="submit" className="orders-btn primary">{isEdit ? 'حفظ' : 'إضافة'}</button></div></form></div>;
}

export default function OrdersCampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => { setToast({ message, type }); window.setTimeout(() => setToast(null), 2300); }, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [campaignRes, customerRes, usersRes] = await Promise.all([api.get('/api/v1/campaigns', { params: { per_page: 100 } }), api.get('/api/v1/customers', { params: { per_page: 100 } }), api.get('/api/v1/users', { params: { per_page: 100 } }).catch(() => ({ data: { data: [] } }))]);
      setCampaigns(campaignRes.data?.data?.data || campaignRes.data?.data || []);
      setCustomers(customerRes.data?.data?.data || customerRes.data?.data || []);
      setUsers(usersRes.data?.data?.data || usersRes.data?.data || []);
    } catch (e) { showToast(e.response?.data?.message || 'تعذر تحميل الحملات', 'danger'); }
    finally { setLoading(false); }
  }, [showToast]);
  useEffect(() => { load(); }, [load]);
  const customersById = useMemo(() => Object.fromEntries(customers.map((c) => [c.id, c])), [customers]);
  const counts = useMemo(() => campaigns.reduce((out, c) => ({ ...out, all: (out.all || 0) + 1, [c.status || 'active']: (out[c.status || 'active'] || 0) + 1 }), { all: 0 }), [campaigns]);
  const filtered = useMemo(() => campaigns.filter((c) => { if (status !== 'all' && c.status !== status) return false; if (search) { const customer = c.customer || customersById[c.customer_id] || {}; const hay = `${c.name} ${c.code} ${customer.name || ''} ${c.coordinator?.name || ''}`.toLowerCase(); if (!hay.includes(search.toLowerCase())) return false; } return true; }), [campaigns, customersById, search, status]);
  const save = async (payload) => { try { if (modal?.id) await api.put(`/api/v1/campaigns/${modal.id}`, payload); else await api.post('/api/v1/campaigns', payload); showToast(modal?.id ? 'تم تحديث الحملة' : 'تم إضافة الحملة'); setModal(null); load(); } catch (e) { showToast(e.response?.data?.message || 'تعذر حفظ الحملة', 'danger'); } };
  const updateStatus = async (campaign, next) => { try { await api.put(`/api/v1/campaigns/${campaign.id}`, { ...campaign, customer_id: campaign.customer_id, status: next }); showToast('تم تحديث الحالة'); load(); } catch (e) { showToast(e.response?.data?.message || 'تعذر تحديث الحالة', 'danger'); } };
  const removeCampaign = async (campaign) => { if (!window.confirm(`حذف الحملة "${campaign.name}"؟`)) return; try { await api.delete(`/api/v1/campaigns/${campaign.id}`); showToast('تم حذف الحملة'); load(); } catch (e) { showToast(e.response?.data?.message || 'تعذر حذف الحملة', 'danger'); } };
  return <div className="orders-page"><Toast toast={toast} onClose={() => setToast(null)} /><Hero campaigns={campaigns} /><Pipeline counts={counts} current={status} setStatus={setStatus} /><Highlights counts={counts} current={status} setStatus={setStatus} /><StatusChips counts={counts} current={status} setStatus={setStatus} /><Filters search={search} setSearch={setSearch} total={filtered.length} openNew={() => setModal({})} />{loading ? <div className="orders-empty"><Icon name="i-refresh" /><h4>جاري تحميل الحملات...</h4></div> : <CampaignTable rows={filtered} customersById={customersById} openEdit={setModal} removeCampaign={removeCampaign} updateStatus={updateStatus} />}{modal ? <CampaignModal campaign={modal.id ? modal : null} customers={customers} users={users} onClose={() => setModal(null)} onSave={save} /> : null}</div>;
}