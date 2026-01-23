import { Microcycle, MicrocycleExercise } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Dumbbell, Zap, BarChart3, TrendingUp, Layers } from "lucide-react";

export function SummaryDashboard({ microcycle }: { microcycle: Microcycle }) {
    // 1. Analysis
    const allItems = Object.values(microcycle.days).flatMap(d => d.exercises).filter(i => i.type === 'exercise') as MicrocycleExercise[];
    const totalSets = allItems.reduce((acc, item) => acc + (item.dosage?.sets || 0), 0);
    const avgRPE = allItems.reduce((acc, item) => acc + (parseInt(item.dosage?.rir as string) || 0), 0) / (allItems.length || 1);

    // Load Classification
    let loadRating = "Baja";
    let loadColor = "text-green-500";
    if (totalSets > 40) { loadRating = "Moderada"; loadColor = "text-yellow-500"; }
    if (totalSets > 70) { loadRating = "Alta"; loadColor = "text-orange-500"; }
    if (totalSets > 100) { loadRating = "Muy Alta"; loadColor = "text-red-500"; }

    // Volume per Target
    const volumeByTarget: Record<string, number> = {};
    allItems.forEach(item => {
        const sets = item.dosage?.sets || 0;
        item.variant.targetPrimarios.forEach(t => {
            volumeByTarget[t] = (volumeByTarget[t] || 0) + sets;
        });
    });

    // Intensity Distribution (Simple Heuristic: Strength/Plyo vs Rehab/Iso)
    const intensityDist = {
        High: allItems.filter(i => ['Strength', 'Plyo'].includes(i.dosage.type)).length,
        Low: allItems.filter(i => ['Rehab', 'Isometric', 'Cardio'].includes(i.dosage.type)).length
    };

    const risks = allItems.filter(i => i.variant.amenazaPotencial !== 'Bajo' || i.variant.flags.ONLINE_RISK === 'Prohibido');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Analytics de Carga</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Estado del Microciclo
                    </p>
                </div>
                <Badge variant="outline" className={`text-sm px-3 py-1 ${loadColor} border-current`}>
                    Carga {loadRating}
                </Badge>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Layers className="h-5 w-5 text-muted-foreground mb-1" />
                        <div className="text-2xl font-bold">{totalSets}</div>
                        <p className="text-xs text-muted-foreground">Sets Totales</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Dumbbell className="h-5 w-5 text-muted-foreground mb-1" />
                        <div className="text-2xl font-bold">{allItems.length}</div>
                        <p className="text-xs text-muted-foreground">Ejercicios</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <Zap className="h-5 w-5 text-muted-foreground mb-1" />
                        <div className="text-2xl font-bold">{intensityDist.High}</div>
                        <p className="text-xs text-muted-foreground">Alta Intensidad</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="h-5 w-5 text-muted-foreground mb-1" />
                        <div className="text-2xl font-bold">{(avgRPE).toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">Promedio RIR</p>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Load Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" /> Distribución de Carga Semanal (Sets)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full flex items-end justify-between gap-2 pt-4 bg-background/50 rounded-lg border p-4">
                        {microcycle.dayOrder.map(dayId => {
                            const day = microcycle.days[dayId];
                            // DEBUG: Ensure dosage/sets are numbers
                            const daySets = day.exercises
                                .filter(e => e.type === 'exercise')
                                .reduce((acc, e) => {
                                    const sets = Number(e.dosage?.sets) || 0;
                                    return acc + sets;
                                }, 0);

                            // Calculate max for scale
                            const allDaysSets = microcycle.dayOrder.map(id =>
                                microcycle.days[id].exercises
                                    .filter(e => e.type === 'exercise')
                                    .reduce((a, b) => a + (Number(b.dosage?.sets) || 0), 0)
                            );
                            const maxSets = Math.max(...allDaysSets, 15);

                            const heightPercentage = Math.min(100, Math.max(2, (daySets / maxSets) * 100)); // Min 2% height visibility

                            return (
                                <div key={dayId} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                    <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm flex items-end overflow-hidden group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors" style={{ height: '100%' }}>
                                        <div
                                            className="w-full bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-700 transition-all duration-500 rounded-t-sm absolute bottom-0"
                                            style={{ height: `${heightPercentage}%` }}
                                        >
                                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-100 transition-opacity text-foreground whitespace-nowrap bg-background px-1 rounded shadow-sm border">
                                                {daySets}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground truncate w-full text-center">
                                        {day.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" /> Distribución por Músculo
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-3">
                                {Object.entries(volumeByTarget)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([target, volume]) => (
                                        <div key={target} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium">{target}</span>
                                                <span className="text-muted-foreground">{volume} sets</span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${Math.min(100, (volume / 15) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {risks.length > 0 ? (
                        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertTriangle className="h-4 w-4" /> Alertas de Seguridad
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[200px] pr-4">
                                    <ul className="space-y-2">
                                        {risks.map((r, i) => (
                                            <li key={i} className="text-xs flex flex-col bg-background/50 p-2 rounded border border-red-100 dark:border-red-900/20">
                                                <span className="font-bold text-red-700 dark:text-red-300">{r.variant.nombreTecnico}</span>
                                                <span className="text-red-600/80 dark:text-red-400/80">
                                                    {r.variant.amenazaPotencial !== 'Bajo' && `• Amenaza: ${r.variant.amenazaPotencial}`}
                                                    {r.variant.flags.ONLINE_RISK === 'Prohibido' && ` • Online: Prohibido`}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
                            <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center text-green-600 dark:text-green-400">
                                <Activity className="h-8 w-8 mb-2 opacity-50" />
                                <p className="font-medium">Sin riesgos detectados</p>
                                <p className="text-xs opacity-70">La rutina parece segura.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
