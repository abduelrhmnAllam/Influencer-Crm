<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Influencer;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Database\Seeder;

class InfluencerSeeder extends Seeder
{
    public function run(): void
    {
        Tenancy::bypass(true);
        $agency = Agency::where('slug', 'default')->first();
        if (!$agency) {
            $agency = Agency::create([
                'slug' => 'default',
                'name' => 'Default Agency',
                'status' => 'active'
            ]);
        }
        
        Tenancy::setAgencyId($agency->id);
        
        $manager = User::where('username', 'manager')->first();
        $assignee_id = $manager ? $manager->id : null;

        $firstNames = [
            'أحمد', 'محمد', 'عبدالله', 'خالد', 'فيصل', 'فهد', 'سلمان', 'سعود', 'تركي', 'ياسر',
            'سارة', 'نورة', 'ريم', 'شهد', 'ليان', 'ريما', 'لمى', 'نوف', 'العنود', 'الهنوف',
            'زياد', 'طارق', 'عبدالرحمن', 'صالح', 'عبدالعزيز', 'بندر', 'وليد', 'ماجد', 'بدر', 'عمر',
            'مريم', 'فاطمة', 'عبير', 'غادة', 'هيفاء', 'شوق', 'نجلاء', 'حصة', 'مها', 'ندى'
        ];
        
        $lastNames = [
            'العتيبي', 'القحطاني', 'المطيري', 'الشمري', 'الدوسري', 'العنزي', 'الغامدي', 'الزهراني',
            'الشهراني', 'العمري', 'السبيعي', 'الرويلي', 'الحربي', 'الجهني', 'اليامي', 'العسيري',
            'المالكي', 'الرشيدي', 'الخالدي', 'البقمي', 'التميمي', 'الشمسان', 'الحمدان', 'الفايز'
        ];

        $categories = [
            'أزياء وجمال', 'سفر وسياحة', 'طعام ومطاعم', 'تقنية', 'يوميات (فلوقات)',
            'رياضة ولياقة', 'كوميديا', 'تعليم وثقافة', 'سيارات', 'أعمال واستثمار'
        ];

        $cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة', 'أبها', 'الطائف', 'تبوك', 'بريدة'];
        
        $platforms = ['snapchat', 'tiktok', 'instagram', 'twitter', 'youtube', 'linkedin'];
        
        $ratings = ['A+', 'A', 'B', 'C'];
        
        $banks = ['مصرف الراجحي', 'البنك الأهلي', 'بنك الإنماء', 'بنك الرياض', 'اليسر', 'ساب'];

        $records = [];
        
        for ($i = 1; $i <= 80; $i++) {
            $firstName = $firstNames[array_rand($firstNames)];
            $lastName = $lastNames[array_rand($lastNames)];
            $name = $firstName . ' ' . $lastName;
            $username = strtolower(str_replace(' ', '_', $firstName)) . rand(100, 9999);
            
            $platform = $platforms[array_rand($platforms)];
            $isFemale = in_array($firstName, ['سارة', 'نورة', 'ريم', 'شهد', 'ليان', 'ريما', 'لمى', 'نوف', 'العنود', 'الهنوف', 'مريم', 'فاطمة', 'عبير', 'غادة', 'هيفاء', 'شوق', 'نجلاء', 'حصة', 'مها', 'ندى']);
            $gender = $isFemale ? 'female' : 'male';
            
            $rating = $ratings[array_rand($ratings)];
            
            // Followers based on rating
            if ($rating == 'A+') $followers = rand(800000, 5000000);
            elseif ($rating == 'A') $followers = rand(300000, 799999);
            elseif ($rating == 'B') $followers = rand(100000, 299999);
            else $followers = rand(10000, 99999);
            
            $cost = rand(10, 100) * 100;
            $sale = round($cost * (1 + (rand(15, 45) / 100)));
            
            $additional_platforms = [];
            $num_additional = rand(0, 3);
            if ($num_additional > 0) {
                $other_platforms = array_diff($platforms, [$platform]);
                shuffle($other_platforms);
                $selected_additional = array_slice($other_platforms, 0, $num_additional);
                
                foreach ($selected_additional as $add_plat) {
                    $add_followers = round($followers * (rand(10, 60) / 100));
                    $additional_platforms[] = [
                        'platform_name' => $add_plat,
                        'url' => 'https://' . $add_plat . '.com/' . $username,
                        'subs' => $add_followers,
                        'views' => round($add_followers * (rand(5, 30) / 100)),
                        'home_sell' => round($sale * (rand(50, 90) / 100)),
                        'cov_sell' => round($sale * (rand(70, 120) / 100))
                    ];
                }
            }

            // Include primary platform in additional_platforms format for the publisher view
            $views = round($followers * (rand(5, 40) / 100));
            $all_platforms = array_merge([[
                'platform_name' => $platform,
                'url' => 'https://' . $platform . '.com/' . $username,
                'subs' => $followers,
                'views' => $views,
                'home_sell' => $sale,
                'cov_sell' => round($sale * 1.5)
            ]], $additional_platforms);

            $records[] = [
                'code' => 'IN-1' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'agency_id' => $agency->id,
                'name' => $name,
                'username' => $username,
                'phone' => '05' . rand(10000000, 99999999),
                'email' => $username . '@example.com',
                'platform' => $platform,
                'followers' => $followers,
                'category' => $categories[array_rand($categories)],
                'rating' => $rating,
                'gender' => $gender,
                'region' => $cities[array_rand($cities)],
                'country' => 'SA',
                'cost_price' => $cost,
                'sale_price' => $sale,
                'bank_name' => $banks[array_rand($banks)],
                'iban' => 'SA' . rand(10, 99) . '8000' . rand(10000000000000, 99999999999999),
                'account_holder' => $name,
                'status' => 'active',
                'notes' => 'تمت الإضافة من خلال seeder',
                'social_links' => json_encode(['website' => 'https://example.com/' . $username]),
                'tags' => json_encode([
                    'engagement_rate' => rand(1, 15) + (rand(0, 9) / 10),
                    'audience_age' => ['13-17', '18-24', '25-34', '35-44', '45+'][rand(0, 4)],
                    'show_face' => rand(0, 1) ? true : false,
                    'classification' => ['vip', 'premium', 'standard'][rand(0, 2)]
                ]),
                'additional_platforms' => json_encode($all_platforms),
                'assignee_id' => $assignee_id,
                'created_at' => now()->subDays(rand(1, 300)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ];
        }

        foreach ($records as $record) {
            Influencer::updateOrCreate(['code' => $record['code']], $record);
        }

        Tenancy::reset();
    }
}
