import React from 'react';

export default function UgcDashboard() {
  return (
    <>
<div className="dashboard" id="dashboard">
  
  {/* TOP BAR */}
  <div className="creator-topbar">
    <div className="brand">
      <div className="logo">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{"position":"relative","zIndex":"1"}}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg>
      </div>
      <div className="text">
        <div className="n">SmartCode Creators</div>
        <div className="s">UGC TIKTOK NETWORK</div>
      </div>
    </div>
    <span className="sc-anchor" title="مدعوم من Smart Code Influencer CRM">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
      منصة موثّقة
    </span>
    <div className="spacer"></div>
    <div className="user-chip" id="user-chip-btn">
      <span className="name" id="topbar-name">صانع محتوى</span>
      <div className="ava" id="topbar-ava">ا</div>
    </div>
  </div>
  
  {/* LAYOUT */}
  <div className="creator-layout">
    
    {/* SIDEBAR */}
    <aside className="creator-sidebar">
      <div className="nav-link active" data-view="home">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span className="label-text">الرئيسية</span>
      </div>
      <div className="nav-link" data-view="campaigns">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        <span className="label-text">الحملات</span>
        <span className="badge" id="badge-campaigns">0</span>
      </div>
      <div className="nav-link" data-view="applications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        <span className="label-text">طلباتي</span>
        <span className="badge" id="badge-applications">0</span>
      </div>
      <div className="nav-link" data-view="content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>
        <span className="label-text">المحتوى</span>
      </div>
      <div className="nav-link" data-view="wallet">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>
        <span className="label-text">المحفظة</span>
      </div>
      <div className="nav-link" data-view="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span className="label-text">حسابي</span>
      </div>
    </aside>
    
    {/* MAIN */}
    <main className="creator-main">
      
      {/* ═══ HOME VIEW ═══ */}
      <div className="view active" id="view-home">
        <div id="home-content"></div>
      </div>
      
      {/* ═══ CAMPAIGNS VIEW ═══ */}
      <div className="view" id="view-campaigns">
        <div id="campaigns-content"></div>
      </div>
      
      {/* ═══ APPLICATIONS VIEW ═══ */}
      <div className="view" id="view-applications">
        <div id="applications-content"></div>
      </div>
      
      {/* ═══ CONTENT VIEW ═══ */}
      <div className="view" id="view-content">
        <div id="content-content"></div>
      </div>
      
      {/* ═══ WALLET VIEW ═══ */}
      <div className="view" id="view-wallet">
        <div id="wallet-content"></div>
      </div>
      
      {/* ═══ PROFILE VIEW ═══ */}
      <div className="view" id="view-profile">
        <div id="profile-content"></div>
      </div>
    </main>
  </div>
</div>

    </>
  );
}