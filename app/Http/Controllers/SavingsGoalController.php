<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSavingsGoalRequest;
use App\Http\Requests\UpdateSavingsGoalRequest;
use App\Models\SavingsGoal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SavingsGoal::query()
            ->whereBelongsTo(auth()->user())
            ->withSum('payments as paid_amount', 'amount')
            ->withCount('payments');

        $search = $request->string('search')->trim()->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $status = $request->string('status')->toString();

        match ($status) {
            'active' => $query->active(),
            'completed' => $query->whereRaw(
                '(select coalesce(sum(amount), 0) from savings_payments where savings_payments.savings_goal_id = savings_goals.id) >= target_amount',
            ),
            default => null,
        };

        $sort = $request->string('sort')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';

        if (in_array($sort, ['created_at', 'target_amount', 'end_date', 'title'], true)) {
            $query->orderBy($sort, $dir);
        } else {
            $query->latest();
        }

        return Inertia::render('savings/index', [
            'goals' => $query->paginate(20)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
                'dir' => $dir,
            ],
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
