import { Check, Monitor, Moon, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type ThemeOption = {
    value: Appearance;
    icon: LucideIcon;
    label: string;
};

const options: ThemeOption[] = [
    { value: 'light', icon: Sun, label: 'Terang' },
    { value: 'dark', icon: Moon, label: 'Gelap' },
    { value: 'system', icon: Monitor, label: 'Sistem' },
];

function MockCard({ dark = false }: { dark?: boolean }) {
    return (
        <div
            className={cn(
                'space-y-2 rounded-lg p-3',
                dark ? 'bg-neutral-900' : 'bg-neutral-50',
            )}
        >
            <div
                className={cn(
                    'h-1.5 w-1/2 rounded-full',
                    dark ? 'bg-neutral-600' : 'bg-neutral-300',
                )}
            />
            <div
                className={cn(
                    'flex items-center gap-1.5 rounded-md p-2',
                    dark ? 'bg-neutral-800' : 'bg-white shadow-sm',
                )}
            >
                <div
                    className={cn(
                        'size-2 shrink-0 rounded-full',
                        dark ? 'bg-primary' : 'bg-primary',
                    )}
                />
                <div
                    className={cn(
                        'h-1 w-1/2 rounded-full',
                        dark ? 'bg-neutral-600' : 'bg-neutral-300',
                    )}
                />
            </div>
            <div
                className={cn(
                    'h-1.5 w-full rounded-full',
                    dark ? 'bg-primary/50' : 'bg-primary/40',
                )}
            />
            <div
                className={cn(
                    'h-1.5 w-3/4 rounded-full',
                    dark ? 'bg-neutral-600' : 'bg-neutral-300',
                )}
            />
        </div>
    );
}

export default function AppearanceTabs() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {options.map(({ value, icon: Icon, label }) => {
                const active = appearance === value;

                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => updateAppearance(value)}
                        className={cn(
                            'group relative rounded-2xl border-2 p-1.5 text-left transition-all duration-200',
                            active
                                ? 'border-primary shadow-md'
                                : 'border-border hover:border-primary/40 hover:shadow-sm',
                        )}
                    >
                        {active && (
                            <span className="absolute -top-2 -right-2 z-10 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                <Check className="size-3" />
                            </span>
                        )}

                        <div className="overflow-hidden rounded-xl border bg-background">
                            {value === 'system' ? (
                                <div className="flex">
                                    <div className="flex-1">
                                        <MockCard />
                                    </div>
                                    <div className="flex-1">
                                        <MockCard dark />
                                    </div>
                                </div>
                            ) : (
                                <MockCard dark={value === 'dark'} />
                            )}
                        </div>

                        <div
                            className={cn(
                                'flex items-center gap-2 px-2 py-2 text-sm font-medium',
                                active
                                    ? 'text-foreground'
                                    : 'text-muted-foreground',
                            )}
                        >
                            <Icon
                                className={cn(
                                    'size-4',
                                    active && 'text-primary',
                                )}
                            />
                            {label}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
