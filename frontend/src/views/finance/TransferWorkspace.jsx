import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';

const stageMeta = {
  '1': { label: 'بانتظار التحويل', short: 'تحويل', num: '01', color: '#f59e0b', bg: '#fffbeb', desc: 'طلبات تحتاج تنفيذ الحوالة' },
  '2': { label: 'تم التحويل', short: 'إيصال', num: '02', color: '#3b82f6', bg: '#eff6ff', desc: 'بانتظار إرسال الإيصال ورفع الفاتورة' },
  '3': { label: 'الفاتورة الضريبية', short: 'فاتورة', num: '03', color: '#7c3aed', bg: '#f5f3ff', desc: 'بانتظار إرسال الفاتورة للعميل' },
  complete: { label: 'مكتمل ومطابق', short: 'مكتمل', num: '04', color: '#10b981', bg: '#f0fdf4', desc: 'مراحل مالية منتهية' },
};

const parties = [
  { key: 'customers', label: 'العملاء', hint: 'تحصيلات وفواتير', icon: 'i-users' },
  { key: 'influencers', label: 'المؤثرون', hint: 'مدفوعات الحملات', icon: 'i-star' },
  { key: 'ugc', label: 'منصة UGC', hint: 'مسار مستقل', icon: 'i-video' },
  { key: 'reports', label: 'التقارير والمتابعة', hint: 'ملخص وسجل', icon: 'i-chart' },
];

const subs = {
  customers: ['عروض الأسعار', 'العقود', 'التحصيلات الواردة', 'الفواتير الضريبية', 'المطابقة المالية', 'الأرشيف المالي'],
  influencers: ['مدفوعات مؤثري الحملات', 'الفواتير', 'الإيصالات', 'الأرشيف المالي'],
  ugc: ['البكجات', 'التحصيلات', 'المصروفات', 'الفواتير', 'الإيصالات', 'الأرشيف المالي'],
  reports: ['الملخص المالي', 'السجل الزمني المالي', 'التقارير', 'مؤشرات الأداء'],
};

const money = (value) => Number(value || 0).toLocaleString('en-US');
const compact = (value) => {
  const n = Number(value || 0);
  const abs = Math.abs(n);
  if (abs >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return n.toLocaleString('en-US');
};

function normalizeStage(stage, status) {
  if (status === 'completed') return 'complete';
  return String(stage || '1');
}

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`finance-toast ${toast.type || 'success'}`} onClick={onClose}>{toast.message}</div>;
}

