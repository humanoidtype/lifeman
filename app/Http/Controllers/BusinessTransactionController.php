<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBusinessTransactionRequest;
use App\Http\Requests\UpdateBusinessTransactionRequest;
use App\Models\Business;
use App\Models\BusinessTransaction;
use Illuminate\Http\RedirectResponse;

class BusinessTransactionController extends Controller
{
    public function store(StoreBusinessTransactionRequest $request, Business $business): RedirectResponse
    {
        $type = $request->string('type')->toString();
        $date = $request->date('date')->toDateString();

        if ($type === BusinessTransaction::TYPE_INITIAL_CAPITAL) {
            $exists = $business->transactions()->where('type', $type)->exists();

            if ($exists) {
                return back()->withErrors(['initial_capital' => 'Modal awal sudah tercatat.']);
            }
        }

        if ($type === BusinessTransaction::TYPE_DAILY_MODAL) {
            $exists = $business->transactions()
                ->where('type', $type)
                ->whereDate('date', $request->date('date'))
                ->exists();

            if ($exists) {
                return back()->withErrors(['daily_modal' => "Modal harian tanggal {$date} sudah tercatat."]);
            }
        }

        $business->transactions()->create([
            'date' => $date,
            'type' => $type,
            'name' => $request->string('name')->trim()->toString(),
            'category' => $request->string('category')->isEmpty()
                ? null
                : $request->string('category')->toString(),
            'amount' => $request->float('amount'),
        ]);

        return back();
    }

    public function update(UpdateBusinessTransactionRequest $request, BusinessTransaction $businessTransaction): RedirectResponse
    {
        $data = [];

        if ($request->filled('name')) {
            $data['name'] = $request->string('name')->trim()->toString();
        }

        if ($request->filled('amount')) {
            $data['amount'] = $request->float('amount');
        }

        if ($request->filled('category')) {
            $data['category'] = $request->string('category')->toString();
        }

        if ($request->filled('date')) {
            $data['date'] = $request->date('date')->toDateString();
        }

        $businessTransaction->update($data);

        return back();
    }

    public function destroy(BusinessTransaction $businessTransaction): RedirectResponse
    {
        $this->authorize('delete', $businessTransaction);

        $businessTransaction->delete();

        return back();
    }
}
