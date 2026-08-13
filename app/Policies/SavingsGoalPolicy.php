<?php

namespace App\Policies;

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SavingsGoalPolicy
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

    public function view(User $user, SavingsGoal $savingsGoal): bool
    {
        return $user->id === $savingsGoal->user_id;
    }

    public function update(User $user, SavingsGoal $savingsGoal): bool
    {
        return $user->id === $savingsGoal->user_id;
    }

    public function delete(User $user, SavingsGoal $savingsGoal): bool
    {
        return $user->id === $savingsGoal->user_id;
    }
}
