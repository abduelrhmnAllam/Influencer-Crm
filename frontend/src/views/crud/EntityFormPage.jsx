import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { entityConfigs } from './entityConfigs';

export default function EntityFormPage({ type }) {
  const config = entityConfigs[type];
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ status: type === 'campaign' ? 'draft' : 'active' });
  const [customers, setCustomers] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (type === 'campaign') api.get('/api/v1/customers', { params:{ per_page:100 } }).then(({data}) => setCustomers(data.data || []));
    if (id) api.get(`/api/v1/${config.endpoint}/${id}`).then(({data}) => setForm(data.data?.data || data.data || {}));
  }, [config.endpoint, id, type]);

  const change = (name, value) => setForm((old) => ({ ...old, [name]:value }));
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setErrors({});
    try {
      const url = `/api/v1/${config.endpoint}${id ? `/${id}` : ''}`;
      if (id) await api.put(url, form); else await api.post(url, form);
      navigate(config.list);
    } catch (error) {
      setErrors(error.response?.data?.errors || { general:[error.response?.data?.message || 'تعذر حفظ البيانات'] });
    } finally { setSaving(false); }
  };

  const field = ([name,label,kind='text',required=false,options=[]]) => <label key={name}>{label}{required && <em>*</em>}
    {kind === 'textarea' ? <textarea value={form[name] || ''} onChange={(e)=>change(name,e.target.value)}/>
      : kind === 'select' ? <select value={form[name] || ''} onChange={(e)=>change(name,e.target.value)}><option value=''>اختر</option>{options.map(([value,text])=><option key={value} value={value}>{text}</option>)}</select>
      : kind === 'customers' ? <select value={form[name] || ''} onChange={(e)=>change(name,e.target.value)}><option value=''>اختر العميل</option>{customers.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>
      : <input type={kind} value={form[name] || ''} onChange={(e)=>change(name,e.target.value)} required={required}/>} 
    {errors[name] && <small>{errors[name][0]}</small>}
  </label>;

  return <div className='entity-page'><div className='page-heading'><div><p>{config.title}</p><h1>{id ? `تعديل ${config.title}` : `إضافة ${config.title}`}</h1><span>أدخل البيانات المطلوبة ثم احفظ التغييرات.</span></div></div>
    <form className='entity-form' onSubmit={submit}>{errors.general && <div className='form-alert'>{errors.general[0]}</div>}<div className='form-grid'>{config.fields.map(field)}</div><div className='form-actions'><button type='button' onClick={()=>navigate(config.list)}>إلغاء</button><button className='primary' disabled={saving}>{saving ? 'جارٍ الحفظ…' : 'حفظ البيانات'}</button></div></form>
  </div>;
}
