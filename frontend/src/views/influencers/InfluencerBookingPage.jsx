import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../../legacy/LegacyIconSprite';
import { useToast } from '../../hooks/useToast';
import './InfluencerBookingPage.css';
import api from '../../api/client'; // Replace with public API if needed later

// Mock API function to get booking by token
const getBookingByToken = async (token) => {
  // Try to find it in campaigns via normal api (mocked logic for now, backend needs an endpoint)
  // For the sake of UI, we'll return a static object if token is "demo"
  if (token === 'demo') {
    return {
      campaign_name: 'حملة العيد التسويقية',
      customer_name: 'شركة العطور المتميزة',
      influencer_name: 'محمد خالد',
      platforms: ['snapchat'],
      ad_type: 'تغطية',
      ads_count: 1,
      proposed_time: 'بعد صلاة التراويح',
      proposed_date: '2026-07-20',
      date_from_client: true,
      fee: 2500,
      is_ugc: false,
      client_notes: 'التركيز على العطر الجديد وذكر كود الخصم (عطر26)',
      decision: null, // null, 'approved', 'rejected', 'reschedule'
      attachments: []
    };
  }
  throw new Error('Invalid token');
};

const platMeta = (p) => {
  p = (p || '').toLowerCase();
  if (p.includes('snap') || p.includes('سناب')) return { label: 'سناب شات', icon: 'snapchat', color: '#f59e0b' };
  if (p.includes('tiktok') || p.includes('تيك')) return { label: 'تيك توك', icon: 'tiktok', color: '#111827' };
  if (p.includes('insta') || p.includes('انس')) return { label: 'إنستغرام', icon: 'instagram', color: '#d6249f' };
  if (p.includes('youtube') || p.includes('يوت')) return { label: 'يوتيوب', icon: 'play', color: '#dc2626' };
  if (p.includes('twitter') || p === 'x') return { label: 'X', icon: 'x', color: '#111827' };
  return { label: p || 'منصة', icon: 'globe', color: '#0d8a6f' };
};

