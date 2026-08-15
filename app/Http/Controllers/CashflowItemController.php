<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCashflowItemRequest;
use App\Http\Requests\UpdateCashflowItemRequest;
use App\Models\Cashflow;
use App\Models\CashflowItem;
use Illuminate\Http\RedirectResponse;

class CashflowItemController extends Controller
{
    public function store(StoreCashflowItemRequest $request, Cashflow $cashflow): RedirectResponse
    {
        $cashflow->items()->create($request->validated());

        return back()->with('success', 'Item berhasil ditambahkan.');
    }

    public function update(UpdateCashflowItemRequest $request, CashflowItem $cashflowItem): RedirectResponse
    {
        $cashflowItem->update($request->validated());

        return back()->with('success', 'Item berhasil diperbarui.');
    }

    public function destroy(CashflowItem $cashflowItem): RedirectResponse
    {
        $this->authorize('delete', $cashflowItem);

        $cashflowItem->delete();

        return back()->with('success', 'Item dihapus.');
    }
}
