<?php

namespace App\Http\Requests;

use App\Models\BusinessTransaction;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('business_transaction');

        return $transaction instanceof BusinessTransaction
            && $this->user()->can('update', $transaction);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $transaction = $this->route('business_transaction');

        if (! $transaction instanceof BusinessTransaction) {
            return [];
        }

        $isExpense = $transaction->type === BusinessTransaction::TYPE_EXPENSE_SMALL
            || $transaction->type === BusinessTransaction::TYPE_EXPENSE_BIG;

        return [
            'date' => ['sometimes', 'date'],
            'name' => ['sometimes', 'string', 'max:100'],
            'category' => [
                'nullable',
                $isExpense ? 'required' : 'prohibited',
                'in:'.implode(',', BusinessTransaction::CATEGORIES),
            ],
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => 'Jenis pengeluaran wajib dipilih.',
            'amount.min' => 'Nominal tidak boleh negatif.',
        ];
    }
}
