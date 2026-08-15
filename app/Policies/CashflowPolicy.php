<?php

namespace App\Policies;

use App\Models\Cashflow;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class CashflowPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Cashflow $cashflow): bool
    {
        return $user->id === $cashflow->user_id;
    }

    public function update(User $user, Cashflow $cashflow): bool
    {
        return $user->id === $cashflow->user_id;
    }

    public function delete(User $user, Cashflow $cashflow): bool
    {
        return $user->id === $cashflow->user_id;
    }
}
