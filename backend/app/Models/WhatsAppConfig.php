<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppConfig extends Model
{
    protected $table = 'whatsapp_configs';

    protected $fillable = [
        'business_account_id', 'phone_number_id', 'display_phone_number', 'verified_name',
        'access_token', 'app_id', 'app_secret', 'webhook_verify_token', 'api_version',
        'connection_status', 'last_connected_at', 'last_error',
        'quality_rating', 'messaging_limit_tier',
        'business_name', 'business_email', 'business_website', 'business_about',
        'business_description', 'business_vertical', 'business_address', 'profile_picture_url',
        'auto_reply_enabled', 'working_hours_enabled', 'working_hours',
    ];
    
    protected $casts = [
        'auto_reply_enabled' => 'boolean',
        'working_hours_enabled' => 'boolean',
        'working_hours' => 'array',
        'last_connected_at' => 'datetime',
    ];
    
    protected $hidden = ['access_token', 'app_secret'];
}
