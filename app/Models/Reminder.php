<?php

namespace App\Models;

use Database\Factories\ReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $body
 * @property Carbon|null $remind_at
 * @property Carbon|null $done_at
 * @property Carbon|null $notified_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['user_id', 'title', 'body', 'remind_at', 'done_at', 'notified_at'])]
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
     * Whether the reminder time has passed and it is still not done.
     *
     * @return Attribute<bool, never>
     */
    protected function isExpired(): Attribute
    {
        return Attribute::get(
            fn (): bool => $this->remind_at !== null
                && $this->remind_at->isPast()
                && $this->done_at === null,
        );
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
     * Reminders whose time has passed and are still not done.
     *
     * @param  Builder<Reminder>  $query
     * @return Builder<Reminder>
     */
    #[Scope]
    protected function overdue(Builder $query): Builder
    {
        return $query->whereNull('done_at')
            ->where('remind_at', '<=', now());
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
