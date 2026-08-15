<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCashflowRequest;
use App\Http\Requests\UpdateCashflowRequest;
use App\Models\Cashflow;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashflowController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Cashflow::query()
            ->whereBelongsTo(auth()->user())
            ->withSum(['items as income_total' => fn ($q) => $q->income()], 'amount')
            ->withSum(['items as expense_total' => fn ($q) => $q->expense()], 'amount');

        $search = $request->string('search')->trim()->toString();

        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        $sort = $request->string('sort')->toString();

        if ($sort === 'oldest') {
            $query->oldest();
        } else {
            $query->latest();
        }

        return Inertia::render('cashflows/index', [
            'cashflows' => $query->paginate(20)->withQueryString(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(Cashflow $cashflow): Response
    {
        $this->authorize('view', $cashflow);

        $cashflow->load(['items' => fn ($query) => $query->latest()]);

        return Inertia::render('cashflows/show', [
            'cashflow' => $cashflow,
            'items' => $cashflow->items,
        ]);
    }

    public function store(StoreCashflowRequest $request): RedirectResponse
    {
        $request->user()->cashflows()->create($request->validated());

        return back()->with('success', 'Kas berhasil dibuat.');
    }

    public function update(UpdateCashflowRequest $request, Cashflow $cashflow): RedirectResponse
    {
        $cashflow->update($request->validated());

        return back()->with('success', 'Kas berhasil diperbarui.');
    }

    public function destroy(Cashflow $cashflow): RedirectResponse
    {
        $this->authorize('delete', $cashflow);

        $cashflow->delete();

        return redirect()->route('cashflows.index')->with('success', 'Kas dihapus.');
    }
}
