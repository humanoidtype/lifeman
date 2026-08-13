<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingsGoalRequest;
use App\Http\Requests\UpdateSavingsGoalRequest;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('savings/index', [
            'goals' => SavingsGoal::query()
                ->whereBelongsTo(auth()->user())
                ->withSum('payments as paid_amount', 'amount')
                ->withCount('payments')
                ->latest()
                ->paginate(20),
        ]);
    }

    public function show(SavingsGoal $savingsGoal): Response
    {
        $this->authorize('view', $savingsGoal);

        $savingsGoal->loadSum('payments as paid_amount', 'amount');
        $savingsGoal->load(['payments' => fn ($query) => $query->latest('paid_at')]);

        return Inertia::render('savings/show', [
            'goal' => $savingsGoal,
            'payments' => $savingsGoal->payments,
        ]);
    }

    public function store(StoreSavingsGoalRequest $request): RedirectResponse
    {
        $request->user()->savingsGoals()->create($request->validated());

        return back()->with('success', 'Target nabung berhasil dibuat.');
    }

    public function update(UpdateSavingsGoalRequest $request, SavingsGoal $savingsGoal): RedirectResponse
    {
        $savingsGoal->update($request->validated());

        return back()->with('success', 'Target nabung berhasil diperbarui.');
    }

    public function destroy(SavingsGoal $savingsGoal): RedirectResponse
    {
        $this->authorize('delete', $savingsGoal);

        $savingsGoal->delete();

        return redirect()->route('savings-goals.index')->with('success', 'Target nabung dihapus.');
    }
}
