<?php

namespace App\Http\Requests;

use App\Models\SavingsGoal;
use Illuminate\Foundation\Http\FormRequest;

class StoreSavingsGoalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', SavingsGoal::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
