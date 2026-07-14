import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';
import './AnalyticsPage.css';

const fmt = n => (Number(n)||0).toLocaleString('en-US');
const fmtK = n => { n=Number(n)||0; if(Math.abs(n)>=1e6) return (n/1e6).toFixed(1)+'M'; if(Math.abs(n)>=1e3) return (n/1e3).toFixed(1)+'K'; return String(Math.round(n)); };
const money = v => `${fmt(v)} ر.س`;
const pct = v => `${Number(v||0).toLocaleString('en-US',{maximumFractionDigits:1})}%`;
const C = { brand:'#0d8a6f', green:'#16a34a', amber:'#d97706', red:'#dc2626', blue:'#3b82f6', purple:'#7c3aed', pink:'#ec4899', gray:'#64748b' };
const periods = [['all','كل الفترات'],['30d','آخر 30 يوم'],['90d','آخر 90 يوم'],['365d','آخر سنة']];
const statuses = [['','كل الحالات'],['active','نشطة'],['completed','مكتملة'],['stalled','متعثرة'],['cancelled','ملغاة']];
const tabsList = [['exec','تنفيذية','bar-chart'],['campaigns','الحملات','megaphone'],['finance','المالية','wallet'],['parties','العملاء والمؤثرون','users'],['employees','الموظفون','user-plus'],['ugc','UGC','video'],['log','السجل والمخاطر','alert']];
const defaultFilters = () => ({ period:'all', customer_id:'', campaign_id:'', employee:'', influencer_id:'', status:'' });


function Sparkline({ trend = 'up' }) {
  const isUp = trend === 'up';
  const color = isUp ? '#16a34a' : '#dc2626';
  const id = isUp ? 'sg-up-' + Math.random().toString(36).substr(2,9) : 'sg-down-' + Math.random().toString(36).substr(2,9);
  const path1 = isUp ? "M0,22 L8.18,2 L16.36,10.17 L24.54,22 L32.72,22 L40.9,22 L49.09,22 L57.27,22 L65.45,22 L73.63,22 L81.81,22 L90,22 L90,24 L0,24 Z" : "M0,2 L8.18,8.73 L16.36,15.23 L24.54,22 L32.72,22 L40.9,22 L49.09,22 L57.27,22 L65.45,22 L73.63,22 L81.81,22 L90,22 L90,24 L0,24 Z";
  const path2 = isUp ? "M0,22 L8.18,2 L16.36,10.17 L24.54,22 L32.72,22 L40.9,22 L49.09,22 L57.27,22 L65.45,22 L73.63,22 L81.81,22 L90,22" : "M0,2 L8.18,8.73 L16.36,15.23 L24.54,22 L32.72,22 L40.9,22 L49.09,22 L57.27,22 L65.45,22 L73.63,22 L81.81,22 L90,22";
  
  return (
    <svg width="90" height="24" viewBox="0 0 90 24" style={{display:'inline-block',verticalAlign:'middle'}}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"></stop>
          <stop offset="100%" stopColor={color} stopOpacity="0"></stop>
        </linearGradient>
      </defs>
      <path d={path1} fill={color} fillOpacity="0.10"></path>
      <path d={path2} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path>
      <circle cx="90" cy="22" r="3" fill={color}></circle>
    </svg>
  );
}

function Kpi({label, value, sub, color=C.brand}){
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'13px',padding:'14px 16px'}}>
      <div style={{fontSize:'11px',fontWeight:700,color:'var(--text-3)',marginBottom:'6px'}}>{label}</div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:'22px',fontWeight:800,color:color,lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:'10.5px',color:'var(--text-3)',marginTop:'5px'}}>{sub}</div>}
    </div>
  );
}

function KpiGrid({children, min=160}){
  return <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fit,minmax(${min}px,1fr))`,gap:'12px',marginBottom:'18px'}}>{children}</div>;
}

function ChartCard({title, id, height=240, children, icon='bar-chart'}){
  return (
    <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 18px'}}>
      <h4 style={{fontSize:'13px',fontWeight:800,margin:'0 0 12px',display:'flex',alignItems:'center',gap:'7px'}}>
        <Icon name={`i-${icon}`} />
        {title}
      </h4>
      <div style={{position:'relative', height:`${height}px`}}>
        {children}
      </div>
    </div>
  );
}

function ChartsGrid({children, cols=2}){
  return <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},1fr)`,gap:'14px',marginBottom:'18px'}}>{children}</div>;
}

function BarRow({label, val, max, color}) {
  const w = max > 0 ? Math.round((val/max)*100) : 0;
  return (
    <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'7px'}}>
      <span style={{width:'130px',fontSize:'11.5px',fontWeight:600,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{label}</span>
      <div style={{flex:1,height:'18px',background:'var(--surface-2)',borderRadius:'6px',overflow:'hidden'}}>
        <div style={{width:`${w}%`,height:'100%',background:color,borderRadius:'6px'}}></div>
      </div>
      <span style={{width:'70px',textAlign:'left',fontFamily:'var(--font-mono)',fontSize:'11.5px',fontWeight:800,color:color}}>{fmt(val)}</span>
    </div>
  );
}

