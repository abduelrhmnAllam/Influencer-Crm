import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import { useToast } from '../../hooks/useToast';
import './InfluencerAddPage.css';

const DEFAULT_PLATFORM = { platform_name: '', url: '', subs: '', views: '', home_sell: '', cov_sell: '', home_cost: '', cov_cost: '' };
const PLATFORM_ICONS = { snapchat: 'snapchat', tiktok: 'tiktok', instagram: 'instagram', twitter: 'x', x: 'x', youtube: 'play', linkedin: 'briefcase' };
const AVAILABLE_PLATFORMS = ['snapchat', 'tiktok', 'instagram', 'twitter', 'youtube', 'linkedin'];

export default function InfluencerAddPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', username: '', phone: '', email: '',
    rating: 'C', category: '', region: '', gender: 'male',
    bank_name: '', iban: '', account_holder: '',
    status: 'active', notes: ''
  });
  
  const [platforms, setPlatforms] = useState([]);
  const [newPlat, setNewPlat] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/v1/influencers/${id}`)
        .then(res => {
          const d = res.data.data;
          setFormData({
            name: d.name || '',
            username: d.username || '',
            phone: d.phone || '',
            email: d.email || '',
            rating: d.rating || 'C',
            category: d.category || '',
            region: d.region || '',
            gender: d.gender || 'male',
            bank_name: d.bank_name || '',
            iban: d.iban || '',
            account_holder: d.account_holder || '',
            status: d.status || 'active',
            notes: d.notes || ''
          });
          
          let parsedPlats = [];
          try {
            parsedPlats = typeof d.additional_platforms === 'string' ? JSON.parse(d.additional_platforms) : d.additional_platforms;
            if (!Array.isArray(parsedPlats)) parsedPlats = [];
          } catch(e) {}
          
          if (parsedPlats.length === 0 && d.platform) {
            parsedPlats.push({
              platform_name: d.platform,
              url: `https://${d.platform}.com/${d.username}`,
              subs: d.followers || 0,
              views: 0,
              home_sell: d.sale_price || 0,
              cov_sell: d.sale_price || 0,
              home_cost: d.cost_price || 0,
              cov_cost: d.cost_price || 0
            });
          }
          setPlatforms(parsedPlats);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          showToast('error', 'فشل تحميل المؤثر');
          navigate('/influencers');
        });
    }
  }, [id, isEdit, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlatform = () => {
    if (!newPlat) return;
    if (platforms.some(p => p.platform_name === newPlat)) {
      showToast('error', 'المنصة مضافة مسبقاً');
      return;
    }
    setPlatforms([...platforms, { ...DEFAULT_PLATFORM, platform_name: newPlat }]);
    setNewPlat('');
  };

  const handleRemovePlatform = (index) => {
    setPlatforms(platforms.filter((_, i) => i !== index));
  };

  const handlePlatformChange = (index, field, value) => {
    const updated = [...platforms];
    updated[index][field] = value;
    setPlatforms(updated);
  };

  const handleSubmit = async () => {
    if (!formData.name) return showToast('error', 'يرجى إدخال اسم المؤثر');
    if (!platforms.length) return showToast('error', 'يرجى إضافة منصة واحدة على الأقل');
    
    // Primary platform is the one with max followers
    let primaryPlatform = platforms[0];
    let maxFollowers = 0;
    platforms.forEach(p => {
      const f = Number(p.subs) || 0;
      if (f >= maxFollowers) {
        maxFollowers = f;
        primaryPlatform = p;
      }
    });

    const payload = {
      ...formData,
      platform: primaryPlatform.platform_name,
      followers: Number(primaryPlatform.subs) || 0,
      cost_price: Number(primaryPlatform.home_cost) || 0,
      sale_price: Number(primaryPlatform.home_sell) || 0,
      additional_platforms: JSON.stringify(platforms)
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await api.put(`/api/v1/influencers/${id}`, payload);
        showToast('success', 'تم التعديل بنجاح');
      } else {
        await api.post('/api/v1/influencers', payload);
        showToast('success', 'تمت الإضافة بنجاح');
      }
      navigate('/influencers');
    } catch (err) {
      console.error(err);
      showToast('error', err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-surface-400 font-bold">جاري التحميل...</div>;
  }

  return (
    <div className="font-sans animate-fade-in relative">
      <div className="sec">
        <div className="sec-title">
          <Icon name="user" className="ic" />
          بيانات المؤثر الأساسية
        </div>
        <div className="fg cols-3">
          <div className="fld">
            <label>اسم المؤثر <span className="req">*</span></label>
            <input name="name" placeholder="الاسم كاملاً" value={formData.name} onChange={handleChange} />
          </div>
          <div className="fld">
            <label>اسم المستخدم (يوزر)</label>
            <input name="username" placeholder="يستخدم في الروابط والإشارات" value={formData.username} onChange={handleChange} style={{ direction: 'ltr', textAlign: 'left' }} />
          </div>
          <div className="fld">
            <label>رقم الجوال</label>
            <input name="phone" placeholder="05XXXXXXXX" value={formData.phone} onChange={handleChange} style={{ direction: 'ltr', textAlign: 'left' }} />
          </div>
          <div className="fld">
            <label>التصنيف التسويقي</label>
            <select name="rating" value={formData.rating} onChange={handleChange}>
              <option value="A+">فئة A+ (نخبة - مليونية)</option>
              <option value="A">فئة A (كبار المؤثرين)</option>
              <option value="B">فئة B (متوسط - متخصص)</option>
              <option value="C">فئة C (صناع محتوى UGC - مبتدئ)</option>
            </select>
          </div>
          <div className="fld">
            <label>المجال الرئيسي</label>
            <input name="category" placeholder="أزياء، مطاعم، تقنية..." value={formData.category} onChange={handleChange} />
          </div>
          <div className="fld">
            <label>المدينة / المنطقة</label>
            <input name="region" placeholder="الرياض، جدة..." value={formData.region} onChange={handleChange} />
          </div>
          <div className="fld">
            <label>الجنس</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
          </div>
          <div className="fld">
            <label>البريد الإلكتروني</label>
            <input name="email" type="email" placeholder="example@domain.com" value={formData.email} onChange={handleChange} style={{ direction: 'ltr', textAlign: 'left' }} />
          </div>
          <div className="fld">
            <label>الحالة التشغيلية</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">نشط (متاح للعمل)</option>
              <option value="inactive">غير نشط / محظور</option>
            </select>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-title">
          <Icon name="link" className="ic" />
          المنصات وقوائم الأسعار <span className="text-danger-600 text-sm">*</span>
        </div>
        <div className="text-sm text-surface-500 mb-4">
          يجب إضافة منصة واحدة على الأقل. المنصة ذات العدد الأكبر من المتابعين ستُعتبر «المنصة الأساسية» تلقائياً في الجدول.
        </div>

        <div id="platforms-container">
          {platforms.map((p, i) => {
            const ic = PLATFORM_ICONS[p.platform_name] || 'globe';
            return (
              <div key={i} className="platform-card">
                <div className="platform-head">
                  <div className="platform-head-left">
                    <div className={`platform-icon ${p.platform_name}`}>
                      <Icon name={ic} className="w-4 h-4" />
                    </div>
                    <div className="platform-name">{p.platform_name}</div>
                  </div>
                  <button className="remove-platform-btn" title="حذف المنصة" onClick={() => handleRemovePlatform(i)}>
                    <Icon name="x" className="ic" />
                  </button>
                </div>
                
                <div className="fg">
                  <div className="fld">
                    <label>رابط الحساب</label>
                    <input value={p.url} onChange={e => handlePlatformChange(i, 'url', e.target.value)} placeholder="https://..." style={{ direction: 'ltr', textAlign: 'left' }} />
                  </div>
                  <div className="fg" style={{ marginBottom: 0 }}>
                    <div className="fld">
                      <label>المتابعون</label>
                      <input type="number" value={p.subs} onChange={e => handlePlatformChange(i, 'subs', e.target.value)} placeholder="مثال: 150000" />
                    </div>
                    <div className="fld">
                      <label>متوسط المشاهدات</label>
                      <input type="number" value={p.views} onChange={e => handlePlatformChange(i, 'views', e.target.value)} placeholder="مثال: 50000" />
                    </div>
                  </div>
                </div>

                <div className="platform-pricing-grid">
                  <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 10, border: '1px dashed var(--border)' }}>
                    <div className="text-xs font-bold text-surface-500 mb-3 text-center border-b border-surface-200 pb-2">إعلان هوم (Home)</div>
                    <div className="fg" style={{ marginBottom: 0, gap: 8 }}>
                      <div className="fld">
                        <label>التكلفة الأساسية (لنا)</label>
                        <input type="number" value={p.home_cost} onChange={e => handlePlatformChange(i, 'home_cost', e.target.value)} placeholder="ر.س" />
                      </div>
                      <div className="fld">
                        <label>سعر البيع (للعميل)</label>
                        <input type="number" value={p.home_sell} onChange={e => handlePlatformChange(i, 'home_sell', e.target.value)} placeholder="ر.س" />
                      </div>
                    </div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 10, border: '1px dashed var(--border)' }}>
                    <div className="text-xs font-bold text-surface-500 mb-3 text-center border-b border-surface-200 pb-2">تغطية / زيارة (Coverage)</div>
                    <div className="fg" style={{ marginBottom: 0, gap: 8 }}>
                      <div className="fld">
                        <label>التكلفة الأساسية (لنا)</label>
                        <input type="number" value={p.cov_cost} onChange={e => handlePlatformChange(i, 'cov_cost', e.target.value)} placeholder="ر.س" />
                      </div>
                      <div className="fld">
                        <label>سعر البيع (للعميل)</label>
                        <input type="number" value={p.cov_sell} onChange={e => handlePlatformChange(i, 'cov_sell', e.target.value)} placeholder="ر.س" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="add-platform-bar">
          <select value={newPlat} onChange={e => setNewPlat(e.target.value)}>
            <option value="">-- اختر المنصة للإضافة --</option>
            {AVAILABLE_PLATFORMS.filter(p => !platforms.some(ep => ep.platform_name === p)).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <button type="button" onClick={handleAddPlatform}>
            <Icon name="plus" className="ic" /> إضافة
          </button>
        </div>
      </div>

      <div className="sec">
        <div className="sec-title">
          <Icon name="credit-card" className="ic" />
          البيانات البنكية <span className="text-xs text-surface-400 font-normal mr-2">(اختياري - لمعالجة الحوالات)</span>
        </div>
        <div className="fg cols-3">
          <div className="fld">
            <label>البنك</label>
            <input name="bank_name" placeholder="مصرف الراجحي..." value={formData.bank_name} onChange={handleChange} />
          </div>
          <div className="fld">
            <label>اسم صاحب الحساب</label>
            <input name="account_holder" placeholder="الاسم كما في البنك" value={formData.account_holder} onChange={handleChange} />
          </div>
          <div className="fld">
            <label>الآيبان (IBAN)</label>
            <input name="iban" placeholder="SA..." value={formData.iban} onChange={handleChange} style={{ direction: 'ltr', textAlign: 'left' }} />
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-title">
          <Icon name="document-text" className="ic" />
          ملاحظات وتوجيهات
        </div>
        <div className="fld full">
          <textarea name="notes" rows="3" placeholder="ملاحظات تشغيلية، شروط خاصة للمؤثر، استثناءات..." value={formData.notes} onChange={handleChange}></textarea>
        </div>
      </div>

      <div className="bottom-actions">
        <button className="btn-cancel" onClick={() => navigate('/influencers')}>إلغاء</button>
        <button className="btn-save" onClick={handleSubmit} disabled={submitting}>
          <Icon name="check-circle" className="ic" /> {isEdit ? 'حفظ التعديلات' : 'حفظ وإضافة المؤثر'}
        </button>
      </div>

    </div>
  );
}
