import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations dictionary
const resources = {
  ar: {
    translation: {
      dashboard: 'لوحة التحكم',
      customers: 'العملاء',
      influencers: 'المؤثرين',
      campaigns: 'الحملات الإعلانية',
      finance: 'المالية والتحويلات',
      tasks: 'المهام',
      calendar: 'جدول الإعلانات',
      content: 'مكتبة المحتوى',
      whatsapp: 'الواتساب والرسائل',
      requests: 'طلبات الحملات',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',
      system: 'النظام الرئيسي',
      welcome: 'مرحباً بك، {{name}}',
      lang_ar: 'العربية (SA)',
      lang_en: 'English (US)',
    }
  },
  en: {
    translation: {
      dashboard: 'Dashboard',
      customers: 'Customers',
      influencers: 'Influencers',
      campaigns: 'Campaigns',
      finance: 'Finance & Transfers',
      tasks: 'Tasks',
      calendar: 'Ad Schedule',
      content: 'Content Library',
      whatsapp: 'WhatsApp & Chats',
      requests: 'Campaign Requests',
      settings: 'Settings',
      logout: 'Logout',
      system: 'Core System',
      welcome: 'Welcome, {{name}}',
      lang_ar: 'العربية (SA)',
      lang_en: 'English (US)',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', // default locale
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply direction attributes dynamically on layout mount
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
