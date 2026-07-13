import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';

export default function TransferDetailPage() {
  const { id }=useParams(); const [transfer,setTransfer]=useState(null); const [file,setFile]=useState(null); const [type,setType]=useState('receipt'); const [message,setMessage]=useState('');
  const load=()=>api.get(`/api/v1/transfers/${id}`).then(({data})=>setTransfer(data.data));
  useEffect(()=>{load();},[id]);
  const update=async(status,workflow_stage)=>{await api.patch(`/api/v1/transfers/${id}`,{status,workflow_stage});setMessage('تم تحديث حالة الحوالة.');load();};
  const upload=async(event)=>{event.preventDefault();if(!file)return;const data=new FormData();data.append('type',type);data.append('file',file);await api.post(`/api/v1/transfers/${id}/upload`,data,{headers:{'Content-Type':'multipart/form-data'}});setMessage('تم رفع الملف بنجاح.');setFile(null);load();};
  if(!transfer)return <div className='panel'>جارٍ تحميل الحوالة…</div>;
  return <div className='entity-page'><div className='page-heading'><div><p>{transfer.code}</p><h1>تفاصيل الحوالة</h1><span>{transfer.customer?.name||'بدون عميل'} · {transfer.campaign?.name||'بدون حملة'}</span></div><div className='status-badge'>{transfer.status}</div></div>{message&&<div className='success-alert'>{message}</div>}
    <div className='metric-grid compact'><article className='metric-card'><div><small>المبلغ الأساسي</small><strong>{Number(transfer.amount_base).toLocaleString('ar-SA')} ر.س</strong></div></article><article className='metric-card'><div><small>الضريبة</small><strong>{Number(transfer.vat).toLocaleString('ar-SA')} ر.س</strong></div></article><article className='metric-card'><div><small>الإجمالي</small><strong>{Number(transfer.amount_total).toLocaleString('ar-SA')} ر.س</strong></div></article><article className='metric-card'><div><small>المرحلة</small><strong>{transfer.workflow_stage}</strong></div></article></div>
    <section className='panel'><h2>المستفيدون</h2><div className='module-table'><table><thead><tr><th>الاسم</th><th>البنك</th><th>IBAN</th><th>المبلغ</th></tr></thead><tbody>{transfer.recipients?.map((item)=><tr key={item.id}><td>{item.name}</td><td>{item.bank_name||'—'}</td><td dir='ltr'>{item.iban||'—'}</td><td>{item.amount_total}</td></tr>)}</tbody></table></div></section>
    <section className='panel'><h2>إدارة سير العمل</h2><div className='workflow-actions'><button onClick={()=>update('transferred','2')}>تم التحويل</button><button onClick={()=>update('completed','complete')}>إغلاق الحوالة</button></div><form className='upload-form' onSubmit={upload}><select value={type} onChange={(e)=>setType(e.target.value)}><option value='receipt'>إيصال تحويل</option><option value='tax_invoice'>فاتورة ضريبية</option><option value='quotation'>عرض سعر</option><option value='other'>ملف آخر</option></select><input type='file' accept='.pdf,.jpg,.jpeg,.png' onChange={(e)=>setFile(e.target.files[0])}/><button>رفع الملف</button></form></section>
    <section className='panel'><h2>سجل الحوالة</h2><div className='timeline'>{transfer.history?.map((item)=><div key={item.id}><b>{item.action}</b><span>{item.note}</span><time>{new Date(item.occurred_at).toLocaleString('ar-SA')}</time></div>)}</div></section>
  </div>;
}
