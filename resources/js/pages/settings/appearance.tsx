import { Head } from '@inertiajs/react';
import { Palette } from 'lucide-react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Tampilan" />

            <h1 className="sr-only">Pengaturan tampilan</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Tampilan"
                    description="Pilih tema yang paling nyaman untukmu"
                />
                <Card className="overflow-hidden rounded-2xl">
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 border-b px-5 py-4">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Palette className="size-4" />
                        </span>
                        <div>
                            <CardTitle className="text-base">
                                Tema aplikasi
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5">
                        <AppearanceTabs />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Tampilan',
            href: editAppearance(),
        },
    ],
};
