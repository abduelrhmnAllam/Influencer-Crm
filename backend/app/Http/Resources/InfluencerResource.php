<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InfluencerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $cost = (float) $this->cost_price;
        $sale = (float) $this->sale_price;
        $margin = $sale > 0 ? (($sale - $cost) / $sale) * 100 : 0.0;

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'username' => $this->username,
            'phone' => $this->phone,
            'email' => $this->email,
            'platform' => $this->platform,
            'followers' => (int) $this->followers,
            'category' => $this->category,
            'rating' => $this->rating,
            'gender' => $this->gender,
            'region' => $this->region,
            'country' => $this->country,
            'cost_price' => $cost,
            'sale_price' => $sale,
            'profit_margin' => round($margin, 2), // Saudi compliance profit margin computation
            'bank_name' => $this->bank_name,
            'iban' => $this->iban,
            'account_holder' => $this->account_holder,
            'campaigns_count' => (int) $this->campaigns_count,
            'ads_count' => (int) $this->ads_count,
            'total_earned' => (float) $this->total_earned,
            'avg_rating' => (float) $this->avg_rating,
            'status' => $this->status,
            'notes' => $this->notes,
            'social_links' => $this->social_links,
            'tags' => $this->tags,
            'additional_platforms' => $this->additional_platforms,
            'assignee_id' => $this->assignee_id,
            'assignee' => $this->relationLoaded('assignee') ? $this->assignee : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
