<?php

namespace App\Http\Requests;

use App\Enums\ReminderType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateReminderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('reminder'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', new Enum(ReminderType::class)],
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:1000'],
            'remind_at' => [
                Rule::requiredIf(fn () => $this->input('type') === ReminderType::Time->value && ! $this->has('remind_at')),
                'nullable',
                'date',
                'after:now',
            ],
        ];
    }
}
