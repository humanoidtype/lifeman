<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class NotificationUpdateRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'notification_sound' => ['required', 'string', 'max:50', 'in:default,chime,beep,melody'],
        ];
    }
}