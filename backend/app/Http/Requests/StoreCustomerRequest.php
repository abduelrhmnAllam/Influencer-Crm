<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Spatie permissions handled at middleware level
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $id = $this->route('customer') ? $this->route('customer')->id : null;

        return [
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:20|unique:customers,code,' . $id,
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'sector' => 'nullable|string|max:100',
            'cr_number' => 'nullable|string|max:20',
            'vat_number' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive,archived',
            'assignee_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'حقل الاسم مطلوب.',
            'code.unique' => 'رمز العميل مسجل مسبقاً في النظام.',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة.',
            'status.in' => 'حالة العميل المحددة غير صالحة.',
            'assignee_id.exists' => 'المسؤول المحدد غير موجود في النظام.',
        ];
    }
}