export default function InfluencerBookingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { showToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [action, setAction] = useState(null); // 'resch', 'no'
  const [altDate, setAltDate] = useState('');
  const [noReason, setNoReason] = useState('');

  useEffect(() => {
    if (!token) {
      setError('رابط غير صالح');
      setLoading(false);
      return;
    }
    
    getBookingByToken(token)
      .then(res => {
        setData(res);
      })
      .catch(err => {
        setError('الرابط منتهي أو غير صالح');
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="booking-app">
        <div className="text-center py-16 text-surface-400 font-bold">جاري التحميل...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="booking-app">
        <div className="booking-hero">
          <h1>حدث خطأ</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const handleDecision = async (decisionType, extra = {}) => {
    // Mock API call to save decision
    setTimeout(() => {
      setData({ ...data, decision: decisionType });
      showToast('success', 'تم حفظ ردك بنجاح');
      setAction(null);
    }, 800);
  };

  const decided = !!data.decision;

  let s2cls = '', s3cls = '', s2label = '', s3label = '', s2icon = '', s3icon = '';
  if (!data.decision) {
    s2cls = 'active'; s2label = 'ردّك الآن'; s2icon = 'clock'; 
    s3cls = ''; s3label = 'تأكيد الحجز'; s3icon = 'calendar-check';
  } else if (data.decision === 'approved') {
    s2cls = 'done'; s2label = 'وافقت'; s2icon = 'check'; 
    s3cls = 'done'; s3label = 'تم تأكيد الحجز'; s3icon = 'check';
  } else if (data.decision === 'reschedule') {
    s2cls = 'done'; s2label = 'طلبت تعديلاً'; s2icon = 'clock'; 
    s3cls = 'warn'; s3label = 'بانتظار الموعد الجديد'; s3icon = 'clock';
  } else {
    s2cls = 'done'; s2label = 'اعتذرت'; s2icon = 'x'; 
    s3cls = 'no'; s3label = 'تم الاعتذار'; s3icon = 'x';
  }

  return (
    <div className="booking-app animate-fade-in" dir="rtl">
      <div className="booking-hero">
        <h1>أهلاً، {data.influencer_name} 👋</h1>
        <p>لديك طلب حجز إعلان جديد</p>
      </div>

      <div className="booking-steps">
        <div className="booking-step done"><div className="dot"><Icon name="check" className="w-4 h-4" /></div><small>اعتمدك العميل</small></div>
        <div className={`booking-step ${s2cls}`}><div className="dot"><Icon name={s2icon} className="w-4 h-4" /></div><small>{s2label}</small></div>
        <div className={`booking-step ${s3cls}`}><div className="dot"><Icon name={s3icon} className="w-4 h-4" /></div><small>{s3label}</small></div>
      </div>

      <div className="booking-card">
        <div className="booking-card-t"><Icon name="speakerphone" className="w-4 h-4" /> تفاصيل الإعلان</div>
        <div className="booking-row"><div className="k">الحملة</div><div className="v">{data.campaign_name || '—'}</div></div>
        <div className="booking-row"><div className="k">العميل</div><div className="v">{data.customer_name || '—'}</div></div>
        <div className="booking-row">
          <div className="k">المنصة المطلوبة</div>
          <div className="v">
            {data.platforms.map((p, i) => {
              const m = platMeta(p);
              return <span key={i} className="booking-plat"><span className="dot" style={{background: m.color}}></span> <Icon name={m.icon} className="w-3.5 h-3.5" /> {m.label}</span>
            })}
          </div>
        </div>
        <div className="booking-row"><div className="k">نوع الإعلان</div><div className="v">{data.ad_type || '—'}</div></div>
        {data.ads_count > 1 && (
          <div className="booking-row"><div className="k">عدد الإعلانات</div><div className="v font-mono">{data.ads_count} <span className="text-[11px] text-surface-400 font-bold font-sans">إعلان (عقد)</span></div></div>
        )}
        {data.proposed_time && (
          <div className="booking-row"><div className="k">الوقت المقترح</div><div className="v font-mono">{data.proposed_time}</div></div>
        )}
      </div>

      <div className="booking-dbox">
        <div className="ic-wrap"><Icon name="calendar" className="w-6 h-6" /></div>
        <div className="flex-1 min-w-0">
          <div className="l">التاريخ المعتمد من العميل {data.date_from_client && <span className="tag"><Icon name="check-circle" className="w-2.5 h-2.5" /> معتمد</span>}</div>
          <div className="d">{data.proposed_date}{data.proposed_time ? ` · ${data.proposed_time}` : ''}</div>
        </div>
      </div>

      {data.fee > 0 ? (
        <div className="booking-earn">
          <div className="ic-wrap"><Icon name="currency-dollar" className="w-6 h-6" /></div>
          <div className="flex-1 min-w-0">
            <div className="l"><Icon name="check-circle" className="w-4 h-4" /> مستحقاتك المتفق عليها</div>
            <div className="v">{data.fee.toLocaleString('en-US')} <small>ر.س</small></div>
            {data.ads_count > 1 && <div className="perad">{data.ads_count} إعلانات · بمعدل {Math.round(data.fee / data.ads_count).toLocaleString('en-US')} ر.س للإعلان</div>}
          </div>
        </div>
      ) : data.is_ugc ? (
        <div className="booking-earn">
          <div className="ic-wrap"><Icon name="currency-dollar" className="w-6 h-6" /></div>
          <div><div className="l">مستحقاتك</div><div className="v text-[15px]">يُتفق عليها لاحقاً</div></div>
        </div>
      ) : null}

      {(data.client_notes || data.notes_for_influencer) && (
        <div className="booking-card">
          <div className="booking-card-t"><Icon name="annotation" className="w-4 h-4" /> التعليمات</div>
          <div className="notes-body">{data.client_notes || data.notes_for_influencer}</div>
        </div>
      )}

      {decided ? (
        <div className={`booking-banner booking-banner-${data.decision === 'approved' ? 'ok' : data.decision === 'rejected' ? 'no' : 'wait'}`}>
          <Icon name={data.decision === 'approved' ? 'check-circle' : data.decision === 'rejected' ? 'x-circle' : 'clock'} className="w-6 h-6" />
          {data.decision === 'approved' ? 'تم تأكيد الحجز. سيتم التواصل معك قريباً.' : 
           data.decision === 'rejected' ? 'تم تسجيل اعتذارك. شكراً لك.' : 
           'تم إرسال طلب تعديل الموعد. سنتواصل معك قريباً.'}
        </div>
      ) : (
        <>
          {action === null && (
            <div className="booking-card">
              <div className="booking-acts">
                <button className="booking-abtn ok" onClick={() => handleDecision('approved')}>
                  <Icon name="check-circle" className="w-5 h-5" /> موافق على الحجز
                </button>
                <button className="booking-abtn wait" onClick={() => setAction('resch')}>
                  <Icon name="clock" className="w-5 h-5" /> أحتاج تعديل موعد
                </button>
                <button className="booking-abtn no" onClick={() => setAction('no')}>
                  <Icon name="x-circle" className="w-5 h-5" /> غير متاح
                </button>
              </div>
            </div>
          )}

          {action === 'resch' && (
            <div className="booking-card animate-fade-in">
              <div className="booking-card-t"><Icon name="calendar" className="w-4 h-4" /> اقتراح موعد بديل</div>
              <div className="booking-form-group">
                <label className="booking-form-label">التاريخ البديل</label>
                <input type="date" className="booking-inp" value={altDate} onChange={e => setAltDate(e.target.value)} />
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-3 bg-surface-200 text-surface-700 rounded-xl font-bold" onClick={() => setAction(null)}>إلغاء</button>
                <button className="flex-[2] px-4 py-3 bg-wait text-white rounded-xl font-bold flex items-center justify-center gap-2" onClick={() => handleDecision('reschedule', { date: altDate })}>
                  <Icon name="paper-airplane" className="w-4 h-4 transform -rotate-90" /> إرسال الاقتراح
                </button>
              </div>
            </div>
          )}

          {action === 'no' && (
            <div className="booking-card animate-fade-in">
              <div className="booking-card-t"><Icon name="x-circle" className="w-4 h-4 text-no" /> سبب الاعتذار</div>
              <div className="booking-form-group">
                <label className="booking-form-label">سبب الاعتذار (اختياري)</label>
                <textarea className="booking-inp" rows="3" placeholder="مزدحم، خارج التغطية، المنتج غير مناسب..." value={noReason} onChange={e => setNoReason(e.target.value)}></textarea>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-3 bg-surface-200 text-surface-700 rounded-xl font-bold" onClick={() => setAction(null)}>تراجع</button>
                <button className="flex-[2] px-4 py-3 bg-no text-white rounded-xl font-bold flex items-center justify-center gap-2" onClick={() => handleDecision('rejected', { reason: noReason })}>
                  <Icon name="check" className="w-4 h-4" /> تأكيد الاعتذار
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
