<?php

namespace Database\Seeders;

use App\Models\{Agency, Campaign, CampaignRequest, Content, Customer, DailyAd, Influencer, Nomination, Notification, RequestUser, Task, Transfer, User};
use App\Support\Tenancy;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        Tenancy::bypass(true);
        $agency = Agency::where('slug', 'default')->firstOrFail();
        Tenancy::setAgencyId($agency->id);
        $admin = User::where('username', 'admin')->firstOrFail();
        $manager = User::where('username', 'manager')->first() ?? $admin;
        $finance = User::where('username', 'finance')->first() ?? $admin;

        $customers = collect([
            ['code'=>'CL-100','name'=>'شركة رِواء للتجارة','contact_person'=>'سارة العتيبي','phone'=>'0501234567','email'=>'marketing@riwa.sa','sector'=>'التجارة الإلكترونية','status'=>'active'],
            ['code'=>'CL-101','name'=>'مطاعم مذاق نجد','contact_person'=>'خالد القحطاني','phone'=>'0552345678','email'=>'brand@mathaq.sa','sector'=>'الأغذية والمطاعم','status'=>'active'],
            ['code'=>'CL-102','name'=>'وجهة للسفر والسياحة','contact_person'=>'نورة الحربي','phone'=>'0533456789','email'=>'campaigns@wijha.sa','sector'=>'السفر والسياحة','status'=>'active'],
        ])->map(fn ($row) => Customer::updateOrCreate(['code'=>$row['code']], $row + ['agency_id'=>$agency->id,'assignee_id'=>$manager->id]));

        $influencers = collect([
            ['code'=>'IN-0100','name'=>'ليان أحمد','username'=>'layan.style','platform'=>'instagram','followers'=>485000,'category'=>'أزياء وجمال','rating'=>'A+','region'=>'الرياض','cost_price'=>4200,'sale_price'=>6500],
            ['code'=>'IN-0101','name'=>'عبدالله فهد','username'=>'abdullah.travels','platform'=>'tiktok','followers'=>720000,'category'=>'سفر وسياحة','rating'=>'A','region'=>'جدة','cost_price'=>5000,'sale_price'=>7800],
            ['code'=>'IN-0102','name'=>'ريم خالد','username'=>'reem.tastes','platform'=>'snapchat','followers'=>310000,'category'=>'طعام','rating'=>'A','region'=>'الدمام','cost_price'=>3500,'sale_price'=>5400],
            ['code'=>'IN-0103','name'=>'سلمان تيك','username'=>'salman.tech','platform'=>'youtube','followers'=>195000,'category'=>'تقنية','rating'=>'B+','region'=>'الرياض','cost_price'=>6000,'sale_price'=>9000],
        ])->map(fn ($row) => Influencer::updateOrCreate(['code'=>$row['code']], $row + ['agency_id'=>$agency->id,'country'=>'SA','status'=>'active','assignee_id'=>$manager->id]));

        $campaigns = collect([
            ['code'=>'CMP-100','name'=>'صيف رِواء 2026','customer_id'=>$customers[0]->id,'start_date'=>now()->subDays(8),'end_date'=>now()->addDays(22),'budget'=>85000,'status'=>'active'],
            ['code'=>'CMP-101','name'=>'نكهات نجد الجديدة','customer_id'=>$customers[1]->id,'start_date'=>now()->addDays(3),'end_date'=>now()->addDays(33),'budget'=>62000,'status'=>'draft'],
            ['code'=>'CMP-102','name'=>'اكتشف العلا','customer_id'=>$customers[2]->id,'start_date'=>now()->subDays(40),'end_date'=>now()->subDays(5),'budget'=>120000,'status'=>'completed'],
        ])->map(fn ($row) => Campaign::updateOrCreate(['code'=>$row['code']], $row + ['agency_id'=>$agency->id,'coordinator_id'=>$manager->id,'description'=>'حملة تجريبية متكاملة لعرض إمكانات النظام.']));

        foreach ($campaigns as $index => $campaign) {
            $influencer = $influencers[$index];
            $campaign->influencers()->syncWithoutDetaching([$influencer->id => ['journey_stage'=>'agreed','agreed_cost'=>$influencer->cost_price,'agreed_sale'=>$influencer->sale_price]]);
            DailyAd::updateOrCreate(['code'=>'AD-2026-'.str_pad($index + 1, 4, '0', STR_PAD_LEFT)], [
                'agency_id'=>$agency->id,'campaign_id'=>$campaign->id,'customer_id'=>$campaign->customer_id,'influencer_id'=>$influencer->id,
                'ad_date'=>now()->addDays($index * 3),'platform'=>$influencer->platform,'status'=>$index === 2 ? 'published' : 'scheduled',
                'cost_price'=>$influencer->cost_price,'sale_price'=>$influencer->sale_price,'coordinator_id'=>$manager->id,
            ]);
        }

        Transfer::updateOrCreate(['code'=>'TR-2026-0001'], ['agency_id'=>$agency->id,'direction'=>'outgoing','campaign_id'=>$campaigns[0]->id,'customer_id'=>$customers[0]->id,'amount_base'=>4200,'vat'=>630,'amount_total'=>4830,'with_vat'=>true,'workflow_stage'=>'1','status'=>'pending','requested_by'=>$manager->id,'assignee_id'=>$finance->id,'reason'=>'مستحقات إعلان المؤثر']);
        Task::updateOrCreate(['code'=>'TSK-0001'], ['agency_id'=>$agency->id,'title'=>'مراجعة محتوى حملة صيف رِواء','description'=>'اعتماد النص والصورة قبل النشر','assigned_by'=>$admin->id,'assigned_to'=>$manager->id,'priority'=>'high','status'=>'in_progress','due_date'=>now()->addDays(2),'progress'=>45]);
        Content::updateOrCreate(['code'=>'CT-00001'], ['agency_id'=>$agency->id,'campaign_id'=>$campaigns[0]->id,'customer_id'=>$customers[0]->id,'influencer_id'=>$influencers[0]->id,'source'=>'campaign','platform'=>'instagram','type'=>'reel','content_url'=>'https://www.instagram.com/','title'=>'إطلالة صيف رِواء','rating'=>5,'published_date'=>now()->subDay(),'views_count'=>128400,'likes_count'=>9400,'comments_count'=>530,'uploaded_by'=>$manager->id]);

        $portalUser = RequestUser::updateOrCreate(
            ['email' => 'client.demo@smartcode.sa'],
            [
                'agency_id' => $agency->id,
                'name' => 'Demo Client',
                'org' => 'Riwa Trading',
                'role' => 'Marketing Manager',
                'user_type' => 'client',
                'status' => 'active',
                'customer_id' => $customers[0]->id,
                'permissions' => ['create_request','upload_attachments','add_notes','track_status','approve_nominations','reject_nominations','request_alternative'],
                'token' => 'rqu_demo_client_2026_smartcode',
                'token_expires_at' => now()->addYear(),
                'token_revoked' => false,
            ],
        );
        $portalRequest = CampaignRequest::updateOrCreate(
            ['number' => 'REQ-DEMO-001'],
            [
                'agency_id' => $agency->id,
                'title' => 'Summer campaign influencer approval',
                'type' => 'campaign',
                'source' => 'external_client',
                'customer_id' => $customers[0]->id,
                'customer_name' => $customers[0]->name,
                'request_user_id' => $portalUser->id,
                'requested_by' => $portalUser->name,
                'owner' => $manager->name,
                'status' => 'in_review',
                'priority' => 'high',
                'brief' => ['objective' => 'Approve the proposed influencer and launch the summer campaign.'],
                'campaign_id' => $campaigns[0]->id,
            ],
        );
        Nomination::updateOrCreate(
            ['request_id' => $portalRequest->id, 'influencer_id' => $influencers[0]->id],
            [
                'agency_id' => $agency->id,
                'campaign_id' => $campaigns[0]->id,
                'influencer_name' => $influencers[0]->name,
                'platforms' => [$influencers[0]->platform],
                'account_url' => 'https://www.instagram.com/'.$influencers[0]->username,
                'proposed_date' => now()->addDays(7)->toDateString(),
                'ad_type' => 'reel',
                'selling_price' => $influencers[0]->sale_price,
                'cost_price' => $influencers[0]->cost_price,
                'with_vat' => true,
                'status' => 'pending',
                'client_decision' => null,
                'client_notes' => null,
            ],
        );

        foreach ([
            ['campaign','حملة جديدة جاهزة للمراجعة','تم تجهيز حملة نكهات نجد الجديدة.','/campaigns'],
            ['task','مهمة تقترب من موعدها','مراجعة محتوى حملة صيف رِواء تستحق خلال يومين.','/tasks'],
            ['transfer','طلب تحويل جديد','يوجد طلب تحويل بقيمة 4,830 ر.س بانتظار المالية.','/finance'],
        ] as [$type,$title,$body,$url]) {
            Notification::updateOrCreate(['user_id'=>$admin->id,'title'=>$title], ['agency_id'=>$agency->id,'type'=>$type,'body'=>$body,'url'=>$url,'read_at'=>null]);
        }
        Notification::updateOrCreate(
            ['user_id'=>$finance->id, 'title'=>'تحويل بانتظار التنفيذ'],
            ['agency_id'=>$agency->id, 'type'=>'transfer', 'body'=>'راجع بيانات المستفيد ونفّذ التحويل.', 'url'=>'/finance']
        );

        foreach ($customers as $customer) $customer->refreshCachedCounts();
        foreach ($influencers as $influencer) $influencer->refreshCachedCounts();
        foreach ($campaigns as $campaign) $campaign->refreshFinancials();
        Tenancy::reset();
    }
}
