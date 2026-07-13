import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './AnalyticsPage.css';

const fmt = (value) => Number(value || 0).toLocaleString('en-US');
const money = (value) => `${fmt(value)} ر.س`;
const pct = (value) => `${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;

const periodTabs = [
  { key: 'all', label: 'كل الفترة' },
  { key: '30d', label: 'آخر 30 يوم' },
  { key: '90d', label: 'آخر 90 يوم' },
  { key: '365d', label: 'السنة' },
];

function LoadingState() {
  return <div className="perf-section"><div className="req-empty">جاري تحميل التحليلات…</div></div>;
}

function EmptyState({ text = 'لا توجد بيانات مطابقة' }) {
  return <div className="an-empty"><Icon name="i-chart" />{text}</div>;
}

function ViewToggle({ viewMode, setViewMode }) {
  const cards = [
    { key: 'intel', icon: 'i-star', title: 'مركز الذكاء التشغيلي', sub: 'تحليلات تفاعلية · فلاتر · رسوم · تصدير متعدد' },
    { key: 'classic', icon: 'i-dashboard', title: 'لوحة الأداء التفصيلية', sub: 'خريطة حرارية · لوحة التكريم · مقارنات شاملة' },
  ];
  return (
    <div className="sc-view-toggle">
      <div className="sc-view-label"><Icon name="i-dashboard" /><span>اختر طريقة العرض</span><small>— عرضان متكاملان لنفس البيانات</small></div>
      <div className="sc-view-cards">
        {cards.map((card) => {
          const active = viewMode === card.key;
          return <button type="button" key={card.key} className={`sc-view-card ${active ? 'active' : ''}`} onClick={() => setViewMode(card.key)}>
            <span className="sc-view-ic"><Icon name={card.icon} /></span>
            <span><b>{card.title}</b><small>{card.sub}</small></span>
            {active ? <em>معروض الآن</em> : <Icon name="i-chevron-left" />}
          </button>;
        })}
      </div>
    </div>
  );
}

function Hero({ data }) {
  const company = data.company || {};
  const rates = data.rates || {};
  return (
    <section className="an-hero">
      <div className="an-hero-grid">
        <div className="an-hero-left">
          <h1>مركز التحليلات الذكي</h1>
          <div className="sub">قراءة لحظية لأداء الحملات، المالية، المؤثرين، العملاء، وفريق العمل — متصلة مباشرة ببيانات النظام.</div>
        </div>
        <div className="an-hero-stats">
          <div className="an-hero-stat"><div className="v">{fmt(company.campaigns_total)}</div><div className="l">CAMPAIGNS</div></div>
          <div className="an-hero-stat"><div className="v">{pct(rates.nomination_success)}</div><div className="l">NOMINATION</div></div>
          <div className="an-hero-stat"><div className="v">{pct(company.margin)}</div><div className="l">MARGIN</div></div>
        </div>
      </div>
    </section>
  );
}

function Kpis({ data }) {
  const company = data.company || {};
  const finance = data.finance || {};
  const items = [
    { label: 'الإيرادات', value: money(company.revenue), icon: 'i-wallet', color: '#0d8a6f', bg: '#ecfdf5' },
    { label: 'الأرباح', value: money(company.profit), icon: 'i-chart', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'التحصيلات', value: money(company.collected), icon: 'i-check', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'معلّق ماليًا', value: money((finance.pendingCollection || 0) + (finance.pendingPayments || 0)), icon: 'i-clock', color: '#f59e0b', bg: '#fffbeb' },
  ];
  return <div className="an-kpis">{items.map((item) => <article className="an-kpi" style={{ '--c': item.color, '--bg': item.bg }} key={item.label}><span className="ic-wrap"><Icon name={item.icon} /></span><div className="v">{item.value}</div><div className="l">{item.label}</div></article>)}</div>;
}

function FilterToolbar({ filters, setFilters, data }) {
  return (
    <div className="filter-toolbar">
      <div className="filter-search-wrap"><Icon name="i-search" /><input className="filter-search" value={filters.search} onChange={(e) => setFilters((old) => ({ ...old, search: e.target.value }))} placeholder="ابحث باسم حملة، عميل، مؤثر أو موظف..." /></div>
      <div className="filter-status">{periodTabs.map((tab) => <button className={`status-pill ${filters.period === tab.key ? 'active' : ''}`} type="button" key={tab.key} onClick={() => setFilters((old) => ({ ...old, period: tab.key }))}>{tab.label}</button>)}</div>
      <button className={`quick-chip ${filters.quick === 'top' ? 'active' : ''}`} type="button" onClick={() => setFilters((old) => ({ ...old, quick: old.quick === 'top' ? '' : 'top' }))}>🏆 الأفضل</button>
      <button className={`quick-chip ${filters.quick === 'risk' ? 'active' : ''}`} type="button" onClick={() => setFilters((old) => ({ ...old, quick: old.quick === 'risk' ? '' : 'risk' }))}>⚠️ تحتاج متابعة</button>
      <span className="filter-pill active">{fmt(data.company?.campaigns_total)} حملة <span className="badge-count">LIVE</span></span>
      {(filters.search || filters.quick || filters.period !== 'all') ? <button type="button" className="clear-filters-btn" onClick={() => setFilters({ search: '', period: 'all', quick: '' })}>مسح الفلاتر</button> : null}
    </div>
  );
}

function SectionHead({ icon = 'i-chart', title, tag, pro, count }) {
  return <div className="perf-section-head"><Icon name={icon} /><span className="title">{title}</span>{tag ? <span className={`tag ${pro ? 'pro' : ''}`}>{tag}</span> : null}{count !== undefined ? <span className="row-count">{count}</span> : null}</div>;
}

function BarChart({ title, icon, rows, labelKey = 'label', valueKey = 'value', color = '#0d8a6f' }) {
  const max = Math.max(...rows.map((r) => Number(r[valueKey] || 0)), 1);
  return <section className="chart-card"><h3><Icon name={icon} />{title}</h3>{rows.map((row) => {
    const width = Math.max(8, Math.round((Number(row[valueKey] || 0) / max) * 100));
    return <div className="bar-row" key={row[labelKey]}><span className="lbl">{row[labelKey]}</span><span className="bar"><span className="fill" style={{ width: `${width}%`, '--c': row.color || color, '--c-l': row.light || '#16a34a' }}>{fmt(row[valueKey])}</span></span></div>;
  })}</section>;
}

function ActionCenter({ actions }) {
  return <section className="analytics-section"><div className="analytics-section-head"><Icon name="i-bell" /><span className="title">مركز الإجراءات العاجلة</span><span className="tag pro">AI READY</span></div><div className="action-grid">{actions.map((item) => <a href={item.href || '#'} className={`action-card ${item.level}`} key={item.title}><span className="action-icon"><Icon name={item.icon} /></span><span className="action-body"><span className="action-title">{item.title}</span><span className="action-desc">{item.desc}</span></span><span className="action-cta">{item.cta}<Icon name="i-chevron-left" /></span></a>)}</div></section>;
}

function CampaignTable({ rows }) {
  return <section className="perf-section"><SectionHead icon="i-megaphone" title="تفصيل الحملات" count={`${rows.length} صف`} /><div className="perf-table-wrap"><table className="perf-table"><thead><tr><th>الحملة</th><th>العميل</th><th>المسؤول</th><th>الحالة</th><th>مؤثرون</th><th>البيع</th><th>التكلفة</th><th>الربح</th><th>هامش %</th><th>التحصيل</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id || row.name}><td>{row.name}</td><td>{row.customer}</td><td>{row.owner}</td><td><span className={`an-status ${row.status_key || ''}`}>{row.status}</span></td><td className="num">{row.influencers}</td><td className="num">{fmt(row.sell)}</td><td className="num">{fmt(row.cost)}</td><td className="num good">{fmt(row.profit)}</td><td className={Number(row.margin) >= 35 ? 'good' : Number(row.margin) >= 20 ? 'warn' : 'bad'}>{pct(row.margin)}</td><td>{pct(row.collected)}</td></tr>)}<tr className="total-row"><td colSpan="5">الإجمالي</td><td className="num">{fmt(rows.reduce((s, r) => s + Number(r.sell || 0), 0))}</td><td className="num">{fmt(rows.reduce((s, r) => s + Number(r.cost || 0), 0))}</td><td className="num">{fmt(rows.reduce((s, r) => s + Number(r.profit || 0), 0))}</td><td colSpan="2">—</td></tr></tbody></table></div></section>;
}

function EmployeeTable({ rows }) {
  return <section className="perf-section"><SectionHead icon="i-users" title="أداء الموظفين" count={`${rows.length} أعضاء`} /><div className="perf-table-wrap"><table className="perf-table"><thead><tr><th>الموظف</th><th>حملات</th><th>ترشيحات</th><th>حجوزات</th><th>متابعات</th><th>منجزة</th><th>مهام</th><th>إنجاز</th><th>تأخير</th><th>ساعات</th><th>مساهمة مالية</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row.name}><td><span className={`inf-rank r${index + 1 <= 3 ? index + 1 : ''}`}>{index + 1}</span><span className="emp-avatar">{row.name?.charAt(0)}</span>{row.name}{index === 0 ? <span className="badge-top">TOP</span> : null}</td><td className="num">{row.campaigns}</td><td className="num">{row.nominations}</td><td className="num">{row.bookings}</td><td className="num">{row.followups}</td><td className="num">{row.completedOps}</td><td className="num">{row.autoTasks}</td><td className="good">{pct(row.completionRate)}</td><td className={Number(row.delayRate) > 15 ? 'bad' : 'warn'}>{pct(row.delayRate)}</td><td className="num">{row.estHours}</td><td className="num good">{fmt(row.financial)}</td></tr>)}</tbody></table></div></section>;
}

function FinanceTables({ data }) {
  const customerRows = data.detail?.customerFinance || [];
  const influencerRows = data.detail?.influencerTable || [];
  return <div className="charts-grid"><section className="perf-section"><SectionHead icon="i-wallet" title="المالية حسب العميل" count={customerRows.length} /><div className="perf-table-wrap"><table className="perf-table"><thead><tr><th>العميل</th><th>حملات</th><th>البيع</th><th>التكلفة</th><th>الربح</th><th>الهامش</th><th>محصّل</th><th>معلّق</th></tr></thead><tbody>{customerRows.map((row) => <tr key={row.name}><td>{row.name}</td><td className="num">{row.campaigns}</td><td className="num">{fmt(row.sell)}</td><td className="num">{fmt(row.cost)}</td><td className="num good">{fmt(row.profit)}</td><td>{pct(row.margin)}</td><td>{pct(row.collected)}</td><td className="warn">{fmt(row.pending)}</td></tr>)}</tbody></table></div></section><section className="perf-section"><SectionHead icon="i-star" title="أداء المؤثرين" count={influencerRows.length} /><div className="perf-table-wrap"><table className="perf-table"><thead><tr><th>المؤثر</th><th>المنصة</th><th>الفئة</th><th>إعلانات</th><th>البيع</th><th>الربح</th><th>هامش</th></tr></thead><tbody>{influencerRows.map((row) => <tr key={row.name}><td>{row.name}</td><td><span className="plat-chip">{row.platform}</span></td><td>{row.tier}</td><td className="num">{row.ads}</td><td className="num">{fmt(row.sell)}</td><td className="num good">{fmt(row.profit)}</td><td>{pct(row.margin)}</td></tr>)}</tbody></table></div></section></div>;
}

function Heatmap({ rows }) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
  return <section className="perf-section"><SectionHead icon="i-calendar" title="خريطة حرارة نشاط الفريق" tag="HEATMAP" /><div className="heatmap-wrap"><table className="heatmap-table"><thead><tr><th>الموظف</th>{days.map((day) => <th key={day}>{day}</th>)}<th>الإجمالي</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name}><td className="emp-cell">{row.name}</td>{row.days.map((value, index) => <td className="heat-cell" style={{ background: `rgba(13,138,111,${Math.min(0.12 + value / 50, 0.88)})`, color: value > 22 ? '#fff' : '#064e3b' }} key={index}>{value}</td>)}<td className="heat-total">{row.days.reduce((a, b) => a + b, 0)}</td></tr>)}</tbody></table><div className="heatmap-legend"><span>أقل</span><span className="heat-legend-bar"><i /><i /><i /><i /><i /></span><span>أعلى</span></div></div></section>;
}

function IntelView({ data, filters }) {
  const detail = data.detail || {};
  const campaigns = detail.campaignsTable || [];
  const filteredCampaigns = campaigns.filter((row) => !filters.search || [row.name, row.customer, row.owner, row.status].join(' ').toLowerCase().includes(filters.search.toLowerCase()));
  return <>
    <Hero data={data} />
    <Kpis data={data} />
    <div className="charts-grid">
      <BarChart title="الأداء حسب المنصة" icon="i-globe" rows={detail.platformPerf || []} labelKey="platform" valueKey="profit" color="#7c3aed" />
      <BarChart title="اتجاه الإيرادات الشهري" icon="i-chart" rows={(data.monthly_revenue || []).map((r) => ({ label: r.month, value: r.revenue, color: '#0d8a6f', light: '#16a34a' }))} />
    </div>
    <ActionCenter actions={data.actions || []} />
    <CampaignTable rows={filteredCampaigns} />
    <FinanceTables data={data} />
    <EmployeeTable rows={data.employees || []} />
  </>;
}

function ClassicView({ data }) {
  const kpis = [
    { label: 'الحملات', value: data.company?.campaigns_total, sub: `${data.company?.campaigns_active || 0} نشطة`, color: '#0d8a6f' },
    { label: 'مكتملة', value: data.company?.campaigns_completed, sub: 'حملات منجزة', color: '#16a34a' },
    { label: 'متعثرة', value: data.company?.campaigns_stalled, sub: 'تحتاج متابعة', color: '#f59e0b' },
    { label: 'ملغاة', value: data.company?.campaigns_cancelled, sub: 'خارج التنفيذ', color: '#dc2626' },
    { label: 'الترشيحات', value: data.company?.nominations_total, sub: `${pct(data.rates?.nomination_success)} نجاح`, color: '#7c3aed' },
    { label: 'الحجوزات', value: data.company?.bookings_total, sub: `${pct(data.rates?.influencer_acceptance)} قبول`, color: '#3b82f6' },
    { label: 'متوسط الإنجاز', value: data.durations?.avg_completion_days, sub: 'يوم للحملة', color: '#64748b' },
  ];
  return <>
    <div className="perf-header"><div><h1>لوحة الأداء التفصيلية</h1><div className="perf-header-sub">مؤشرات تشغيلية ومالية متقدمة بنفس نمط legacy analytics</div></div><div className="period-tabs">{periodTabs.map((tab) => <button className={`period-tab ${tab.key === 'all' ? 'active' : ''}`} type="button" key={tab.key}>{tab.label}</button>)}</div></div>
    <div className="kpi-row">{kpis.map((item) => <div className="kpi-pill" style={{ '--c': item.color }} key={item.label}><div className="kpi-pill-v">{fmt(item.value)}</div><div className="kpi-pill-l">{item.label}</div><div className="kpi-pill-sub">{item.sub}</div></div>)}</div>
    <EmployeeTable rows={data.employees || []} />
    <Heatmap rows={data.heatmap || []} />
    <CampaignTable rows={data.detail?.campaignsTable || []} />
  </>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('intel');
  const [filters, setFilters] = useState({ search: '', period: 'all', quick: '' });

  useEffect(() => {
    setLoading(true);
    api.get('/api/v1/analytics/overview', { params: { period: filters.period } })
      .then(({ data: response }) => { setData(response); setError(''); })
      .catch((err) => setError(err.response?.data?.message || 'تعذّر تحميل التحليلات'))
      .finally(() => setLoading(false));
  }, [filters.period]);

  const visibleData = useMemo(() => {
    if (!data || !filters.quick) return data;
    if (filters.quick === 'top') return { ...data, employees: [...(data.employees || [])].sort((a, b) => Number(b.financial || 0) - Number(a.financial || 0)).slice(0, 5) };
    if (filters.quick === 'risk') return { ...data, detail: { ...(data.detail || {}), campaignsTable: (data.detail?.campaignsTable || []).filter((row) => ['متعثرة', 'قيد المتابعة'].includes(row.status)) } };
    return data;
  }, [data, filters.quick]);

  if (loading) return <LoadingState />;
  if (error) return <div className="perf-section"><EmptyState text={error} /></div>;
  if (!visibleData) return <EmptyState />;

  return <div className="analytics-page-v5">
    <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
    <FilterToolbar filters={filters} setFilters={setFilters} data={visibleData} />
    {viewMode === 'intel' ? <IntelView data={visibleData} filters={filters} /> : <ClassicView data={visibleData} />}
  </div>;
}
