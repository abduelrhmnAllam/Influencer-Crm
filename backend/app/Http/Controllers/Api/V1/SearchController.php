<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Influencer;
use App\Models\Transfer;
use App\Models\Task;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => 'required|string|min:1|max:100']);
        $q = $request->input('q');
        
        $results = [];

        // Customers
        Customer::search($q)->limit(5)->get()->each(function ($c) use (&$results) {
            $results[] = [
                'type' => 'customer',
                'title' => $c->name,
                'subtitle' => $c->code . ' · ' . ($c->phone ?? '—'),
                'url' => "/customers/{$c->id}",
                'icon' => 'users',
                'group' => 'العملاء',
            ];
        });

        // Influencers
        Influencer::search($q)->limit(5)->get()->each(function ($i) use (&$results) {
            $results[] = [
                'type' => 'influencer',
                'title' => $i->name,
                'subtitle' => $i->code . ' · ' . ($i->category ?? '—'),
                'url' => "/influencers/{$i->id}",
                'icon' => 'star',
                'group' => 'المؤثرين',
            ];
        });

        // Campaigns
        Campaign::where('name', 'like', "%{$q}%")
            ->orWhere('code', 'like', "%{$q}%")
            ->limit(5)->get()->each(function ($c) use (&$results) {
                $results[] = [
                    'type' => 'campaign',
                    'title' => $c->name,
                    'subtitle' => $c->code,
                    'url' => "/campaigns/{$c->id}",
                    'icon' => 'folder',
                    'group' => 'الحملات',
                ];
            });

        // Transfers
        Transfer::where('code', 'like', "%{$q}%")
            ->limit(5)->get()->each(function ($t) use (&$results) {
                $results[] = [
                    'type' => 'transfer',
                    'title' => $t->code,
                    'subtitle' => number_format((float) $t->amount_total, 2) . ' ر.س',
                    'url' => "/transfers/{$t->id}",
                    'icon' => 'wallet',
                    'group' => 'المالية',
                ];
            });

        // Tasks
        Task::where('title', 'like', "%{$q}%")
            ->limit(5)->get()->each(function ($t) use (&$results) {
                $results[] = [
                    'type' => 'task',
                    'title' => $t->title,
                    'subtitle' => $t->priority . ' · ' . $t->status,
                    'url' => "/tasks/{$t->id}",
                    'icon' => 'check',
                    'group' => 'المهام',
                ];
            });

        return response()->json(['results' => $results, 'query' => $q]);
    }
}
