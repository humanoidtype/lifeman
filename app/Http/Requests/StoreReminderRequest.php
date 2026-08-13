<?php

namespace App\Http\Requests;

use App\Enums\ReminderType;
use App\Models\Reminder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Reminder::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', new Enum(ReminderType::class)],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:1000'],
            'remind_at' => [
                Rule::requiredIf(fn () => $this->input('type') === ReminderType::Time->value),
                'nullable',
                'date',
                'after:now',
            ],
        ];
    }
}
