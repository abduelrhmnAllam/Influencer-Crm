<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\User;
use Faker\Factory as Faker;
use App\Models\Agency;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('ar_SA');
        
        $users = User::pluck('id')->toArray();
        if (empty($users)) {
            $users = [null];
        }
        
        $agencyId = Agency::first()->id ?? 1;

        $sectors = [
            'مطاعم وكافيهات', 'عيادات وتجميل', 'عقارات', 'تجارة إلكترونية', 
            'سيارات', 'تقنية واتصالات', 'سياحة وسفر', 'تعليم وتدريب', 
            'ملابس وأزياء', 'صحة ولياقة', 'عطور وتجميل', 'أخرى'
        ];

        $tagsList = ['vip', 'متفاعل', 'جديد', 'يحتاج متابعة', 'عميل دائم', 'مهم'];

        $customersToCreate = [];

        for ($i = 0; $i < 80; $i++) {
            $companyName = $faker->company;
            $status = $faker->randomElement(['active', 'active', 'active', 'inactive']);
            
            $randomTags = (array) $faker->randomElements($tagsList, $faker->numberBetween(0, 3));

            $customersToCreate[] = [
                'code'           => 'CL-' . mt_rand(10000, 99999) . $i,
                'name'           => $companyName,
                'contact_person' => $faker->name,
                'phone'          => '05' . $faker->numerify('########'),
                'email'          => $faker->unique()->companyEmail,
                'sector'         => $faker->randomElement($sectors),
                'cr_number'      => $faker->boolean(70) ? $faker->numerify('1010######') : null,
                'vat_number'     => $faker->boolean(70) ? $faker->numerify('300########3') : null,
                'address'        => $faker->city . '، ' . $faker->streetName,
                'notes'          => $faker->realText(50),
                'status'         => $status,
                'assignee_id'    => $faker->randomElement($users),
                'tags'           => json_encode($randomTags),
                'created_at'     => $faker->dateTimeBetween('-1 year', 'now'),
                'updated_at'     => now(),
                'total_spent'    => $faker->randomFloat(2, 0, 150000),
                'campaigns_count'=> $faker->numberBetween(0, 10),
                'agency_id'      => $agencyId,
            ];
        }

        foreach (array_chunk($customersToCreate, 20) as $chunk) {
            Customer::insert($chunk);
        }
    }
}
