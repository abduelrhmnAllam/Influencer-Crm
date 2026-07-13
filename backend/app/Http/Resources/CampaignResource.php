<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CampaignResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $cost = (float) $this->total_cost;
        $sale = (float) $this->total_sale;
        $margin = $sale > 0 ? (($sale - $cost) / $sale) * 100 : 0.0;

        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'customer_id' => $this->customer_id,
            'customer' => $this->relationLoaded('customer') ? $this->customer : null,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'budget' => (float) $this->budget,
            'total_cost' => $cost,
            'total_sale' => $sale,
            'profit_margin' => round($margin, 2), // Campaign profit margin calculation
            'status' => $this->status,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'notes' => $this->notes,
            'influencers_count' => (int) $this->influencers_count,
            'ads_count' => (int) $this->ads_count,
            'coordinator_id' => $this->coordinator_id,
            'coordinator' => $this->relationLoaded('coordinator') ? $this->coordinator : null,
            'tags' => $this->tags,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
