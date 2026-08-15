<?php

namespace App\Http\Requests;

use App\Models\CashflowItem;
use Illuminate\Foundation\Http\FormRequest;

class StoreCashflowItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('createItem', [CashflowItem::class, $this->route('cashflow')]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:'.CashflowItem::TYPE_INCOME.','.CashflowItem::TYPE_EXPENSE],
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:1'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
