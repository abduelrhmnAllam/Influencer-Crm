<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Influencer;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Database\Seeder;
use App\Support\Tenancy;
use App\Models\Agency;

/**
 * Imports data from a JSON export of localStorage
 * 
 * Usage:
 *   1. Export localStorage from frontend (Settings → Export All)
 *   2. Save as storage/app/localstorage-export.json
 *   3. Run: php artisan db:seed --class=LocalStorageImportSeeder
 */
class LocalStorageImportSeeder extends Seeder
{
    public function run(): void
    {
        Tenancy::bypass(true);
        $a = Agency::where('slug','default')->first();
        if ($a) Tenancy::setAgencyId($a->id);
        $file = storage_path('app/localstorage-export.json');
        
        if (!file_exists($file)) {
            $this->command->warn('⚠️  No export file found at storage/app/localstorage-export.json');
            $this->command->info('Skipping LocalStorage import. Creating minimal sample data instead.');
            $this->createMinimalSamples();
            return;
        }
        
        $data = json_decode(file_get_contents($file), true);
        
        // Import customers
        if (isset($data['customers'])) {
            $this->command->info('Importing ' . count($data['customers']) . ' customers...');
            foreach ($data['customers'] as $c) {
                Customer::updateOrCreate(
                    ['code' => $c['id'] ?? null],
                    [
                        'name' => $c['name'] ?? 'بدون اسم',
                        'phone' => $c['phone'] ?? null,
                        'email' => $c['email'] ?? null,
                        'sector' => $c['sector'] ?? null,
                        'address' => $c['address'] ?? null,
                        'notes' => $c['notes'] ?? null,
                        'status' => 'active',
                    ]
                );
            }
        }
        
        // Import influencers
        if (isset($data['influencers'])) {
            $this->command->info('Importing ' . count($data['influencers']) . ' influencers...');
            foreach ($data['influencers'] as $i) {
                Influencer::updateOrCreate(
                    ['code' => $i['id'] ?? null],
                    [
                        'name' => $i['name'] ?? 'بدون اسم',
                        'username' => $i['username'] ?? null,
                        'phone' => $i['phone'] ?? null,
                        'platform' => $i['platform'] ?? 'instagram',
                        'followers' => $i['followers'] ?? 0,
                        'category' => $i['category'] ?? null,
                        'rating' => $i['rating'] ?? null,
                        'cost_price' => $i['cost_price'] ?? 0,
                        'sale_price' => $i['sale_price'] ?? 0,
                        'status' => 'active',
                    ]
                );
            }
        }
        
        $this->command->info('✅ Import complete!');
    }

    protected function createMinimalSamples(): void
    {
        Customer::create([
            'name' => 'متجر تجريبي',
            'phone' => '0501234567',
            'sector' => 'تجارة إلكترونية',
            'status' => 'active',
        ]);
        
        Influencer::create([
            'name' => 'مؤثر تجريبي',
            'username' => 'test_inf',
            'platform' => 'instagram',
            'followers' => 50000,
            'category' => 'أزياء',
            'rating' => 'A',
            'cost_price' => 1500,
            'sale_price' => 2500,
            'status' => 'active',
        ]);
    }
}
