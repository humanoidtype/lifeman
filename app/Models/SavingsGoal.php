<?php

namespace App\Models;

use Database\Factories\SavingsGoalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string $target_amount
 * @property Carbon $start_date
 * @property Carbon|null $end_date
 * @property string|null $notes
 * @property-read float|int|string|null $paid_amount
 * @property-read int|null $payments_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'title', 'target_amount', 'start_date', 'end_date', 'notes'])]
class SavingsGoal extends Model
{
    /** @use HasFactory<SavingsGoalFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
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
     * @return HasMany<SavingsPayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(SavingsPayment::class);
    }

    /**
     * @param  Builder<SavingsGoal>  $query
     * @return Builder<SavingsGoal>
     */
    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where(fn (Builder $builder) => $builder
            ->whereNull('end_date')
            ->orWhere('end_date', '>=', now()->toDateString()));
    }
}
