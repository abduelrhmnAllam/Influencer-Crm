import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './CustomerListPage.css';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, last_page: 1, current_page: 1 });

  // Stats
  const [stats, setStats] = useState({
    all: 0,
    active: 0,
    complete: 0,
    incomplete: 0,
    activeCampaigns: 0,
    totalRevenue: 0
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      // Note: Real API might not return all these stats at once, 
      // but we can query them or backend can return them.
      // For now, let's fetch list.
      const params = {
        search,
        page,
        per_page: 25,
      };
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') params.status = 'active';
        // 'complete' / 'incomplete' logic needs to be handled by backend or filtered here.
        // If backend doesn't support 'complete', we fetch more or let backend handle it.
      }

      const { data } = await api.get('/api/v1/customers', { params });
      
      let fetchedCustomers = data.data || [];
      
      // If client-side complete/incomplete filter is needed (since backend doesn't have isComplete column)
      if (statusFilter === 'complete') {
        fetchedCustomers = fetchedCustomers.filter(c => !!c.cr_number && !!c.vat_number);
      } else if (statusFilter === 'incomplete') {
        fetchedCustomers = fetchedCustomers.filter(c => !(c.cr_number && c.vat_number));
      }

      setCustomers(fetchedCustomers);
      
      if (data.meta) {
        setPagination({
          current_page: data.meta.current_page,
          last_page: data.meta.last_page,
          total: data.meta.total,
        });
      }

      // Mock stats for now as backend might not have an aggregate endpoint ready
      setStats({
        all: data.meta ? data.meta.total : fetchedCustomers.length,
        active: data.meta ? data.meta.total : fetchedCustomers.length, // Simplified
        complete: 0,
        incomplete: 0,
        activeCampaigns: 12, // Mocked
        totalRevenue: 1250000 // Mocked
      });

    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('تعذر تحميل العملاء');
    } finally {
      setLoading(false);
    }
  }, [search, page, statusFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const formatCompact = (n) => {
    if(!n && n !== 0) return '0';
    const abs = Math.abs(n);
    if(abs >= 1e6) return (n/1e6).toFixed(1).replace(/.0$/, '') + 'M';
    if(abs >= 1e3) return (n/1e3).toFixed(1).replace(/.0$/, '') + 'K';
    return n.toLocaleString('en-US');
  };

  const formatNiceDate = (dateStr) => {
    if(!dateStr) return '—';
    try{
      const d = new Date(dateStr);
      if(isNaN(d)) return dateStr;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }catch(e){ return dateStr; }
  };

  return (
    <div className="customers-page" style={{padding:'24px',maxWidth:'1400px',margin:'0 auto'}}>
      
      {/* CREATIVE HERO */}
      <div className="cust-hero">
        <div className="cust-hero-grid">
          <div className="cust-hero-left">
            <h1>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline-block',verticalAlign:'-3px',marginInlineEnd:'7px'}}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              إدارة العملاء
            </h1>
            <div className="sub">قاعدة بيانات شاملة لإدارة العلاقات والحملات والمتابعة المالية</div>
          </div>
          <div className="cust-hero-stats">
            <div className="cust-hero-stat">
              <div className="v">{stats.all}</div>
              <div className="l">إجمالي</div>
            </div>
            <div className="cust-hero-stat">
              <div className="v">{stats.active}</div>
              <div className="l">نشط</div>
            </div>
            <div className="cust-hero-stat">
              <div className="v">{stats.complete}</div>
              <div className="l">مكتمل</div>
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT CARDS */}
      <div className="cust-highlights">
        <div className="cust-hl" style={{'--c':'#0d8a6f','--bg':'#f0fdf9'}} onClick={() => {setStatusFilter('all'); setPage(1);}}>
          <div className="ic-wrap"><Icon name="i-users" className="ic" /></div>
          <div className="body">
            <div className="val">{stats.all}</div>
            <div className="lbl">كل العملاء</div>
          </div>
        </div>
        <div className="cust-hl" style={{'--c':'#3b82f6','--bg':'#eff6ff'}} onClick={() => {setStatusFilter('active'); setPage(1);}}>
          <div className="ic-wrap"><Icon name="i-check" className="ic" /></div>
          <div className="body">
            <div className="val">{stats.active}</div>
            <div className="lbl">عملاء نشطون</div>
          </div>
        </div>
        <div className="cust-hl" style={{'--c':'#f59e0b','--bg':'#fffbeb'}}>
          <div className="ic-wrap"><Icon name="i-inbox" className="ic" /></div>
          <div className="body">
            <div className="val">{stats.activeCampaigns}</div>
            <div className="lbl">حملات جارية</div>
          </div>
        </div>
        <div className="cust-hl" style={{'--c':'#16a34a','--bg':'#f0fdf4'}}>
          <div className="ic-wrap"><Icon name="i-trending-up" className="ic" /></div>
          <div className="body">
            <div className="val">{formatCompact(stats.totalRevenue)}<small style={{fontSize:'11px',color:'var(--text-3)',fontWeight:500}}> ر.س</small></div>
            <div className="lbl">الإيرادات</div>
          </div>
        </div>
      </div>

      <div className="actions-row">
        <div className="left"></div>
        <div className="right">
          <button className="btn btn-ghost" id="btn-export">
            <Icon name="i-download" className="ic" /> تصدير
          </button>
          <Link to="/customers/add" className="btn btn-primary">
            <Icon name="i-plus" className="ic" /> عميل جديد
          </Link>
        </div>
      </div>

      <div className="chip-row">
        <button className={'cstm-chip ' + (statusFilter === 'all' ? 'active' : '')} onClick={() => {setStatusFilter('all'); setPage(1);}}>
          الكل <span className="n">{stats.all}</span>
        </button>
        <button className={'cstm-chip ' + (statusFilter === 'active' ? 'active' : '')} onClick={() => {setStatusFilter('active'); setPage(1);}}>
          نشط <span className="n">{stats.active}</span>
        </button>
        <button className={'cstm-chip ' + (statusFilter === 'complete' ? 'active' : '')} onClick={() => {setStatusFilter('complete'); setPage(1);}}>
          مكتمل <span className="n">{stats.complete}</span>
        </button>
        <button className={'cstm-chip ' + (statusFilter === 'incomplete' ? 'active' : '')} onClick={() => {setStatusFilter('incomplete'); setPage(1);}}>
          غير مكتمل <span className="n">{stats.incomplete}</span>
        </button>
      </div>

      <div className="search-card">
        <div className="field">
          <Icon name="i-search" className="ic" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            placeholder="ابحث بالبراند، النشاط، السجل التجاري..." 
          />
        </div>
        <div className="results-count">{pagination.total} نتيجة</div>
      </div>

      <div className="customers-table-wrap">
        <div className="table-scroll">
          {loading ? (
            <div className="empty-state">
              <p>جاري التحميل...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <Icon name="i-users" className="ic" />
              <h4>لا توجد نتائج</h4>
              <p>لم يتم العثور على عملاء مطابقين</p>
            </div>
          ) : (
            <table className="customers-tbl">
              <thead>
                <tr>
                  <th>العميل</th>
                  <th>النشاط</th>
                  <th>المنسق</th>
                  <th>التواصل</th>
                  <th>الحالة</th>
                  <th>تاريخ التسجيل</th>
                  <th style={{textAlign:'end'}}></th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => {
                  const isComplete = !!(c.cr_number && c.vat_number); // Approximation
                  return (
                    <tr key={c.id} onClick={(e) => {
                      if (!e.target.closest('.row-action-btn')) {
                        navigate(`/customers/${c.id}`);
                      }
                    }}>
                      <td>
                        <div className="cust-cell">
                          <div className="icon-box">
                            <Icon name="i-building" className="ic" />
                          </div>
                          <div className="info">
                            <div className="name">{c.name}</div>
                            <div className="meta">{(parseFloat(c.total_spent) || 0).toLocaleString()} ر.س</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="activity-cell">
                          <div className="main">{c.sector || 'تجربة'}</div>
                          <div className="other">أخرى</div>
                        </div>
                      </td>
                      <td>{c.assignee?.name || c.contact_person || '—'}</td>
                      <td dir="ltr" style={{fontFamily:'var(--font-mono)',fontSize:'13px',color:'var(--text-2)',textAlign:'right'}}>{c.phone || '—'}</td>
                      <td>
                        <span className={`status-pill ${isComplete ? 'complete' : 'incomplete'}`}>
                          <span className="dot"></span>
                          {isComplete ? 'مكتمل' : 'غير مكتمل'}
                        </span>
                      </td>
                      <td><span className="date-cell">{formatNiceDate(c.created_at)}</span></td>
                      <td>
                        <div className="row-actions">
                          <button className="row-action-btn" title="عرض" aria-label="عرض" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c.id}`); }}>
                            <Icon name="i-eye" className="ic" />
                          </button>
                          <button className="row-action-btn danger" title="حذف" aria-label="حذف" onClick={(e) => { e.stopPropagation(); /* TODO Delete */ }}>
                            <Icon name="i-trash" className="ic" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {pagination.last_page > 1 && (
          <div className="pagination">
            <div style={{fontFamily:'var(--font-mono)',color:'var(--text-3)',fontSize:'11.5px'}}>
              عرض {((page - 1) * 25) + 1}-{Math.min(page * 25, pagination.total)} من أصل {pagination.total}
            </div>
            <div className="pager" style={{display:'flex',gap:'4px'}}>
              <button 
                className={`p ${page <= 1 ? 'disabled' : ''}`} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{width:'32px',height:'32px',display:'grid',placeItems:'center',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--surface)',cursor:page<=1?'not-allowed':'pointer'}}
              >
                <Icon name="i-chevron-right" className="ic" style={{width:'14px',height:'14px'}}/>
              </button>
              
              {Array.from({length: Math.min(pagination.last_page, 5)}, (_,i) => i+1).map(p => (
                <button 
                  key={p}
                  className={`p ${p === page ? 'active' : ''}`} 
                  onClick={() => setPage(p)}
                  style={{width:'32px',height:'32px',display:'grid',placeItems:'center',border:'1px solid var(--border)',borderRadius:'8px',background:p===page?'var(--brand-600)':'var(--surface)',color:p===page?'#fff':'var(--text-2)',cursor:'pointer'}}
                >
                  {p}
                </button>
              ))}
              
              <button 
                className={`p ${page >= pagination.last_page ? 'disabled' : ''}`} 
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                style={{width:'32px',height:'32px',display:'grid',placeItems:'center',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--surface)',cursor:page>=pagination.last_page?'not-allowed':'pointer'}}
              >
                <Icon name="i-chevron-left" className="ic" style={{width:'14px',height:'14px'}}/>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
