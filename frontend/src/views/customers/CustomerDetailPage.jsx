import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './CustomerDetailPage.css';

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`customers-toast ${toast.type || 'success'}`} onClick={onClose}>
      <Icon name={toast.type === 'danger' || toast.type === 'warning' ? 'i-info' : 'i-check'} className="ic" />
      {toast.message}
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mocked stats and lists since API doesn't have all these related models fully implemented yet
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    profitMargin: 0
  });

  const [campaigns, setCampaigns] = useState([]);
  const [ads, setAds] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [docs, setDocs] = useState([]);
  const [influencers, setInfluencers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/api/v1/customers/${id}`);
        setCustomer(data.data);
        
        // Use real stats if provided by API, otherwise fallback to mocks
        if (data.stats) {
          const rev = data.stats.total_spent || 0;
          const cost = rev * 0.75; // mocked cost
          const profit = rev - cost;
          const margin = rev > 0 ? Math.round((profit / rev) * 100) : 0;
          setStats({
            totalRevenue: rev,
            totalCost: cost,
            totalProfit: profit,
            profitMargin: margin
          });
        }
        
        // Mock data for lists
        setCampaigns([]);
        setAds([]);
        setTransfers([]);
        setDocs([]);
        setInfluencers([]);
        
      } catch (err) {
        console.error(err);
        showToast('لم يتم العثور على العميل', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatCompact = (n) => {
    if(!n && n !== 0) return '0';
    const abs = Math.abs(n);
    if(abs >= 1e6) return (n/1e6).toFixed(1).replace(/.0$/, '') + 'M';
    if(abs >= 1e3) return (n/1e3).toFixed(1).replace(/.0$/, '') + 'K';
    return n.toLocaleString('en-US');
  };

  const isComplete = customer && customer.cr_number && customer.vat_number;

  if (loading) {
    return <div style={{padding:'60px',textAlign:'center',color:'#94a3b8'}}>جاري التحميل...</div>;
  }

  if (!customer) {
    return (
      <div style={{padding:'60px',textAlign:'center'}}>
        <h2>العميل غير موجود</h2>
        <Link to="/customers" className="btn btn-primary" style={{marginTop:'16px'}}>العودة للقائمة</Link>
      </div>
    );
  }

  return (
    <div className="customers-page" style={{padding:'24px',maxWidth:'1400px',margin:'0 auto'}}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="detail-head">
        <Link to="/customers" className="back-link">
          <Icon name="i-chevron-right" className="ic" /> العودة للعملاء
        </Link>
      </div>

      <div className="customer-hero">
        <div className="hero-row">
          <div className="hero-left">
            <div className="hero-logo"><Icon name="i-building" className="ic" /></div>
            <div className="hero-info">
              <h1>{customer.name}</h1>
              <div className="brand">{customer.name} · {customer.code || customer.id}</div>
              <div className="hero-tags">
                <span className="hero-tag normal">{customer.clientType || 'عادي'}</span>
                <span className="hero-tag active">● {customer.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                {isComplete && <span className="hero-tag complete">مكتمل</span>}
                {customer.sector && <span className="hero-tag activity">{customer.sector}</span>}
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <Link to={`/customers/edit/${id}`} className="btn btn-primary">
              تعديل
            </Link>
            <button className="btn btn-ghost">
              تصدير
            </button>
          </div>
        </div>

        <div className="hero-kpis">
          <div className="hero-kpi">
            <div className="label">إجمالي الإيراد</div>
            <div className="val">{formatCompact(stats.totalRevenue)} <small>ر.س</small></div>
          </div>
          <div className="hero-kpi cost">
            <div className="label">إجمالي التكلفة</div>
            <div className="val">{formatCompact(stats.totalCost)} <small>ر.س</small></div>
          </div>
          <div className="hero-kpi profit">
            <div className="label">صافي الربح</div>
            <div className="val">{formatCompact(stats.totalProfit)} <small>ر.س</small></div>
          </div>
          <div className="hero-kpi">
            <div className="label">هامش الربح</div>
            <div className="val">{stats.profitMargin}<small>%</small></div>
          </div>
        </div>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>نظرة عامة</button>
        <button className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`} onClick={() => setActiveTab('campaigns')}>
          الحملات <span className="badge">{campaigns.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
          الإعلانات <span className="badge">{ads.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>
          الحوالات <span className="badge">{transfers.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'docs' ? 'active' : ''}`} onClick={() => setActiveTab('docs')}>
          العقود والمستندات <span className="badge">{docs.length}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'influencers' ? 'active' : ''}`} onClick={() => setActiveTab('influencers')}>
          المؤثرين المتعاملين <span className="badge">{influencers.length}</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="tab-content active">
          
          <div className="info-section">
            <div className="info-section-h">
              <div className="ic-wrap" style={{background:'var(--brand-50)',color:'var(--brand-700)'}}><Icon name="i-info" className="ic"/></div>
              <h3>البيانات الأساسية</h3>
            </div>
            <div className="info-grid">
              <div className="info-item"><div className="lbl">اسم الشركة (السجل التجاري)</div><div className="val rtl">{customer.name}</div></div>
              <div className="info-item"><div className="lbl">البراند</div><div className="val rtl">{customer.name}</div></div>
              <div className="info-item"><div className="lbl">المنسق</div><div className="val rtl">{customer.contact_person || '—'}</div></div>
              <div className="info-item"><div className="lbl">نوع النشاط</div><div className="val rtl">{customer.sector || '—'}</div></div>
              <div className="info-item"><div className="lbl">رقم السجل التجاري</div><div className="val">{customer.cr_number || '—'}</div></div>
              <div className="info-item"><div className="lbl">الرقم الضريبي</div><div className="val">{customer.vat_number || 'غير خاضع'}</div></div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-section-h">
              <div className="ic-wrap" style={{background:'#eff6ff',color:'#1e40af'}}><Icon name="i-info" className="ic"/></div>
              <h3>التواصل</h3>
            </div>
            <div className="info-grid">
              <div className="info-item"><div className="lbl">رقم التواصل</div><div className="val">{customer.phone || '—'}</div></div>
              <div className="info-item"><div className="lbl">البريد الإلكتروني</div><div className={`val ${!customer.email ? 'muted' : ''}`}>{customer.email || 'لم يُحدد'}</div></div>
              <div className="info-item"><div className="lbl">المدينة</div><div className="val rtl">{customer.city || 'الرياض'}</div></div>
              <div className="info-item"><div className="lbl">المنطقة</div><div className="val rtl">{customer.region || 'الوسطى'}</div></div>
              <div className="info-item"><div className="lbl">الجنسية</div><div className="val rtl">{customer.nationality || 'سعودي'}</div></div>
              <div className="info-item"><div className="lbl">المصدر</div><div className="val rtl muted">{customer.source || 'غير محدد'}</div></div>
            </div>
          </div>
          
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="tab-content active">
          <div className="table-card">
            <div className="empty-state">
              <h4>لا توجد حملات</h4>
              <p>لم يتم إنشاء حملات لهذا العميل بعد</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="tab-content active">
          <div className="table-card">
            <div className="empty-state">
              <h4>لا توجد إعلانات</h4>
              <p>لم يتم إضافة إعلانات لهذا العميل بعد</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="tab-content active">
          <div className="table-card">
            <div className="empty-state">
              <h4>لا توجد حوالات</h4>
              <p>لم يتم تسجيل حوالات لهذا العميل بعد</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="tab-content active">
          <div className="table-card">
            <div className="empty-state">
              <h4>لا توجد مستندات</h4>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'influencers' && (
        <div className="tab-content active">
          <div className="table-card">
            <div className="empty-state">
              <h4>لا يوجد مؤثرين</h4>
              <p>لم يتعامل هذا العميل مع أي مؤثرين بعد</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
