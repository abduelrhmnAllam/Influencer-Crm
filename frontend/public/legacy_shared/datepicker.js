/**
 * Smart Code — Universal Professional Date Picker
 * ------------------------------------------------
 * Replaces every <input type="date"> across the WHOLE system with a
 * professional, calendar-only picker:
 *   • English numerals only, display format dd/mm/yyyy
 *   • No manual typing (calendar selection only)
 *   • Keeps the original input in the DOM (hidden) so existing code that
 *     reads input.value (ISO yyyy-mm-dd) keeps working unchanged
 *   • Auto-enhances inputs added dynamically via innerHTML (MutationObserver)
 * Load this once per page (after helpers.js). Zero per-page wiring needed.
 */
(function(){
  'use strict';
  if(window.__SC_DATEPICKER__) return; window.__SC_DATEPICKER__ = true;

  /* ---------- styles ---------- */
  const STYLE = `
.scdp-wrap{display:block;position:relative}
.scdp-native{position:absolute!important;width:1px;height:1px;opacity:0;pointer-events:none;margin:0;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0)}
.scdp-field{display:flex;align-items:center;gap:9px;width:100%;min-height:44px;padding:10px 13px;border:1px solid var(--border,#e2e8f0);border-radius:10px;background:var(--surface,#fff);color:var(--text,#0f172a);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;text-align:start;transition:border-color .12s,box-shadow .12s;direction:ltr;box-sizing:border-box}
.scdp-field:hover{border-color:var(--brand,#0d8a6f)}
.scdp-field.open,.scdp-field:focus-visible{outline:none;border-color:var(--brand,#0d8a6f);box-shadow:0 0 0 3px rgba(13,138,111,.15)}
.scdp-field .scdp-cal{width:18px;height:18px;color:var(--brand,#0d8a6f);flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.scdp-txt{flex:1;font-family:'JetBrains Mono',ui-monospace,monospace;letter-spacing:.5px;font-weight:700}
.scdp-txt.ph{color:var(--text-3,#94a3b8);font-weight:600;letter-spacing:1px}
.scdp-field:disabled{opacity:.55;cursor:not-allowed}
.scdp-pop{position:absolute;z-index:99999;width:288px;background:var(--surface,#fff);border:1px solid var(--border,#e2e8f0);border-radius:14px;box-shadow:0 16px 44px rgba(15,23,42,.22);padding:12px;direction:ltr;font-family:'Plus Jakarta Sans','IBM Plex Sans Arabic',sans-serif;animation:scdp-in .14s ease}
@keyframes scdp-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.scdp-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.scdp-nav{width:32px;height:32px;border-radius:9px;border:1px solid var(--border,#e2e8f0);background:var(--surface-2,#f8fafc);color:var(--text,#0f172a);font-size:19px;cursor:pointer;line-height:1;display:flex;align-items:center;justify-content:center}
.scdp-nav:hover{border-color:var(--brand,#0d8a6f);color:var(--brand,#0d8a6f)}
.scdp-title{display:flex;gap:6px;flex:1}
.scdp-msel,.scdp-ysel{border:1px solid var(--border,#e2e8f0);border-radius:8px;padding:6px 6px;font-family:inherit;font-size:13px;font-weight:700;background:var(--surface,#fff);color:var(--text,#0f172a);cursor:pointer;outline:none}
.scdp-msel{flex:1.5}.scdp-ysel{flex:1}
.scdp-wd{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px}
.scdp-wd span{text-align:center;font-size:11px;font-weight:800;color:var(--text-3,#94a3b8);padding:4px 0}
.scdp-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.scdp-d{height:36px;border:none;background:transparent;border-radius:9px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:13.5px;font-weight:700;color:var(--text,#0f172a);cursor:pointer;padding:0}
.scdp-d.empty{visibility:hidden;cursor:default}
.scdp-d:hover:not(:disabled):not(.empty){background:var(--brand-50,#e8f5f1);color:var(--brand-700,#0a6b56)}
.scdp-d.today{box-shadow:inset 0 0 0 1.5px var(--brand,#0d8a6f)}
.scdp-d.sel{background:var(--brand,#0d8a6f);color:#fff}
.scdp-d:disabled{opacity:.3;cursor:not-allowed}
.scdp-foot{display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border,#e2e8f0)}
.scdp-tbtn{border:none;background:transparent;font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;padding:5px 10px;border-radius:8px}
.scdp-tbtn.go{color:var(--brand,#0d8a6f)}.scdp-tbtn.go:hover{background:var(--brand-50,#e8f5f1)}
.scdp-tbtn.cl{color:var(--text-3,#94a3b8)}.scdp-tbtn.cl:hover{background:var(--surface-2,#f8fafc);color:var(--text,#0f172a)}
`;
  const st = document.createElement('style'); st.id='scdp-style'; st.textContent = STYLE;
  (document.head||document.documentElement).appendChild(st);

  /* ---------- date helpers (English numerals, dd/mm/yyyy) ---------- */
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WD = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  function pad(n){ return (n<10?'0':'')+n; }
  function toISO(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function parseISO(s){ if(!s) return null; const m=/^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(s)); if(!m) return null; const d=new Date(+m[1],+m[2]-1,+m[3]); return isNaN(d.getTime())?null:d; }
  function fmt(s){ const d=parseISO(s); if(!d) return ''; return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear(); }
  const CAL_SVG = '<svg class="scdp-cal" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

  /* ---------- shared popup ---------- */
  let pop=null, curInput=null, curField=null, viewY=0, viewM=0;
  function ensurePopup(){
    if(pop) return pop;
    pop=document.createElement('div'); pop.className='scdp-pop'; pop.style.display='none';
    document.body.appendChild(pop);
    pop.addEventListener('click', onPopClick);
    pop.addEventListener('change', onPopChange);
    pop.addEventListener('mousedown', e=>e.stopPropagation());
    return pop;
  }
  function yearOptions(){ let o=''; for(let i=viewY-80;i<=viewY+10;i++) o+='<option value="'+i+'"'+(i===viewY?' selected':'')+'>'+i+'</option>'; return o; }
  function renderPop(){
    const sel = parseISO(curInput && curInput.value);
    const min = parseISO(curInput && curInput.getAttribute('min'));
    const max = parseISO(curInput && curInput.getAttribute('max'));
    const today = new Date(); today.setHours(0,0,0,0);
    const startDow = new Date(viewY, viewM, 1).getDay();
    const daysIn = new Date(viewY, viewM+1, 0).getDate();
    let cells='';
    for(let i=0;i<startDow;i++) cells+='<button type="button" class="scdp-d empty" disabled></button>';
    for(let day=1; day<=daysIn; day++){
      const cd=new Date(viewY, viewM, day); cd.setHours(0,0,0,0);
      let cls='scdp-d', dis=false;
      if(sel && cd.getTime()===sel.getTime()) cls+=' sel';
      if(cd.getTime()===today.getTime()) cls+=' today';
      if((min && cd<min)||(max && cd>max)) dis=true;
      cells+='<button type="button" class="'+cls+'" data-iso="'+toISO(cd)+'"'+(dis?' disabled':'')+'>'+day+'</button>';
    }
    pop.innerHTML =
      '<div class="scdp-head">'
      + '<button type="button" class="scdp-nav" data-nav="-1">&#8249;</button>'
      + '<div class="scdp-title">'
      +   '<select class="scdp-msel">'+MONTHS.map((m,i)=>'<option value="'+i+'"'+(i===viewM?' selected':'')+'>'+m+'</option>').join('')+'</select>'
      +   '<select class="scdp-ysel">'+yearOptions()+'</select>'
      + '</div>'
      + '<button type="button" class="scdp-nav" data-nav="1">&#8250;</button>'
      + '</div>'
      + '<div class="scdp-wd">'+WD.map(w=>'<span>'+w+'</span>').join('')+'</div>'
      + '<div class="scdp-grid">'+cells+'</div>'
      + '<div class="scdp-foot"><button type="button" class="scdp-tbtn go" data-act="today">Today</button><button type="button" class="scdp-tbtn cl" data-act="clear">Clear</button></div>';
  }
  function openFor(input, field){
    curInput=input; curField=field;
    const d=parseISO(input.value)||new Date();
    viewY=d.getFullYear(); viewM=d.getMonth();
    ensurePopup(); renderPop();
    pop.style.display='block';
    position(field);
    field.classList.add('open');
  }
  function closePop(){ if(pop) pop.style.display='none'; if(curField) curField.classList.remove('open'); curInput=null; curField=null; }
  function onPopChange(e){
    if(e.target.classList.contains('scdp-msel')){ viewM=+e.target.value; renderPop(); }
    else if(e.target.classList.contains('scdp-ysel')){ viewY=+e.target.value; renderPop(); }
  }
  function onPopClick(e){
    const nav=e.target.closest('[data-nav]');
    if(nav){ viewM+=+nav.dataset.nav; if(viewM<0){viewM=11;viewY--;} if(viewM>11){viewM=0;viewY++;} renderPop(); return; }
    const day=e.target.closest('.scdp-d[data-iso]');
    if(day && !day.disabled){ setValue(day.dataset.iso); closePop(); return; }
    const act=e.target.closest('[data-act]');
    if(act){ setValue(act.dataset.act==='today'?toISO(new Date()):''); closePop(); }
  }
  function setValue(iso){
    if(!curInput) return;
    curInput.value=iso;
    syncField(curInput);
    curInput.dispatchEvent(new Event('input',{bubbles:true}));
    curInput.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function position(field){
    const r=field.getBoundingClientRect();
    const ph=pop.offsetHeight||330, pw=pop.offsetWidth||288;
    let top=r.bottom+window.scrollY+6;
    if(r.bottom+ph>window.innerHeight && r.top-ph>0) top=r.top+window.scrollY-ph-6;
    let left=r.right+window.scrollX-pw;            // RTL-friendly: align right edges
    if(left<window.scrollX+6) left=r.left+window.scrollX;
    if(left+pw>window.scrollX+window.innerWidth-6) left=window.scrollX+window.innerWidth-pw-6;
    if(left<window.scrollX+6) left=window.scrollX+6;
    pop.style.top=top+'px'; pop.style.left=left+'px';
  }

  /* ---------- enhancement ---------- */
  function syncField(input){
    const wrap=input.closest('.scdp-wrap'); if(!wrap) return;
    const txt=wrap.querySelector('.scdp-txt');
    if(txt){ const v=fmt(input.value); txt.textContent=v||'dd/mm/yyyy'; txt.classList.toggle('ph', !v); }
  }
  function enhance(input){
    if(!input || input.getAttribute('data-scdp')==='1' || input.type!=='date') return;
    input.setAttribute('data-scdp','1');
    const wrap=document.createElement('span'); wrap.className='scdp-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    input.classList.add('scdp-native'); input.setAttribute('tabindex','-1'); input.setAttribute('aria-hidden','true');
    const field=document.createElement('button'); field.type='button'; field.className='scdp-field';
    const v=fmt(input.value);
    field.innerHTML=CAL_SVG+'<span class="scdp-txt'+(v?'':' ph')+'">'+(v||'dd/mm/yyyy')+'</span>';
    if(input.disabled) field.disabled=true;
    wrap.appendChild(field);
    field.addEventListener('click', function(){
      if(field.disabled) return;
      if(pop && pop.style.display!=='none' && curInput===input){ closePop(); return; }
      openFor(input, field);
    });
    // keep the visible field in sync if value is changed programmatically (dispatch change)
    input.addEventListener('change', ()=>syncField(input));
    input.addEventListener('input', ()=>syncField(input));
  }
  function scan(root){ try{ (root||document).querySelectorAll('input[type="date"]:not([data-scdp])').forEach(enhance); }catch(e){} }

  /* ---------- global close + boot ---------- */
  document.addEventListener('mousedown', e=>{ if(pop && pop.style.display!=='none' && !pop.contains(e.target) && !e.target.closest('.scdp-field')) closePop(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closePop(); });
  window.addEventListener('scroll', ()=>{ if(pop && pop.style.display!=='none') closePop(); }, true);
  window.addEventListener('resize', ()=>{ if(pop && pop.style.display!=='none') closePop(); });

  function boot(){
    scan(document);
    new MutationObserver(muts=>{
      for(const m of muts){
        for(const node of m.addedNodes){
          if(node.nodeType!==1) continue;
          if(node.matches && node.matches('input[type="date"]')) enhance(node);
          if(node.querySelectorAll) scan(node);
        }
      }
    }).observe(document.documentElement,{childList:true,subtree:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // expose minimal API
  window.SC = window.SC || {};
  window.SC.datepicker = { enhance, scan, format: fmt };
})();
