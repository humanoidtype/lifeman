<?php

namespace App\Policies;

use App\Models\Cashflow;
use App\Models\CashflowItem;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CashflowItemPolicy
{
    use HandlesAuthorization;

    public function createItem(User $user, Cashflow $cashflow): bool
    {
        return $user->id === $cashflow->user_id;
    }

    public function view(User $user, CashflowItem $cashflowItem): bool
    {
        return $user->id === $cashflowItem->cashflow->user_id;
    }

    public function update(User $user, CashflowItem $cashflowItem): bool
    {
        return $user->id === $cashflowItem->cashflow->user_id;
    }

    public function delete(User $user, CashflowItem $cashflowItem): bool
    {
        return $user->id === $cashflowItem->cashflow->user_id;
    }
}
