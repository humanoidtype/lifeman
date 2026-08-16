import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    KeyRound,
    LogOut,
    Mail,
    ShieldCheck,
    ShieldAlert,
    User,
} from 'lucide-react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import DeleteUser from '@/components/delete-user';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const verified = auth.user.email_verified_at !== null;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Profil" />

            <h1 className="sr-only">Pengaturan profil</h1>

            <div className="space-y-4">
                <Heading
                    variant="small"
                    title="Profil"
                    description="Kelola nama dan alamat emailmu"
                />

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <User className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">Nama</CardTitle>
                            <CardDescription>
                                Nama yang tampil di aplikasi
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-3"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama</Label>
                                        <Input
                                            id="name"
                                            className="mt-1 block w-full rounded-xl"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Nama lengkap"
                                        />
                                        <InputError
                                            className="mt-2"
                                            message={errors.name}
                                        />
                                    </div>

                                    <Button
                                        disabled={processing}
                                        className="rounded-xl bg-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                        data-test="update-profile-button"
                                    >
                                        Simpan
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Mail className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Alamat email
                            </CardTitle>
                            <CardDescription>
                                Email tidak dapat diubah setelah terdaftar
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">
                                {auth.user.email}
                            </p>
                            <span
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                                    verified
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                                )}
                            >
                                {verified ? (
                                    <ShieldCheck className="size-3.5" />
                                ) : (
                                    <ShieldAlert className="size-3.5" />
                                )}
                                {verified
                                    ? 'Terverifikasi'
                                    : 'Belum terverifikasi'}
                            </span>
                        </div>

                        {mustVerifyEmail && !verified && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                                <p className="text-muted-foreground">
                                    Email kamu belum diverifikasi. Kirim ulang
                                    tautan verifikasi untuk mengaktifkan semua
                                    fitur.
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                >
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="font-medium"
                                    >
                                        Kirim ulang verifikasi
                                    </Link>
                                </Button>

                                {status === 'verification-link-sent' && (
                                    <p className="mt-2 text-sm font-medium text-green-600">
                                        Tautan verifikasi baru telah dikirim.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-3">
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
                    <CardContent className="px-4 py-3">
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
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <Button
                                        disabled={processing}
                                        className="rounded-xl bg-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                                        data-test="update-password-button"
                                    >
                                        Simpan password
                                    </Button>
                                </>
                            )}
                        </Form>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-4 py-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <LogOut className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">Akun</CardTitle>
                            <CardDescription>
                                Keluar atau hapus akunmu
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-3 px-4 py-3 sm:grid-cols-2">
                        <Button
                            asChild
                            variant="secondary"
                            className="rounded-xl"
                        >
                            <Link
                                href={logout()}
                                as="button"
                                data-test="logout-button"
                            >
                                <LogOut className="size-4" />
                                Keluar
                            </Link>
                        </Button>
                        <DeleteUser compact />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profil',
            href: edit(),
        },
    ],
};
