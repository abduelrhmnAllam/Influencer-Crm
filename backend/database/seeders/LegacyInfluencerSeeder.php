<?php

namespace Database\Seeders;

use App\Models\Agency;
use App\Models\Influencer;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LegacyInfluencerSeeder extends Seeder
{
    public function run(): void
    {
        Tenancy::bypass(true);
        $agency = Agency::where('slug', 'default')->first();
        if (!$agency) {
            $agency = Agency::create(['slug' => 'default', 'name' => 'Default Agency', 'status' => 'active']);
        }
        
        Tenancy::setAgencyId($agency->id);
        
        $manager = User::where('username', 'manager')->first();
        $assignee_id = $manager ? $manager->id : null;

        $file = storage_path('app/legacy_influencers.json');
        
        if (!file_exists($file)) {
            $this->command->error("File not found: " . $file);
            return;
        }

        $data = json_decode(file_get_contents($file), true);
        
        if (!is_array($data)) {
            $this->command->error("Invalid JSON data");
            return;
        }

        // Clear existing influencers to avoid duplicates
        Influencer::query()->delete();

        $this->command->info('Importing ' . count($data) . ' legacy influencers...');
        
        $chunks = array_chunk($data, 100);
        
        foreach ($chunks as $chunk) {
            $records = [];
            foreach ($chunk as $inf) {
                // Determine platform
                $platform = 'instagram';
                $followers = 0;
                $additional = [];
                if (!empty($inf['platforms']) && is_array($inf['platforms'])) {
                    foreach ($inf['platforms'] as $pl) {
                        $additional[] = $pl;
                        if ($pl['subs'] > $followers) {
                            $followers = $pl['subs'];
                            $platform = $pl['platform_name'];
                        }
                    }
                }
                
                $records[] = [
                    'code' => $inf['id'] ?? 'INF-' . rand(10000, 99999),
                    'agency_id' => $agency->id,
                    'name' => $inf['name'] ?? 'بدون اسم',
                    'username' => $inf['username'] ?: str_replace(' ', '_', $inf['name'] ?? 'user'),
                    'phone' => $inf['phone'] ?: '05' . rand(10000000, 99999999),
                    'email' => ($inf['email'] ?: 'inf' . rand(1000, 9999)) . '@example.com',
                    'platform' => strtolower($platform ?: 'instagram'),
                    'followers' => $followers,
                    'category' => $inf['category'] ?: 'عام',
                    'rating' => $inf['classification'] ?: 'C',
                    'gender' => ($inf['gender'] == 'أنثى') ? 'female' : 'male',
                    'region' => $inf['city'] ?: 'الرياض',
                    'country' => 'SA',
                    'cost_price' => 0,
                    'sale_price' => 0,
                    'bank_name' => $inf['bank_name'] ?: null,
                    'iban' => $inf['iban'] ?: null,
                    'account_holder' => $inf['account_holder'] ?: null,
                    'status' => 'active',
                    'notes' => $inf['notes'] ?: '',
                    'social_links' => json_encode([]),
                    'tags' => json_encode([
                        'engagement_rate' => $inf['engagement_rate'] ?? 0,
                        'audience_age' => $inf['audience_age'] ?? null,
                        'show_face' => $inf['show_face'] ?? false,
                        'gender_ratio' => $inf['gender_ratio'] ?? null,
                        'nationality' => $inf['nationality'] ?? null,
                        'total_campaigns' => $inf['total_campaigns'] ?? 0,
                        'all_categories' => $inf['all_categories'] ?? null,
                    ]),
                    'additional_platforms' => json_encode($additional),
                    'assignee_id' => $assignee_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            Influencer::insert($records);
        }

        $this->command->info('✅ Import complete! Imported ' . count($data) . ' records.');
        Tenancy::reset();
    }
}
