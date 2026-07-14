import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './CustomerAddPage.css';

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`customers-toast ${toast.type || 'success'}`} onClick={onClose}>
      <Icon name={toast.type === 'danger' || toast.type === 'warning' ? 'i-info' : 'i-check'} className="ic" />
      {toast.message}
    </div>
  );
}

export default function CustomerAddPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    sector: '',
    cr_number: '',
    isVatRegistered: '0',
    vat_number: '',
    clientType: 'عادي',
    source: '',
    nationality: 'سعودي',
    city: 'الرياض',
    region: 'الوسطى',
    isComplete: 0,
    status: 'active',
    notes: ''
  });

  const [kycDocs, setKycDocs] = useState({
    logo: null,
    cr: null,
    vat: null,
    address: null,
    contract: null
  });

  useEffect(() => {
    if (isEdit) {
      const fetchCustomer = async () => {
        try {
          const { data } = await api.get(`/api/v1/customers/${id}`);
          const c = data.data;
          setFormData({
            name: c.name || '',
            contact_person: c.contact_person || '',
            phone: c.phone || '',
            email: c.email || '',
            sector: c.sector || '',
            cr_number: c.cr_number || '',
            isVatRegistered: c.vat_number ? '1' : '0',
            vat_number: c.vat_number || '',
            clientType: c.clientType || 'عادي',
            source: c.source || '',
            nationality: c.nationality || 'سعودي',
            city: c.city || 'الرياض',
            region: c.region || 'الوسطى',
            isComplete: c.cr_number && c.vat_number ? 1 : 0, // Mocked logic since isComplete isn't in DB
            status: c.status || 'active',
            notes: c.notes || ''
          });
        } catch (err) {
          console.error(err);
          showToast('لم يتم العثور على العميل', 'danger');
          navigate('/customers');
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    }
  }, [id, isEdit, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileUpload = (key) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4.5 * 1024 * 1024) {
      showToast('الملف كبير جداً (الحد ~4MB)', 'warning');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => {
      setKycDocs(prev => ({
        ...prev,
        [key]: { name: file.name, type: file.type, size: file.size, data: ev.target.result }
      }));
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!formData.contact_person) return showToast('اسم المنسق مطلوب', 'warning');
    if (!formData.phone) return showToast('رقم التواصل مطلوب', 'warning');
    if (!formData.sector) return showToast('نوع النشاط مطلوب', 'warning');
    // if (!formData.brand) return showToast('البراند مطلوب', 'warning'); // merged with name in our model
    if (!formData.name) return showToast('اسم الشركة بالسجل التجاري مطلوب', 'warning');
    if (!formData.cr_number) return showToast('رقم السجل التجاري مطلوب', 'warning');
    
    if (formData.isVatRegistered === '1' && !formData.vat_number) {
      return showToast('الرقم الضريبي مطلوب', 'warning');
    }

    const payload = { ...formData };
    if (payload.isVatRegistered === '0') payload.vat_number = '';
    delete payload.isVatRegistered;
    delete payload.clientType;
    delete payload.source;
    delete payload.nationality;
    delete payload.city;
    delete payload.region;
    delete payload.isComplete;

    try {
      setSaving(true);
      if (isEdit) {
        await api.patch(`/api/v1/customers/${id}`, payload);
        showToast('تم التحديث بنجاح', 'success');
      } else {
        await api.post('/api/v1/customers', payload);
        showToast('تمت إضافة العميل بنجاح', 'success');
      }
      navigate('/customers');
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ أثناء الحفظ', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{padding:'60px',textAlign:'center',color:'#94a3b8'}}>جاري التحميل...</div>;
  }

  return (
    <div className="customers-page" style={{padding:'24px',maxWidth:'960px',margin:'0 auto'}}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="form-page-head">
        <div>
          <h1>{isEdit ? 'تعديل عميل' : 'إضافة عميل جديد'}</h1>
          <div className="sub">{isEdit ? ('تحرير بيانات العميل ' + formData.name) : 'املأ البيانات لإضافة عميل جديد لقاعدة البيانات'}</div>
        </div>
        <Link to="/customers" className="back-link">
          <Icon name="i-chevron-right" className="ic" />
          رجوع
        </Link>
      </div>
      
      <form onSubmit={e => e.preventDefault()}>
        
        {/* Required Section */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="left">
              <div className="title">
                <div className="check-circle"><Icon name="i-check" className="ic" /></div>
                البيانات الأساسية
              </div>
              <span className="section-tag required">إلزامية</span>
            </div>
            <span className="section-hint">الحقول المطلوبة لاكتمال ملف العميل</span>
          </div>
          
          <div className="fg">
            <div className="fld">
              <label>اسم المنسق <span className="req">*</span></label>
              <input name="contact_person" value={formData.contact_person} onChange={handleChange} required placeholder="اسم المنسق" />
            </div>
            <div className="fld">
              <label>رقم التواصل <span className="req">*</span></label>
              <input name="phone" value={formData.phone} onChange={handleChange} required dir="ltr" placeholder="05xxxxxxxx" />
            </div>
            <div className="fld">
              <label>نوع النشاط <span className="req">*</span></label>
              <select name="sector" value={formData.sector} onChange={handleChange} required>
                <option value="">— اختر من القائمة —</option>
                {['تجزئة','مطاعم','تجارة إلكترونية','تقنية','تقنية مالية','مالية','صيدليات','فنادق','أزياء','حكومي','إنتاج إعلامي','رياضة وصحة','توصيل طلبات','أخرى','مطاعم وكافيهات','عيادات وتجميل','عقارات','سيارات','سياحة وسفر','تعليم وتدريب','ملابس وأزياء','صحة ولياقة','عطور وتجميل'].map(t => 
                  <option key={t} value={t}>{t}</option>
                )}
              </select>
            </div>
            <div className="fld">
              <label>اسم الشركة بالسجل التجاري / البراند <span className="req">*</span></label>
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="الاسم الرسمي أو التجاري" />
            </div>
            <div className="fld">
              <label>رقم السجل التجاري <span className="req">*</span></label>
              <input name="cr_number" value={formData.cr_number} onChange={handleChange} required dir="ltr" placeholder="10xxxxxxxx" />
            </div>
            <div className="fld full">
              <label>هل العميل خاضع للضريبة؟ <span className="req">*</span></label>
              <div className="radio-group">
                <label className="radio-opt">
                  <input type="radio" name="isVatRegistered" value="1" checked={formData.isVatRegistered === '1'} onChange={handleChange} />
                  <span>نعم، خاضع للضريبة (15%)</span>
                </label>
                <label className="radio-opt">
                  <input type="radio" name="isVatRegistered" value="0" checked={formData.isVatRegistered === '0'} onChange={handleChange} />
                  <span>لا</span>
                </label>
              </div>
            </div>
            {formData.isVatRegistered === '1' && (
              <div className="fld">
                <label>الرقم الضريبي <span className="req">*</span></label>
                <input name="vat_number" value={formData.vat_number} onChange={handleChange} dir="ltr" placeholder="15 رقم" />
              </div>
            )}
          </div>
        </div>
        
        {/* Optional Section */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="left">
              <div className="title">
                <div className="check-circle" style={{background:'#eff6ff',color:'#1e40af'}}><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></div>
                بيانات إضافية
              </div>
              <span className="section-tag optional">اختيارية</span>
            </div>
            <div className="toggle-wrap">
              <span className="lbl">ملف العميل مكتمل</span>
              <button type="button" className={`toggle ${formData.isComplete ? 'on' : ''}`} onClick={() => setFormData(p => ({...p, isComplete: p.isComplete ? 0 : 1}))}></button>
            </div>
          </div>
          
          {formData.isComplete ? (
            <div className="fg" id="optional-content">
              <div className="fld">
                <label>البريد الإلكتروني</label>
                <input name="email" type="email" dir="ltr" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
              </div>
              <div className="fld">
                <label>نوع العميل</label>
                <select name="clientType" value={formData.clientType} onChange={handleChange}>
                  <option value="">— اختر —</option>
                  <option value="عادي">عادي</option>
                  <option value="مميز">مميز</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              <div className="fld">
                <label>المصدر</label>
                <select name="source" value={formData.source} onChange={handleChange}>
                  <option value="">— من أين سمعت بنا؟ —</option>
                  {['مبيعات','إحالة','سوشيال','إعلان','أخرى'].map(s => 
                    <option key={s} value={s}>{s}</option>
                  )}
                </select>
              </div>
              <div className="fld">
                <label>الجنسية</label>
                <select name="nationality" value={formData.nationality} onChange={handleChange}>
                  <option value="">— اختر —</option>
                  {['سعودي','إماراتي','كويتي','بحريني','قطري','عماني','مصري','أردني','لبناني','سوري','يمني','عراقي','مغربي','تونسي','ليبي','جزائري','سوداني','فلسطيني','أخرى'].map(n => 
                    <option key={n} value={n}>{n}</option>
                  )}
                </select>
              </div>
              <div className="fld">
                <label>المدينة</label>
                <select name="city" value={formData.city} onChange={handleChange}>
                  <option value="">— اختر —</option>
                  {['الرياض','جدة','الدمام','مكة المكرمة','المدينة المنورة','الخبر','أبها','تبوك','بريدة','الطائف','جازان','نجران','حائل'].map(c => 
                    <option key={c} value={c}>{c}</option>
                  )}
                </select>
              </div>
              <div className="fld">
                <label>المنطقة</label>
                <select name="region" value={formData.region} onChange={handleChange}>
                  <option value="">— اختر —</option>
                  {['الوسطى','الغربية','الشرقية','الشمالية','الجنوبية'].map(r => 
                    <option key={r} value={r}>{r}</option>
                  )}
                </select>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Attachments Section */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="left">
              <div className="title">
                <div className="check-circle" style={{background:'#fef3c7',color:'#92400e'}}><svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div>
                المرفقات
              </div>
            </div>
            <span className="section-hint">أضف الوثائق الرسمية للعميل (اختياري)</span>
          </div>
          
          <div className="upload-grid">
            {[
              { id: 'logo', label: 'الشعار', format: 'PNG / JPG', accept: 'image/png,image/jpeg' },
              { id: 'cr', label: 'السجل التجاري', format: 'PDF', accept: 'application/pdf' },
              { id: 'vat', label: 'الشهادة الضريبية', format: 'PDF', accept: 'application/pdf' },
              { id: 'address', label: 'العنوان الوطني', format: 'PDF', accept: 'application/pdf' },
              { id: 'contract', label: 'العقد', format: 'PDF', accept: 'application/pdf' }
            ].map(f => (
              <div className="upload-box" key={f.id}>
                <label className="lbl">{f.label}</label>
                <label className={`upload-area ${kycDocs[f.id] ? 'uploaded' : ''}`}>
                  <div className="icon-circle">
                    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <div className="text">{kycDocs[f.id] ? kycDocs[f.id].name : 'اضغط للرفع'}</div>
                  <div className="fmt">{f.format}</div>
                  <input type="file" accept={f.accept} onChange={handleFileUpload(f.id)} />
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Notes Section */}
        <div className="form-section">
          <div className="form-section-head">
            <div className="left">
              <div className="title">
                <div className="check-circle" style={{background:'#f5f3ff',color:'#7c3aed'}}>
                  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                ملاحظات إضافية
              </div>
            </div>
          </div>
          <div className="fld full">
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="أي ملاحظات أو تفاصيل إضافية..."></textarea>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="bottom-actions">
          <Link to="/customers" className="btn-cancel">إلغاء</Link>
          <button type="button" className="btn-save" onClick={save} disabled={saving}>
            <Icon name="i-check" className="ic" />
            {saving ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة العميل')}
          </button>
        </div>
      </form>
    </div>
  );
}
