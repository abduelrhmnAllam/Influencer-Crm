export const legacyMainNavItems = [
  { page: 'dashboard', path: '/dashboard', icon: 'i-dashboard', label: 'لوحة التحكم', permission: null },
  { page: 'requests', path: '/requests', icon: 'i-inbox', label: 'الطلبات', permission: 'view-requests' },
  { page: 'calendar', path: '/calendar', icon: 'i-calendar', label: 'التقويم', permission: 'view-campaigns' },
  { page: 'customers', path: '/customers', icon: 'i-users', label: 'العملاء', permission: 'view-customers' },
  { page: 'influencers', path: '/influencers', icon: 'i-star', label: 'المؤثرون', permission: 'view-influencers' },
  { page: 'publishers', path: '/publishers', icon: 'i-globe', label: 'الناشرون', permission: 'view-influencers' },
  { page: 'orders-campaigns', path: '/orders-campaigns', icon: 'i-megaphone', label: 'الحملات', permission: 'view-campaigns' },
  { page: 'ugc-admin', path: '/ugc-admin', icon: 'i-video', label: 'UGC', permission: 'view-content' },
  { page: 'finance', path: '/finance', icon: 'i-wallet', label: 'المالية', permission: 'view-transfers' },
  { page: 'content', path: '/content', icon: 'i-folder', label: 'المحتوى', permission: 'view-content' },
  { page: 'analytics', path: '/analytics', icon: 'i-chart', label: 'التحليلات', permission: 'view-analytics' },
];

export const legacySystemNavItems = [
  { page: 'settings', path: '/settings', icon: 'i-settings', label: 'الإعدادات', permission: 'view-settings' },
];

export const legacyPageMeta = {
  dashboard: { title: 'لوحة التحكم', desc: 'نظرة عامة على أداء النظام والمؤشرات الرئيسية' },
  requests: { title: 'الطلبات', desc: 'مركز استقبال وتشغيل ومتابعة طلبات علاقات المؤثرين' },
  calendar: { title: 'التقويم', desc: 'جدولة الإعلانات والمواعيد والتذكيرات' },
  customers: { title: 'العملاء', desc: 'إدارة العملاء وملفاتهم وحساباتهم' },
  influencers: { title: 'المؤثرون', desc: 'قاعدة بيانات المؤثرين وتصنيفاتهم وأسعارهم' },
  publishers: { title: 'الناشرون', desc: 'تحليل حسابات المؤثرين والناشرين وأداؤهم عبر المنصات' },
  'orders-campaigns': { title: 'الحملات', desc: 'إدارة الحملات ومتابعة تنفيذها مرحلة بمرحلة' },
  analytics: { title: 'التحليلات', desc: 'مركز الذكاء التشغيلي والتقارير التفصيلية' },
  finance: { title: 'المالية', desc: 'التحصيلات والمدفوعات والحوالات والمستندات' },
  content: { title: 'المحتوى', desc: 'أرشيف محتوى الحملات والإعلانات المنشورة' },
  'ugc-admin': { title: 'UGC', desc: 'إدارة صنّاع المحتوى والمشاريع والمدفوعات' },
  whatsapp: { title: 'واتساب API', desc: 'تكامل واتساب والرسائل الآلية' },
  settings: { title: 'الإعدادات', desc: 'إعدادات النظام والمستخدمين والصلاحيات' },
  'monthly-report': { title: 'التقرير الشهري', desc: 'تقرير شهري شامل لأداء القسم' },
  tasks: { title: 'المهام', desc: 'مهامك التشغيلية المؤتمتة — تُنشأ وتُسند تلقائياً من سير العمليات' },
  'request-detail': { title: 'تفاصيل الطلب', desc: 'مركز تشغيل الطلب الكامل' },
  'requests-users': { title: 'مستخدمو الطلبات', desc: 'إدارة مستخدمي منصة الطلبات وصلاحياتهم' },
};

export const roleLabels = {
  super_admin: 'مدير النظام',
  agency_admin: 'مدير الوكالة',
  admin: 'مدير النظام',
  manager: 'مدير',
  finance: 'المالية',
  viewer: 'مشاهد',
};

export const roleColors = {
  super_admin: '#7c3aed',
  agency_admin: '#0d8a6f',
  admin: '#7c3aed',
  manager: '#0d8a6f',
  finance: '#3b82f6',
  viewer: '#64748b',
};

export function pageFromPath(pathname) {
  const clean = pathname.replace(/^\/+/, '').split('/')[0] || 'dashboard';
  if (clean === 'campaigns') return 'orders-campaigns';
  if (clean === 'request-users') return 'requests-users';
  return clean;
}

export function isLegacyActive(pathname, item) {
  if (item.path === '/dashboard') return pathname === '/' || pathname.startsWith('/dashboard');
  if (item.page === 'orders-campaigns') return pathname.startsWith('/orders-campaigns') || pathname.startsWith('/campaigns');
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
