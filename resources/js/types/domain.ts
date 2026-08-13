export type Reminder = {
    id: number;
    title: string;
    body: string | null;
    remind_at: string | null;
    done_at: string | null;
    notified_at: string | null;
    created_at: string;
    updated_at: string;
};

export type DueReminder = {
    id: number;
    title: string;
    body: string | null;
    remind_at: string | null;
};

export type SavingsGoal = {
    id: number;
    title: string;
    target_amount: string;
    start_date: string;
    end_date: string | null;
    notes: string | null;
    paid_amount?: string | null;
    payments_count?: number;
};

export type SavingsPayment = {
    id: number;
    savings_goal_id: number;
    amount: string;
    paid_at: string;
    note: string | null;
};

export type PaginatedData<T> = {
    data: T[];
    links: Record<string, string | null>;
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
};
