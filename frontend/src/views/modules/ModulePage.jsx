import { useEffect, useState } from 'react';
import api from '../../api/client';
import useAuthStore from '../../stores/authStore';
import { Link } from 'react-router-dom';

const config = {
  content: { title:'مكتبة المحتوى', subtitle:'إدارة ومراجعة محتوى الحملات والمؤثرين', endpoint:'/api/v1/contents', columns:[['code','الكود'],['title','العنوان'],['platform','المنصة'],['type','النوع'],['views_count','المشاهدات']] },
  requests: { title:'طلبات الحملات', subtitle:'متابعة طلبات العملاء من الاستلام حتى التنفيذ', endpoint:'/api/v1/requests', columns:[['number','الرقم'],['title','الطلب'],['type','النوع'],['priority','الأولوية'],['status','الحالة']] },
  notifications: { title:'التنبيهات', subtitle:'كل تحديثات النظام والمهام التي تحتاج إلى انتباهك', endpoint:'/api/v1/notifications', columns:[['title','العنوان'],['body','التفاصيل'],['type','النوع'],['created_at','التاريخ']] },
};

export default function ModulePage({ type }) {
  const details = config[type];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get(details.endpoint).then(({data}) => setRows(data.data?.data || data.data || [])).finally(() => setLoading(false)); }, [details]);
  return <div className='module-page'><div className='page-heading'><div><p>Smart Code CRM</p><h1>{details.title}</h1><span>{details.subtitle}</span></div>{type==='requests'&&<div className='detail-actions'><Link to='/request-users'>مستخدمو البوابة</Link><Link to='/requests/add'>طلب جديد</Link></div>}</div><section className='module-table'><table><thead><tr>{details.columns.map(([,label])=><th key={label}>{label}</th>)}</tr></thead><tbody>{rows.map((row)=><tr key={row.id}>{details.columns.map(([key])=><td key={key}>{type==='requests'&&key==='title'?<Link to={`/requests/${row.id}`}>{row[key]}</Link>:key==='created_at'&&row[key]?new Date(row[key]).toLocaleDateString('ar-SA'):row[key]??'—'}</td>)}</tr>)}</tbody></table>{loading&&<p>جارٍ تحميل البيانات…</p>}{!loading&&!rows.length&&<p>لا توجد بيانات بعد.</p>}</section></div>;
}

export function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/api/v1/analytics/overview').then((response)=>setData(response.data)); }, []);
  const totals = data?.totals || {};
  return <div className='module-page'><div className='page-heading'><div><p>التقارير</p><h1>التحليلات</h1><span>قراءة مباشرة لأداء الحملات والمنصات</span></div></div><div className='metric-grid'><article className='metric-card'><div><small>الإيرادات</small><strong>{Number(totals.revenue||0).toLocaleString('ar-SA')} ر.س</strong></div></article><article className='metric-card'><div><small>التكلفة</small><strong>{Number(totals.cost||0).toLocaleString('ar-SA')} ر.س</strong></div></article><article className='metric-card'><div><small>الإعلانات</small><strong>{totals.ads_count ?? '—'}</strong></div></article><article className='metric-card'><div><small>الحملات</small><strong>{totals.campaigns_count ?? '—'}</strong></div></article></div><section className='panel'><header><h2>أداء المنصات</h2></header><div className='platform-list'>{(data?.platform_breakdown||[]).map((row)=><div key={row.platform}><b>{row.platform}</b><span>{row.c} إعلان</span><strong>{Number(row.total).toLocaleString('ar-SA')} ر.س</strong></div>)}</div></section></div>;
}

export function SettingsPage() {
  const user = useAuthStore((state)=>state.user);
  return <div className='module-page'><div className='page-heading'><div><p>الإدارة</p><h1>الإعدادات</h1><span>بيانات الحساب والوكالة وإعدادات التكامل</span></div></div><section className='panel settings-card'><div className='settings-avatar'>{user?.name?.charAt(0)}</div><div><h2>{user?.name}</h2><p>{user?.email}</p><span>{user?.role}</span></div></section><section className='panel'><h2>Google OAuth</h2><p>تم ربط التطبيق بمعرّف Google. يمكن للمستخدمين المسجل بريدهم في النظام تسجيل الدخول عبر Gmail.</p></section></div>;
}
