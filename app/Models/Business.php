<?php

namespace App\Models;

use Database\Factories\BusinessFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $rekap_period
 * @property Carbon $period_start
 * @property string $formula_type
 * @property string $raw_material_pct
 * @property string $operational_pct
 * @property string $marketing_pct
 * @property string $profit_pct
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'user_id',
    'name',
    'rekap_period',
    'period_start',
    'formula_type',
    'raw_material_pct',
    'operational_pct',
    'marketing_pct',
    'profit_pct',
])]
class Business extends Model
{
    /** @use HasFactory<BusinessFactory> */
    use HasFactory;

    public const PERIOD_WEEKLY = 'weekly';

    public const PERIOD_MONTHLY = 'monthly';

    public const PERIOD_YEARLY = 'yearly';

    public const FORMULA_FB_A = 'fb_a';

    public const FORMULA_FB_B = 'fb_b';

    public const FORMULA_CUSTOM = 'custom';

    /**
     * The preset formula percentages.
     *
     * @return array<string, array{raw_material: float, operational: float, marketing: float, profit: float}>
     */
    public static function formulaPresets(): array
    {
        return [
            self::FORMULA_FB_A => ['raw_material' => 40, 'operational' => 35, 'marketing' => 5, 'profit' => 20],
            self::FORMULA_FB_B => ['raw_material' => 30, 'operational' => 45, 'marketing' => 10, 'profit' => 15],
        ];
    }

    /**
     * The percentages used for this business' formula.
     *
     * @return array{raw_material: float, operational: float, marketing: float, profit: float}
     */
    public function formulaPercentages(): array
    {
        if ($this->formula_type === self::FORMULA_CUSTOM) {
            return [
                'raw_material' => (float) $this->raw_material_pct,
                'operational' => (float) $this->operational_pct,
                'marketing' => (float) $this->marketing_pct,
                'profit' => (float) $this->profit_pct,
            ];
        }

        return self::formulaPresets()[$this->formula_type] ?? self::formulaPresets()[self::FORMULA_FB_A];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'raw_material_pct' => 'decimal:2',
            'operational_pct' => 'decimal:2',
            'marketing_pct' => 'decimal:2',
            'profit_pct' => 'decimal:2',
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
     * @return HasMany<BusinessTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(BusinessTransaction::class);
    }
}
