import { ExerciseVariantWithFlags } from "@/types";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { useData } from "@/context/store";

export function ExerciseDrawer({ exercise }: { exercise: ExerciseVariantWithFlags }) {
    const { addToMicrocycle, microcycle } = useData();
    // Check if exercise is in ANY of the days
    const isInCart = Object.values(microcycle.days).some(day =>
        day.exercises.some(i => i.exerciseId === exercise.id)
    );

    return (
        <div className="flex flex-col h-full gap-6">
            <SheetHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <Badge variant="outline" className="mb-2">{exercise.arquetipos.join(", ")}</Badge>
                        <SheetTitle className="text-3xl text-primary">{exercise.nombreTecnico}</SheetTitle>
                        <SheetDescription className="text-base mt-2">
                            {exercise.observaciones || "Sin observaciones específicas."}
                        </SheetDescription>
                    </div>
                </div>
                <div className="flex gap-2 mt-4">
                    {isInCart ? (
                        <Button variant="secondary" disabled className="w-full">
                            <Check className="mr-2 h-4 w-4" /> En Microciclo
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={() => addToMicrocycle(exercise)}>
                            <Plus className="mr-2 h-4 w-4" /> Agregar a Microciclo
                        </Button>
                    )}
                </div>
            </SheetHeader>

            <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 pb-10">

                    {/* RISK SECTION */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="bg-muted/10 border-dashed">
                            <div className="p-4 flex flex-col gap-1 items-center justify-center text-center">
                                <span className="text-xs font-semibold text-muted-foreground">ONLINE RISK</span>
                                <Badge variant={exercise.flags.ONLINE_RISK === 'OK' ? 'success' : exercise.flags.ONLINE_RISK === 'Precaución' ? 'warning' : 'destructive'} className="text-sm">
                                    {exercise.flags.ONLINE_RISK}
                                </Badge>
                            </div>
                        </Card>
                        <Card className="bg-muted/10 border-dashed">
                            <div className="p-4 flex flex-col gap-1 items-center justify-center text-center">
                                <span className="text-xs font-semibold text-muted-foreground">PF RISK</span>
                                <Badge variant={exercise.flags.PF_RISK === 'OK' ? 'success' : exercise.flags.PF_RISK === 'Precaución' ? 'warning' : 'destructive'} className="text-sm">
                                    {exercise.flags.PF_RISK}
                                </Badge>
                            </div>
                        </Card>
                    </div>

                    <Separator />

                    {/* V3.0 PERFORMANCE PROFILE (RADAR CONCEPT) */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Perfil de Rendimiento (0-10)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Hipertrofia", val: exercise.scoreHypertrophy || 0, color: "bg-pink-500" },
                                { label: "Fuerza Max", val: exercise.scoreMaxStrength || 0, color: "bg-orange-500" },
                                { label: "Potencia", val: exercise.scorePower || 0, color: "bg-yellow-500" },
                                { label: "Reactividad", val: exercise.scoreReactivity || 0, color: "bg-green-500" },
                                { label: "Resistencia (Endurance)", val: exercise.scoreEndurance || 0, color: "bg-blue-500" },
                                { label: "Estabilidad", val: exercise.scoreStability || 0, color: "bg-purple-500" },
                            ].map((stat) => (
                                <div key={stat.label} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-muted-foreground">{stat.label}</span>
                                        <span className="font-bold">{stat.val}/10</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.color} transition-all`} style={{ width: `${(stat.val / 10) * 100}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* DIMENSIONES TÉCNICAS */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Perfil Técnico</h4>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Arquetipo</span>
                                <p className="font-medium">{exercise.arquetipos.join(", ")}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Equipamiento</span>
                                <p className="font-medium">{exercise.equipamiento}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Natera</span>
                                <p className="font-medium">{exercise.natera}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Jordan</span>
                                <p className="font-medium">{exercise.jordan}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Naturaleza</span>
                                <p className="font-medium">{exercise.naturaleza}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-muted-foreground text-xs">Perfil Resistencia</span>
                                <p className="font-medium">{exercise.perfilResistencia}</p>
                            </div>
                        </div>
                        {/* V3.0 BIOMECHANICS & PHYSICS */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                ⚙️ Física & Biomecánica
                            </h4>

                            <div className="bg-slate-50 border rounded-lg p-3 grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground font-semibold">Resistencia</span>
                                    <Badge variant="outline" className="font-normal bg-white">{exercise.resistanceCurve || "-"}</Badge>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground font-semibold">Peak Torque</span>
                                    <Badge variant="outline" className="font-normal bg-white">{exercise.peakTorqueAngle || "-"}</Badge>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground font-semibold">ROM</span>
                                    <Badge variant="outline" className="font-normal bg-white">{exercise.rangeOfMotion || "-"}</Badge>
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-muted-foreground font-semibold">Potencial Carga</span>
                                    <Badge variant="outline" className="font-normal bg-white">{exercise.absoluteLoadPotential || "-"}</Badge>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* TARGETS */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Targets & Limitantes</h4>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Target Primario</span>
                                    <div className="flex flex-wrap gap-1">
                                        {exercise.targetPrimarios.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Limiting Factors</span>
                                    <div className="flex flex-wrap gap-1">
                                        {exercise.limitingFactor.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Target Secundario</span>
                                    <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                        {exercise.targetSecundarios.length ? exercise.targetSecundarios.join(", ") : "-"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* CLINICAL / REHAB */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" />
                                Clínico
                            </h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Fase Rehab</span>
                                    <div className="flex gap-1 flex-wrap">
                                        {(exercise.faseRehabList || [exercise.faseRehab]).map(f => (
                                            <Badge key={f} variant="secondary" className="px-1.5 h-5 text-[10px]">Fase {f}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Estadio Tendón</span>
                                    <p className="font-medium">{exercise.estadioTendon.join(", ") || "-"}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">PIA (Ideal / Conserv.)</span>
                                    <p className="font-medium truncate" title={`${exercise.piaIdeal} / ${exercise.piaConservador}`}>
                                        {exercise.piaIdeal} / {exercise.piaConservador}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Amenaza Potencial</span>
                                    <Badge variant={exercise.amenazaPotencial === 'Bajo' ? 'success' : exercise.amenazaPotencial === 'Medio' ? 'warning' : 'destructive'} className="text-[10px]">
                                        {exercise.amenazaPotencial}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-muted-foreground text-xs">Estrés Articular</span>
                                    <p className="font-medium text-[11px] leading-tight text-destructive/80">
                                        {exercise.jointStressProfile || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* METRICS */}
                        <div className="bg-muted p-4 rounded-lg space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                KPIs & Carga
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-muted-foreground block">Carga Axial</span>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`h-1.5 w-4 rounded-full ${i < exercise.cargaAxial ? "bg-orange-500" : "bg-gray-300"}`} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Impacto</span>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className={`h-1.5 w-4 rounded-full ${i < exercise.impacto ? "bg-red-500" : "bg-gray-300"}`} />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Demanda Técnica</span>
                                    <span className="font-bold">{exercise.demandaTecnica}/5</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block">Auditabilidad</span>
                                    <div className="flex gap-1 mt-0.5">
                                        {exercise.vbtReady && <Badge variant="outline" className="text-[9px] px-1 h-4">VBT</Badge>}
                                        {exercise.camaraApp && <Badge variant="outline" className="text-[9px] px-1 h-4">Cam</Badge>}
                                        {exercise.dynamoTests && <Badge variant="outline" className="text-[9px] px-1 h-4">Dyn</Badge>}
                                        {!exercise.vbtReady && !exercise.camaraApp && !exercise.dynamoTests && <span className="text-xs">-</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
            </ScrollArea>
        </div>
    );
}
