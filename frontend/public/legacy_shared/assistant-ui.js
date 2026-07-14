/* ============================================================
   Smart Code — المساعد الذكي المدمج (Console احترافي بهيئة شات)
   صندوق بالأعلى: هوية المساعد + «ما يحتاج إجراءً» + محادثة فعلية
   + مشغّل عائم للوصول السريع. مرتبط بـ SC.api.assistant
   ============================================================ */
(function () {
  'use strict';
  if (window.__SC_ASSISTANT_UI__) return;
  window.__SC_ASSISTANT_UI__ = true;
  window.SC = window.SC || {};

  const AS  = () => (window.SC.api && window.SC.api.assistant) || window.SC.assistant;
  const AUTH = () => window.SC.auth;

  const LEVEL_COLOR = { alert:'#dc2626', suggest:'#d97706', info:'#0d8a6f' };
  const SCOPE_LABEL = { dashboard:'نظرة عامة على النظام', campaign:'هذه الحملة', client:'هذا العميل', influencer:'هذا المؤثر', finance:'الوضع المالي' };
  const SUBTITLE = 'مساعدك التشغيلي الذكي';
  let panelOpen = false, curScope = 'dashboard', curId = null;

  function icon(n){ return '<svg class="ai-ic" width="16" height="16"><use href="#i-'+n+'"></use></svg>'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function itemHref(route,id){ return route && /=$/.test(route) ? route+encodeURIComponent(id) : (route||'#'); }
  function firstName(){ try{ const s=AUTH()&&AUTH().getSession&&AUTH().getSession(); const n=(s&&(s.name||s.username))||''; return n.split(' ')[0]||''; }catch(e){ return ''; } }
  function todayLabel(){ try{ return new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',calendar:'gregory'}); }catch(e){ return ''; } }
  function ready(cb){ const d=window.SC&&window.SC.data; if(d&&d.ready&&d.ready.then) d.ready.then(cb).catch(cb); else cb(); }

  /* ---------------- الأنماط ---------------- */
  function injectStyles(){
    if (document.getElementById('ai-assistant-styles')) return;
    const css = `
    .ai-console{background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);border-radius:18px;margin-bottom:18px;overflow:hidden;box-shadow:0 2px 14px rgba(15,23,42,.05)}
    .ai-con-head{display:flex;align-items:center;gap:13px;padding:15px 18px;background:linear-gradient(120deg,rgba(124,58,237,.10),rgba(13,138,111,.07))}
    .ai-con-av{width:44px;height:44px;border-radius:13px;background:linear-gradient(135deg,#7c3aed,#0d8a6f);display:grid;place-items:center;color:#fff;flex-shrink:0;box-shadow:0 4px 12px rgba(124,58,237,.3)}
    .ai-con-av svg{width:23px;height:23px}
    .ai-con-id{flex:1;min-width:0}
    .ai-con-id .t{font-weight:800;font-size:15.5px;color:var(--text,#111);font-family:var(--font-display,inherit);line-height:1.2}
    .ai-con-id .s{font-size:11.5px;color:var(--text-3,#9ca3af);margin-top:3px}
    .ai-con-ctx{font-size:11px;color:var(--text-2,#6b7280);background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);padding:4px 11px;border-radius:99px;white-space:nowrap;font-weight:600}
    .ai-con-body{padding:15px 18px}
    .ai-greet{margin-bottom:14px;line-height:1.6}
    .ai-greet .g1{font-size:15px;color:var(--text,#111);font-weight:700;font-family:var(--font-display,inherit)}
    .ai-greet .g1 b{color:#7c3aed}
    .ai-greet .gdate{font-size:11.5px;color:var(--text-3,#9ca3af);font-weight:500;margin-inline-start:6px}
    .ai-greet .g2{font-size:13px;color:var(--text-2,#6b7280);margin-top:3px}
    .ai-greet .g2 b{color:#dc2626}
    .ai-act-h{font-size:12px;font-weight:800;color:var(--text-2,#374151);margin-bottom:10px;display:flex;align-items:center;gap:7px}
    .ai-act-h .cnt{background:#dc2626;color:#fff;font-size:11px;padding:1px 9px;border-radius:99px;font-weight:800;font-family:var(--font-mono,monospace)}
    .ai-act-h .ok{background:#0d8a6f}
    .ai-acts{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:9px;margin-bottom:15px}
    .ai-act{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border-radius:12px;border:1px solid var(--border,#e5e7eb);background:var(--bg,#fff);text-decoration:none;transition:border-color .15s,transform .12s;position:relative}
    .ai-act:hover{transform:translateY(-1px);border-color:var(--c,#7c3aed)}
    .ai-act .aic{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;flex-shrink:0}
    .ai-act .aic svg{width:16px;height:16px}
    .ai-act .atx{flex:1;min-width:0}
    .ai-act .att{font-size:12.5px;font-weight:700;color:var(--text,#111);line-height:1.4}
    .ai-act .ade{font-size:11px;color:var(--text-3,#9ca3af);margin-top:2px;line-height:1.45}
    .ai-act .ago{position:absolute;inset-block-start:11px;inset-inline-end:12px;color:var(--c,#7c3aed);font-size:15px;opacity:.5}
    .ai-thread{display:flex;flex-direction:column;gap:9px;max-height:320px;overflow-y:auto;margin-bottom:12px;padding-inline-end:2px}
    .ai-thread:empty{display:none}
    .ai-msg{padding:10px 13px;border-radius:13px;font-size:13px;line-height:1.7;white-space:pre-wrap;word-break:break-word}
    .ai-msg.u{background:#7c3aed;color:#fff;align-self:flex-end;max-width:82%;border-end-end-radius:4px}
    .ai-msg.a{background:var(--gray-50,#f1f5f9);color:var(--text,#111);align-self:flex-start;max-width:92%;border-end-start-radius:4px}
    .ai-reslist{display:flex;flex-direction:column;gap:3px;margin-top:7px}
    .ai-reslist a{color:#0d8a6f;font-weight:700;text-decoration:none;font-size:12.5px;display:flex;gap:6px}
    .ai-reslist a .sub{color:var(--text-3,#9ca3af);font-weight:400;font-size:11px}
    .ai-reslist .grp{font-size:11px;font-weight:800;color:var(--text-3,#9ca3af);margin-top:5px}
    .ai-ask{display:flex;gap:9px;align-items:center;background:var(--gray-50,#f8fafc);border:1px solid var(--border,#e5e7eb);border-radius:14px;padding:6px 7px 6px 15px}
    .ai-ask:focus-within{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
    .ai-ask input{flex:1;border:none;background:transparent;font-family:inherit;font-size:13.5px;color:var(--text,#111);outline:none;min-width:0}
    .ai-ask .snd{background:linear-gradient(135deg,#7c3aed,#0d8a6f);color:#fff;border:none;width:38px;height:38px;border-radius:11px;cursor:pointer;display:grid;place-items:center;flex-shrink:0}
    .ai-ask .snd svg{width:18px;height:18px}
    .ai-quick{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}
    .ai-qchip{background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);border-radius:99px;padding:6px 13px;font-size:12px;cursor:pointer;color:var(--text-2,#374151);font-family:inherit;font-weight:600}
    .ai-qchip:hover{background:#7c3aed;color:#fff;border-color:#7c3aed}
    .ai-typing{font-size:12px;color:var(--text-3,#9ca3af)}
    #ai-fab{position:fixed;inset-block-end:22px;inset-inline-end:22px;z-index:9000;width:52px;height:52px;border-radius:50%;
      background:linear-gradient(135deg,#7c3aed,#0d8a6f);color:#fff;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(124,58,237,.4);display:grid;place-items:center;transition:transform .15s}
    #ai-fab:hover{transform:scale(1.08)}
    #ai-fab svg{width:24px;height:24px}
    #ai-fab .dot{position:absolute;inset-block-start:-3px;inset-inline-end:-3px;min-width:20px;height:20px;padding:0 5px;border-radius:11px;background:#dc2626;border:2px solid #fff;color:#fff;font-size:11px;font-weight:800;display:grid;place-items:center;font-family:var(--font-mono,monospace)}
    #ai-panel{position:fixed;inset-block-end:84px;inset-inline-end:22px;z-index:9001;width:min(420px,calc(100vw - 32px));max-height:min(640px,calc(100vh - 130px));
      background:var(--surface,#fff);border:1px solid var(--border,#e5e7eb);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;font-family:var(--font-sans,inherit)}
    #ai-panel.open{display:flex}
    .ai-ph{background:linear-gradient(135deg,#7c3aed,#0d8a6f);color:#fff;padding:14px 16px;display:flex;align-items:center;gap:10px}
    .ai-ph .ttl{font-weight:800;font-size:15px}.ai-ph .sub{font-size:11px;opacity:.9}
    .ai-ph .x{margin-inline-start:auto;background:rgba(255,255,255,.18);border:none;color:#fff;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:18px}
    .ai-pbody{padding:13px;overflow-y:auto;flex:1}
    .ai-pfoot{padding:9px 13px;border-top:1px solid var(--border,#e5e7eb);font-size:11px;color:var(--text-3,#9ca3af);display:flex;align-items:center;gap:6px}
    @media(max-width:560px){.ai-acts{grid-template-columns:1fr}#ai-panel{inset-inline:12px;width:auto}}
    `;
    const st=document.createElement('style'); st.id='ai-assistant-styles'; st.textContent=css; document.head.appendChild(st);
  }

  /* ---------- عرض الرسائل ---------- */
  function addMsg(thread, role, html){
    if(!thread) return null;
    const d=document.createElement('div'); d.className='ai-msg '+(role==='u'?'u':'a'); d.innerHTML=html;
    thread.appendChild(d); thread.scrollTop=thread.scrollHeight; return d;
  }
  function searchListHtml(d){
    if(!d||!d.groups||!d.groups.length) return '';
    return '<div class="ai-reslist">'+d.groups.map(g=>'<div class="grp">'+esc(g.label)+' ('+g.count+')</div>'+
      g.items.map(it=>'<a href="'+itemHref(g.route,it.id)+'">▸ '+esc(it.name)+(it.sub?' <span class="sub">'+esc(it.sub)+'</span>':'')+'</a>').join('')).join('')+'</div>';
  }
  async function runQuery(thread, q){
    q=(q||'').trim(); if(!q) return;
    const A=AS(); if(!A){ addMsg(thread,'a','المساعد غير محمّل.'); return; }
    if(q==='__report'){ addMsg(thread,'u','📄 تقرير ذكي'); try{ addMsg(thread,'a',esc(A.buildReport(curScope,curId))); }catch(e){ addMsg(thread,'a','تعذّر إنشاء التقرير.'); } return; }
    addMsg(thread,'u',esc(q));
    const typing=addMsg(thread,'a','<span class="ai-typing">… يحلّل بيانات النظام</span>');
    try{
      const res=await A.ask(q,{scope:curScope,id:curId});
      if(typing) typing.remove();
      const sd=res.local&&res.local.kind==='search'?res.local.data:null;
      addMsg(thread,'a',esc(res.answer||'—')+searchListHtml(sd));
    }catch(e){ if(typing) typing.remove(); addMsg(thread,'a','تعذّر التنفيذ: '+esc(e.message||'خطأ')); }
  }

  /* ---------------- صندوق المساعد الاحترافي ---------------- */
  function actionCard(it){
    const c=LEVEL_COLOR[it.level]||LEVEL_COLOR.info;
    const inner='<div class="aic" style="background:'+c+'1a;color:'+c+'">'+icon(it.icon||'info')+'</div>'+
      '<div class="atx"><div class="att">'+esc(it.title)+'</div>'+(it.detail?'<div class="ade">'+esc(it.detail)+'</div>':'')+'</div>'+
      (it.href?'<span class="ago">‹</span>':'');
    return it.href ? '<a class="ai-act" style="--c:'+c+'" href="'+it.href+'">'+inner+'</a>'
                   : '<div class="ai-act" style="--c:'+c+'">'+inner+'</div>';
  }
  function renderConsole(scope, id, anchorEl){
    injectStyles();
    scope = scope || curScope; id = (id!==undefined)?id:curId;
    let ins=[]; try{ ins=(AS()&&AS().getInsights(scope,id))||[]; }catch(e){}
    const prev=document.getElementById('ai-console-box'); if(prev) prev.remove();

    const actionable=ins.filter(i=>i.level!=='info');
    const nm=firstName(), date=todayLabel();
    const ctxLabel=SCOPE_LABEL[scope]||'النظام';
    const g2 = actionable.length
      ? ('لديك <b>'+actionable.length+'</b> '+(actionable.length===1?'بند يحتاج':'بنود تحتاج')+' إجراءً الآن')
      : 'كل العمليات تحت السيطرة — لا بنود عاجلة';

    const box=document.createElement('div');
    box.className='ai-console'; box.id='ai-console-box';
    box.innerHTML =
      '<div class="ai-con-head">'
        +'<div class="ai-con-av">'+icon('zap')+'</div>'
        +'<div class="ai-con-id"><div class="t">المساعد الذكي</div><div class="s">'+SUBTITLE+'</div></div>'
        +'<div class="ai-con-ctx">'+esc(ctxLabel)+'</div>'
      +'</div>'
      +'<div class="ai-con-body">'
        +'<div class="ai-greet"><div class="g1">'+(nm?('مرحباً <b>'+esc(nm)+'</b> 👋'):'أهلاً بك 👋')+(date?'<span class="gdate">'+esc(date)+'</span>':'')+'</div><div class="g2">'+g2+'</div></div>'
        +(ins.length?(
            '<div class="ai-act-h">'+icon('zap')+'<span>ما يحتاج إجراءً</span>'+(actionable.length?'<span class="cnt">'+actionable.length+'</span>':'<span class="cnt ok">✓</span>')+'</div>'
            +'<div class="ai-acts">'+ins.map(actionCard).join('')+'</div>'
          ):'')
        +'<div class="ai-thread" id="ai-con-thread"></div>'
        +'<div class="ai-ask"><input id="ai-con-input" type="text" placeholder="اسأل المساعد: ابحث عن عميل/مؤثر/حملة، أو اطلب ملخصاً أو تقريراً…" autocomplete="off"><button class="snd" id="ai-con-send" title="إرسال">'+icon('send')+'</button></div>'
        +'<div class="ai-quick">'
          +'<button class="ai-qchip" data-q="__report">📄 تقرير ذكي</button>'
          +'<button class="ai-qchip" data-q="الحملات المتعثرة">⚠️ التعثرات</button>'
          +'<button class="ai-qchip" data-q="الوضع المالي">💰 المالية</button>'
        +'</div>'
      +'</div>';

    const anchor=anchorEl||document.getElementById('content');
    const host=anchor?anchor.parentElement:(document.querySelector('main')||document.body);
    if(anchor) host.insertBefore(box,anchor); else host.insertBefore(box,host.firstChild);

    const thread=box.querySelector('#ai-con-thread');
    const input=box.querySelector('#ai-con-input');
    const send=()=>{ const v=input.value; input.value=''; runQuery(thread,v); };
    box.querySelector('#ai-con-send').onclick=send;
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });
    box.querySelectorAll('.ai-qchip').forEach(c=>c.onclick=()=>runQuery(thread,c.getAttribute('data-q')));
    return box;
  }

  /* ---------------- المشغّل العائم + اللوحة ---------------- */
  function stallCount(){ try{ const s=AS().detectStalls(); return (s.campaigns?s.campaigns.length:0)+(s.approvals||0)+(s.bookings||0)+(s.collections||0)+(s.payments||0)+(s.tasks||0); }catch(e){ return 0; } }
  function mountLauncher(){
    if(document.getElementById('ai-fab')) return;
    injectStyles();
    const n=stallCount();
    const fab=document.createElement('button');
    fab.id='ai-fab'; fab.title='المساعد الذكي';
    fab.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="11" rx="2.5"/><path d="M12 8V4"/><circle cx="12" cy="3" r="1.4" fill="currentColor"/><circle cx="9" cy="13" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M9.5 16.3h5"/></svg>'+(n>0?'<span class="dot">'+(n>99?'99+':n)+'</span>':'');
    fab.onclick=()=>panelOpen?closePanel():openPanel();
    document.body.appendChild(fab);
  }
  function openPanel(){
    let p=document.getElementById('ai-panel');
    if(!p){ p=document.createElement('div'); p.id='ai-panel'; document.body.appendChild(p); }
    p.innerHTML='<div class="ai-ph">'+icon('zap')+'<div><div class="ttl">المساعد الذكي</div><div class="sub">'+SUBTITLE+'</div></div><button class="x" id="ai-px">×</button></div>'
      +'<div class="ai-pbody"><div class="ai-thread" id="ai-panel-thread"></div>'
      +'<div class="ai-ask" style="margin-top:6px"><input id="ai-pin" type="text" placeholder="ابحث أو اسأل…" autocomplete="off"><button class="snd" id="ai-psnd">'+icon('send')+'</button></div>'
      +'<div class="ai-quick"><button class="ai-qchip" data-q="__report">📄 تقرير</button><button class="ai-qchip" data-q="الحملات المتعثرة">⚠️ التعثرات</button><button class="ai-qchip" data-q="الوضع المالي">💰 المالية</button></div></div>'
      +'<div class="ai-pfoot">'+icon('shield')+'<span>رؤى وإجراءات فورية من بيانات نظامك.</span></div>';
    p.classList.add('open'); panelOpen=true;
    const fab=document.getElementById('ai-fab'); const dot=fab&&fab.querySelector('.dot'); if(dot) dot.remove();
    const thread=p.querySelector('#ai-panel-thread'); const input=p.querySelector('#ai-pin');
    const send=()=>{ const v=input.value; input.value=''; runQuery(thread,v); };
    p.querySelector('#ai-px').onclick=closePanel;
    p.querySelector('#ai-psnd').onclick=send;
    input.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });
    p.querySelectorAll('.ai-qchip').forEach(c=>c.onclick=()=>runQuery(thread,c.getAttribute('data-q')));
    addMsg(thread,'a','مرحباً 👋 اسألني عن أي حملة أو عميل أو مؤثر، أو اطلب «الحملات المتعثرة» أو «تقرير».');
    setTimeout(()=>{ try{ input.focus(); }catch(e){} },50);
  }
  function closePanel(){ const p=document.getElementById('ai-panel'); if(p) p.classList.remove('open'); panelOpen=false; }

  /* ---------------- تهيئة تلقائية ---------------- */
  const PAGE_SCOPE = {
    'dashboard.html':['dashboard',false], 'campaign-detail.html':['campaign',true],
    'customer-detail.html':['client',true], 'influencer-detail.html':['influencer',true],
    'finance.html':['finance',false], 'orders-campaigns.html':['dashboard',false]
  };
  function autoInit(){
    if(!AS()) return;
    const path=(location.pathname.split('/').pop()||'').toLowerCase();
    const map=PAGE_SCOPE[path];
    if(map){ curScope=map[0]; curId=map[1]?new URLSearchParams(location.search).get('id'):null; }
    ready(function(){
      mountLauncher();
      // الصندوق المدمج بالأعلى أُزيل بناءً على الطلب — يبقى المشغّل العائم للوصول السريع.
      // (renderConsole ما زالت متاحة للاستدعاء اليدوي عند الحاجة مستقبلاً)
    });
  }

  window.SC.assistantUI={ mountLauncher, openPanel, closePanel, renderConsole, renderInsights:renderConsole, autoInit };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(autoInit,250));
  else setTimeout(autoInit,250);
})();
