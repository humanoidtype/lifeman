<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBusinessRequest;
use App\Models\Business;
use App\Services\BusinessPeriodService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(private readonly BusinessPeriodService $periods) {}

    public function index(Request $request): Response
    {
        $businesses = Business::query()
            ->whereBelongsTo($request->user())
            ->withCount('transactions')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Business $business) => [
                'id' => $business->id,
                'name' => $business->name,
                'rekap_period' => $business->rekap_period,
                'period_start' => $business->period_start->format('Y-m-d'),
                'transactions_count' => $business->transactions_count,
            ]);

        return Inertia::render('businesses/index', [
            'businesses' => $businesses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('businesses/create');
    }

    public function store(StoreBusinessRequest $request): RedirectResponse
    {
        $percentages = $request->formulaPercentages();

        $business = $request->user()->businesses()->create([
            'name' => $request->string('name')->trim()->toString(),
            'rekap_period' => $request->string('rekap_period')->toString(),
            'period_start' => $request->date('period_start'),
            'formula_type' => $request->string('formula_type')->toString(),
            'raw_material_pct' => $percentages['raw_material'],
            'operational_pct' => $percentages['operational'],
            'marketing_pct' => $percentages['marketing'],
            'profit_pct' => $percentages['profit'],
        ]);

        return redirect()->route('businesses.show', $business);
    }

    public function show(Business $business, BusinessPeriodService $periods): Response
    {
        $this->authorize('view', $business);

        $current = $periods->currentPeriod($business);

        return Inertia::render('businesses/show', [
            'business' => [
                'id' => $business->id,
                'name' => $business->name,
                'rekap_period' => $business->rekap_period,
                'period_start' => $business->period_start->format('Y-m-d'),
                'formula_type' => $business->formula_type,
                'formula' => $business->formulaPercentages(),
            ],
            'ledger' => $periods->ledger($business),
            'days' => $periods->dailyBalances($business),
            'periods' => array_map(
                fn (array $period) => [
                    'key' => $period['key'],
                    'start' => $period['start']->format('Y-m-d'),
                    'end' => $period['end']->format('Y-m-d'),
                    'active' => $period['active'],
                    'completed' => $period['completed'],
                ],
                $periods->periods($business),
            ),
            'current_period' => [
                'start' => $current['start']->format('Y-m-d'),
                'end' => $current['end']->format('Y-m-d'),
            ],
            'lr' => $periods->lr($business, $current),
            'lr_chart' => $periods->lrChart($business),
        ]);
    }

    public function destroy(Business $business): RedirectResponse
    {
        $this->authorize('delete', $business);

        $business->delete();

        return redirect()->route('businesses.index');
    }
}
