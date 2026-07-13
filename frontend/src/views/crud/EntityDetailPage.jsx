import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { entityConfigs } from './entityConfigs';

export default function EntityDetailPage({ type }) {
  const config = entityConfigs[type]; const { id } = useParams(); const navigate = useNavigate();
  const [record, setRecord] = useState(null); const [stats, setStats] = useState({}); const [error, setError] = useState('');
  useEffect(() => { api.get(`/api/v1/${config.endpoint}/${id}`).then(({data}) => { setRecord(data.data?.data || data.data); setStats(data.stats || {}); }).catch(()=>setError('تعذر تحميل السجل.')); }, [config.endpoint,id]);
  const remove = async () => { if (!window.confirm('هل تريد حذف هذا السجل؟')) return; await api.delete(`/api/v1/${config.endpoint}/${id}`); navigate(config.list); };
  if (error) return <div className='form-alert'>{error}</div>; if (!record) return <div className='panel'>جارٍ التحميل…</div>;
  const hidden = new Set(['id','agency_id','deleted_at','created_at','updated_at','permissions','preferences','metadata','social_links','tags','additional_platforms']);
  return <div className='entity-page'><div className='page-heading'><div><p>{record.code || config.title}</p><h1>{record.name || record.title}</h1><span>تفاصيل السجل والبيانات المرتبطة به.</span></div><div className='detail-actions'><Link to={`${config.list}/${id}/edit`}>تعديل</Link><button onClick={remove}>حذف</button></div></div>
    {Object.keys(stats).length > 0 && <div className='metric-grid compact'>{Object.entries(stats).map(([key,value])=><article className='metric-card' key={key}><div><small>{key.replaceAll('_',' ')}</small><strong>{Number(value || 0).toLocaleString('ar-SA')}</strong></div></article>)}</div>}
    <section className='detail-card'>{Object.entries(record).filter(([key,value])=>!hidden.has(key)&&value!==null&&typeof value!=='object').map(([key,value])=><div key={key}><small>{key.replaceAll('_',' ')}</small><strong>{String(value)}</strong></div>)}</section>
  </div>;
}
