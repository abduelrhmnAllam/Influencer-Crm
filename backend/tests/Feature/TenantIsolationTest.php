<?php

namespace Tests\Feature;

use App\Models\Agency;
use App\Models\CampaignRequest;
use App\Models\User;
use App\Support\Tenancy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    /** وكالة لا ترى بيانات وكالة أخرى — جوهر العزل */
    public function test_agency_cannot_see_other_agency_requests(): void
    {
        $a = Agency::create(['name' => 'A', 'slug' => 'a', 'status' => 'active']);
        $b = Agency::create(['name' => 'B', 'slug' => 'b', 'status' => 'active']);

        Tenancy::setAgencyId($a->id);
        CampaignRequest::create(['number' => 'REQ-A1', 'title' => 'طلب A', 'status' => 'new']);
        Tenancy::reset();

        Tenancy::setAgencyId($b->id);
        CampaignRequest::create(['number' => 'REQ-B1', 'title' => 'طلب B', 'status' => 'new']);

        // ضمن سياق B: نرى طلب B فقط
        $this->assertEquals(1, CampaignRequest::count());
        $this->assertEquals('طلب B', CampaignRequest::first()->title);

        // ضمن سياق A: نرى طلب A فقط
        Tenancy::setAgencyId($a->id);
        $this->assertEquals(1, CampaignRequest::count());
        $this->assertEquals('طلب A', CampaignRequest::first()->title);
    }

    public function test_no_tenant_context_returns_no_data(): void
    {
        $a = Agency::create(['name' => 'A', 'slug' => 'a2', 'status' => 'active']);
        Tenancy::setAgencyId($a->id);
        CampaignRequest::create(['number' => 'REQ-X', 'title' => 'X', 'status' => 'new']);
        Tenancy::reset(); // بلا سياق

        // fail-closed: لا بيانات بلا مستأجر
        $this->assertEquals(0, CampaignRequest::count());
    }
}
