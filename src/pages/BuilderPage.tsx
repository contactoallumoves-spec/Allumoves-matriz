import { useData } from "@/context/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, FileDown, Plus, X, GripVertical, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { MicrocycleExercise, MicrocycleSeparator } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function BuilderPage() {
    const {
        microcycle,
        removeFromMicrocycle,
        updateMicrocycleItem,
        clearMicrocycle,
        setCurrentView,
        addDay,
        removeDay,
        addSeparator,
        moveItem
    } = useData();

    // Drag and Drop State
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [sourceDayId, setSourceDayId] = useState<string | null>(null);
    const [dragOverInfo, setDragOverInfo] = useState<{ dayId: string, index: number } | null>(null);

    const handleDragStart = (e: React.DragEvent, itemId: string, dayId: string) => {
        e.dataTransfer.setData("text/plain", itemId);
        e.dataTransfer.effectAllowed = "move";
        setDraggedItemId(itemId);
        setSourceDayId(dayId);
    };

    const handleDragOver = (e: React.DragEvent, dayId: string, index: number) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";

        // Optimize updates: only update if changed
        if (dragOverInfo?.dayId !== dayId || dragOverInfo?.index !== index) {
            setDragOverInfo({ dayId, index });
        }
    };

    const handleDrop = (e: React.DragEvent, targetDayId: string, targetIndex?: number) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData("text/plain");

        if (draggedItemId && sourceDayId) {
            // If dropping on a container without index, append to end
            // If targetIndex is provided, use it.
            // Note: If dropping on the same list, we need to adjust index logic?
            // The MoveItem logic in store handles splicing correctly.
            moveItem(itemId, sourceDayId, targetDayId, targetIndex);
        }

        setDraggedItemId(null);
        setSourceDayId(null);
        setDragOverInfo(null);
    };

    const handleExport = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(microcycle, null, 2));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = microcycle.name + ".json";
        anchor.click();
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 shrink-0 bg-background z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Microciclo</h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        Arrastra tarjetas para organizar tu semana. {microcycle.dayOrder.length} días.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setCurrentView('matrix')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir Ejercicios
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearMicrocycle} className="text-destructive hover:font-bold">
                        Limpiar
                    </Button>
                    <Button onClick={handleExport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar JSON
                    </Button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-4 pb-4 min-w-max px-2">
                    {/* Render Columns for each Day */}
                    <AnimatePresence>
                        {microcycle.dayOrder.map((dayId, dayIndex) => {
                            const day = microcycle.days[dayId];
                            return (
                                <motion.div
                                    key={dayId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="w-[340px] flex flex-col bg-muted/30 rounded-xl border h-full max-h-full"
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        // Drop at the end if hovering over container
                                        setDragOverInfo({ dayId, index: day.exercises.length });
                                    }}
                                    onDrop={(e) => {
                                        // Ensure we catch drops on the container itself
                                        // Specifically if not handled by children (event bubbling)
                                        // But simpler to handle via a dedicated drop zone at bottom or ref check
                                        if (e.target === e.currentTarget) {
                                            handleDrop(e, dayId, day.exercises.length);
                                        }
                                    }}
                                >
                                    {/* Column Header */}
                                    <div className="p-3 border-b flex items-center justify-between bg-background/50 rounded-t-xl sticky top-0 backdrop-blur-sm z-10">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {day.label}
                                            <Badge variant="secondary" className="text-xs">{day.exercises.filter(e => e.type === 'exercise').length}</Badge>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addSeparator(dayId)} title="Agregar Separador">
                                                <Separator className="h-4 w-4" />
                                            </Button>
                                            {microcycle.dayOrder.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeDay(dayId)}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column Content (Scrollable) */}
                                    <ScrollArea className="flex-1 p-2">
                                        <div className="space-y-2 min-h-[100px]">
                                            {day.exercises.map((item, index) => {
                                                const isDragging = draggedItemId === item.id;
                                                const isOver = dragOverInfo?.dayId === dayId && dragOverInfo?.index === index;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, item.id, dayId)}
                                                        onDragOver={(e) => {
                                                            e.stopPropagation(); // Prevent container getting it
                                                            handleDragOver(e, dayId, index);
                                                        }}
                                                        onDrop={(e) => {
                                                            e.stopPropagation();
                                                            handleDrop(e, dayId, index);
                                                        }}
                                                    >
                                                        {/* Drop Indicator */}
                                                        {isOver && <div className="h-1 w-full bg-primary mb-2 rounded-full animate-pulse transition-all" />}

                                                        {item.type === 'separator' ? (
                                                            <div className={cn("relative group py-2 flex items-center gap-2", isDragging && "opacity-50")}>
                                                                <GripHorizontal className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing" />
                                                                <Input
                                                                    value={(item as MicrocycleSeparator).title}
                                                                    className="h-7 text-xs font-bold uppercase tracking-wider bg-transparent border-none shadow-none focus-visible:ring-0 px-0"
                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { title: e.target.value })}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-0"
                                                                    onClick={() => removeFromMicrocycle(item.id, dayId)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                                <div className="absolute inset-x-0 bottom-1 border-b border-dashed border-primary/20 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <Card className={cn(
                                                                "group relative overflow-hidden border-l-4 border-l-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                                                                isDragging && "opacity-40 border-dashed border-2"
                                                            )}>
                                                                <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 bg-background/80 rounded transition-opacity z-20">
                                                                    <GripVertical className="h-4 w-4 text-muted-foreground mr-1" />
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromMicrocycle(item.id, dayId)}>
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <CardContent className="p-3 space-y-2 pointer-events-none"> {/* Disable pointer events on content to facilitate drag on whole card */}
                                                                    {/* Hack: Re-enable pointer events for inputs */}
                                                                    <div className="pointer-events-auto">
                                                                        {/* Header */}
                                                                        <div className="mb-2">
                                                                            <div className="text-xs text-muted-foreground/70 mb-0.5">{(item as MicrocycleExercise).variant.arquetipos[0]}</div>
                                                                            <div className="font-bold text-sm leading-tight">{(item as MicrocycleExercise).variant.nombreTecnico}</div>
                                                                        </div>

                                                                        {/* Inputs */}
                                                                        <div className="grid grid-cols-3 gap-1">
                                                                            <div className="bg-muted/30 rounded p-1 text-center">
                                                                                <label className="block text-[8px] uppercase text-muted-foreground font-bold">Sets</label>
                                                                                <input
                                                                                    className="w-full bg-transparent text-center text-xs font-medium focus:outline-none"
                                                                                    value={(item as MicrocycleExercise).sets}
                                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { sets: parseInt(e.target.value) || 0 })}
                                                                                />
                                                                            </div>
                                                                            <div className="bg-muted/30 rounded p-1 text-center">
                                                                                <label className="block text-[8px] uppercase text-muted-foreground font-bold">Reps</label>
                                                                                <input
                                                                                    className="w-full bg-transparent text-center text-xs font-medium focus:outline-none"
                                                                                    value={(item as MicrocycleExercise).reps}
                                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { reps: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="bg-muted/30 rounded p-1 text-center">
                                                                                <label className="block text-[8px] uppercase text-muted-foreground font-bold">RIR</label>
                                                                                <input
                                                                                    className="w-full bg-transparent text-center text-xs font-medium focus:outline-none"
                                                                                    value={(item as MicrocycleExercise).rir}
                                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { rir: e.target.value })}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        {/* Notes */}
                                                                        <Input
                                                                            className="h-6 text-[10px] px-1 bg-transparent border-t-0 border-x-0 border-b border-dashed rounded-none focus-visible:ring-0 mt-2"
                                                                            placeholder="Notas..."
                                                                            value={(item as MicrocycleExercise).notes}
                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { notes: e.target.value })}
                                                                        />

                                                                        {/* Tags */}
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {(item as MicrocycleExercise).variant.targetPrimarios.slice(0, 2).map(t => (
                                                                                <span key={t} className="text-[9px] bg-primary/5 text-primary px-1 rounded">{t}</span>
                                                                            ))}
                                                                            {(item as MicrocycleExercise).variant.amenazaPotencial !== 'Bajo' && (
                                                                                <span className="text-[9px] bg-destructive/10 text-destructive px-1 rounded font-bold">Alert</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            {/* Empty Zone for dropping at the end */}
                                            <div
                                                className="h-20 w-full flex items-center justify-center border-2 border-dashed border-transparent hover:border-muted rounded-lg transition-colors"
                                                onDragOver={(e) => {
                                                    e.stopPropagation();
                                                    handleDragOver(e, dayId, day.exercises.length);
                                                }}
                                                onDrop={(e) => {
                                                    e.stopPropagation();
                                                    handleDrop(e, dayId, day.exercises.length);
                                                }}
                                            >
                                                {day.exercises.length === 0 && <span className="text-xs text-muted-foreground opacity-50">Soltar aquí</span>}
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Add Day Column */}
                    <div className="w-[100px] shrink-0 pt-10">
                        <Button variant="outline" className="h-full max-h-[200px] w-full flex flex-col gap-2 border-dashed" onClick={addDay}>
                            <Plus className="h-6 w-6" />
                            <span>Añadir Día</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
