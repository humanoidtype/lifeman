<?php

namespace App\Models;

use Database\Factories\BusinessTransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $business_id
 * @property Carbon $date
 * @property string $type
 * @property string $name
 * @property string|null $category
 * @property string $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['business_id', 'date', 'type', 'name', 'category', 'amount'])]
class BusinessTransaction extends Model
{
    /** @use HasFactory<BusinessTransactionFactory> */
    use HasFactory;

    public const TYPE_INITIAL_CAPITAL = 'initial_capital';

    public const TYPE_DAILY_MODAL = 'daily_modal';

    public const TYPE_INCOME = 'income';

    public const TYPE_EXPENSE_SMALL = 'expense_small';

    public const TYPE_EXPENSE_BIG = 'expense_big';

    public const TYPE_OPENING_BALANCE = 'opening_balance';

    public const CATEGORY_RAW_MATERIAL = 'raw_material';

    public const CATEGORY_OPERATIONAL = 'operational';

    public const CATEGORY_MARKETING = 'marketing';

    public const CATEGORY_PRE_OPERATIONAL = 'pre_operational';

    public const TYPES = [
        self::TYPE_INITIAL_CAPITAL,
        self::TYPE_DAILY_MODAL,
        self::TYPE_INCOME,
        self::TYPE_EXPENSE_SMALL,
        self::TYPE_EXPENSE_BIG,
        self::TYPE_OPENING_BALANCE,
    ];

    /**
     * Types that can be created through the transaction form.
     */
    public const FORM_TYPES = [
        self::TYPE_INITIAL_CAPITAL,
        self::TYPE_DAILY_MODAL,
        self::TYPE_INCOME,
        self::TYPE_EXPENSE_SMALL,
        self::TYPE_EXPENSE_BIG,
    ];

    public const CATEGORIES = [
        self::CATEGORY_RAW_MATERIAL,
        self::CATEGORY_OPERATIONAL,
        self::CATEGORY_MARKETING,
        self::CATEGORY_PRE_OPERATIONAL,
    ];

    /**
     * Whether this transaction type is an expense.
     */
    public function isExpense(): bool
    {
        return in_array($this->type, [self::TYPE_EXPENSE_SMALL, self::TYPE_EXPENSE_BIG], true);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
