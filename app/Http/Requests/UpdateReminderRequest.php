<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['nullable', 'string', 'max:1000'],
            'remind_at' => ['sometimes', 'date', 'after:now'],
        ];
    }
}