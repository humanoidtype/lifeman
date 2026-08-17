<?php

namespace App\Http\Requests;

use App\Models\Business;
use App\Models\BusinessTransaction;
use Illuminate\Foundation\Http\FormRequest;

class StoreBusinessTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $business = $this->route('business');

        return $business instanceof Business
            && $this->user()->can('storeTransaction', $business);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'in:'.implode(',', BusinessTransaction::FORM_TYPES)],
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:100'],
            'category' => [
                'nullable',
                'required_if:type,'.BusinessTransaction::TYPE_EXPENSE_SMALL.','.BusinessTransaction::TYPE_EXPENSE_BIG,
                'in:'.implode(',', BusinessTransaction::CATEGORIES),
            ],
            'amount' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama transaksi wajib diisi.',
            'category.required_if' => 'Jenis pengeluaran wajib dipilih.',
            'amount.required' => 'Nominal wajib diisi.',
            'amount.min' => 'Nominal tidak boleh negatif.',
        ];
    }
}
