<?php

namespace App\Models;

use App\Enums\ReminderType;
use Database\Factories\ReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property ReminderType $type
 * @property string $title
 * @property string|null $body
 * @property Carbon|null $remind_at
 * @property Carbon|null $done_at
 * @property Carbon|null $notified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'type', 'title', 'body', 'remind_at', 'done_at', 'notified_at'])]
class Reminder extends Model
{
    /** @use HasFactory<ReminderFactory> */
    use HasFactory;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ReminderType::class,
            'remind_at' => 'datetime',
            'done_at' => 'datetime',
            'notified_at' => 'datetime',
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
     * @param  Builder<Reminder>  $query
     * @return Builder<Reminder>
     */
    #[Scope]
    protected function pending(Builder $query): Builder
    {
        return $query->whereNull('done_at');
    }

    /**
     * @param  Builder<Reminder>  $query
     * @return Builder<Reminder>
     */
    #[Scope]
    protected function due(Builder $query): Builder
    {
        return $query->whereNull('done_at')
            ->where('remind_at', '<=', now())
            ->whereNull('notified_at');
    }

    /**
     * @param  Builder<Reminder>  $query
     * @return Builder<Reminder>
     */
    #[Scope]
    protected function upcoming(Builder $query): Builder
    {
        return $query->whereNull('done_at')->where('remind_at', '>', now());
    }
}
