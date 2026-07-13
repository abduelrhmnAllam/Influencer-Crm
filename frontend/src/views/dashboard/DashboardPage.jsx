import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { Icon } from '../../legacy/LegacyIconSprite';

const compact = (value) => Number(value || 0).toLocaleString('ar-SA', { maximumFractionDigits: 0 });
const money = (value) => Number(value || 0).toLocaleString('ar-SA', { maximumFractionDigits: 0 });

function SectionHead({ color = '#0d8a6f', icon = 'i-chart', title, badge, to }) {
  return (
    <div className="dash-section-head" style={{ '--c': `${color}1a`, '--c-d': color }}>
      <div className="title"><span className="ic-w"><Icon name={icon} /></span>{title}</div>
      {badge ? <span className="badge">{badge}</span> : null}
      {to ? <Link className="lnk" to={to}>عرض الكل ←</Link> : null}
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/v1/dashboard/stats')
      .then(({ data: response }) => setData(response))
      .finally(() => setLoading(false));
  }, []);

  const highlights = useMemo(() => data?.highlights || [], [data]);
  const urgent = data?.urgent || [];
  const campaigns = data?.campaigns || [];
  const customers = data?.top_customers || [];
  const influencers = data?.top_influencers || [];
  const activities = data?.recent_activity || [];
  const financial = data?.financial || {};
  const hero = data?.hero || {};

  if (loading) {
    return <div className="dash-section"><div className="req-empty">جاري تحميل لوحة التحكم…</div></div>;
  }

  return (
    <div className="legacy-dashboard-v5">
      <div className="dash-hero">
        <div className="dash-hero-grid">
          <div className="dash-hero-left">
            <h1>مرحباً، {user?.name || hero.user_name || 'مستخدم'}</h1>
            <div className="sub">{hero.subtitle || 'تابع أداء الوكالة وأحدث الأنشطة من مكان واحد.'}</div>
          </div>
          <div className="dash-hero-stats">
            {(hero.stats || []).map((item) => <div className="dash-hero-stat" key={item.label}><div className="v">{item.value}</div><div className="l">{item.label}</div></div>)}
          </div>
        </div>
      </div>

      <div className="dash-highlights">
        {highlights.map((item) => (
          <Link className="dash-hl" style={{ '--c': item.color, '--bg': item.bg }} to={item.href || '#'} key={item.label}>
            <span className="ic-wrap"><Icon name={item.icon} /></span>
            <span className="body"><span className="val">{compact(item.value)}{item.suffix ? <small>{item.suffix}</small> : null}</span><span className="lbl">{item.label}</span></span>
          </Link>
        ))}
      </div>

      <div className="req-now">
        <div className="req-head"><div className="t"><Icon name="i-clock" />المعلّقات العاجلة الآن</div><span className={`req-badge${urgent.length ? '' : ' ok'}`}>{urgent.length ? urgent.length : '✓'}</span></div>
        {urgent.length ? <div className="req-cards">{urgent.map((item) => (
          <Link className="req-card" style={{ '--c': item.color, '--bg': item.bg }} to={item.href} key={item.label}>
            <span className="ic-w"><Icon name={item.icon} /></span><span><span className="rc-n">{item.count}</span><span className="rc-l">{item.label}</span></span>
          </Link>
        ))}</div> : <div className="req-clear"><Icon name="i-check" />لا مهام عاجلة — كل شيء منجز</div>}
      </div>

      <div className="dash-grid-2col">
        <div className="dash-section">
          <SectionHead title="الحملات النشطة" icon="i-megaphone" color="#0d8a6f" badge={`${campaigns.length} حملات`} to="/orders-campaigns" />
          <div className="dash-campaign-list">
            {campaigns.map((campaign) => <Link to={`/campaigns/${campaign.id}`} className="dash-campaign-row" key={campaign.id}><span><b>{campaign.name}</b><small>{campaign.customer} · {campaign.manager}</small></span><em>{campaign.progress}%</em><i><span style={{ width: `${campaign.progress}%` }} /></i></Link>)}
            {!campaigns.length ? <div className="req-empty">لا توجد حملات نشطة</div> : null}
          </div>
        </div>
        <div className="dash-section">
          <SectionHead title="الأداء المالي" icon="i-wallet" color="#16a34a" />
          <div className="dash-finance-boxes">
            <div><span>إجمالي الإيرادات</span><b>{money(financial.total_revenue)} ر.س</b></div>
            <div><span>إجمالي التكلفة</span><b>{money(financial.total_cost)} ر.س</b></div>
            <div><span>صافي الربح</span><b>{money(financial.net_profit)} ر.س</b></div>
            <div><span>هامش الربح</span><b>{financial.margin}%</b></div>
          </div>
        </div>
      </div>

      <div className="dash-grid-2col">
        <div className="dash-section">
          <SectionHead title="أبرز العملاء" icon="i-users" color="#3b82f6" to="/customers" />
          <div className="cc-ranks">{customers.map((customer, index) => <Link to={`/customers/${customer.id}`} className="cc-rank" key={customer.id}><span className="num">{index + 1}</span><span className="nm">{customer.name}</span><span className="bar"><span style={{ width: `${customer.score}%` }} /></span><span className="mt">{money(customer.revenue)} ر.س · {customer.campaigns} حملات</span></Link>)}</div>
        </div>
        <div className="dash-section">
          <SectionHead title="أبرز المؤثرين" icon="i-star" color="#ec4899" to="/influencers" />
          <div className="cc-ranks">{influencers.map((influencer, index) => <Link to={`/influencers/${influencer.id}`} className="cc-rank" key={influencer.id}><span className="num">{index + 1}</span><span className="nm">{influencer.name}</span><span className="bar"><span style={{ width: `${influencer.score}%` }} /></span><span className="mt">{influencer.platform} · {influencer.ads_completed} إعلان</span></Link>)}</div>
        </div>
      </div>

      <div className="dash-section">
        <SectionHead title="السجل التشغيلي" icon="i-clock" color="#64748b" badge={`${activities.length} تحديث`} />
        <div className="dash-activity-feed">{activities.map((item) => <div className="dash-activity" key={item.id}><span style={{ background: item.color }} /><div><b>{item.title}</b><small>{item.body}</small></div><time>{item.time}</time></div>)}</div>
      </div>
    </div>
  );
}
