<?php

namespace App\Enums;

enum ReminderType: string
{
    case Time = 'time';
    case Task = 'task';

    public function label(): string
    {
        return match ($this) {
            self::Time => 'Waktu',
            self::Task => 'Task',
        };
    }
}
