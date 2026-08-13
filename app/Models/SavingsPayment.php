<?php

namespace App\Models;

use Database\Factories\SavingsPaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $savings_goal_id
 * @property string $amount
 * @property Carbon $paid_at
 * @property string|null $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['savings_goal_id', 'amount', 'paid_at', 'note'])]
class SavingsPayment extends Model
{
    /** @use HasFactory<SavingsPaymentFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'date',
        ];
    }

    /**
     * @return BelongsTo<SavingsGoal, $this>
     */
    public function savingsGoal(): BelongsTo
    {
        return $this->belongsTo(SavingsGoal::class);
    }
}
