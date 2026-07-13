<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Resources\CustomerResource;

class CustomerController extends Controller
{
    /**
     * GET /api/v1/customers
     * Query: search, status, sort, per_page, page
     */
    public function index(Request $request)
    {
        $query = Customer::with(['assignee:id,name,role'])
            ->search($request->input('search'));

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($sector = $request->input('sector')) {
            $query->where('sector', $sector);
        }

        // Sort
        $sortField = $request->input('sort', '-updated_at');
        $direction = str_starts_with($sortField, '-') ? 'desc' : 'asc';
        $field = ltrim($sortField, '-');
        $allowedSorts = ['name', 'code', 'updated_at', 'created_at', 'total_spent', 'campaigns_count'];
        if (in_array($field, $allowedSorts)) {
            $query->orderBy($field, $direction);
        }

        $perPage = min((int) $request->input('per_page', 25), 100);
        $customers = $query->paginate($perPage);

        return CustomerResource::collection($customers);
    }

    /**
     * POST /api/v1/customers
     */
    public function store(StoreCustomerRequest $request)
    {
        $customer = Customer::create($request->validated());
        $customer->refresh()->load('assignee:id,name');

        return response()->json([
            'message' => 'تم إنشاء العميل بنجاح',
            'data' => new CustomerResource($customer),
        ], 201);
    }

    /**
     * GET /api/v1/customers/{customer}
     */
    public function show(Customer $customer)
    {
        $customer->load([
            'assignee:id,name,role',
            'campaigns' => fn($q) => $q->orderByDesc('start_date')->limit(20),
        ]);

        return response()->json([
            'data' => new CustomerResource($customer),
            'stats' => [
                'campaigns_count' => $customer->campaigns()->count(),
                'active_campaigns_count' => $customer->activeCampaigns()->count(),
                'total_ads' => $customer->dailyAds()->count(),
                'total_spent' => (float) $customer->dailyAds()->sum('sale_price'),
            ],
        ]);
    }

    /**
     * PATCH /api/v1/customers/{customer}
     */
    public function update(StoreCustomerRequest $request, Customer $customer)
    {
        $customer->update($request->validated());

        return response()->json([
            'message' => 'تم التحديث بنجاح',
            'data' => new CustomerResource($customer->fresh()),
        ]);
    }

    /**
     * DELETE /api/v1/customers/{customer}
     */
    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    /**
     * POST /api/v1/customers/bulk-delete
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:customers,id',
        ]);

        $count = Customer::whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => "تم حذف {$count} عميل",
            'deleted_count' => $count,
        ]);
    }
}
