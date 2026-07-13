<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInfluencerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $id = $this->route('influencer') ? $this->route('influencer')->id : null;

        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20|unique:influencers,code,' . $id,
            'username' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'platform' => 'required|string|in:instagram,tiktok,snapchat,twitter,youtube,linkedin',
            'followers' => 'nullable|integer|min:0',
            'category' => 'nullable|string|max:50',
            'rating' => 'nullable|string|in:A+,A,B,C',
            'gender' => 'nullable|string|in:male,female,other',
            'region' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:50',
            'cost_price' => 'nullable|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'bank_name' => 'nullable|string|max:100',
            'iban' => ['nullable', 'string', 'regex:/^SA\d{22}$/i'], // Saudi IBAN validation
            'account_holder' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:active,inactive,blacklisted',
            'notes' => 'nullable|string',
            'social_links' => 'nullable|array',
            'tags' => 'nullable|array',
            'additional_platforms' => 'nullable|array',
            'assignee_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اسم المؤثر مطلوب.',
            'platform.required' => 'المنصة الرئيسية مطلوبة.',
            'platform.in' => 'المنصة المحددة غير صالحة.',
            'iban.regex' => 'صيغة الآيبان (IBAN) غير صحيحة. يجب أن يبدأ بـ SA ويتبعه 22 رقماً.',
            'status.in' => 'حالة المؤثر المحددة غير صالحة.',
            'assignee_id.exists' => 'المسؤول المحدد غير موجود في النظام.',
        ];
    }
}
