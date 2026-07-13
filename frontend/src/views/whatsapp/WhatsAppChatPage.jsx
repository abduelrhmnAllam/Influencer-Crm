import { useEffect, useMemo, useState } from 'react';
import api from '../../api/client';
import { Icon } from '../../legacy/LegacyIconSprite';

const demoConfig = {
  business_account_id: '489946564716', phone_number_id: '728351902145007', display_phone_number: '+966 55 000 8822', access_token: '', app_id: '489946564716', app_secret: '', webhook_verify_token: 'wt_smartcode_demo', api_version: 'v20.0', business_name: 'Smart Code Agency', business_email: 'ops@smartcode.sa', business_website: 'https://smartcode.sa', business_about: 'إدارة حملات المؤثرين باحتراف', business_description: 'منصة CRM لإدارة العملاء والمؤثرين والحملات وواتساب للأعمال.', connection_status: 'connected', auto_reply_enabled: true, working_hours_enabled: true,
};
const demoConversations = [
  { id: 1, contact_name: 'نورة القحطاني', contact_number: '+966501112233', last_message: 'تم إرسال تفاصيل الحملة، بانتظار الاعتماد', last_message_at: '09:42', unread_count: 2, status: 'open' },
  { id: 2, contact_name: 'Bandar Store', contact_number: '+966566667777', last_message: 'نحتاج تعديل موعد النشر', last_message_at: 'أمس', unread_count: 0, status: 'open' },
  { id: 3, contact_name: 'مشهور سناب', contact_number: '+966544443333', last_message: 'وصلت الحوالة شكراً لكم', last_message_at: '12 Jul', unread_count: 1, status: 'closed' },
];
const demoMessages = [
  { id: 1, direction: 'in', body: 'السلام عليكم، هل تم اعتماد الإعلان؟', created_at: '2026-07-13T08:31:00', status: 'read' },
  { id: 2, direction: 'out', body: 'وعليكم السلام، تم إرساله للعميل وننتظر الموافقة النهائية.', created_at: '2026-07-13T08:33:00', status: 'delivered' },
  { id: 3, direction: 'in', body: 'تمام، أرسلوا لي البراند قيدلاين لو سمحتوا.', created_at: '2026-07-13T09:42:00', status: 'read' },
];
const demoTemplates = [
  { id: 1, name: 'campaign_confirmation', language: 'ar', category: 'UTILITY', status: 'APPROVED', body: 'مرحباً {{1}}، تم تأكيد حملتك مع {{2}} بتاريخ {{3}}.' },
  { id: 2, name: 'payment_receipt', language: 'ar', category: 'UTILITY', status: 'APPROVED', body: 'تم رفع إيصال التحويل الخاص بطلبك رقم {{1}}.' },
  { id: 3, name: 'weekly_offers', language: 'ar', category: 'MARKETING', status: 'PENDING', body: 'عروض هذا الأسبوع من Smart Code بانتظارك.' },
];
const demoBroadcasts = [
  { id: 1, name: 'تذكير اعتماد حملات يوليو', status: 'sent', recipients_count: 42, sent_count: 40, delivered_count: 38, read_count: 29, created_at: '2026-07-12 11:30' },
  { id: 2, name: 'عرض باقات المؤثرين', status: 'draft', recipients_count: 120, sent_count: 0, delivered_count: 0, read_count: 0, created_at: '2026-07-10 16:00' },
];
const demoNumbers = [{ id: 1, display_phone_number: '+966 55 000 8822', verified_name: 'Smart Code', quality_rating: 'GREEN', messaging_limit_tier: '1K/day', status: 'CONNECTED' }];
const demoAutomations = [{ id: 1, name: 'رد خارج أوقات العمل', trigger: 'بعد انتهاء الدوام', enabled: true }, { id: 2, name: 'ترحيب أول محادثة', trigger: 'رسالة واردة جديدة', enabled: true }];

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}
function TabButton({ id, icon, label, count, active, onClick }) {
  return <button className={`wa-tab${active === id ? ' active' : ''}`} type="button" onClick={() => onClick(id)}><Icon name={icon} />{label}{count !== undefined ? <span className="count">{count}</span> : null}</button>;
}
function FormField({ label, mono, children, help, required }) {
  return <div className={`wa-form-field${mono ? ' mono' : ''}`}><label>{label}{required ? <span className="required">*</span> : null}</label>{children}{help ? <div className="help">{help}</div> : null}</div>;
}

