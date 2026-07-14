/*
 * Smart Code — Publishers Module (الناشرون)
 * طبقة بيانات الناشرين + مدير تكاملات المنصات
 * - يُشتق الناشرون من سجلات المؤثرين الحالية (مصدر واحد — بلا تكرار بيانات)
 * - التكاملات: حالة اتصال صادقة لكل منصة، لا نجاح وهمي أبداً
 */
(function(){
'use strict';
window.SC = window.SC || {};

/* ══════════════ 1) تعريف المنصات ══════════════ */
const PLATFORMS = {
  snapchat:  { label:'سناب شات',  icon:'snapchat',  color:'#FFFC00', text:'#0f172a', api:'Snapchat Creator Marketplace', docs:'https://marketingapi.snapchat.com', fields:['client_id','client_secret','refresh_token'], base:'https://adsapi.snapchat.com/v1/me' },
  tiktok:    { label:'تيك توك',   icon:'tiktok',    color:'#0f172a', text:'#fff',    api:'TikTok Creator Marketplace / TikTok API', docs:'https://developers.tiktok.com', fields:['client_key','client_secret','access_token'], base:'https://open.tiktokapis.com/v2/user/info/' },
  instagram: { label:'إنستقرام',  icon:'instagram', color:'#E1306C', text:'#fff',    api:'Meta Graph API', docs:'https://developers.facebook.com/docs/instagram-api', fields:['app_id','app_secret','access_token'], base:'https://graph.facebook.com/v19.0/me' },
  facebook:  { label:'فيسبوك',    icon:'users',     color:'#1877F2', text:'#fff',    api:'Meta Graph API', docs:'https://developers.facebook.com/docs/graph-api', fields:['app_id','app_secret','access_token'], base:'https://graph.facebook.com/v19.0/me' },
  x:         { label:'إكس',       icon:'x',         color:'#0f172a', text:'#fff',    api:'X API v2', docs:'https://developer.x.com', fields:['api_key','api_secret','bearer_token'], base:'https://api.x.com/2/users/me' },
  linkedin:  { label:'لينكدإن',   icon:'briefcase', color:'#0A66C2', text:'#fff',    api:'LinkedIn Marketing API', docs:'https://developer.linkedin.com', fields:['client_id','client_secret','access_token'], base:'https://api.linkedin.com/v2/me' },
  youtube:   { label:'يوتيوب',    icon:'play',      color:'#FF0000', text:'#fff',    api:'YouTube Data API v3', docs:'https://developers.google.com/youtube/v3', fields:['api_key'], base:'https://www.googleapis.com/youtube/v3/channels' }
};
// تطبيع أسماء المنصات القادمة من بيانات المؤثرين
const PLAT_ALIAS = { snap:'snapchat', snapchat:'snapchat', سناب:'snapchat', tiktok:'tiktok', تيكتوك:'tiktok', instagram:'instagram', insta:'instagram', انستقرام:'instagram', facebook:'facebook', فيسبوك:'facebook', twitter:'x', x:'x', تويتر:'x', youtube:'youtube', يوتيوب:'youtube', linkedin:'linkedin' };
function normPlat(n){ n=String(n||'').trim().toLowerCase(); return PLAT_ALIAS[n]||n; }

/* ══════════════ 2) مدير التكاملات ══════════════ */
const CFG_KEY='integrations_config', LOG_KEY='integrations_log';
function cfgAll(){ try{ return SC.data.get(CFG_KEY)||{}; }catch(e){ return {}; } }
function logAll(){ try{ return SC.data.get(LOG_KEY)||[]; }catch(e){ return []; } }
function pushLog(entry){ const l=logAll(); l.unshift(Object.assign({at:new Date().toISOString()},entry)); SC.data.set(LOG_KEY,l.slice(0,200)); }

const integrations = {
  PLATFORMS,
  config(p){ return (cfgAll()[p])||{}; },
  saveConfig(p,vals){ const all=cfgAll(); all[p]=Object.assign({},all[p]||{},vals,{updated_at:new Date().toISOString()}); SC.data.set(CFG_KEY,all); pushLog({platform:p,event:'config_saved',ok:true}); return all[p]; },
  clearConfig(p){ const all=cfgAll(); delete all[p]; SC.data.set(CFG_KEY,all); pushLog({platform:p,event:'config_cleared',ok:true}); },
  /** حالة صادقة: disconnected | configured | connected | error */
  status(p){
    const c=this.config(p), def=PLATFORMS[p];
    if(!def) return {state:'unknown',label:'غير معروف'};
    const hasAll=def.fields.every(f=>String(c[f]||'').trim());
    if(!hasAll) return {state:'disconnected',label:'غير متصل — يتطلب مفاتيح من المالك',color:'#94a3b8'};
    if(c.last_test_ok) return {state:'connected',label:'متصل — آخر فحص ناجح '+String(c.last_test_at||'').slice(0,16).replace('T',' '),color:'#16a34a'};
    if(c.last_test_ok===false) return {state:'error',label:'خطأ اتصال — '+(c.last_test_error||'فشل الفحص'),color:'#dc2626'};
    return {state:'configured',label:'المفاتيح محفوظة — لم يُفحص الاتصال بعد',color:'#d97706'};
  },
  /** فحص فعلي — لا يدّعي النجاح: يحاول الطلب ويسجّل النتيجة الحقيقية */
  async testConnection(p){
    const def=PLATFORMS[p], c=this.config(p);
    if(!def) throw new Error('منصة غير معروفة');
    const missing=def.fields.filter(f=>!String(c[f]||'').trim());
    if(missing.length){ const e='حقول ناقصة: '+missing.join('، '); this.saveConfig(p,{last_test_ok:false,last_test_error:e,last_test_at:new Date().toISOString()}); pushLog({platform:p,event:'test',ok:false,error:e}); return {ok:false,error:e}; }
    try{
      const ctrl=new AbortController(); const to=setTimeout(()=>ctrl.abort(),8000);
      const headers={}; if(c.access_token||c.bearer_token) headers['Authorization']='Bearer '+(c.access_token||c.bearer_token);
      const res=await fetch(def.base,{headers,signal:ctrl.signal}); clearTimeout(to);
      const ok=res.ok;
      const err=ok?'':('HTTP '+res.status+(res.status===401?' — رمز الوصول غير صالح أو منتهٍ':''));
      this.saveConfig(p,{last_test_ok:ok,last_test_error:err,last_test_at:new Date().toISOString()});
      pushLog({platform:p,event:'test',ok,error:err});
      return {ok,error:err};
    }catch(err){
      // غالباً CORS من المتصفح — الرد الصادق: الفحص يجب أن يتم عبر خادم النظام (Laravel)
      const e='تعذّر الاتصال من المتصفح مباشرة (CORS/شبكة). فحص الاتصال الفعلي يتم من خادم النظام بعد ضبط المفاتيح في بيئة الإنتاج.';
      this.saveConfig(p,{last_test_ok:false,last_test_error:e,last_test_at:new Date().toISOString()});
      pushLog({platform:p,event:'test',ok:false,error:e});
      return {ok:false,error:e};
    }
  },
  /** مزامنة بيانات منصة — تعمل فقط عند اتصال حقيقي؛ وإلا تسجّل فشلاً صريحاً */
  async sync(p){
    const st=this.status(p);
    if(st.state!=='connected'){ pushLog({platform:p,event:'sync',ok:false,error:'المنصة غير متصلة — لا مزامنة وهمية'}); return {ok:false,error:st.label}; }
    pushLog({platform:p,event:'sync',ok:false,error:'المزامنة الكاملة تتطلب تشغيل مهمة الخادم (Cron) — مجدولة في الخلفية'});
    return {ok:false,error:'تُنفَّذ المزامنة من خادم النظام دورياً'};
  },
  log(limit){ return logAll().slice(0,limit||50); },
  connectedCount(){ return Object.keys(PLATFORMS).filter(p=>this.status(p).state==='connected').length; }
};

/* ══════════════ 3) طبقة الناشرين ══════════════ */
function parseGender(gr){ // "70% إناث" → {female:70,male:30}
  const m=String(gr||'').match(/(\d+)\s*%/); if(!m) return null;
  const v=Math.min(100,Number(m[1])); const isF=/إناث|أنث/.test(gr);
  return isF?{female:v,male:100-v}:{male:v,female:100-v};
}
const AGE_BANDS=['13-17','18-24','25-34','35-44','45+'];
function normAge(a){ a=String(a||'').replace(/\s/g,''); if(/25-34|25–34/.test(a))return'25-34'; if(/18-24/.test(a))return'18-24'; if(/35-44/.test(a))return'35-44'; if(/13-17/.test(a))return'13-17'; if(/45|\+/.test(a))return'45+'; return null; }
function enrich(inf){
  const plats={};
  (inf.platforms||[]).forEach(pl=>{
    const key=normPlat(pl.platform_name); if(!key) return;
    const cur=plats[key]||{platform:key,followers:0,views:0,url:pl.url||'',services:[]};
    cur.followers+=Number(pl.subs)||0; cur.views+=Number(pl.views)||0;
    if(!cur.url&&pl.url) cur.url=pl.url;
    [['إعلان هوم','home_sell'],['تغطية','cov_sell']].forEach(([lbl,k])=>{ const v=Number(pl[k])||0; if(v>0) cur.services.push({label:lbl,price:v}); });
    plats[key]=cur;
  });
  const platforms=Object.values(plats).sort((a,b)=>b.followers-a.followers);
  const followers=platforms.reduce((s,p)=>s+p.followers,0);
  const gender=parseGender(inf.gender_ratio);
  const topAge=normAge(inf.audience_age);
  const saudiPct=/سعود/.test(inf.nationality||'')?77:55; // تقديري حتى الربط الفعلي
  return {
    id:inf.id, name:inf.name, category:inf.category||'—', all_categories:inf.all_categories||'',
    city:inf.city||'', region:inf.region||'', nationality:inf.nationality||'', gender:inf.gender||'',
    classification:inf.classification||'', show_face:!!inf.show_face, rating:inf.rating||'',
    phone:inf.phone||'', status:inf.status||'active',
    platforms, followers, engagement:Number(inf.engagement_rate)||0,
    total_campaigns:Number(inf.total_campaigns)||Number(inf.order_count)||0,
    audience:{
      gender, topAge,
      ageDist: topAge?AGE_BANDS.map(b=>({band:b,pct:b===topAge?41:(b==='18-24'?22:b==='35-44'?18:b==='13-17'?9:10)})):null,
      countries:[{name:'المملكة العربية السعودية',pct:saudiPct,flag:'sa'},{name:'الإمارات',pct:3,flag:'ae'},{name:'الكويت',pct:2,flag:'kw'},{name:'بلدان أخرى',pct:100-saudiPct-5,flag:''}],
      estimated:true, source:'بيانات مُدخلة يدوياً + تقدير — تُستبدل ببيانات المنصة الفعلية عند الربط'
    },
    _raw:inf
  };
}

const publishers = {
  PLATFORMS, AGE_BANDS,
  list(filters){
    filters=filters||{};
    let rows=(SC.api.influencers.list()||[]).map(enrich);
    if(filters.q){ const q=filters.q.toLowerCase(); rows=rows.filter(r=>(r.name+' '+r.category+' '+r.city+' '+r.all_categories).toLowerCase().includes(q)); }
    if(filters.platform) rows=rows.filter(r=>r.platforms.some(p=>p.platform===filters.platform));
    if(filters.category) rows=rows.filter(r=>r.category===filters.category||String(r.all_categories).includes(filters.category));
    if(filters.city) rows=rows.filter(r=>r.city===filters.city);
    if(filters.gender) rows=rows.filter(r=>r.gender===filters.gender);
    if(filters.age) rows=rows.filter(r=>r.audience.topAge===filters.age);
    if(filters.minFollowers) rows=rows.filter(r=>r.followers>=Number(filters.minFollowers));
    if(filters.maxFollowers) rows=rows.filter(r=>r.followers<=Number(filters.maxFollowers));
    if(filters.minEngagement) rows=rows.filter(r=>r.engagement>=Number(filters.minEngagement));
    if(filters.showFace==='yes') rows=rows.filter(r=>r.show_face);
    if(filters.showFace==='no') rows=rows.filter(r=>!r.show_face);
    const sort=filters.sort||'followers';
    rows.sort((a,b)=>sort==='engagement'?b.engagement-a.engagement:sort==='campaigns'?b.total_campaigns-a.total_campaigns:sort==='name'?String(a.name).localeCompare(b.name,'ar'):b.followers-a.followers);
    return rows;
  },
  get(id){ const inf=SC.api.influencers.get?SC.api.influencers.get(id):(SC.api.influencers.list()||[]).find(x=>x.id===id); return inf?enrich(inf):null; },
  facets(){
    const all=(SC.api.influencers.list()||[]);
    const uniq=a=>[...new Set(a.filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y),'ar'));
    return { categories:uniq(all.map(i=>i.category)), cities:uniq(all.map(i=>i.city)) };
  },
  stats(rows){
    rows=rows||this.list();
    const followers=rows.reduce((s,r)=>s+r.followers,0);
    const withEng=rows.filter(r=>r.engagement>0);
    const avgEng=withEng.length?(withEng.reduce((s,r)=>s+r.engagement,0)/withEng.length):0;
    const byPlat={}; rows.forEach(r=>r.platforms.forEach(p=>{ byPlat[p.platform]=byPlat[p.platform]||{publishers:0,followers:0}; byPlat[p.platform].publishers++; byPlat[p.platform].followers+=p.followers; }));
    return { total:rows.length, followers, avgEngagement:Math.round(avgEng*10)/10, byPlatform:byPlat, connected:integrations.connectedCount(), showFace:rows.filter(r=>r.show_face).length };
  },
  /** سجل الحملات والترشيحات الفعلي لهذا الناشر من بيانات النظام */
  history(id){
    const out=[];
    try{
      (SC.api.campaigns.list()||[]).forEach(c=>{
        const noms=(SC.api.campaign_nominations&&SC.api.campaign_nominations.list(c.id))||[];
        noms.filter(n=>n.influencer_id===id).forEach(n=>out.push({type:'nomination',campaign_id:c.id,campaign:c.name||c.title||c.id,status:n.internal_status||n.status||'—',at:n.created_at||c.created_at||''}));
      });
    }catch(e){}
    try{
      (SC.api.transfers.list()||[]).forEach(t=>{ if(t.influencer_id===id||((t.recipients||[]).some(r=>r.influencer_id===id))) out.push({type:'transfer',campaign_id:t.campaign_id||'',campaign:t.title||t.id,status:t.status||'—',amount:t.amount,at:t.created_at||''}); });
    }catch(e){}
    return out.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  },
  exportRows(rows){
    return rows.map(r=>({ 'المعرف':r.id,'الاسم':r.name,'المجال':r.category,'المدينة':r.city,'الجنس':r.gender,'إجمالي المتابعين':r.followers,'نسبة التفاعل %':r.engagement,'عدد الحملات':r.total_campaigns,'المنصات':r.platforms.map(p=>PLATFORMS[p.platform]?PLATFORMS[p.platform].label+' ('+p.followers.toLocaleString('en-US')+')':p.platform).join(' · '),'الفئة العمرية الأعلى':r.audience.topAge||'','التصنيف':r.classification,'يظهر وجهه':r.show_face?'نعم':'لا' }));
  }
};

SC.api=SC.api||{};
SC.api.publishers=publishers;
SC.integrations=integrations;
window.SC_DEBUG&&console.log('Smart Code Publishers module loaded');
})();
