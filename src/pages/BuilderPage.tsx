import { useData } from "@/context/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, ArrowLeft, Save, FileDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BuilderPage() {
    const {
        microcycle,
        removeFromMicrocycle,
        updateMicrocycleItem,
        clearMicrocycle,
        setCurrentView,
        currentDayId,
        setCurrentDayId,
        addDay,
        removeDay
    } = useData();

    const currentDay = microcycle.days[currentDayId];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Microciclo Semanal</h1>
                    <p className="text-muted-foreground">
                        Organiza tu semana de entrenamiento. {microcycle.dayOrder.length} días configurados.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setCurrentView('matrix')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Añadir Ejercicios
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearMicrocycle}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Reiniciar
                    </Button>
                    <Button>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* Days Tabs */}
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-2">
                {microcycle.dayOrder.map(dayId => {
                    const day = microcycle.days[dayId];
                    const isActive = dayId === currentDayId;
                    return (
                        <div key={dayId} className="relative group">
                            <Button
                                variant={isActive ? "default" : "outline"}
                                className={cn("min-w-[100px]", isActive ? "shadow-md" : "text-muted-foreground")}
                                onClick={() => setCurrentDayId(dayId)}
                            >
                                {day.label}
                                <span className="ml-2 bg-black/10 rounded-full px-1.5 py-0.5 text-[9px]">
                                    {day.exercises.length}
                                </span>
                            </Button>
                            {/* Delete Day Button (only if not active or handling appropriately, simplified here) */}
                            {microcycle.dayOrder.length > 1 && (
                                <button
                                    className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => { e.stopPropagation(); removeDay(dayId); }}
                                    title="Eliminar día"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    )
                })}
                <Button variant="ghost" size="sm" onClick={addDay} className="text-primary hover:bg-primary/10 dashed border border-dashed border-primary/30">
                    <Plus className="mr-1 h-4 w-4" /> Agregar Día
                </Button>
            </div>

            {/* Current Day Content */}
            <ScrollArea className="flex-1 -mx-4 px-4">
                {currentDay && currentDay.exercises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center space-y-4 border-2 border-dashed rounded-xl m-4">
                        <div className="bg-muted p-4 rounded-full">
                            <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">Este día está vacío</h3>
                        <p className="text-muted-foreground">Ve a la Matriz para agregar ejercicios al {currentDay.label}.</p>
                        <Button onClick={() => setCurrentView('matrix')}>Ir a Matriz</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 pb-20">
                        {currentDay?.exercises.map((item, index) => (
                            <Card key={item.id} className="group hover:shadow-premium-md transition-all duration-300 border-l-4 border-l-primary/40 relative overflow-hidden flex flex-col">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFromMicrocycle(item.id, currentDayId)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CardHeader className="pb-2 bg-muted/10">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 w-[90%]">
                                            <div className="flex items-center justify-center h-6 w-6 shrink-0 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-sm">
                                                {index + 1}
                                            </div>
                                            <CardTitle className="text-base font-bold leading-tight truncate">
                                                {item.variant.nombreTecnico}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    {/* Rich Metadata Tags */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        <Badge variant="outline" className="text-[10px] bg-background">{item.variant.arquetipos[0]}</Badge>
                                        {item.variant.targetPrimarios.map(t => (
                                            <Badge key={t} variant="secondary" className="text-[10px] bg-secondary/30 text-secondary-foreground">{t}</Badge>
                                        ))}
                                        {item.variant.amenazaPotencial === 'Alto' && (
                                            <Badge variant="destructive" className="text-[10px]">Riesgo Alto</Badge>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-3 flex-1 flex flex-col justify-end">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wide">Sets</label>
                                            <Input
                                                type="number"
                                                value={item.sets}
                                                onChange={(e) => updateMicrocycleItem(item.id, currentDayId, { sets: parseInt(e.target.value) || 0 })}
                                                className="h-7 text-center font-medium bg-muted/20"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wide">Reps</label>
                                            <Input
                                                type="text"
                                                value={item.reps}
                                                onChange={(e) => updateMicrocycleItem(item.id, currentDayId, { reps: e.target.value })}
                                                className="h-7 text-center font-medium bg-muted/20"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] uppercase font-bold text-muted-foreground tracking-wide">RIR</label>
                                            <Input
                                                type="text"
                                                value={item.rir}
                                                onChange={(e) => updateMicrocycleItem(item.id, currentDayId, { rir: e.target.value })}
                                                className="h-7 text-center font-medium bg-muted/20"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Input
                                            value={item.notes}
                                            placeholder="Notas..."
                                            onChange={(e) => updateMicrocycleItem(item.id, currentDayId, { notes: e.target.value })}
                                            className="h-7 text-xs bg-muted/20 border-dashed focus:border-solid"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
