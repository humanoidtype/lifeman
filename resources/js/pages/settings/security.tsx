import { Form, Head } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';

type Props = {
    passwordRules: string;
};

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Keamanan" />

            <h1 className="sr-only">Pengaturan keamanan</h1>

            <div className="space-y-4">
                <Heading
                    variant="small"
                    title="Keamanan"
                    description="Jaga akunmu tetap aman dengan password yang kuat"
                />

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <KeyRound className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Ubah password
                            </CardTitle>
                            <CardDescription>
                                Gunakan password yang panjang dan unik
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <Form
                            {...SecurityController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-3"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_password">
                                            Password saat ini
                                        </Label>

                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="mt-1 block w-full rounded-xl"
                                            autoComplete="current-password"
                                            placeholder="Password saat ini"
                                        />

                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Password baru
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            className="mt-1 block w-full rounded-xl"
                                            autoComplete="new-password"
                                            placeholder="Password baru"
                                            passwordrules={props.passwordRules}
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Konfirmasi password
                                        </Label>

                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            className="mt-1 block w-full rounded-xl"
                                            autoComplete="new-password"
                                            placeholder="Ulangi password baru"
                                            passwordrules={props.passwordRules}
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                                        <ShieldCheck className="size-4 shrink-0 text-primary" />
                                        <p className="text-xs text-muted-foreground">
                                            Tips: kombinasikan huruf besar,
                                            angka, dan simbol, serta jangan
                                            pakai password yang sama di aplikasi
                                            lain.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <Button
                                            disabled={processing}
                                            className="rounded-xl bg-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                            data-test="update-password-button"
                                        >
                                            Simpan password
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Keamanan',
            href: edit(),
        },
    ],
};
