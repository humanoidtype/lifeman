<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingsPaymentRequest;
use App\Http\Requests\UpdateSavingsPaymentRequest;
use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use Illuminate\Http\RedirectResponse;

class SavingsPaymentController extends Controller
{
    public function store(StoreSavingsPaymentRequest $request, SavingsGoal $savingsGoal): RedirectResponse
    {
        $savingsGoal->payments()->create($request->validated());

        return back()->with('success', 'Cicilan berhasil dicatat.');
    }

    public function update(UpdateSavingsPaymentRequest $request, SavingsPayment $savingsPayment): RedirectResponse
    {
        $savingsPayment->update($request->validated());

        return back()->with('success', 'Cicilan berhasil diperbarui.');
    }

    public function destroy(SavingsPayment $savingsPayment): RedirectResponse
    {
        $this->authorize('delete', $savingsPayment);

        $savingsPayment->delete();

        return back()->with('success', 'Cicilan dihapus.');
    }
}