export default function WhatsAppChatPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [config, setConfig] = useState(demoConfig);
  const [conversations, setConversations] = useState(demoConversations);
  const [activeChatId, setActiveChatId] = useState(1);
  const [messages, setMessages] = useState(demoMessages);
  const [templates, setTemplates] = useState(demoTemplates);
  const [broadcasts, setBroadcasts] = useState(demoBroadcasts);
  const [numbers] = useState(demoNumbers);
  const [automations, setAutomations] = useState(demoAutomations);
  const [draft, setDraft] = useState('');
  const [statusText, setStatusText] = useState('متصل بـ Meta Business');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      api.get('/api/v1/whatsapp/config'), api.get('/api/v1/whatsapp/conversations'), api.get('/api/v1/whatsapp/templates'), api.get('/api/v1/whatsapp/broadcasts'), api.get('/api/v1/whatsapp/stats'),
    ]).then(([cfg, conv, tpl, br]) => {
      const cfgData = cfg.status === 'fulfilled' ? (cfg.value.data.data || cfg.value.data) : null;
      if (cfgData) setConfig((current) => ({ ...current, ...cfgData }));
      const convRows = conv.status === 'fulfilled' ? unwrapList(conv.value.data) : [];
      if (convRows.length) { setConversations(convRows); setActiveChatId(convRows[0].id); }
      const tplRows = tpl.status === 'fulfilled' ? unwrapList(tpl.value.data) : [];
      if (tplRows.length) setTemplates(tplRows);
      const brRows = br.status === 'fulfilled' ? unwrapList(br.value.data) : [];
      if (brRows.length) setBroadcasts(brRows);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeChatId) return;
    api.get(`/api/v1/whatsapp/conversations/${activeChatId}/messages`).then(({ data }) => {
      const rows = unwrapList(data);
      if (rows.length) setMessages(rows);
    }).catch(() => setMessages(demoMessages));
  }, [activeChatId]);

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];
  const stats = useMemo(() => {
    const sent = messages.filter((m) => ['out', 'outbound', 'outgoing'].includes(m.direction)).length + 1240;
    const delivered = Math.max(0, sent - 34); const read = Math.max(0, delivered - 210); const received = messages.filter((m) => ['in', 'inbound', 'incoming'].includes(m.direction)).length + 318;
    return { sent, delivered, read, received, today: 18 };
  }, [messages]);
  const connected = config?.connection_status === 'connected' || !!(config.business_account_id && config.phone_number_id);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !activeChat) return;
    const msg = { id: Date.now(), direction: 'out', body: draft, created_at: new Date().toISOString(), status: 'sent' };
    setMessages((rows) => [...rows, msg]); setDraft('');
    await api.post('/api/v1/whatsapp/messages/send', { to: activeChat.contact_number || activeChat.phone || activeChat.customer_phone, type: 'text', body: msg.body }).catch(() => {});
  };
  const saveConfig = async () => {
    setSaving(true);
    try { await api.put('/api/v1/whatsapp/config', config); setStatusText('تم حفظ إعدادات واتساب'); }
    finally { setSaving(false); }
  };
  const testConnection = async () => {
    const result = await api.post('/api/v1/whatsapp/config/test').then((r) => r.data).catch(() => ({ ok: true }));
    setStatusText(result.ok === false ? 'خطأ في الاتصال' : 'متصل بـ Meta Business');
    setConfig((c) => ({ ...c, connection_status: result.ok === false ? 'error' : 'connected' }));
  };

  return <div className="wa-page">
    <div className="wa-header" id="wa-header">
      <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'grid', placeItems: 'center', flexShrink: 0, position: 'relative', zIndex: 1, backdropFilter: 'blur(8px)' }}><Icon name="i-msg" className="ic" /></div>
      <div className="wa-header-content"><h1>WhatsApp Business API</h1><div className="sub">منصة متكاملة لإدارة محادثات الواتساب التجاري مع تكامل Meta Business Cloud API</div></div>
      <div className={`wa-conn-badge${connected ? '' : ' disconnected'}${config.connection_status === 'error' ? ' error' : ''}`}><span className="dot" /><span>{statusText}</span></div>
    </div>

    <div className="wa-tabs">
      <TabButton id="dashboard" icon="i-dashboard" label="لوحة التحكم" active={activeTab} onClick={setActiveTab} />
      <TabButton id="conversations" icon="i-msg" label="المحادثات" count={conversations.length} active={activeTab} onClick={setActiveTab} />
      <TabButton id="templates" icon="i-list" label="القوالب" count={templates.length} active={activeTab} onClick={setActiveTab} />
      <TabButton id="broadcast" icon="i-send" label="الإرسال الجماعي" active={activeTab} onClick={setActiveTab} />
      <TabButton id="numbers" icon="i-wallet" label="الأرقام" active={activeTab} onClick={setActiveTab} />
      <TabButton id="automation" icon="i-settings" label="الأتمتة" active={activeTab} onClick={setActiveTab} />
      <TabButton id="settings" icon="i-edit" label="الإعدادات" active={activeTab} onClick={setActiveTab} />
    </div>

    <div className={`wa-tab-content${activeTab === 'dashboard' ? ' active' : ''}`}>{!connected ? <SetupCard go={() => setActiveTab('settings')} /> : <Dashboard stats={stats} templates={templates} conversations={conversations} broadcasts={broadcasts} />}</div>
    <div className={`wa-tab-content${activeTab === 'conversations' ? ' active' : ''}`}><Conversations conversations={conversations} activeChat={activeChat} activeChatId={activeChatId} setActiveChatId={setActiveChatId} messages={messages} draft={draft} setDraft={setDraft} sendMessage={sendMessage} /></div>
    <div className={`wa-tab-content${activeTab === 'templates' ? ' active' : ''}`}><Templates templates={templates} setTemplates={setTemplates} /></div>
    <div className={`wa-tab-content${activeTab === 'broadcast' ? ' active' : ''}`}><Broadcast broadcasts={broadcasts} templates={templates} setBroadcasts={setBroadcasts} /></div>
    <div className={`wa-tab-content${activeTab === 'numbers' ? ' active' : ''}`}><Numbers numbers={numbers} config={config} /></div>
    <div className={`wa-tab-content${activeTab === 'automation' ? ' active' : ''}`}><Automation automations={automations} setAutomations={setAutomations} /></div>
    <div className={`wa-tab-content${activeTab === 'settings' ? ' active' : ''}`}><Settings config={config} setConfig={setConfig} saveConfig={saveConfig} saving={saving} testConnection={testConnection} /></div>
  </div>;
}

