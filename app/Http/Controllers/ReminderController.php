<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReminderRequest;
use App\Http\Requests\UpdateReminderRequest;
use App\Models\Reminder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReminderController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Reminder::query()->whereBelongsTo(auth()->user());

        $search = $request->string('search')->trim()->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('body', 'like', "%{$search}%");
            });
        }

        $status = $request->string('status')->toString();

        match ($status) {
            'pending' => $query->pending(),
            'done' => $query->whereNotNull('done_at'),
            'overdue' => $query->overdue(),
            default => null,
        };

        $sort = $request->string('sort')->toString();
        $dir = $request->string('dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';

        if (in_array($sort, ['remind_at', 'created_at', 'title', 'done_at'], true)) {
            $query->orderBy($sort, $dir);
        } else {
            $query->orderByRaw('done_at IS NULL DESC')->latest('remind_at');
        }

        return Inertia::render('reminders/index', [
            'reminders' => $query->paginate(20)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort' => $sort,
                'dir' => $dir,
            ],
        ]);
    }

    public function store(StoreReminderRequest $request): RedirectResponse
    {
        $request->user()->reminders()->create($request->validated());

        return back()->with('success', 'Ingatkan berhasil dibuat.');
    }

    public function update(UpdateReminderRequest $request, Reminder $reminder): RedirectResponse
    {
        $reminder->update($request->validated());

        return back()->with('success', 'Ingatkan berhasil diperbarui.');
    }

    public function destroy(Reminder $reminder): RedirectResponse
    {
        $this->authorize('delete', $reminder);

        $reminder->delete();

        return back()->with('success', 'Ingatkan dihapus.');
    }

    public function due(): JsonResponse
    {
        $reminders = Reminder::query()
            ->whereBelongsTo(auth()->user())
            ->due()
            ->orderBy('remind_at')
            ->get(['id', 'title', 'body', 'remind_at']);

        return response()->json($reminders);
    }

    public function upcoming(): JsonResponse
    {
        $reminders = Reminder::query()
            ->whereBelongsTo(auth()->user())
            ->upcoming()
            ->orderBy('remind_at')
            ->get(['id', 'title', 'body', 'remind_at']);

        return response()->json($reminders);
    }

    public function notified(Request $request, Reminder $reminder): RedirectResponse|HttpResponse
    {
        $this->authorize('update', $reminder);

        $reminder->update(['notified_at' => now()]);

        return $request->wantsJson() ? response()->noContent() : back();
    }

    public function done(Request $request, Reminder $reminder): RedirectResponse|HttpResponse
    {
        $this->authorize('update', $reminder);

        $reminder->update(['done_at' => now(), 'notified_at' => now()]);

        return $request->wantsJson() ? response()->noContent() : back()->with('success', 'Ingatkan selesai.');
    }
}
