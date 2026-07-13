<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'contact_person' => $this->contact_person,
            'phone' => $this->phone,
            'email' => $this->email,
            'sector' => $this->sector,
            'cr_number' => $this->cr_number,
            'vat_number' => $this->vat_number,
            'address' => $this->address,
            'notes' => $this->notes,
            'status' => $this->status,
            'total_spent' => (float) $this->total_spent,
            'campaigns_count' => (int) $this->campaigns_count,
            'active_campaigns_count' => (int) $this->active_campaigns_count,
            'assignee_id' => $this->assignee_id,
            'assignee' => $this->relationLoaded('assignee') ? $this->assignee : null,
            'tags' => $this->tags,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
