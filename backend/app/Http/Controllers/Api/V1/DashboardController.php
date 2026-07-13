<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = Auth::user();

        return response()->json([
            'hero' => [
                'user_name' => $user?->name ?? 'Smart Code',
                'subtitle' => 'مركز تشغيل الوكالة اليومي: الطلبات، الحملات، المالية، والعملاء في شاشة واحدة.',
                'stats' => [
                    ['label' => 'TODAY', 'value' => 18],
                    ['label' => 'ACTIVE', 'value' => 12],
                    ['label' => 'SLA', 'value' => '94%'],
                ],
            ],
            'totals' => [
                'customers' => 24,
                'influencers' => 186,
                'campaigns' => 17,
                'daily_ads' => 64,
                'transfers_pending' => 7,
                'tasks_pending' => 14,
            ],
            'highlights' => [
                ['label' => 'الحملات النشطة', 'value' => 12, 'suffix' => ' حملة', 'icon' => 'i-megaphone', 'color' => '#3b82f6', 'bg' => '#eff6ff', 'href' => '/orders-campaigns'],
                ['label' => 'معلّقات تشغيلية', 'value' => 9, 'suffix' => ' بند', 'icon' => 'i-clock', 'color' => '#f59e0b', 'bg' => '#fffbeb', 'href' => '/requests'],
                ['label' => 'عملاء نشطون', 'value' => 24, 'suffix' => ' عميل', 'icon' => 'i-users', 'color' => '#0d8a6f', 'bg' => '#f0fdf9', 'href' => '/customers'],
                ['label' => 'إيراد الشهر', 'value' => 842500, 'suffix' => ' ر.س', 'icon' => 'i-wallet', 'color' => '#16a34a', 'bg' => '#f0fdf4', 'href' => '/finance'],
            ],
            'urgent' => [
                ['label' => 'بانتظار اعتماد العميل', 'count' => 3, 'icon' => 'i-inbox', 'color' => '#8b5cf6', 'bg' => '#f5f3ff', 'href' => '/requests?status=awaiting_internal_approval'],
                ['label' => 'حوالات بانتظار الإجراء', 'count' => 7, 'icon' => 'i-wallet', 'color' => '#3b82f6', 'bg' => '#eff6ff', 'href' => '/finance'],
                ['label' => 'طلبات تحتاج استكمال', 'count' => 4, 'icon' => 'i-clock', 'color' => '#d97706', 'bg' => '#fffbeb', 'href' => '/requests?status=awaiting_completion'],
            ],
            'financial' => [
                'total_revenue' => 842500,
                'total_cost' => 511250,
                'net_profit' => 331250,
                'margin' => 39.3,
                'pending_amount' => 146000,
                'completed_amount' => 696500,
            ],
            'campaigns' => [
                ['id' => 1, 'name' => 'إطلاق عطر نوفا الصيفي', 'customer' => 'نوفا للعطور', 'manager' => 'سارة العتيبي', 'progress' => 72],
                ['id' => 2, 'name' => 'حملة تطبيق فودلي رمضان', 'customer' => 'Foodly KSA', 'manager' => 'محمد الحربي', 'progress' => 58],
                ['id' => 3, 'name' => 'تغطية معرض التقنية', 'customer' => 'Tech Expo Riyadh', 'manager' => 'لينا السالم', 'progress' => 41],
                ['id' => 4, 'name' => 'UGC منتجات العناية', 'customer' => 'Luma Care', 'manager' => 'عبدالله القحطاني', 'progress' => 86],
            ],
            'top_customers' => [
                ['id' => 1, 'name' => 'نوفا للعطور', 'revenue' => 215000, 'campaigns' => 4, 'score' => 96],
                ['id' => 2, 'name' => 'Foodly KSA', 'revenue' => 184500, 'campaigns' => 3, 'score' => 88],
                ['id' => 3, 'name' => 'Tech Expo Riyadh', 'revenue' => 132000, 'campaigns' => 2, 'score' => 74],
                ['id' => 4, 'name' => 'Luma Care', 'revenue' => 98000, 'campaigns' => 2, 'score' => 61],
            ],
            'top_influencers' => [
                ['id' => 1, 'name' => 'نورة فهد', 'platform' => 'Snapchat', 'ads_completed' => 9, 'score' => 98],
                ['id' => 2, 'name' => 'عبدالعزيز لايف', 'platform' => 'TikTok', 'ads_completed' => 7, 'score' => 84],
                ['id' => 3, 'name' => 'ريم ستايل', 'platform' => 'Instagram', 'ads_completed' => 6, 'score' => 73],
                ['id' => 4, 'name' => 'سعود تيك', 'platform' => 'YouTube', 'ads_completed' => 4, 'score' => 58],
            ],
            'recent_activity' => [
                ['id' => 1, 'title' => 'تحويل طلب إلى حملة', 'body' => 'تم تحويل طلب REQ-2026-104 إلى حملة تشغيلية.', 'time' => 'قبل 12 دقيقة', 'color' => '#16a34a'],
                ['id' => 2, 'title' => 'اعتماد ترشيحات', 'body' => 'العميل وافق على 4 مؤثرين لحملة نوفا.', 'time' => 'قبل 38 دقيقة', 'color' => '#8b5cf6'],
                ['id' => 3, 'title' => 'رفع فاتورة', 'body' => 'تم رفع فاتورة تحصيل بقيمة 76,000 ر.س.', 'time' => 'قبل ساعة', 'color' => '#3b82f6'],
                ['id' => 4, 'title' => 'تنبيه موعد نشر', 'body' => 'إعلان سناب شات مجدول اليوم 09:30 مساءً.', 'time' => 'قبل ساعتين', 'color' => '#f59e0b'],
            ],
        ]);
    }
}
