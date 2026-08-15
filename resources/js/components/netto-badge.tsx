import { Badge } from '@/components/ui/badge';

export function NettoBadge({ netto }: { netto: number }) {
    if (netto > 0) {
        return <Badge className="bg-emerald-500 text-white">Surplus</Badge>;
    }

    if (netto < 0) {
        return <Badge variant="destructive">Defisit</Badge>;
    }

    return <Badge variant="secondary">Impas</Badge>;
}