export type Reminder = {
    id: number;
    title: string;
    body: string | null;
    remind_at: string | null;
    done_at: string | null;
    notified_at: string | null;
    is_expired: boolean;
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

export type Cashflow = {
    id: number;
    title: string;
    period_start: string | null;
    period_end: string | null;
    notes: string | null;
    income_total?: string | null;
    expense_total?: string | null;
    created_at: string;
};

export type CashflowItem = {
    id: number;
    cashflow_id: number;
    type: 'income' | 'expense';
    name: string;
    amount: string;
    quantity: number;
    created_at: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
};
