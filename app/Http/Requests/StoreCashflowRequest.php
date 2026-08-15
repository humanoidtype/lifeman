<?php

namespace App\Http\Requests;

use App\Models\Cashflow;
use Illuminate\Foundation\Http\FormRequest;

class StoreCashflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Cashflow::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'period_start' => ['nullable', 'date'],
            'period_end' => ['nullable', 'date', 'after_or_equal:period_start'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