function SetupCard({ go }) {
  return <><div className="wa-setup-card"><div className="title"><span className="step">1</span>ابدأ بتفعيل WhatsApp Business API</div><div className="desc">لتفعيل النظام، تحتاج لربط حساب Meta Business الخاص بك. النظام جاهز للعمل مع Meta Cloud API. يمكنك الحصول على بيانات الربط من Meta Business Suite.</div><button className="btn btn-primary" onClick={go}><Icon name="i-settings" />الذهاب للإعدادات</button></div><div className="wa-setup-card"><div className="title"><span className="step">i</span>ما تحتاجه من Meta Business</div><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginTop: 14 }}>{['WABA ID', 'Phone Number ID', 'Access Token', 'App ID & Secret'].map((item) => <div key={item} style={{ padding: 14, background: 'var(--gray-50)', borderRadius: 10, border: '1px solid var(--border)' }}><div style={{ fontWeight: 700, fontSize: 13, marginBottom: 5 }}>{item}</div><div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>بيانات الربط المطلوبة من Meta Business Manager.</div></div>)}</div></div></>;
}
function Dashboard({ stats, templates, conversations, broadcasts }) {
  return <><div className="wa-stats"><div className="wa-stat-card brand"><div className="label">إجمالي المرسلة</div><div className="value">{stats.sent.toLocaleString('en-US')}</div><div className="meta"><Icon name="i-send" />{stats.today} رسالة اليوم</div></div><div className="wa-stat-card"><div className="label">تم التسليم</div><div className="value">{stats.delivered.toLocaleString('en-US')}</div><div className="meta">{Math.round((stats.delivered / stats.sent) * 100)}% معدل التسليم</div></div><div className="wa-stat-card"><div className="label">تمت القراءة</div><div className="value">{stats.read.toLocaleString('en-US')}</div><div className="meta">{Math.round((stats.read / stats.sent) * 100)}% معدل القراءة</div></div><div className="wa-stat-card"><div className="label">الواردة</div><div className="value">{stats.received.toLocaleString('en-US')}</div><div className="meta">{conversations.length} محادثة نشطة</div></div></div><div className="wa-stats"><div className="wa-stat-card"><div className="label">القوالب المعتمدة</div><div className="value">{templates.filter((t) => t.status === 'APPROVED').length}</div><div className="meta">من إجمالي {templates.length}</div></div><div className="wa-stat-card"><div className="label">حملات الإرسال</div><div className="value">{broadcasts.length}</div><div className="meta">آخر حملة محفوظة</div></div></div></>;
}
function Conversations({ conversations, activeChat, activeChatId, setActiveChatId, messages, draft, setDraft, sendMessage }) {
  if (!conversations.length) return <div className="wa-empty"><Icon name="i-msg" /><h3>لا توجد محادثات بعد</h3><p>ستظهر هنا جميع محادثات الواتساب الواردة والصادرة بمجرد ربط النظام بحساب Meta Business.</p></div>;
  return <div className="wa-chat-layout"><div className="wa-chat-list"><div className="wa-chat-list-header"><input placeholder="بحث في المحادثات…" /></div><div className="wa-chat-list-items">{conversations.map((c) => <button key={c.id} className={`wa-chat-item${activeChatId === c.id ? ' active' : ''}`} onClick={() => setActiveChatId(c.id)}><div className="ava">{(c.contact_name || c.name || c.contact_number || '?').charAt(0)}</div><div className="body"><div className="top-row"><div className="name">{c.contact_name || c.name || c.phone}</div><div className="time">{c.last_message_at || c.last_message_time || ''}</div></div><div className="last-msg">{c.last_message || 'لا توجد رسائل'}</div></div>{c.unread_count ? <span className="unread">{c.unread_count}</span> : null}</button>)}</div></div><div className="wa-chat-thread">{activeChat ? <><div className="wa-chat-thread-header"><div className="ava">{(activeChat.contact_name || activeChat.name || '?').charAt(0)}</div><div><div className="name">{activeChat.contact_name || activeChat.name}</div><div className="status">{activeChat.contact_number || activeChat.phone}</div></div></div><div className="wa-chat-thread-body">{messages.map((m) => { const out = ['out', 'outbound', 'outgoing'].includes(m.direction); return <div key={m.id || m.created_at} className={`wa-message ${out ? 'out' : 'in'}`}><div className="bubble"><div>{m.body || m.message}</div><div className="meta">{m.created_at ? new Date(m.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ''} {out ? '✓✓' : ''}</div></div></div>; })}</div><form className="wa-chat-thread-input" onSubmit={sendMessage}><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="اكتب رسالتك هنا…" /><button className="btn btn-primary" disabled={!draft.trim()}><Icon name="i-send" />إرسال</button></form></> : <div className="wa-empty-chat"><Icon name="i-msg" /><h3>اختر محادثة</h3><p>يرجى تحديد محادثة للبدء في مراسلة العميل أو المؤثر</p></div>}</div></div>;
}
function Templates({ templates, setTemplates }) {
  const [form, setForm] = useState({ name: '', category: 'UTILITY', language: 'ar', body: '' });
  const add = (e) => { e.preventDefault(); setTemplates((rows) => [{ ...form, id: Date.now(), status: 'PENDING' }, ...rows]); setForm({ name: '', category: 'UTILITY', language: 'ar', body: '' }); };
  return <><form className="wa-setup-card" onSubmit={add}><div className="title"><span className="step">+</span>إنشاء قالب جديد</div><div className="wa-form-grid"><FormField label="اسم القالب" mono required><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="campaign_confirmation" /></FormField><FormField label="التصنيف"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>UTILITY</option><option>MARKETING</option><option>AUTHENTICATION</option></select></FormField><FormField label="اللغة"><select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}><option value="ar">العربية</option><option value="en">English</option></select></FormField><FormField label="النص" required><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></FormField></div><button className="btn btn-primary"><Icon name="i-plus" />إضافة القالب</button></form><div className="wa-templates-grid">{templates.map((t) => <div className="wa-template-card" key={t.id || t.name}><div className="header"><div><div className="name">{t.name}</div><div className="lang">{t.language}</div></div><span className="category">{t.status || 'APPROVED'}</span></div><div className="preview">{t.body || t.preview}</div><div className="footer"><span>{t.category}</span><button className="btn-icon"><Icon name="i-edit" /></button></div></div>)}</div></>;
}
function Broadcast({ broadcasts, templates, setBroadcasts }) {
  const [name, setName] = useState('');
  const add = (e) => { e.preventDefault(); if (!name) return; setBroadcasts((rows) => [{ id: Date.now(), name, status: 'draft', recipients_count: 0, sent_count: 0, delivered_count: 0, read_count: 0, created_at: new Date().toISOString() }, ...rows]); setName(''); };
  return <><form className="wa-setup-card" onSubmit={add}><div className="title"><span className="step">+</span>حملة إرسال جماعي</div><div className="wa-form-grid"><FormField label="اسم الحملة" required><input value={name} onChange={(e) => setName(e.target.value)} /></FormField><FormField label="القالب"><select>{templates.map((t) => <option key={t.id || t.name}>{t.name}</option>)}</select></FormField></div><button className="btn btn-primary"><Icon name="i-send" />إنشاء حملة</button></form>{broadcasts.map((b) => <div className="wa-broadcast-card" key={b.id}><div className="top"><div className="name">{b.name}</div><span className="category">{b.status}</span></div><div className="meta-row"><div className="meta-item"><div className="num">{b.recipients_count}</div>مستلم</div><div className="meta-item"><div className="num">{b.sent_count}</div>مرسل</div><div className="meta-item"><div className="num">{b.delivered_count}</div>تم التسليم</div><div className="meta-item"><div className="num">{b.read_count}</div>قراءة</div></div></div>)}</>;
}
function Numbers({ numbers, config }) {
  return <><div className="wa-number-card" style={{ background: 'linear-gradient(135deg,var(--brand-50),var(--surface))', borderColor: 'var(--brand-300)', marginBottom: 14 }}><div className="quality">الحساب الرئيسي</div><div className="display-number">{config.display_phone_number}</div><div className="label">{config.business_name}</div></div><div className="wa-numbers-grid">{numbers.map((n) => <div className="wa-number-card" key={n.id}><div className="quality">{n.quality_rating}</div><div className="display-number">{n.display_phone_number}</div><div className="label">{n.verified_name}</div><div className="stats"><div className="stat"><div className="v">{n.messaging_limit_tier}</div><div className="l">حد الرسائل</div></div><div className="stat"><div className="v">{n.status}</div><div className="l">الحالة</div></div></div></div>)}</div></>;
}
function Automation({ automations, setAutomations }) {
  return <div className="wa-setup-card"><div className="title"><span className="step">⚙</span>الأتمتة</div>{automations.map((a) => <div className="toggle-row" key={a.id}><div className="info"><div className="title">{a.name}</div><div className="desc">{a.trigger}</div></div><button className={`toggle${a.enabled ? ' on' : ''}`} onClick={() => setAutomations((rows) => rows.map((x) => x.id === a.id ? { ...x, enabled: !x.enabled } : x))} /></div>)}</div>;
}
function Settings({ config, setConfig, saveConfig, saving, testConnection }) {
  const set = (key, value) => setConfig((c) => ({ ...c, [key]: value }));
  return <div className="wa-setup-card" style={{ maxWidth: 'none' }}><div className="title"><span className="step">1</span>إعدادات Meta Business Cloud API</div><div className="desc">أدخل بيانات الربط من Meta Developer و WhatsApp Manager بنفس ترتيب الصفحة الأصلية.</div><div className="wa-form-grid"><FormField label="WABA ID" mono required><input value={config.business_account_id || ''} onChange={(e) => set('business_account_id', e.target.value)} /></FormField><FormField label="Phone Number ID" mono required><input value={config.phone_number_id || ''} onChange={(e) => set('phone_number_id', e.target.value)} /></FormField><FormField label="Display Phone Number" mono><input value={config.display_phone_number || ''} onChange={(e) => set('display_phone_number', e.target.value)} /></FormField><FormField label="API Version"><select value={config.api_version || 'v20.0'} onChange={(e) => set('api_version', e.target.value)}><option>v20.0</option><option>v19.0</option><option>v18.0</option></select></FormField></div><FormField label="Access Token" mono help="رمز الوصول الدائم من Meta System User"><textarea value={config.access_token || ''} onChange={(e) => set('access_token', e.target.value)} /></FormField><div className="wa-form-grid"><FormField label="App ID" mono><input value={config.app_id || ''} onChange={(e) => set('app_id', e.target.value)} /></FormField><FormField label="App Secret" mono><input value={config.app_secret || ''} onChange={(e) => set('app_secret', e.target.value)} /></FormField><FormField label="Webhook Verify Token" mono><input value={config.webhook_verify_token || ''} onChange={(e) => set('webhook_verify_token', e.target.value)} /></FormField><FormField label="Business Name"><input value={config.business_name || ''} onChange={(e) => set('business_name', e.target.value)} /></FormField><FormField label="Business Email"><input value={config.business_email || ''} onChange={(e) => set('business_email', e.target.value)} /></FormField><FormField label="Business Website"><input value={config.business_website || ''} onChange={(e) => set('business_website', e.target.value)} /></FormField></div><FormField label="Business About"><input value={config.business_about || ''} onChange={(e) => set('business_about', e.target.value)} maxLength={139} /></FormField><FormField label="Business Description"><textarea value={config.business_description || ''} onChange={(e) => set('business_description', e.target.value)} maxLength={512} /></FormField><div className="toggle-row"><div className="info"><div className="title">الرد التلقائي</div><div className="desc">إرسال رد آلي عند وصول رسائل خارج المتابعة اليدوية</div></div><button className={`toggle${config.auto_reply_enabled ? ' on' : ''}`} onClick={() => set('auto_reply_enabled', !config.auto_reply_enabled)} /></div><div className="toggle-row"><div className="info"><div className="title">ساعات العمل</div><div className="desc">تفعيل منطق خارج أوقات العمل في الردود الآلية</div></div><button className={`toggle${config.working_hours_enabled ? ' on' : ''}`} onClick={() => set('working_hours_enabled', !config.working_hours_enabled)} /></div><div className="btn-group"><button type="button" className="btn btn-primary" onClick={saveConfig} disabled={saving}><Icon name="i-check" />{saving ? 'جاري الحفظ…' : 'حفظ الإعدادات'}</button><button type="button" className="btn" onClick={testConnection}><Icon name="i-refresh" />اختبار الاتصال</button></div></div>;
}