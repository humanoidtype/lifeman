<?php

namespace App\Policies;

use App\Models\BusinessTransaction;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BusinessTransactionPolicy
{
    use HandlesAuthorization;

    public function update(User $user, BusinessTransaction $businessTransaction): bool
    {
        return $user->id === $businessTransaction->business->user_id;
    }

    public function delete(User $user, BusinessTransaction $businessTransaction): bool
    {
        return $user->id === $businessTransaction->business->user_id;
    }
}