import { Microcycle, MicrocycleExercise } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Dumbbell, Zap } from "lucide-react";

export function SummaryDashboard({ microcycle }: { microcycle: Microcycle }) {
    // 1. Flatten all exercises
    const allItems = Object.values(microcycle.days).flatMap(d => d.exercises).filter(i => i.type === 'exercise') as MicrocycleExercise[];

    // 2. Volume per Target (Primary)
    const volumeByTarget: Record<string, number> = {};
    const setsByNature: Record<string, number> = {
        Grind: 0,
        Ballistic: 0,
        "Semi-ballistic": 0
    };

    allItems.forEach(item => {
        const sets = item.dosage?.sets || 0;

        // Target Counts
        item.variant.targetPrimarios.forEach(t => {
            volumeByTarget[t] = (volumeByTarget[t] || 0) + sets;
        });

        // Nature Counts
        const nature = item.variant.naturaleza || "Grind";
        setsByNature[nature] = (setsByNature[nature] || 0) + sets;
    });

    // 3. Risk Flags Accumulation
    const risks = allItems.filter(i => i.variant.amenazaPotencial !== 'Bajo' || i.variant.flags.ONLINE_RISK === 'Prohibido' || i.variant.flags.PF_RISK === 'Contraindicado');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Resumen de Carga</h3>
                    <p className="text-sm text-muted-foreground">{allItems.length} ejercicios en {microcycle.dayOrder.length} días.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Volume Distribution */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Dumbbell className="h-4 w-4" /> Distribución por Target (Sets)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] w-full pr-4">
                            <div className="space-y-2">
                                {Object.entries(volumeByTarget)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([target, volume]) => (
                                        <div key={target} className="flex items-center justify-between text-sm">
                                            <span>{target}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (volume / 20) * 100)}%` }} />
                                                </div>
                                                <span className="font-mono w-6 text-right">{volume}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Nature & Risks */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Zap className="h-4 w-4" /> Perfil de Intensidad
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span>Grind (Fuerza controlada)</span>
                                <Badge variant="secondary">{setsByNature["Grind"]} sets</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Ballistic / Plyo</span>
                                <Badge variant="outline" className="border-orange-500 text-orange-600">{setsByNature["Ballistic"] + setsByNature["Semi-ballistic"]} sets</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {risks.length > 0 && (
                        <Card className="border-destructive/50 bg-destructive/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="h-4 w-4" /> Alertas de Riesgo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[100px]">
                                    <ul className="space-y-2 text-xs text-destructive/80">
                                        {risks.map(r => (
                                            <li key={r.id}>
                                                <strong>{r.variant.nombreTecnico}:</strong>
                                                {r.variant.amenazaPotencial !== 'Bajo' && ` Amenaza ${r.variant.amenazaPotencial}.`}
                                                {r.variant.flags.ONLINE_RISK === 'Prohibido' && ` Online: Prohibido.`}
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
