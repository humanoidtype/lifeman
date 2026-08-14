<?php

namespace App\Http\Requests;

use App\Models\Reminder;
use Illuminate\Foundation\Http\FormRequest;

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
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:1000'],
            'remind_at' => ['required', 'date', 'after:now'],
        ];
    }
}
