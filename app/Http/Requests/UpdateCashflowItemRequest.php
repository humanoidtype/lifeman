<?php

namespace App\Http\Requests;

use App\Models\CashflowItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCashflowItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('cashflow_item'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'string', 'in:'.CashflowItem::TYPE_INCOME.','.CashflowItem::TYPE_EXPENSE],
            'name' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:1'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
