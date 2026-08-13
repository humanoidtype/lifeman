<?php

namespace App\Policies;

use App\Models\SavingsGoal;
use App\Models\SavingsPayment;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SavingsPaymentPolicy
{
    use HandlesAuthorization;

    public function createPayment(User $user, SavingsGoal $savingsGoal): bool
    {
        return $user->id === $savingsGoal->user_id;
    }

    public function view(User $user, SavingsPayment $savingsPayment): bool
    {
        return $user->id === $savingsPayment->savingsGoal->user_id;
    }

    public function update(User $user, SavingsPayment $savingsPayment): bool
    {
        return $user->id === $savingsPayment->savingsGoal->user_id;
    }

    public function delete(User $user, SavingsPayment $savingsPayment): bool
    {
        return $user->id === $savingsPayment->savingsGoal->user_id;
    }
}
