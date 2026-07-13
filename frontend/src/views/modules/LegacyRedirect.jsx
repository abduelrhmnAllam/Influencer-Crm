import{Navigate,useSearchParams}from'react-router-dom';
export default function LegacyRedirect({base,fallback}){const[params]=useSearchParams();const id=params.get('id');return <Navigate to={id?`${base}/${id}`:fallback||base} replace/>}
export function NotFoundPage(){return <main className='not-found'><strong>404</strong><h1>الصفحة غير موجودة</h1><p>تعذر العثور على الصفحة المطلوبة.</p><a href='/dashboard'>العودة إلى لوحة التحكم</a></main>}
