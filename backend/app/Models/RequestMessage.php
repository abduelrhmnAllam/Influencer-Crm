<?php
namespace App\Models;

use App\Models\Concerns\BelongsToAgency;
use Illuminate\Database\Eloquent\Model;

class RequestMessage extends Model
{
    use BelongsToAgency;
    protected $fillable = ['request_id','body','visibility','author','author_role','attachments'];
    protected $casts = ['attachments' => 'array'];
}
