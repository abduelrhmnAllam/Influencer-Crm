<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCampaignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('campaign') ? $this->route('campaign')->id : null;

        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20|unique:campaigns,code,' . $id,
            'customer_id' => 'required|exists:customers,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'budget' => 'nullable|numeric|min:0',
            'total_cost' => 'nullable|numeric|min:0',
            'total_sale' => 'nullable|numeric|min:0',
            'status' => 'nullable|string|in:draft,active,paused,completed,cancelled',
            'description' => 'nullable|string',
            'objectives' => 'nullable|string',
            'notes' => 'nullable|string',
            'coordinator_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'metadata' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم الحملة مطلوب.',
            'customer_id.required' => 'يرجى اختيار العميل.',
            'customer_id.exists' => 'العميل المحدد غير موجود في النظام.',
            'end_date.after_or_equal' => 'تاريخ الانتهاء يجب أن يكون مساويًا أو لاحقًا لتاريخ البداية.',
            'status.in' => 'حالة الحملة المحددة غير صالحة.',
            'coordinator_id.exists' => 'منسق الحملة المحدد غير موجود في النظام.',
        ];
    }
}