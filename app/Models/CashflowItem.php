<?php

namespace App\Models;

use Database\Factories\CashflowItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cashflow_id
 * @property string $type
 * @property string $name
 * @property string $amount
 * @property int $quantity
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['cashflow_id', 'type', 'name', 'amount', 'quantity'])]
class CashflowItem extends Model
{
    public const TYPE_INCOME = 'income';

    public const TYPE_EXPENSE = 'expense';

    /** @use HasFactory<CashflowItemFactory> */
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
            'quantity' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Cashflow, $this>
     */
    public function cashflow(): BelongsTo
    {
        return $this->belongsTo(Cashflow::class);
    }

    /**
     * @param  Builder<CashflowItem>  $query
     * @return Builder<CashflowItem>
     */
    #[Scope]
    protected function income(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_INCOME);
    }

    /**
     * @param  Builder<CashflowItem>  $query
     * @return Builder<CashflowItem>
     */
    #[Scope]
    protected function expense(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_EXPENSE);
    }
}
