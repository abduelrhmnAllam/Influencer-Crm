import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../stores/authStore';
import api from '../../api/client';

const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
const DEMO_PASSWORD = 'SmartCodeDemo@2026';
const demoAccounts = [
  { username: 'admin', label: 'مدير الوكالة', icon: '👑' },
  { username: 'manager', label: 'مدير الحملات', icon: '📣' },
  { username: 'finance', label: 'المدير المالي', icon: '💳' },
  { username: 'viewer', label: 'حساب المشاهدة', icon: '👁️' },
];

export default function LoginPage() {
  const { login, error: authError, clearError } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) return setError('يرجى ملء اسم المستخدم وكلمة المرور.');
    setError(null); clearError(); setLoading(true);
    try { await login(username.trim(), password); }
    catch (requestError) { setError(requestError.response?.data?.errors?.username?.[0] || requestError.response?.data?.error || requestError.response?.data?.message || 'فشل تسجيل الدخول. تحقق من البيانات.'); }
    finally { setLoading(false); }
  };

  const googleLogin = async ({ credential }) => {
    setError(null); clearError(); setLoading(true);
    try {
      const { data } = await api.post('/api/v1/auth/google/callback', { credential });
      useAuthStore.setState({ user: data.user, loading: false, error: null });
    } catch (requestError) { setError(requestError.response?.data?.error || 'فشل تسجيل الدخول باستخدام Google.'); }
    finally { setLoading(false); }
  };

  const selectDemo = (account) => {
    setUsername(account.username);
    setPassword(DEMO_PASSWORD);
    setError(null);
    clearError();
  };

  return <main className='login-page' dir='rtl'>
    <aside className='login-brand'><header><b>Smart Code</b><small>منصة علاقات المؤثرين</small></header><div><span className='brand-pill'>منصة متكاملة لإدارة الحملات الإعلانية</span><h2>أدِر علاقات المؤثرين<br/>والعملاء بطريقة احترافية</h2><p>نظام شامل لإدارة المؤثرين والعملاء والحملات والمالية، مع تحليلات لحظية وتقارير ذكية.</p></div><footer>إدارة موحّدة · تحليلات لحظية · إدارة مالية</footer></aside>
    <section className='login-form-side'><div className='login-form-wrap'><h1>مرحباً بعودتك</h1><p>سجّل دخولك للوصول إلى لوحة التحكم وإدارة أعمالك.</p>
      {(error || authError) && <div className='login-error'>{error || authError}</div>}
      <form onSubmit={submit}><label>اسم المستخدم أو البريد الإلكتروني<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete='username' placeholder='username or email' dir='ltr' disabled={loading}/></label><label>كلمة المرور<input type='password' value={password} onChange={(event) => setPassword(event.target.value)} autoComplete='current-password' placeholder='••••••••' dir='ltr' disabled={loading}/></label><button disabled={loading}>{loading ? 'جارٍ الدخول…' : 'تسجيل الدخول'}</button></form>
      {import.meta.env.DEV && <section className='demo-login'><p>حسابات اختبار الصلاحيات</p><div>{demoAccounts.map((account)=><button type='button' key={account.username} onClick={() => selectDemo(account)} className={username === account.username ? 'active' : ''}><span>{account.icon}</span><b>{account.label}</b><small>{account.username}</small></button>)}</div><small>اختر الحساب وسيتم ملء اسم المستخدم وكلمة المرور تلقائياً: <b dir='ltr'>{DEMO_PASSWORD}</b></small><div className='demo-portal-info'><strong>بوابة العملاء:</strong><span dir='ltr'>rqu_demo_client_2026_smartcode</span><em>Demo nomination ID: 1</em></div></section>}
      <div className='login-divider'>أو تابع باستخدام</div>{googleEnabled ? <GoogleLogin onSuccess={googleLogin} onError={() => setError('تعذّر الاتصال بخدمة Google.')} width='380' locale='ar'/> : <p className='google-notice'>يلزم إعداد Google OAuth لتفعيل تسجيل الدخول عبر Gmail.</p>}
    </div></section>
  </main>;
}