export default function TransferWorkspace() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('1');
  const [party, setParty] = useState('influencers');
  const [subIndex, setSubIndex] = useState(0);
  const [filters, setFilters] = useState({ q: '', direction: '', month: '' });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    window.clearTimeout(window.__financeToastTimer);
    window.__financeToastTimer = window.setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: transfersRes }, { data: overviewRes }] = await Promise.all([
        api.get('/api/v1/transfers', { params: { per_page: 100, stage: 'all' } }),
        api.get('/api/v1/transfers/finance-overview'),
      ]);
      setTransfers(transfersRes.data || transfersRes || []);
      setSummary(overviewRes.data || overviewRes);
    } catch (error) {
      console.error('finance load failed', error);
      showToast(error.response?.data?.message || 'تعذر تحميل بيانات المالية', 'danger');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchFinance(); }, [fetchFinance]);

  const filtered = useMemo(() => transfers.filter((t) => {
    const current = normalizeStage(t.workflow_stage, t.status);
    if (stage !== 'all' && current !== stage) return false;
    if (filters.direction && t.direction !== filters.direction) return false;
    if (filters.month) {
      const m = String(t.created_at || '').slice(0, 7);
      if (m !== filters.month) return false;
    }
    if (filters.q.trim()) {
      const q = filters.q.trim().toLowerCase();
      const hay = [t.code, t.campaign?.name, t.customer?.name, t.requester?.name, t.assignee?.name, t.reason, t.notes]
        .filter(Boolean).join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }), [transfers, stage, filters]);

  const totals = summary?.totals || {};
  const stages = summary?.stages || {};
  const docs = summary?.documents || {};
  const highlights = [
    { label: 'إجمالي الحوالات', value: totals.count || transfers.length, icon: 'i-wallet', color: '#0d8a6f', bg: '#f0fdf9' },
    { label: 'قيمة قيد التنفيذ', value: `${compact(totals.open_amount)} ر.س`, icon: 'i-clock', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'إيصالات مرفوعة', value: docs.receipts || 0, icon: 'i-file-check', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'فواتير ضريبية', value: docs.tax_invoices || 0, icon: 'i-folder', color: '#7c3aed', bg: '#f5f3ff' },
  ];

  const upload = async (transferId, type, file) => {
    if (!file) return;
    const form = new FormData();
    form.append('type', type);
    form.append('file', file);
    try {
      await api.post(`/api/v1/transfers/${transferId}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast(type === 'receipt' ? 'تم رفع إيصال التحويل وتحديث المرحلة' : 'تم رفع الفاتورة الضريبية وتحديث المرحلة');
      fetchFinance();
    } catch (error) {
      showToast(error.response?.data?.message || 'فشل رفع الملف', 'danger');
    }
  };

  const sendWhatsApp = async (transferId, target) => {
    try {
      await api.post(`/api/v1/transfers/${transferId}/send-${target}`);
      showToast(target === 'receipt' ? 'تم إرسال الإيصال للمؤثر' : 'تم إرسال الفاتورة للعميل');
      fetchFinance();
    } catch (error) {
      showToast(error.response?.data?.error || error.response?.data?.message || 'تعذر الإرسال', 'danger');
    }
  };

  const markComplete = async (transfer) => {
    try {
      await api.patch(`/api/v1/transfers/${transfer.id}`, { workflow_stage: 'complete', status: 'completed' });
      showToast('تم إغلاق الحوالة كمكتملة ومطابقة');
      fetchFinance();
    } catch (error) {
      showToast(error.response?.data?.message || 'تعذر تحديث الحوالة', 'danger');
    }
  };

  const exportCsv = () => {
    const rows = [['الكود', 'الحملة', 'العميل', 'المبلغ', 'المرحلة', 'الحالة'], ...filtered.map((t) => [
      t.code,
      t.campaign?.name || '',
      t.customer?.name || '',
      t.amount_total || 0,
      stageMeta[normalizeStage(t.workflow_stage, t.status)]?.label || '',
      t.status || '',
    ])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-transfers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تجهيز ملف التصدير');
  };

  return (
    <div className="finance-page">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="fin-hero">
        <div className="fin-hero-grid">
          <div className="fin-hero-left">
            <h1>المالية</h1>
            <div className="sub">التحصيلات والمدفوعات والحوالات والمستندات — نفس مسار التشغيل القديم متصل الآن ببيانات Laravel</div>
          </div>
          <div className="fin-hero-stats">
            <div className="fin-hero-stat"><div className="v">{compact(totals.total_amount)}<small>ر.س</small></div><div className="l">إجمالي</div></div>
            <div className="fin-hero-stat"><div className="v">{totals.count || 0}</div><div className="l">حوالة</div></div>
            <div className="fin-hero-stat"><div className="v">{stages['1']?.count || 0}</div><div className="l">بانتظار</div></div>
          </div>
        </div>
      </section>

      <div className="fin-sections fin-sections-4">
        {parties.map((item) => <button key={item.key} className={`fin-sec ${party === item.key ? 'active' : ''}`} onClick={() => { setParty(item.key); setSubIndex(0); }} type="button">
          <Icon name={item.icon} />
          <span className="fin-sec-label">{item.label}</span>
          <span className="fin-sec-hint">{item.hint}</span>
        </button>)}
      </div>
      <div className={`fin-subs ${party === 'ugc' ? 'fin-subs-ugc' : ''}`}>
        {(subs[party] || []).map((label, index) => <button key={label} className={`fin-sub ${party === 'ugc' ? 'fin-sub-ugc ' : ''}${subIndex === index ? 'on' : ''}`} onClick={() => setSubIndex(index)} type="button">{label}</button>)}
      </div>

      <div className="fin-flow">
        {Object.entries(stageMeta).map(([key, meta]) => <button type="button" key={key} className="fin-flow-card" style={{ '--c': meta.color, '--bg': meta.bg }} onClick={() => setStage(stage === key ? 'all' : key)}>
          <div className="head-row"><span className="ic-wrap"><Icon name={key === 'complete' ? 'i-check' : key === '2' ? 'i-upload' : key === '3' ? 'i-file-check' : 'i-clock'} /></span><span className="step-num">{meta.num}</span></div>
          <div className="v">{stages[key]?.count || 0}</div>
          <div className="l">{meta.label}</div>
          <div className="d">{compact(stages[key]?.amount || 0)} ر.س · {meta.desc}</div>
        </button>)}
      </div>

      <div className="cust-highlights">
        {highlights.map((h) => <button type="button" key={h.label} className="cust-hl" style={{ '--c': h.color, '--bg': h.bg }}>
          <span className="ic-wrap"><Icon name={h.icon} /></span><span className="body"><span className="val">{h.value}</span><span className="lbl">{h.label}</span></span>
        </button>)}
      </div>

      <div className="actions-row">
        <div className="fin-subs"><button className="fin-sub on" type="button">{stage === 'all' ? 'كل المراحل' : stageMeta[stage]?.label}</button><button className="fin-sub" type="button">{filtered.length} نتيجة</button></div>
        <div className="row-actions"><Link to="/finance/request" className="btn btn-primary"><Icon name="i-plus" /> رفع طلب حوالة</Link><button className="btn" type="button" onClick={exportCsv}><Icon name="i-download" /> تصدير</button></div>
      </div>

      <div className="search-card">
        <label className="field"><Icon name="i-search" /><input value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="ابحث برقم الحوالة أو الحملة أو العميل..." /></label>
        <span className="field-divider" />
        <label className="field compact"><select value={filters.direction} onChange={(e) => setFilters((f) => ({ ...f, direction: e.target.value }))}><option value="">كل الاتجاهات</option><option value="outgoing">مدفوعات صادرة</option><option value="incoming">تحصيلات واردة</option></select></label>
        <span className="field-divider" />
        <label className="field compact"><input type="month" value={filters.month} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))} /></label>
        <span className="results-count">{loading ? 'جاري التحميل...' : `${filtered.length} سجل`}</span>
      </div>

      <div className="tr-table-wrap">
        <div className="table-scroll">
          <table className="tr-tbl">
            <thead><tr><th>رقم الحوالة</th><th>المستفيد / العميل</th><th>الحملة</th><th>المبلغ</th><th>المرحلة</th><th>المستندات</th><th>المسؤول</th><th>إجراءات</th></tr></thead>
            <tbody>
              {!loading && filtered.length === 0 ? <tr><td colSpan="8"><div className="empty-state"><Icon name="i-inbox" /><h4>لا توجد حوالات مطابقة</h4><p>غيّر الفلاتر أو ارفع طلب حوالة جديد.</p></div></td></tr> : null}
              {filtered.map((t) => {
                const current = normalizeStage(t.workflow_stage, t.status);
                const meta = stageMeta[current] || stageMeta['1'];
                const receiptCount = t.attachments?.filter?.((a) => a.type === 'receipt').length || t.receipts_count || 0;
                const invoiceCount = t.attachments?.filter?.((a) => a.type === 'tax_invoice').length || t.tax_invoices_count || 0;
                return <tr key={t.id} onDoubleClick={() => navigate(`/finance/${t.id}`)}>
                  <td><Link to={`/finance/${t.id}`} className="tr-id-cell">{t.code}</Link></td>
                  <td><div className="inf-mini"><div className="ava">{(t.customer?.name || t.recipients?.[0]?.name || 'م').charAt(0)}</div><div className="info"><span className="name">{t.recipients?.[0]?.name || t.customer?.name || 'غير محدد'}</span><span className="meta">{t.customer?.name || t.direction}</span></div></div></td>
                  <td>{t.campaign?.name || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                  <td><span className="amount-cell">{money(t.amount_total)}<small>ر.س</small></span></td>
                  <td><span className={`stage-pill stage-${current}`}><span className="dot" />{meta.label}</span></td>
                  <td><div className="attach-row"><span className={`attach-icon ${receiptCount ? 'uploaded' : 'missing'}`} title="إيصال"><Icon name="i-upload" /></span><span className={`attach-icon ${invoiceCount ? 'uploaded' : 'missing'}`} title="فاتورة"><Icon name="i-file-check" /></span></div></td>
                  <td>{t.assignee?.name || t.requester?.name || '—'}</td>
                  <td><div className="row-actions">
                    {current === '1' ? <label className="row-action-btn primary" title="رفع إيصال"><Icon name="i-upload" /><input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => upload(t.id, 'receipt', e.target.files?.[0])} /></label> : null}
                    {current === '2' ? <><button className="row-action-btn success" title="إرسال الإيصال" type="button" onClick={() => sendWhatsApp(t.id, 'receipt')}><Icon name="i-send" /></button><label className="row-action-btn primary" title="رفع فاتورة"><Icon name="i-file-check" /><input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => upload(t.id, 'tax_invoice', e.target.files?.[0])} /></label></> : null}
                    {current === '3' ? <><button className="row-action-btn success" title="إرسال الفاتورة" type="button" onClick={() => sendWhatsApp(t.id, 'invoice')}><Icon name="i-send" /></button><button className="row-action-btn" title="إغلاق" type="button" onClick={() => markComplete(t)}><Icon name="i-check" /></button></> : null}
                    <Link className="row-action-btn" to={`/finance/${t.id}`} title="عرض"><Icon name="i-eye" /></Link>
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        <div className="pagination"><span>عرض {filtered.length} من {transfers.length} حوالة</span><span>متصل بقاعدة البيانات · آخر تحديث مباشر</span></div>
      </div>
    </div>
  );
}
