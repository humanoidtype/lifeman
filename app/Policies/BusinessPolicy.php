<?php

namespace App\Policies;

use App\Models\Business;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class BusinessPolicy
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

    public function view(User $user, Business $business): bool
    {
        return $user->id === $business->user_id;
    }

    public function update(User $user, Business $business): bool
    {
        return $user->id === $business->user_id;
    }

    public function delete(User $user, Business $business): bool
    {
        return $user->id === $business->user_id;
    }

    public function storeTransaction(User $user, Business $business): bool
    {
        return $user->id === $business->user_id;
    }
}