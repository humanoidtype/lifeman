<?php

namespace App\Models;

use Database\Factories\CashflowFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property Carbon|null $period_start
 * @property Carbon|null $period_end
 * @property string|null $notes
 * @property-read float|int|string|null $income_total
 * @property-read float|int|string|null $expense_total
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'title', 'period_start', 'period_end', 'notes'])]
class Cashflow extends Model
{
    /** @use HasFactory<CashflowFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<CashflowItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(CashflowItem::class);
    }
}
