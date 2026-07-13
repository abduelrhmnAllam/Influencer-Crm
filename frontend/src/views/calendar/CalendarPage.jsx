import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';

export default function CalendarPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch daily ads scheduler
      const { data } = await api.get('/api/v1/daily-ads');
      setAds(data.data || data);
    } catch (err) {
      console.error('Error fetching daily ads:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  // Month names in Arabic
  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];
  // Fill empty spaces before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Fill actual month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get ads for a specific day
  const getAdsForDay = (day) => {
    if (!day) return [];
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return ads.filter(ad => ad.publish_date === formattedDate);
  };

  const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">جدول الإعلانات اليومية</h1>
          <p className="text-sm text-surface-600">تتبع ومراقبة مواعيد نشر الحملات الإعلانية للمؤثرين</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-card border border-surface-200 p-6">
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePrevMonth}
            className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 font-bold transition-all cursor-pointer"
          >
            ◀ الشهر السابق
          </button>
          <h2 className="text-xl font-bold text-surface-900">
            {monthNames[month]} {year}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="px-4 py-2 border border-surface-200 rounded-xl hover:bg-surface-50 font-bold transition-all cursor-pointer"
          >
            الشهر التالي ▶
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-surface-200 rounded-2xl overflow-hidden border border-surface-200">
          {/* Weekday headers */}
          {weekdays.map(wd => (
            <div key={wd} className="bg-surface-50 py-3 text-center text-xs font-bold text-surface-600">
              {wd}
            </div>
          ))}

          {/* Days */}
          {calendarDays.map((day, idx) => {
            const dayAds = getAdsForDay(day);
            return (
              <div 
                key={idx} 
                className={`bg-white min-h-[120px] p-2 flex flex-col justify-between ${
                  day ? 'hover:bg-surface-50/30' : 'bg-surface-50/20'
                }`}
              >
                <div className="text-right">
                  <span className={`text-sm font-bold ${day ? 'text-surface-900' : 'text-surface-200'}`}>
                    {day || ''}
                  </span>
                </div>

                <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px]">
                  {dayAds.map(ad => (
                    <div 
                      key={ad.id} 
                      className="px-2 py-1 rounded text-[10px] font-bold truncate bg-primary-100 text-primary-700 border border-primary-200"
                      title={ad.influencer?.name}
                    >
                      {ad.platform === 'tiktok' ? '⚫' : ad.platform === 'snapchat' ? '🟡' : '📸'} {ad.influencer?.name || 'مؤثر'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
