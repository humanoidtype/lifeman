<?php

namespace App\Http\Requests;

use App\Models\SavingsPayment;
use Illuminate\Foundation\Http\FormRequest;

class StoreSavingsPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('createPayment', [SavingsPayment::class, $this->route('savings_goal')]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'paid_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
