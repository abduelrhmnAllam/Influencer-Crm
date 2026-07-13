<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['code','name','monthly_price','currency','max_users','max_clients',
        'max_campaigns','max_influencers','max_reports','max_portal_links','is_active','features'];
    protected $casts = ['features' => 'array', 'is_active' => 'boolean', 'monthly_price' => 'decimal:2'];

    public function limitFor(string $resource): int
    {
        return (int) ($this->{'max_' . $resource} ?? 0);
    }
}
