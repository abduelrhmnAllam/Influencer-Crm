<?php

namespace App\Policies;

use App\Models\CampaignRequest;
use App\Models\User;

/** تفويض على مستوى السجل (لا الدور فقط) — العزل بالوكالة مضمون أصلاً بالـscope */
class CampaignRequestPolicy
{
    private const MANAGERS = ['super_admin', 'agency_admin', 'campaign_manager'];

    public function viewAny(User $user): bool { return true; } // مقيّد أصلاً بوكالته

    public function view(User $user, CampaignRequest $req): bool
    {
        return $user->agency_id === $req->agency_id || $user->role === 'super_admin';
    }

    public function update(User $user, CampaignRequest $req): bool
    {
        if ($user->role === 'super_admin') return true;
        if ($user->agency_id !== $req->agency_id) return false;
        // المدراء أو مالك الطلب (owner) فقط
        return in_array($user->role, self::MANAGERS, true) || $req->owner === $user->name;
    }

    public function delete(User $user, CampaignRequest $req): bool
    {
        if ($user->role === 'super_admin') return true;
        if ($user->agency_id !== $req->agency_id) return false;
        return in_array($user->role, ['agency_admin', 'campaign_manager'], true);
    }
}