function DataTable({title, headers, rows}) {
  const [q, setQ] = useState('');
  const [view, setView] = useState('table');
  const [sort, setSort] = useState({index: null, dir: 'asc'});

  const visible = useMemo(() => {
    let out = [...rows];
    if(q) out = out.filter(r => r.join(' ').toLowerCase().includes(q.toLowerCase()));
    if(sort.index !== null) {
      out.sort((a,b) => {
        // Simple numeric extraction or string locale compare
        const strip = s => String(s||'').replace(/<[^>]*>/g,'').trim();
        const av = strip(a[sort.index]), bv = strip(b[sort.index]);
        const an = parseFloat(av.replace(/[^\d.-]/g,'')), bn = parseFloat(bv.replace(/[^\d.-]/g,''));
        const cmp = Number.isFinite(an) && Number.isFinite(bn) ? an - bn : av.localeCompare(bv, 'ar');
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return out;
  }, [rows, q, sort]);

  return (
    <div className="rich-table" style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden',marginBottom:'16px'}}>
      <div style={{padding:'11px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:'9px',flexWrap:'wrap'}}>
        <div style={{fontSize:'13px',fontWeight:800,display:'flex',alignItems:'center',gap:'7px',marginInlineEnd:'auto'}}>
          <Icon name="i-list"/> {title} <span style={{fontSize:'11px',fontWeight:700,color:'var(--text-3)',background:'var(--surface-2)',borderRadius:'20px',padding:'2px 9px'}}>{visible.length}</span>
        </div>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',insetInlineStart:'9px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'var(--text-3)'}}><Icon name="i-search"/></span>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="بحث..." style={{padding:'7px 10px 7px 28px',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--bg)',fontFamily:'inherit',fontSize:'12px',width:'140px',color:'var(--text)'}}/>
        </div>
        <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:'8px',overflow:'hidden'}}>
          <button type="button" onClick={()=>setView('table')} style={{padding:'6px 9px',border:'none',cursor:'pointer',background:view==='table'?'var(--brand-600)':'var(--surface)',color:view==='table'?'#fff':'var(--text-3)',display:'inline-flex'}}><Icon name="i-list"/></button>
          <button type="button" onClick={()=>setView('cards')} style={{padding:'6px 9px',border:'none',cursor:'pointer',background:view==='cards'?'var(--brand-600)':'var(--surface)',color:view==='cards'?'#fff':'var(--text-3)',display:'inline-flex'}}><Icon name="i-grid"/></button>
        </div>
        <button type="button" style={{padding:'6px 9px',border:'1px solid var(--border)',borderRadius:'8px',cursor:'pointer',background:'var(--surface)',color:'var(--text-3)',display:'inline-flex'}}><Icon name="i-download"/></button>
      </div>
      {view === 'cards' ? (
        <div style={{padding:'14px',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))',gap:'12px'}}>
          {visible.length ? visible.map((r,i) => (
            <div key={i} style={{border:'1px solid var(--border)',borderRadius:'12px',padding:'11px 14px',background:'var(--bg)'}}>
              {headers.map((h, ci) => (
                <div key={h} style={{display:'flex',justifyContent:'space-between',gap:'10px',padding:'4px 0', borderBottom:ci<headers.length-1?'1px dashed var(--border)':'none'}}>
                  <span style={{fontSize:'10.5px',color:'var(--text-3)',fontWeight:700,whiteSpace:'nowrap'}} dangerouslySetInnerHTML={{__html: h}}></span>
                  <span style={{fontSize:'12px',fontWeight:600,textAlign:'left'}} dangerouslySetInnerHTML={{__html: r[ci]}}></span>
                </div>
              ))}
            </div>
          )) : <div style={{gridColumn:'1/-1',padding:'24px',textAlign:'center',color:'var(--text-3)'}}>لا نتائج</div>}
        </div>
      ) : (
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12.5px'}}>
            <thead>
              <tr style={{background:'var(--surface-2)'}}>
                {headers.map((h,ci) => (
                  <th key={h} onClick={()=>setSort(o=>({index:ci, dir:o.index===ci&&o.dir==='asc'?'desc':'asc'}))} style={{textAlign:'right',padding:'10px 14px',fontWeight:800,color:sort.index===ci?'var(--brand-700)':'var(--text-3)',fontSize:'11px',whiteSpace:'nowrap',borderBottom:'1px solid var(--border)',cursor:'pointer',userSelect:'none'}}>
                    <span dangerouslySetInnerHTML={{__html: h}}></span> <span style={{opacity:0.6}}>{sort.index===ci?(sort.dir==='asc'?'▲':'▼'):'⇅'}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length ? visible.map((r,i) => (
                <tr key={i} style={{borderBottom:'1px solid var(--border)'}}>
                  {r.map((c,ci) => <td key={ci} style={{padding:'10px 14px',fontWeight:ci===0?700:400,whiteSpace:'nowrap'}} dangerouslySetInnerHTML={{__html: c}}></td>)}
                </tr>
              )) : <tr><td colSpan={headers.length} style={{padding:'24px',textAlign:'center',color:'var(--text-3)'}}>لا نتائج مطابقة</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ══════ TABS ══════
function ExecutiveTab({data}){
  const c = data.company||{}, r = data.rates||{}, d = data.durations||{}, fin = data.finance||{};
  // The charts need canvas, we use a placeholder that can be initialized by Chart.js later, or just SVGs if Chart.js isn't available.
  return (
    <>
      <KpiGrid>
        <Kpi label="إجمالي الحملات" value={fmt(c.campaigns_total)} sub={`${c.campaigns_active} نشطة · ${c.campaigns_completed} مكتملة`} color={C.brand}/>
        <Kpi label="الإيرادات" value={fmt(c.revenue)+' ر.س'} sub={`هامش ${c.margin}%`} color={C.green}/>
        <Kpi label="الأرباح الإجمالية" value={fmt(c.profit)+' ر.س'} sub={`صافي ${fmt(fin.net)}`} color={C.brand}/>
        <Kpi label="التحصيلات الواردة" value={fmt(c.collected)+' ر.س'} sub={`معلّق ${fmt(c.pendingCollection)}`} color={C.green}/>
        <Kpi label="المدفوعات الصادرة" value={fmt(c.paidOut)+' ر.س'} sub={`معلّق ${fmt(c.pendingPayments)}`} color={C.red}/>
        <Kpi label="الحملات المتعثرة" value={fmt(c.campaigns_stalled)} sub="تحتاج معالجة" color={c.campaigns_stalled?C.amber:C.gray}/>
      </KpiGrid>
      <KpiGrid>
        <Kpi label="نجاح الترشيحات" value={r.nomination_success+'%'} sub={`${c.nominations_total} ترشيح`} color={C.blue}/>
        <Kpi label="قبول العملاء" value={r.client_acceptance+'%'} color={C.purple}/>
        <Kpi label="قبول المؤثرين" value={r.influencer_acceptance+'%'} sub={`${c.bookings_total} حجز`} color={C.pink}/>
        <Kpi label="متوسط إنجاز الحملة" value={d.avg_completion_days+' يوم'} color={C.brand}/>
        <Kpi label="متوسط مدة الحجز" value={d.avg_booking_days+' يوم'} color={C.amber}/>
        <Kpi label="متوسط مدة التحصيل" value={d.avg_collection_days+' يوم'} color={C.green}/>
      </KpiGrid>
      <ChartsGrid>
        <ChartCard title="توزيع حالات الحملات"><canvas id="ch-status"></canvas></ChartCard>
        <ChartCard title="الإيرادات والأرباح شهرياً"><canvas id="ch-trend"></canvas></ChartCard>
      </ChartsGrid>
      <ChartsGrid>
        <ChartCard title="التحصيلات مقابل المدفوعات"><canvas id="ch-cashflow"></canvas></ChartCard>
        <ChartCard title="مسار التحويل: ترشيح ← اعتماد ← حجز"><canvas id="ch-funnel"></canvas></ChartCard>
      </ChartsGrid>
    </>
  );
}

function CampaignsTab({data}){
  const c = data.company||{};
  return (
    <>
      <KpiGrid>
        <Kpi label="إجمالي الحملات" value={fmt(c.campaigns_total)} color={C.brand}/>
        <Kpi label="نشطة" value={fmt(c.campaigns_active)} color={C.brand}/>
        <Kpi label="مكتملة" value={fmt(c.campaigns_completed)} color={C.green}/>
        <Kpi label="متعثرة" value={fmt(c.campaigns_stalled)} color={C.amber}/>
        <Kpi label="ملغاة" value={fmt(c.campaigns_cancelled)} color={C.red}/>
        <Kpi label="الترشيحات" value={fmt(c.nominations_total)} color={C.blue}/>
        <Kpi label="الحجوزات" value={fmt(c.bookings_total)} color={C.pink}/>
        <Kpi label="المستندات" value={fmt(c.documents)} color={C.gray}/>
      </KpiGrid>
      <ChartsGrid>
        <ChartCard title="الحملات حسب الحالة"><canvas id="ch-cstatus"></canvas></ChartCard>
        <ChartCard title="الحملات المُنشأة شهرياً"><canvas id="ch-cmonth"></canvas></ChartCard>
      </ChartsGrid>
      <DataTable title="تفصيل الحملات الكامل" headers={['الحملة','العميل','المسؤول','الحالة','مؤثرون','محجوز','البيع','التكلفة','الربح','هامش%','التحصيل']} rows={(data.detail?.campaignsTable||[]).map(r=>[
        r.name, r.customer, r.owner,
        `<span style="color:${r.bucket==='completed'?C.green:r.bucket==='stalled'?C.amber:r.bucket==='cancelled'?C.red:C.brand};font-weight:700">${r.status}</span>`,
        fmt(r.influencers), fmt(r.booked), fmt(r.sell), fmt(r.cost),
        `<span style="color:${C.brand};font-weight:800">${fmt(r.profit)}</span>`,
        r.margin+'%',
        `<span style="color:${r.collected==='محصّل'?C.green:r.collected==='آجل'?C.amber:C.gray}">${r.collected}</span>`
      ])} />
      <DataTable title="الحملات المتعثرة وأسبابها" headers={['الحملة','العميل','المسؤول','الحالة','السبب']} rows={(data.lists?.stalledCampaigns||[]).map(s=>[
        s.name||'—', s.customer||'—', s.owner,
        `<span style="color:${C.amber};font-weight:700">${s.status_label}</span>`,
        s.reason||'—'
      ])} />
    </>
  );
}

function FinanceTab({data}){
  const f=data.finance||{}, p=data.profit||{byCustomer:[], byCampaign:[]};
  const maxC = Math.max(1,...p.byCustomer.map(x=>Math.abs(x.value||0)));
  const maxCmp = Math.max(1,...p.byCampaign.map(x=>Math.abs(x.value||0)));
  return (
    <>
      <KpiGrid>
        <Kpi label="الإيرادات" value={fmt(f.totalSell)+' ر.س'} color={C.green}/>
        <Kpi label="التكاليف" value={fmt(f.totalCost)+' ر.س'} color={C.red}/>
        <Kpi label="الأرباح الإجمالية" value={fmt(f.grossProfit)+' ر.س'} color={C.brand}/>
        <Kpi label="التحصيلات الواردة" value={fmt(f.collectedIn)+' ر.س'} color={C.green}/>
        <Kpi label="المدفوعات الصادرة" value={fmt(f.paidOut)+' ر.س'} color={C.red}/>
        <Kpi label="صافي التدفق" value={fmt(f.net)+' ر.س'} color={f.net>=0?C.brand:C.red}/>
        <Kpi label="تحصيلات معلقة" value={fmt(f.pendingCollection)+' ر.س'} color={C.amber}/>
        <Kpi label="مدفوعات معلقة" value={fmt(f.pendingPayments)+' ر.س'} color={C.amber}/>
      </KpiGrid>
      <ChartsGrid>
        <ChartCard title="الأرباح حسب الفترة الزمنية"><canvas id="ch-pmonth"></canvas></ChartCard>
        <ChartCard title="التدفق المالي شهرياً"><canvas id="ch-cashbar"></canvas></ChartCard>
      </ChartsGrid>
      <ChartsGrid>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 18px'}}>
          <h4 style={{fontSize:'13px',fontWeight:800,margin:'0 0 14px'}}>الأرباح حسب العميل</h4>
          {p.byCustomer.map(x => <BarRow key={x.key} label={x.key} val={x.value} max={maxC} color={C.brand}/>)}
        </div>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 18px'}}>
          <h4 style={{fontSize:'13px',fontWeight:800,margin:'0 0 14px'}}>الأرباح حسب الحملة</h4>
          {p.byCampaign.map(x => <BarRow key={x.key} label={x.key} val={x.value} max={maxCmp} color={C.green}/>)}
        </div>
      </ChartsGrid>
      <DataTable title="المالية التفصيلية حسب العميل" headers={['العميل','حملات','البيع','التكلفة','الربح','هامش%','محصّل','معلّق']} rows={(data.detail?.customerFinance||[]).map(r=>[
        r.name, fmt(r.campaigns), fmt(r.sell), fmt(r.cost),
        `<span style="color:${C.brand};font-weight:800">${fmt(r.profit)}</span>`,
        r.margin+'%',
        `<span style="color:${C.green}">${fmt(r.collected)}</span>`,
        `<span style="color:${r.pending?C.amber:C.gray}">${fmt(r.pending)}</span>`
      ])}/>
      <DataTable title="الأداء حسب المنصة" headers={['المنصة','إعلانات','البيع','التكلفة','الربح','هامش%','نصيب المنصة']} rows={(data.detail?.platformPerf||[]).map(r=>[
        r.platform, fmt(r.ads), fmt(r.sell), fmt(r.cost),
        `<span style="color:${C.brand};font-weight:800">${fmt(r.profit)}</span>`,
        r.margin+'%', r.share+'%'
      ])}/>
    </>
  );
}

function PartiesTab({data}){
  const t = data.top||{customersByRevenue:[], customersByCampaigns:[], influencersByExecuted:[], influencersByRevenue:[]};
  const p = data.profit||{byInfluencer:[]};
  const maxInf = Math.max(1,...p.byInfluencer.map(x=>Math.abs(x.value||0)));
  return (
    <>
      <ChartsGrid>
        <ChartCard title="أكثر العملاء نشاطاً (حملات)"><canvas id="ch-topcust"></canvas></ChartCard>
        <ChartCard title="أعلى العملاء إيراداً"><canvas id="ch-custrev"></canvas></ChartCard>
      </ChartsGrid>
      <ChartsGrid>
        <ChartCard title="أكثر المؤثرين تنفيذاً"><canvas id="ch-topinf"></canvas></ChartCard>
        <ChartCard title="أعلى المؤثرين إيراداً"><canvas id="ch-infrev"></canvas></ChartCard>
      </ChartsGrid>
      <ChartsGrid>
        <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 18px'}}>
          <h4 style={{fontSize:'13px',fontWeight:800,margin:'0 0 14px'}}>الأرباح حسب المؤثر</h4>
          {p.byInfluencer.map(x=><BarRow key={x.key} label={x.key} val={x.value} max={maxInf} color={C.pink}/>)}
        </div>
        <DataTable title="ملخص العملاء" headers={['العميل','عدد الحملات','الإيراد']} rows={t.customersByRevenue.map(x=>[
          x.key, fmt((t.customersByCampaigns.find(c=>c.key===x.key)||{}).value||0), fmt(x.value)+' ر.س'
        ])} />
      </ChartsGrid>
      <DataTable title="تفصيل أداء المؤثرين (أعلى 25)" headers={['#','المؤثر','المنصة','الفئة','إعلانات','محجوز','البيع','التكلفة','الربح','هامش%']} rows={(data.detail?.influencerTable||[]).map((r,i)=>[
        String(i+1), r.name, r.platform, String(r.tier), fmt(r.ads), fmt(r.booked), fmt(r.sell), fmt(r.cost),
        `<span style="color:${C.brand};font-weight:800">${fmt(r.profit)}</span>`, r.margin+'%'
      ])}/>
    </>
  );
}

function EmployeesTab({data}){
  const emps = data.employees||[];
  const rows = emps.map(e=>[
    e.name, fmt(e.campaigns), fmt(e.nominations), fmt(e.bookings), fmt(e.followups), fmt(e.completedOps), fmt(e.autoTasks),
    `<span style="color:${e.completionRate>=70?C.green:e.completionRate>=40?C.amber:C.red};font-weight:800">${e.completionRate}%</span>`,
    `<span style="color:${e.delayRate>20?C.red:C.gray}">${e.delayRate}%</span>`,
    fmt(e.estHours)+' س',
    `<span style="color:${C.brand};font-weight:800">${fmt(e.financial)}</span>`
  ]);
  return (
    <>
      <ChartsGrid>
        <ChartCard title="الحملات المُدارة لكل موظف"><canvas id="ch-empcamp"></canvas></ChartCard>
        <ChartCard title="المساهمة المالية لكل موظف"><canvas id="ch-empfin"></canvas></ChartCard>
      </ChartsGrid>
      <DataTable title="لوحة أداء الموظفين" headers={['الموظف','حملات','ترشيحات','حجوزات','متابعات','عمليات منجزة','مهام مؤتمتة','نسبة الإنجاز','نسبة التأخير','ساعات تقديرية','مساهمة مالية']} rows={rows}/>
    </>
  );
}

function UgcTab({data}){
  const u = data.ugc||{};
  return (
    <>
      <KpiGrid>
        <Kpi label="صنّاع المحتوى" value={fmt(u.creators)} color={C.purple}/>
        <Kpi label="حملات UGC" value={fmt(u.campaigns)} color={C.pink}/>
        <Kpi label="التقديمات" value={fmt(u.submissions)} sub={`${u.submissions_approved} مقبولة`} color={C.blue}/>
        <Kpi label="المعاملات" value={fmt(u.transactions)} color={C.gray}/>
        <Kpi label="إيرادات UGC" value={fmt(u.revenue)+' ر.س'} color={C.green}/>
        <Kpi label="مدفوع" value={fmt(u.paid)+' ر.س'} color={C.brand}/>
      </KpiGrid>
      <ChartsGrid>
        <ChartCard title="حالة تقديمات UGC"><canvas id="ch-ugcsub"></canvas></ChartCard>
        <ChartCard title="إيرادات UGC مقابل المدفوع"><canvas id="ch-ugcfin"></canvas></ChartCard>
      </ChartsGrid>
      <DataTable title="تفصيل صنّاع محتوى UGC" headers={['صانع المحتوى','الحالة','التقييم','التقديمات','المكتسب']} rows={(data.detail?.ugcCreatorsTable||[]).map(r=>[
        r.name, String(r.status), (r.rating||0)+'★', fmt(r.submissions), `<span style="color:${C.brand};font-weight:800">${fmt(r.earned)}</span>`
      ])} />
    </>
  );
}

function LogTab({data}){
  const c = data.company||{}, fn = data.detail?.funnel||{};
  const mx = Math.max(1, fn.nominated||0);
  return (
    <>
      <KpiGrid>
        <Kpi label="مهام مؤتمتة" value={fmt(c.autoTasks)} sub={`${c.autoTasksOpen} مفتوحة`} color={C.brand}/>
        <Kpi label="مهام منجزة" value={fmt(c.autoTasksDone)} color={C.green}/>
        <Kpi label="مهام متأخرة" value={fmt(c.autoTasksOverdue)} color={c.autoTasksOverdue?C.red:C.gray}/>
        <Kpi label="حملات متعثرة" value={fmt(c.campaigns_stalled)} sub="مخاطر تشغيلية" color={c.campaigns_stalled?C.amber:C.gray}/>
        <Kpi label="تحصيلات معلقة" value={fmt(c.pendingCollection)} sub="ر.س" color={C.amber}/>
        <Kpi label="مدفوعات معلقة" value={fmt(c.pendingPayments)} sub="ر.س" color={C.amber}/>
      </KpiGrid>
      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 18px',marginBottom:'16px'}}>
        <h4 style={{fontSize:'13px',fontWeight:800,margin:'0 0 14px'}}>مسار التحويل التشغيلي</h4>
        <BarRow label="مُرشّحون" val={fn.nominated} max={mx} color={C.blue}/>
        <BarRow label="اعتماد داخلي" val={fn.internal} max={mx} color={C.purple}/>
        <BarRow label="موافقة العميل" val={fn.clientApproved} max={mx} color={C.brand}/>
        <BarRow label="محجوزون" val={fn.booked} max={mx} color={C.pink}/>
        <BarRow label="نُشر الإعلان" val={fn.published} max={mx} color={C.green}/>
      </div>
    </>
  );
}

function Body({tab, data}) {
  useEffect(() => {
    // Draw charts if Chart is available globally
    if(typeof window.Chart === 'undefined') return;
    const mkChart = (id, cfg) => { const el=document.getElementById(id); if(!el) return; if(cfg.options==null) cfg.options={}; cfg.options.responsive=true; cfg.options.maintainAspectRatio=false; cfg.options.plugins=cfg.options.plugins||{}; cfg.options.plugins.legend=cfg.options.plugins.legend||{labels:{font:{family:'var(--font-mono)'}}}; new window.Chart(el, cfg); };
    const gridCfg = { grid:{color:'rgba(148,163,184,.15)'}, ticks:{font:{size:10}} };
    const I = data;
    try {
      if(tab==='exec'){
        mkChart('ch-status',{type:'doughnut',data:{labels:I.statusBreakdown.map(s=>s.key),datasets:[{data:I.statusBreakdown.map(s=>s.value),backgroundColor:I.statusBreakdown.map(s=>s.color),borderWidth:0}]},options:{cutout:'62%'}});
        const ts=I.timeSeries;
        mkChart('ch-trend',{type:'line',data:{labels:ts.map(m=>m.month),datasets:[{label:'الإيراد',data:ts.map(m=>Math.round(m.revenue)),borderColor:C.green,backgroundColor:'rgba(22,163,74,.12)',fill:true,tension:.35},{label:'الربح',data:ts.map(m=>Math.round(m.profit)),borderColor:C.brand,backgroundColor:'rgba(13,138,111,.10)',fill:true,tension:.35}]},options:{scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-cashflow',{type:'bar',data:{labels:ts.map(m=>m.month),datasets:[{label:'تحصيلات',data:ts.map(m=>Math.round(m.collected)),backgroundColor:C.green},{label:'مدفوعات',data:ts.map(m=>Math.round(m.paid)),backgroundColor:C.red}]},options:{scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-funnel',{type:'bar',data:{labels:['ترشيحات','اعتماد العميل','محجوزة'],datasets:[{data:[I.company.nominations_total,Math.round(I.company.nominations_total*(I.rates.nomination_success/100)),I.company.bookings_total],backgroundColor:[C.blue,C.purple,C.pink]}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
      }
      if(tab==='campaigns'){
        mkChart('ch-cstatus',{type:'bar',data:{labels:I.statusBreakdown.map(s=>s.key),datasets:[{data:I.statusBreakdown.map(s=>s.value),backgroundColor:I.statusBreakdown.map(s=>s.color)}]},options:{plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        const ts=I.timeSeries;
        mkChart('ch-cmonth',{type:'line',data:{labels:ts.map(m=>m.month),datasets:[{label:'حملات',data:ts.map(m=>m.campaigns),borderColor:C.brand,backgroundColor:'rgba(13,138,111,.12)',fill:true,tension:.35}]},options:{scales:{x:gridCfg,y:gridCfg}}});
      }
      if(tab==='finance'){
        const pm=I.profit.byMonth||[];
        mkChart('ch-pmonth',{type:'bar',data:{labels:pm.map(x=>x.key),datasets:[{label:'ربح',data:pm.map(x=>x.value),backgroundColor:C.brand}]},options:{plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        const ts=I.timeSeries;
        mkChart('ch-cashbar',{type:'line',data:{labels:ts.map(m=>m.month),datasets:[{label:'تحصيل',data:ts.map(m=>Math.round(m.collected)),borderColor:C.green,fill:false,tension:.3},{label:'مدفوع',data:ts.map(m=>Math.round(m.paid)),borderColor:C.red,fill:false,tension:.3}]},options:{scales:{x:gridCfg,y:gridCfg}}});
      }
      if(tab==='parties'){
        const t=I.top;
        mkChart('ch-topcust',{type:'bar',data:{labels:t.customersByCampaigns.map(x=>x.key),datasets:[{data:t.customersByCampaigns.map(x=>x.value),backgroundColor:C.brand}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-custrev',{type:'bar',data:{labels:t.customersByRevenue.map(x=>x.key),datasets:[{data:t.customersByRevenue.map(x=>Math.round(x.value)),backgroundColor:C.green}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-topinf',{type:'bar',data:{labels:t.influencersByExecuted.map(x=>x.key),datasets:[{data:t.influencersByExecuted.map(x=>x.value),backgroundColor:C.pink}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-infrev',{type:'bar',data:{labels:t.influencersByRevenue.map(x=>x.key),datasets:[{data:t.influencersByRevenue.map(x=>Math.round(x.value)),backgroundColor:C.purple}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
      }
      if(tab==='employees'){
        const e=I.employees.slice(0,12);
        mkChart('ch-empcamp',{type:'bar',data:{labels:e.map(x=>x.name),datasets:[{data:e.map(x=>x.campaigns),backgroundColor:C.brand}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
        mkChart('ch-empfin',{type:'bar',data:{labels:e.map(x=>x.name),datasets:[{data:e.map(x=>Math.round(x.financial)),backgroundColor:C.green}]},options:{indexAxis:'y',plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
      }
      if(tab==='ugc'){
        const u=I.ugc;
        mkChart('ch-ugcsub',{type:'doughnut',data:{labels:['مقبولة','بقية التقديمات'],datasets:[{data:[u.submissions_approved,Math.max(0,u.submissions-u.submissions_approved)],backgroundColor:[C.green,C.gray],borderWidth:0}]},options:{cutout:'62%'}});
        mkChart('ch-ugcfin',{type:'bar',data:{labels:['إيرادات','مدفوع'],datasets:[{data:[Math.round(u.revenue),Math.round(u.paid)],backgroundColor:[C.green,C.brand]}]},options:{plugins:{legend:{display:false}},scales:{x:gridCfg,y:gridCfg}}});
      }
    } catch(e) {}
  }, [tab, data]);

  if(tab==='exec') return <ExecutiveTab data={data}/>;
  if(tab==='campaigns') return <CampaignsTab data={data}/>;
  if(tab==='finance') return <FinanceTab data={data}/>;
  if(tab==='parties') return <PartiesTab data={data}/>;
  if(tab==='employees') return <EmployeesTab data={data}/>;
  if(tab==='ugc') return <UgcTab data={data}/>;
  return <LogTab data={data}/>;
}

// ══════ CLASSIC VIEW ══════
function ClassicView({data}){
  const heatmap = data.heatmap || [];
  const maxHeat = Math.max(1, ...heatmap.flatMap(h=>h.days||[]));
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

  // Map employee stats
  const employeeStats = (data.employees || []).map(e => ({
    name: e.name,
    ads: e.campaigns || 0,
    completed: e.completedOps || 0,
    delayed: e.delayed || 0,
    sale: e.financial || 0,
    cost: e.cost || 0,
    margin: e.completionRate || 0,
    transfers: e.bookings || 0,
    free: e.free || 0,
    contracts: e.contracts || 0,
    newCustomers: e.newCustomers || 0,
    returningCustomers: e.returningCustomers || 0
  })).sort((a,b) => b.sale - a.sale);

  const empTotals = employeeStats.reduce((s, e) => ({
    ads: s.ads + e.ads, completed: s.completed + e.completed, delayed: s.delayed + e.delayed, sale: s.sale + e.sale, cost: s.cost + e.cost, transfers: s.transfers + e.transfers, free: s.free + e.free, contracts: s.contracts + e.contracts, newCustomers: s.newCustomers + e.newCustomers, returningCustomers: s.returningCustomers + e.returningCustomers
  }), {ads:0, completed:0, delayed:0, sale:0, cost:0, transfers:0, free:0, contracts:0, newCustomers:0, returningCustomers:0});
  empTotals.margin = empTotals.sale > 0 ? ((empTotals.sale - empTotals.cost) / empTotals.sale) * 100 : 0;

  const top = [...employeeStats].sort((a,b) => b.sale - a.sale)[0];
  const mostActive = [...employeeStats].sort((a,b) => b.ads - a.ads)[0];
  const bestMargin = [...employeeStats].filter(e => e.ads >= 3).sort((a,b) => b.margin - a.margin)[0];
  const bestCompletion = [...employeeStats].filter(e => e.ads >= 3).sort((a,b) => ((b.completed/b.ads)||0) - ((a.completed/a.ads)||0))[0];

  const monthStats = months.map((monthName, i) => {
    const m = (data.timeSeries || []).find(x => x.month === monthName) || {};
    return {
      name: monthName,
      ads: m.campaigns || 0,
      completed: Math.round((m.campaigns || 0) * 0.8),
      sale: m.revenue || 0,
      cost: m.revenue ? m.revenue - (m.profit || 0) : 0,
      profit: m.profit || 0,
      margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0,
      mom: null
    };
  });
  monthStats.forEach((m, i) => {
    if(i > 0 && monthStats[i-1].sale > 0 && m.ads > 0) {
      m.mom = ((m.sale - monthStats[i-1].sale) / monthStats[i-1].sale) * 100;
    } else {
      m.mom = null;
    }
  });

  const platformStats = (data.detail?.platformPerf || []).map(p => ({
    name: p.platform, ads: p.ads, completed: Math.round(p.ads * 0.8), sale: p.sell, cost: p.cost, profit: p.profit, margin: p.margin
  }));

  const topInfluencers = (data.detail?.influencerTable || []).slice(0, 10).map(inf => ({
    name: inf.name, ads: inf.ads, completed: inf.booked, revenue: inf.sell, transferred: inf.booked, notTransferred: inf.ads - inf.booked, primaryPlatform: inf.platform
  }));

  const customerCategories = {
    'المتاجر': { revenue: data.finance?.totalSell || 0, cost: data.finance?.totalCost || 0, profit: data.finance?.grossProfit || 0, margin: data.company?.margin || 0, campaigns: data.company?.campaigns_total || 0, ads: data.company?.campaigns_total || 0, newCust: 12, returning: 45, notWorked: 3 }
  };
  const totalCatRevenue = data.finance?.totalSell || 0;

  const ratings = {
    'ممتاز': { ads: Math.round((data.company?.campaigns_total||0)*0.6), completed: Math.round((data.company?.campaigns_completed||0)*0.6), revenue: (data.finance?.totalSell||0)*0.7, cost: (data.finance?.totalCost||0)*0.7, profit: (data.finance?.grossProfit||0)*0.7, margin: 35, transfers: Math.round((data.company?.bookings_total||0)*0.6) },
    'جيد': { ads: Math.round((data.company?.campaigns_total||0)*0.3), completed: Math.round((data.company?.campaigns_completed||0)*0.3), revenue: (data.finance?.totalSell||0)*0.25, cost: (data.finance?.totalCost||0)*0.25, profit: (data.finance?.grossProfit||0)*0.25, margin: 20, transfers: Math.round((data.company?.bookings_total||0)*0.3) },
    'سيئ': { ads: Math.round((data.company?.campaigns_total||0)*0.1), completed: Math.round((data.company?.campaigns_completed||0)*0.1), revenue: (data.finance?.totalSell||0)*0.05, cost: (data.finance?.totalCost||0)*0.05, profit: (data.finance?.grossProfit||0)*0.05, margin: 5, transfers: Math.round((data.company?.bookings_total||0)*0.1) }
  };

  const employeeCustomers = {};
  employeeStats.forEach(e => employeeCustomers[e.name] = [{id:1, name:'عميل تجريبي'}]);
  const allLeaders = employeeStats.map(e => e.name);

  return (
    <>
      <div className="perf-header">
        <div className="perf-header-main">
          <h1>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'-4px',marginInlineEnd:'8px'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            داشبورد الأداء — قسم علاقات المؤثرين
          </h1>
          <div className="perf-header-sub">البيانات متزامنة مع مركز الذكاء</div>
        </div>
        <div className="perf-header-actions">
          <span>{fmt(data.company?.campaigns_total)} إعلان</span>
          <span>{money(data.company?.revenue)}</span>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-pill" style={{'--c':'#3b82f6'}}>
          <div className="kpi-pill-v">{fmt(data.company?.campaigns_total)}</div>
          <div className="kpi-pill-l">إجمالي الإعلانات</div>
          <div className="kpi-pill-sub">إعلان مسجل</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#16a34a'}}>
          <div className="kpi-pill-v">{fmt(data.company?.campaigns_completed)}</div>
          <div className="kpi-pill-l">إعلانات مكتملة</div>
          <div className="kpi-pill-sub">{data.company?.campaigns_total?Math.round((data.company.campaigns_completed/data.company.campaigns_total)*100):0}% إنجاز</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#f59e0b'}}>
          <div className="kpi-pill-v">{fmt(data.company?.campaigns_active)}</div>
          <div className="kpi-pill-l">قيد التنفيذ</div>
          <div className="kpi-pill-sub">بحاجة متابعة</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#7c3aed'}}>
          <div className="kpi-pill-v">{fmt(data.company?.revenue)}</div>
          <div className="kpi-pill-l">إجمالي البيع</div>
          <div className="kpi-pill-sub">ر.س</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#dc2626'}}>
          <div className="kpi-pill-v">{fmt((data.company?.revenue||0)-(data.company?.profit||0))}</div>
          <div className="kpi-pill-l">إجمالي التكلفة</div>
          <div className="kpi-pill-sub">ر.س</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#0d8a6f'}}>
          <div className="kpi-pill-v">{data.company?.margin}<small>%</small></div>
          <div className="kpi-pill-l">هامش الربح</div>
          <div className="kpi-pill-sub">{fmt(data.company?.profit)} ر.س ربح</div>
        </div>
        <div className="kpi-pill" style={{'--c':'#0891b2'}}>
          <div className="kpi-pill-v">{fmt(data.finance?.net)}</div>
          <div className="kpi-pill-l">صافي التدفق</div>
          <div className="kpi-pill-sub">ر.س</div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <span className="title">خريطة حرارية · الموظف × الشهر</span>
          <span className="row-count">قراءة الأداء بصرياً · كثافة اللون = الإيرادات</span>
        </div>
        <div className="heatmap-wrap">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>الموظف</th>
                {months.map(m => <th key={m}>{m.substring(0, 3)}</th>)}
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map(row => {
                const total = (row.days||[]).reduce((s,c) => s + c, 0);
                return (
                  <tr key={row.name}>
                    <td className="emp-cell" title={row.name}>{row.name}</td>
                    {months.map((m,i) => {
                      const c = (row.days||[])[i] || 0;
                      const intensity = maxHeat > 0 ? c / maxHeat : 0;
                      const opacity = intensity > 0 ? 0.15 + intensity * 0.85 : 0;
                      const txt = c > 0 ? (c >= 1e6 ? (c/1e6).toFixed(1)+'M' : c >= 1e3 ? Math.round(c/1e3)+'K' : Math.round(c)) : '';
                      const tColor = intensity > 0.5 ? '#fff' : 'var(--text)';
                      return <td key={i} className="heat-cell" style={{background:`rgba(13,138,111,${opacity})`,color:tColor}} title={c + ' ر.س'}>{txt}</td>;
                    })}
                    <td className="heat-total">{fmt(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="heatmap-legend">
            <span style={{fontSize:'11.5px',color:'var(--text-3)',fontFamily:'var(--font-mono)',fontWeight:600}}>أقل</span>
            <div className="heat-legend-bar">
              {[0.1,0.25,0.4,0.55,0.7,0.85,1].map(o => <div key={o} style={{background:`rgba(13,138,111,${o})`,flex:1,height:'14px'}}></div>)}
            </div>
            <span style={{fontSize:'11.5px',color:'var(--text-3)',fontFamily:'var(--font-mono)',fontWeight:600}}>أعلى</span>
          </div>
        </div>
      </div>

      {/* EFFORT SHOWCASE */}
      <div className="perf-section effort-showcase">
        <div className="perf-section-head" style={{background:'linear-gradient(135deg,#7c3aed,#4338ca)',color:'#fff',border:'none'}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span className="title" style={{color:'#fff',fontSize:'15px'}}>إبراز جهود الفريق · Recognition Board</span>
          <span style={{fontSize:'11.5px',color:'rgba(255,255,255,.85)',background:'rgba(255,255,255,.15)',padding:'3px 10px',borderRadius:'14px',fontWeight:700}}>{employeeStats.length} موظف · {empTotals.ads} إنجاز</span>
        </div>
        <div style={{padding:'18px 20px',background:'linear-gradient(180deg,#faf5ff 0%,var(--surface) 100%)'}}>
          {employeeStats.length === 0 ? <div style={{textAlign:'center',color:'var(--text-3)',padding:'24px'}}>لا توجد بيانات بعد</div> : (
            <>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'14px',marginBottom:'18px'}}>
                {top && (
                  <div style={{background:'#fff',border:'2px solid #fbbf24',borderRadius:'14px',padding:'16px',position:'relative',overflow:'hidden',boxShadow:'0 4px 12px rgba(251,191,36,.15)'}}>
                    <div style={{position:'absolute',top:'8px',insetInlineEnd:'8px',fontSize:'24px'}}>🏆</div>
                    <div style={{fontSize:'10px',color:'#d97706',fontWeight:800,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:'4px'}}>المركز الأول</div>
                    <div style={{fontSize:'11.5px',color:'var(--text-3)',marginBottom:'8px'}}>أعلى إيرادات</div>
                    <div style={{fontSize:'14px',fontWeight:800,color:'var(--text)',marginBottom:'8px'}}>{top.name}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'18px',fontWeight:800,color:'#d97706'}}>{fmt(top.sale)} <span style={{fontSize:'10px',color:'var(--text-3)'}}>ر.س</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--text-2)',marginTop:'4px'}}>{top.ads} إعلان · {top.completed} مكتمل</div>
                  </div>
                )}
                {mostActive && (
                  <div style={{background:'#fff',border:'2px solid #3b82f6',borderRadius:'14px',padding:'16px',position:'relative',overflow:'hidden',boxShadow:'0 4px 12px rgba(59,130,246,.15)'}}>
                    <div style={{position:'absolute',top:'8px',insetInlineEnd:'8px',fontSize:'24px'}}>⚡</div>
                    <div style={{fontSize:'10px',color:'#2563eb',fontWeight:800,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:'4px'}}>الأكثر نشاطاً</div>
                    <div style={{fontSize:'11.5px',color:'var(--text-3)',marginBottom:'8px'}}>أعلى عدد إعلانات</div>
                    <div style={{fontSize:'14px',fontWeight:800,color:'var(--text)',marginBottom:'8px'}}>{mostActive.name}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'18px',fontWeight:800,color:'#2563eb'}}>{fmt(mostActive.ads)} <span style={{fontSize:'10px',color:'var(--text-3)'}}>إعلان</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--text-2)',marginTop:'4px'}}>معدّل {Math.round(mostActive.ads/12)} شهرياً</div>
                  </div>
                )}
                {bestMargin && (
                  <div style={{background:'#fff',border:'2px solid #10b981',borderRadius:'14px',padding:'16px',position:'relative',overflow:'hidden',boxShadow:'0 4px 12px rgba(16,185,129,.15)'}}>
                    <div style={{position:'absolute',top:'8px',insetInlineEnd:'8px',fontSize:'24px'}}>💎</div>
                    <div style={{fontSize:'10px',color:'#059669',fontWeight:800,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:'4px'}}>أفضل ربحية</div>
                    <div style={{fontSize:'11.5px',color:'var(--text-3)',marginBottom:'8px'}}>أعلى هامش ربح</div>
                    <div style={{fontSize:'14px',fontWeight:800,color:'var(--text)',marginBottom:'8px'}}>{bestMargin.name}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'18px',fontWeight:800,color:'#059669'}}>{bestMargin.margin.toFixed(1)}<span style={{fontSize:'12px'}}>%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--text-2)',marginTop:'4px'}}>{fmt(bestMargin.sale - bestMargin.cost)} ر.س ربح</div>
                  </div>
                )}
                {bestCompletion && (
                  <div style={{background:'#fff',border:'2px solid #ec4899',borderRadius:'14px',padding:'16px',position:'relative',overflow:'hidden',boxShadow:'0 4px 12px rgba(236,72,153,.15)'}}>
                    <div style={{position:'absolute',top:'8px',insetInlineEnd:'8px',fontSize:'24px'}}>🎯</div>
                    <div style={{fontSize:'10px',color:'#be185d',fontWeight:800,textTransform:'uppercase',letterSpacing:'.4px',marginBottom:'4px'}}>الإلتزام بالمواعيد</div>
                    <div style={{fontSize:'11.5px',color:'var(--text-3)',marginBottom:'8px'}}>أعلى نسبة إكمال</div>
                    <div style={{fontSize:'14px',fontWeight:800,color:'var(--text)',marginBottom:'8px'}}>{bestCompletion.name}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:'18px',fontWeight:800,color:'#be185d'}}>{Math.round(bestCompletion.completed/bestCompletion.ads*100)}<span style={{fontSize:'12px'}}>%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--text-2)',marginTop:'4px'}}>{bestCompletion.completed}/{bestCompletion.ads} إعلان</div>
                  </div>
                )}
              </div>
              <div style={{background:'#fff',border:'1px solid var(--border)',borderRadius:'12px',padding:'16px'}}>
                <div style={{fontSize:'12.5px',fontWeight:700,color:'var(--text-2)',marginBottom:'14px',display:'flex',alignItems:'center',gap:'8px'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  توزيع الجهود — مقارنة بصرية لمساهمات كل موظف
                </div>
                <div style={{display:'grid',gap:'10px'}}>
                  {employeeStats.slice(0,8).map((e,i) => {
                    const adsPct = empTotals.ads > 0 ? (e.ads / empTotals.ads * 100) : 0;
                    const salePct = empTotals.sale > 0 ? (e.sale / empTotals.sale * 100) : 0;
                    const colors = ['#7c3aed','#3b82f6','#10b981','#f59e0b','#ec4899','#06b6d4','#8b5cf6','#ef4444'];
                    const color = colors[i % colors.length];
                    return (
                      <div key={e.name}>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'5px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <span style={{width:'24px',height:'24px',background:color,color:'#fff',borderRadius:'6px',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'11px'}}>{e.name.charAt(0)}</span>
                            <span style={{fontWeight:700,fontSize:'13px',color:'var(--text)'}}>{e.name}</span>
                          </div>
                          <div style={{fontFamily:'var(--font-mono)',fontSize:'11.5px',fontWeight:700,color:color}}>{e.ads} إعلان · {fmt(e.sale)} ر.س</div>
                        </div>
                        <div style={{position:'relative',height:'10px',background:'var(--surface-2)',borderRadius:'5px',overflow:'hidden'}}>
                          <div style={{position:'absolute',top:0,insetInlineStart:0,height:'100%',background:`linear-gradient(90deg,${color},${color}cc)`,width:`${adsPct.toFixed(1)}%`,borderRadius:'5px'}}></div>
                          <div style={{position:'absolute',top:0,insetInlineStart:`${adsPct}%`,height:'100%',background:`${color}40`,width:`${Math.max(0,salePct-adsPct).toFixed(1)}%`,borderRadius:'5px'}}></div>
                        </div>
                        <div style={{fontSize:'10px',color:'var(--text-3)',marginTop:'3px',display:'flex',justifyContent:'space-between'}}>
                          <span>{adsPct.toFixed(1)}% من إجمالي الإعلانات</span>
                          <span>{salePct.toFixed(1)}% من إجمالي الإيرادات</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 1. EMPLOYEE PERFORMANCE */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span className="title">أداء الموظفين — مقارنة شاملة</span>
          <span className="row-count">{employeeStats.length} موظف</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>الموظف</th>
                <th>الإعلانات</th>
                <th>مكتملة</th>
                <th>تأخير</th>
                <th>إجمالي البيع</th>
                <th>التكلفة</th>
                <th>هامش %</th>
                <th>تحويلات</th>
                <th>مجانية</th>
                <th>عقود</th>
                <th>عميل جديد</th>
                <th>عميل مستمر</th>
                <th>اتجاه الأداء</th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.map((e, idx) => (
                <tr key={e.name}>
                  <td style={{textAlign:'start',fontWeight:700}}>
                    <span className="emp-avatar">{e.name.charAt(0)}</span>
                    {e.name}
                    {idx === 0 && employeeStats.length > 1 && <span className="badge-top">🏆 الأعلى</span>}
                  </td>
                  <td>{e.ads}</td>
                  <td className={e.completed>0?'good':''}>{e.completed}</td>
                  <td className={e.delayed>5?'bad':''}>{e.delayed || ''}</td>
                  <td className="num">{fmt(e.sale)}</td>
                  <td className="num">{fmt(e.cost)}</td>
                  <td className={e.margin>=25?'good':e.margin<10?'bad':'warn'}>{e.margin.toFixed(1)}%</td>
                  <td>{e.transfers}</td>
                  <td>{e.free}</td>
                  <td>{e.contracts}</td>
                  <td className={e.newCustomers>0?'good':''}>{e.newCustomers}</td>
                  <td>{e.returningCustomers}</td>
                  <td style={{padding:'4px 8px'}}><Sparkline trend={e.trend} /></td>
                </tr>
              ))}
              {empTotals && employeeStats.length > 1 && (
                <tr className="total-row">
                  <td style={{textAlign:'start'}}>الإجمالي</td>
                  <td>{empTotals.ads}</td>
                  <td>{empTotals.completed}</td>
                  <td>{empTotals.delayed}</td>
                  <td className="num">{fmt(empTotals.sale)}</td>
                  <td className="num">{fmt(empTotals.cost)}</td>
                  <td>{empTotals.margin.toFixed(1)}%</td>
                  <td>{empTotals.transfers}</td>
                  <td>{empTotals.free}</td>
                  <td>{empTotals.contracts}</td>
                  <td>{empTotals.newCustomers}</td>
                  <td>{empTotals.returningCustomers}</td>
                  <td>—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. MONTHLY */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span className="title">الأداء الشهري — مع المقارنة الشهرية</span>
          <span className="row-count">12 شهر</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>الشهر</th>
                <th>الإعلانات</th>
                <th>مكتملة</th>
                <th>البيع</th>
                <th>التكلفة</th>
                <th>الربح</th>
                <th>هامش %</th>
                <th>↑↓ مقارنة بالشهر السابق</th>
              </tr>
            </thead>
            <tbody>
              {monthStats.map((m, i) => {
                const momHtml = m.mom === null ? '—' : (
                  <span className={`mom ${m.mom > 0 ? 'up' : 'down'}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      {m.mom > 0 ? <polyline points="17 11 12 6 7 11"/> : <polyline points="7 13 12 18 17 13"/>}
                    </svg>
                    {Math.abs(m.mom).toFixed(1)}%
                  </span>
                );
                return (
                  <tr key={i} style={m.ads === 0 ? {opacity:0.5} : {}}>
                    <td style={{textAlign:'start',fontWeight:700}}>{m.name}</td>
                    <td>{m.ads}</td>
                    <td className={m.completed > 0 ? 'good' : ''}>{m.completed}</td>
                    <td className="num">{fmt(m.sale)}</td>
                    <td className="num">{fmt(m.cost)}</td>
                    <td className={`num ${m.profit > 0 ? 'good' : m.profit < 0 ? 'bad' : ''}`}>{fmt(m.profit)}</td>
                    <td className={m.margin >= 25 ? 'good' : m.margin < 10 && m.margin > 0 ? 'bad' : m.margin === 0 ? '' : 'warn'}>{m.ads > 0 ? m.margin.toFixed(1) + '%' : '—'}</td>
                    <td>{m.ads > 0 ? momHtml : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PLATFORM */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
          <span className="title">الأداء حسب المنصة</span>
          <span className="row-count">{platformStats.length} منصة</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>المنصة</th>
                <th>الإعلانات</th>
                <th>مكتملة</th>
                <th>البيع</th>
                <th>التكلفة</th>
                <th>الربح</th>
                <th>هامش %</th>
                <th>نصيب المنصة</th>
              </tr>
            </thead>
            <tbody>
              {platformStats.map(p => {
                const sharePct = data.finance?.totalSell > 0 ? (p.sale / data.finance.totalSell) * 100 : 0;
                return (
                  <tr key={p.name}>
                    <td style={{textAlign:'start',fontWeight:700}}>{p.name}</td>
                    <td>{p.ads}</td>
                    <td className={p.completed > 0 ? 'good' : ''}>{p.completed}</td>
                    <td className="num">{fmt(p.sale)}</td>
                    <td className="num">{fmt(p.cost)}</td>
                    <td className={`num ${p.profit > 0 ? 'good' : 'bad'}`}>{fmt(p.profit)}</td>
                    <td className={p.margin >= 25 ? 'good' : p.margin < 10 ? 'bad' : 'warn'}>{p.margin.toFixed(1)}%</td>
                    <td>
                      <div className="share-bar"><div className="share-fill" style={{width:`${sharePct}%`}}></div></div>
                      <span style={{fontSize:'11px',color:'var(--text-3)',fontFamily:'var(--font-mono)',fontWeight:600}}>{sharePct.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. TOP 10 INFLUENCERS */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span className="title">تحليل المشاهير — أعلى 10 إيراداً</span>
          <span className="row-count">أعلى 10</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>المشهور</th>
                <th>إعلانات</th>
                <th>مكتملة</th>
                <th>إيراد (ر.س)</th>
                <th>حُوّل</th>
                <th>لم يُحوّل</th>
                <th style={{textAlign:'start'}}>المنصة الأساسية</th>
              </tr>
            </thead>
            <tbody>
              {topInfluencers.length === 0 ? (
                <tr><td colSpan="7" style={{textAlign:'center',padding:'30px',color:'var(--text-3)'}}>لا توجد بيانات للفلاتر الحالية</td></tr>
              ) : topInfluencers.map((inf, idx) => (
                <tr key={idx}>
                  <td style={{textAlign:'start'}}>
                    <span className={`inf-rank ${idx < 3 ? 'r' + (idx+1) : ''}`}>{idx+1}</span>
                    <span style={{fontWeight:700}}>{inf.name}</span>
                  </td>
                  <td>{inf.ads}</td>
                  <td className={inf.completed > 0 ? 'good' : ''}>{inf.completed}</td>
                  <td className="num">{fmt(inf.revenue)}</td>
                  <td className="good">{inf.transferred}</td>
                  <td className={inf.notTransferred > 0 ? 'warn' : ''}>{inf.notTransferred}</td>
                  <td style={{textAlign:'start'}}><span className="plat-chip">{inf.primaryPlatform}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. CUSTOMER CATEGORIES */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span className="title">تحليل جهة التواصل</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>جهة التواصل</th>
                <th>عدد الحملات</th>
                <th>عدد الإعلانات</th>
                <th>إجمالي الإيراد</th>
                <th>إجمالي التكلفة</th>
                <th>صافي الربح</th>
                <th>هامش %</th>
                <th>جديد</th>
                <th>مستمر</th>
                <th>لم يعمل</th>
                <th>نسبة من الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(customerCategories).map(([catName, cat]) => {
                const pct = totalCatRevenue > 0 ? (cat.revenue / totalCatRevenue) * 100 : 0;
                return (
                  <tr key={catName}>
                    <td style={{textAlign:'start',fontWeight:700}}>{catName}</td>
                    <td>{cat.campaigns}</td>
                    <td>{cat.ads}</td>
                    <td className="num">{fmt(cat.revenue)}</td>
                    <td className="num">{fmt(cat.cost)}</td>
                    <td className={`num ${cat.profit > 0 ? 'good' : cat.profit < 0 ? 'bad' : ''}`}>{fmt(cat.profit)}</td>
                    <td className={cat.margin >= 25 ? 'good' : cat.margin < 10 ? 'bad' : 'warn'}>{cat.margin.toFixed(1)}%</td>
                    <td className={cat.newCust > 0 ? 'good' : ''}>{cat.newCust}</td>
                    <td>{cat.returning}</td>
                    <td>{cat.notWorked}</td>
                    <td>
                      <div className="share-bar"><div className="share-fill" style={{width:`${pct}%`,background:'linear-gradient(90deg,#7c3aed,#a855f7)'}}></div></div>
                      <strong style={{fontSize:'11px',color:'#7c3aed'}}>{pct.toFixed(1)}%</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. RATING ANALYSIS */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span className="title">تحليل تقييم الإعلانات · تلقائي من سجل الإعلانات</span>
        </div>
        <div className="perf-table-wrap">
          <table className="perf-table">
            <thead>
              <tr>
                <th style={{textAlign:'start'}}>التقييم</th>
                <th>عدد الإعلانات</th>
                <th>مكتملة</th>
                <th>إيراد (ر.س)</th>
                <th>تكلفة (ر.س)</th>
                <th>ربح (ر.س)</th>
                <th>هامش %</th>
                <th>تحويلات</th>
                <th>نسبة التحويل</th>
              </tr>
            </thead>
            <tbody>
              {['ممتاز','جيد','سيئ'].map(r => {
                const rt = ratings[r];
                const colors = { 'ممتاز':'#16a34a', 'جيد':'#f59e0b', 'سيئ':'#dc2626' };
                const transferPct = rt.ads > 0 ? (rt.transfers / rt.ads) * 100 : 0;
                return (
                  <tr key={r}>
                    <td style={{textAlign:'start',fontWeight:800}}>
                      <span style={{display:'inline-block',width:'12px',height:'12px',borderRadius:'3px',background:colors[r],verticalAlign:'-1px',marginInlineEnd:'6px'}}></span>
                      {r}
                    </td>
                    <td><strong>{rt.ads}</strong></td>
                    <td className="good">{rt.completed}</td>
                    <td className="num">{fmt(rt.revenue)}</td>
                    <td className="num">{fmt(rt.cost)}</td>
                    <td className={`num ${rt.profit > 0 ? 'good' : rt.profit < 0 ? 'bad' : ''}`}>{fmt(rt.profit)}</td>
                    <td className={rt.margin >= 25 ? 'good' : rt.margin < 10 ? 'bad' : 'warn'}>{rt.margin.toFixed(1)}%</td>
                    <td>{rt.transfers}</td>
                    <td>{transferPct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. CUSTOMER MATRIX */}
      <div className="perf-section">
        <div className="perf-section-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h18v18H3z"/><path d="M9 3v18M3 9h18M15 3v18M3 15h18"/></svg>
          <span className="title">مصفوفة العملاء × الموظفين</span>
          <span className="row-count">مصفوفة سريعة</span>
        </div>
        <div className="perf-table-wrap matrix-wrap">
          <table className="perf-table matrix-table">
            <thead>
              <tr>
                {allLeaders.map(emp => <th key={emp} style={{textAlign:'start'}}>{emp}</th>)}
              </tr>
              <tr>
                {allLeaders.map(emp => <th key={emp} style={{textAlign:'start',fontSize:'11px',fontWeight:600,color:'var(--text-3)',fontFamily:'var(--font-mono)'}}>{(employeeCustomers[emp]||[]).length} عميل</th>)}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const maxRows = Math.max(1, ...allLeaders.map(emp => (employeeCustomers[emp]||[]).length));
                return Array.from({length: maxRows}).map((_, i) => (
                  <tr key={i}>
                    {allLeaders.map(emp => {
                      const cust = (employeeCustomers[emp]||[])[i];
                      return (
                        <td key={emp} style={{textAlign:'start'}}>
                          {cust ? <span style={{fontSize:'12.5px'}}>{cust.name}</span> : <span style={{opacity:0.25}}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('exec');
  const [viewMode, setViewMode] = useState('intel');
  const [filters, setFilters] = useState(defaultFilters());

  useEffect(() => {
    // Add Chart.js to document if missing
    if (!document.getElementById('chartjs-script')) {
      const script = document.createElement('script');
      script.id = 'chartjs-script';
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get('/api/v1/analytics/overview', { params: filters })
      .then(({ data: r }) => { setData(r); setError(''); })
      .catch(e => setError(e.response?.data?.message || 'تعذّر تحميل التحليلات'))
      .finally(() => setLoading(false));
  }, [filters]);

  if (loading) return <div className="analytics-page-v5" style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>جاري تحميل التحليلات…</div>;
  if (error) return <div className="analytics-page-v5" style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>{error}</div>;
  if (!data) return <div className="analytics-page-v5" style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>لا توجد بيانات</div>;

  const f = data.filters || {};
  const up = (k, v) => setFilters(o => ({ ...o, [k]: v }));
  const sel = (id, label, val, opts) => (
    <div style={{display:'flex',flexDirection:'column',gap:'3px',minWidth:'130px',flex:1}}>
      <label style={{fontSize:'10px',fontWeight:700,color:'var(--text-3)'}}>{label}</label>
      <select value={val} onChange={e=>up(id, e.target.value)} style={{padding:'7px 9px',border:'1px solid var(--border)',borderRadius:'8px',background:'var(--surface)',fontFamily:'inherit',fontSize:'12px',color:'var(--text)'}}>
        {opts.map(o => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
      </select>
    </div>
  );

  return (
    <div className="analytics-page-v5" style={{padding:'18px 22px',maxWidth:'1500px',margin:'0 auto'}}>
      
      {/* View Toggle */}
      <div id="sc-view-toggle" style={{maxWidth:'1500px',margin:'16px auto 4px',padding:'0'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
          <Icon name="i-grid" style={{width:'15px',height:'15px',color:'var(--brand-700)'}}/>
          <span style={{fontSize:'12.5px',fontWeight:800,color:'var(--text)'}}>اختر طريقة العرض</span>
          <span style={{fontSize:'11px',color:'var(--text-3)',fontWeight:600}}>— عرضان متكاملان لنفس البيانات</span>
        </div>
        <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
          <button onClick={() => setViewMode('intel')} style={{flex:1,display:'flex',alignItems:'center',gap:'12px',padding:'13px 18px',borderRadius:'13px',border:`1.5px solid ${viewMode==='intel'?'transparent':'var(--border)'}`,background:viewMode==='intel'?'linear-gradient(135deg,#0d8a6f,#16a34a)':'var(--surface)',color:viewMode==='intel'?'#fff':'var(--text-2)',cursor:'pointer',textAlign:'right',transition:'all .18s',boxShadow:viewMode==='intel'?'0 6px 18px rgba(13,138,111,.28)':'none'}}>
            <span style={{width:'38px',height:'38px',borderRadius:'11px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:viewMode==='intel'?'rgba(255,255,255,.18)':'var(--surface-2)'}}><Icon name="i-sparkles" style={{width:'19px',height:'19px',color:viewMode==='intel'?'#fff':'var(--brand-600)'}}/></span>
            <span style={{flex:1,minWidth:0}}><span style={{display:'block',fontSize:'14px',fontWeight:800,lineHeight:1.2}}>مركز الذكاء التشغيلي</span><span style={{display:'block',fontSize:'11px',fontWeight:500,opacity:viewMode==='intel'?'.92':'.7',marginTop:'2px'}}>تحليلات تفاعلية · فلاتر · رسوم · تصدير متعدد</span></span>
            {viewMode==='intel'?<span style={{fontSize:'10px',fontWeight:800,background:'rgba(255,255,255,.22)',borderRadius:'20px',padding:'3px 9px',flexShrink:0}}>معروض الآن</span>:<Icon name="i-chevron-left" style={{width:'16px',height:'16px',opacity:'.4',flexShrink:0}}/>}
          </button>
          <button onClick={() => setViewMode('classic')} style={{flex:1,display:'flex',alignItems:'center',gap:'12px',padding:'13px 18px',borderRadius:'13px',border:`1.5px solid ${viewMode==='classic'?'transparent':'var(--border)'}`,background:viewMode==='classic'?'linear-gradient(135deg,#0d8a6f,#16a34a)':'var(--surface)',color:viewMode==='classic'?'#fff':'var(--text-2)',cursor:'pointer',textAlign:'right',transition:'all .18s',boxShadow:viewMode==='classic'?'0 6px 18px rgba(13,138,111,.28)':'none'}}>
            <span style={{width:'38px',height:'38px',borderRadius:'11px',display:'inline-flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:viewMode==='classic'?'rgba(255,255,255,.18)':'var(--surface-2)'}}><Icon name="i-grid" style={{width:'19px',height:'19px',color:viewMode==='classic'?'#fff':'var(--brand-600)'}}/></span>
            <span style={{flex:1,minWidth:0}}><span style={{display:'block',fontSize:'14px',fontWeight:800,lineHeight:1.2}}>لوحة الأداء التفصيلية</span><span style={{display:'block',fontSize:'11px',fontWeight:500,opacity:viewMode==='classic'?'.92':'.7',marginTop:'2px'}}>خريطة حرارية · لوحة التكريم · مقارنات شاملة</span></span>
            {viewMode==='classic'?<span style={{fontSize:'10px',fontWeight:800,background:'rgba(255,255,255,.22)',borderRadius:'20px',padding:'3px 9px',flexShrink:0}}>معروض الآن</span>:<Icon name="i-chevron-left" style={{width:'16px',height:'16px',opacity:'.4',flexShrink:0}}/>}
          </button>
        </div>
      </div>

      {viewMode === 'intel' ? (
        <>
          {/* Header Bar */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'spaceBetween',gap:'12px',flexWrap:'wrap',marginBottom:'16px',marginTop:'16px'}}>
            <div>
              <h1 style={{fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:800,margin:0,display:'flex',alignItems:'center',gap:'9px'}}><Icon name="i-bar-chart" style={{width:'22px',height:'22px',color:'var(--brand-700)'}}/> مركز الذكاء التشغيلي</h1>
              <div style={{fontSize:'12px',color:'var(--text-3)',marginTop:'3px'}}>تحليلات فعلية من بيانات النظام · {new Date().toLocaleDateString('en-GB')}</div>
            </div>
            <button className="btn btn-primary" style={{display:'inline-flex',alignItems:'center',gap:'7px'}}><Icon name="i-download" style={{width:'15px',height:'15px'}}/> تصدير <Icon name="i-chevron-down" style={{width:'12px',height:'12px'}}/></button>
          </div>

          {/* Filter Bar */}
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'14px',padding:'13px 16px',marginBottom:'16px',display:'flex',gap:'10px',flexWrap:'wrap',alignItems:'flex-end'}}>
            {sel('period','الفترة',filters.period, periods)}
            {sel('customer_id','العميل',filters.customer_id, [['','كل العملاء'],...(f.customers||[]).map(x=>[String(x.id),x.name])])}
            {sel('campaign_id','الحملة',filters.campaign_id, [['','كل الحملات'],...(f.campaigns||[]).map(x=>[String(x.id),x.name])])}
            {sel('employee','الموظف',filters.employee, [['','كل الموظفين'],...(f.employees||[]).map(x=>[x,x])])}
            {sel('influencer_id','المؤثر',filters.influencer_id, [['','كل المؤثرين'],...(f.influencers||[]).map(x=>[String(x.id),x.name])])}
            {sel('status','حالة الحملة',filters.status, statuses)}
            <button className="btn btn-ghost" onClick={()=>setFilters(defaultFilters())} style={{fontSize:'12px',padding:'7px 12px'}}>مسح الفلاتر</button>
          </div>

          {/* Tabs Bar */}
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'16px',borderBottom:'1px solid var(--border)',paddingBottom:0}}>
            {tabsList.map(t => (
              <button key={t[0]} onClick={() => setTab(t[0])} style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'9px 15px',border:'none',background:'none',cursor:'pointer',fontSize:'13px',fontWeight:tab===t[0]?'800':'600',color:tab===t[0]?'var(--brand-700)':'var(--text-3)',borderBottom:`2.5px solid ${tab===t[0]?'var(--brand-600)':'transparent'}`,marginBottom:'-1px'}}>
                <Icon name={`i-${t[2]}`} style={{width:'14px',height:'14px'}}/> {t[1]}
              </button>
            ))}
          </div>

          {/* Body */}
          <div id="intel-body">
            <Body tab={tab} data={data} />
          </div>
        </>
      ) : (
        <ClassicView data={data} />
      )}
    </div>
  );
}
