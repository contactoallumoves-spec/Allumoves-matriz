import { useData } from "@/context/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, FileDown, Plus, X, GripVertical, GripHorizontal, BarChart2, Copy, Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MicrocycleExercise, MicrocycleSeparator } from "@/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SummaryDashboard } from "@/components/builder/SummaryDashboard";

// Helper for card colors
const getCardColor = (ex: MicrocycleExercise, viewMode: 'default' | 'hypertrophy' | 'rehab' | 'risk') => {
    if (viewMode === 'hypertrophy') {
        const target = ex.variant.targetPrimarios[0]?.toLowerCase() || "";
        if (target.includes("glúteo") || target.includes("cadera")) return "border-l-pink-500 bg-pink-50/30";
        if (target.includes("cuádriceps") || target.includes("rodilla")) return "border-l-blue-500 bg-blue-50/30";
        if (target.includes("isquio")) return "border-l-amber-500 bg-amber-50/30";
        return "border-l-slate-500 bg-slate-50/30";
    }

    if (viewMode === 'rehab') {
        const phase = ex.variant.faseRehab;
        if (phase === 1) return "border-l-cyan-500 bg-cyan-50/30";
        if (phase === 2) return "border-l-emerald-500 bg-emerald-50/30";
        if (phase === 3) return "border-l-orange-500 bg-orange-50/30";
        if (phase === 4) return "border-l-red-500 bg-red-50/30";
        return "border-l-slate-200 bg-slate-50";
    }

    if (viewMode === 'risk') {
        if (ex.variant.amenazaPotencial === 'Alto') return "border-l-red-600 bg-red-100/50";
        if (ex.variant.amenazaPotencial === 'Medio') return "border-l-orange-400 bg-orange-50/30";
        return "border-l-green-500 bg-green-50/30";
    }

    // Default
    if (ex.variant.naturaleza === 'Ballistic' || ex.variant.naturaleza === 'Semi-ballistic') {
        return "border-l-orange-500 bg-orange-50/30";
    }
    if (ex.variant.arquetipos.some(a => a.includes("Core") || a.includes("Anti"))) {
        return "border-l-emerald-500 bg-emerald-50/30";
    }
    return "border-l-primary/40 bg-card";
};

export default function BuilderPage() {
    const {
        microcycle,
        removeFromMicrocycle,
        updateMicrocycleItem,
        duplicateMicrocycleItem,
        clearMicrocycle,
        setCurrentView,
        addDay,
        moveItem,
        addSeparator,
        exercises,
        addToMicrocycle,
        viewMode,
        setViewMode
    } = useData();

    // Magic Generator State
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [genTarget, setGenTarget] = useState("Glúteo Mayor");
    const [genCount, setGenCount] = useState(4);
    const [genIntensity, setGenIntensity] = useState("Alto");



    // Generator Logic
    const handleAutoGenerate = () => {
        // 1. Filter Pool
        // Normalized search
        const term = genTarget.toLowerCase();
        // exercises is already an array of ExerciseVariantWithFlags
        const pool = (exercises || []).filter(e => {
            const matchTarget = e.targetPrimarios?.some(t => t.toLowerCase().includes(term));
            const matchRoi = genIntensity === 'Cualquiera' ? true : e.roi === genIntensity;
            return matchTarget && matchRoi;
        });

        if (pool.length === 0) {
            alert(`No encontré ejercicios de ${genTarget} con ROI ${genIntensity}. Intenta otros filtros.`);
            return;
        }

        // 2. Select Random
        const selected = [];
        for (let i = 0; i < genCount; i++) {
            const random = pool[Math.floor(Math.random() * pool.length)];
            // Avoid duplicates if possible, but allow if pool is small
            selected.push(random);
        }

        // 3. Add Day & Items
        // We need to wait for the state update or use a different approach. 
        // Since we can't await `addDay` state update in this version without major refactor,
        // we will manually construct the day object and insert it directly via setMicrocycle if we could.
        // BUT `addDay` returns the new ID synchronously in our store implementation!

        const newDayId = addDay();

        // Now add items to this new Day
        // We need to iterate and add them one by one or create a bulk add.
        // `updateMicrocycleItem` works on existing items. `addToMicrocycle`?
        // Let's check if we have `addToMicrocycle`. access via useData.

        selected.forEach(ex => {
            // `addToMicrocycle` expects (exercise, dayId).
            addToMicrocycle(ex, newDayId);
        });

        setIsGeneratorOpen(false);
    };

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
            moveItem(itemId, sourceDayId, targetDayId, targetIndex);
        }

        setDraggedItemId(null);
        setSourceDayId(null);
        setDragOverInfo(null);
    };

    const handleExportJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(microcycle, null, 2));
        const anchor = document.createElement('a');
        anchor.href = dataStr;
        anchor.download = microcycle.name + ".json";
        anchor.click();
    };

    const handleExportCSV = () => {
        // Build CSV content
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Dia,Ejercicio,Sets,Reps,RIR,Notas,Targets\n";

        microcycle.dayOrder.forEach(dayId => {
            const day = microcycle.days[dayId];
            day.exercises.forEach(item => {
                if (item.type === 'exercise') {
                    const row = [
                        day.label,
                        `"${item.variant.nombreTecnico}"`,
                        item.dosage.sets,
                        `"${item.dosage.reps || item.dosage.duration || item.dosage.contacts || '-'}"`,
                        item.dosage.rir || item.dosage.intensity || '-',
                        `"${item.notes}"`,
                        `"${item.variant.targetPrimarios.join(', ')}"`
                    ].join(",");
                    csvContent += row + "\n";
                }
            });
        });

        const encodedUri = encodeURI(csvContent);
        const anchor = document.createElement("a");
        anchor.setAttribute("href", encodedUri);
        anchor.setAttribute("download", microcycle.name + ".csv");
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col print:h-auto print:overflow-visible">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 shrink-0 bg-background z-10 print:hidden">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Microciclo</h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        Arrastra tarjetas para organizar tu semana. {microcycle.dayOrder.length} días.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Mode Selector */}
                    <select
                        className="h-9 w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors cursor-pointer print:hidden"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as any)}
                    >
                        <option value="default">Default</option>
                        <option value="hypertrophy">Hipertrofia</option>
                        <option value="rehab">Rehab</option>
                        <option value="risk">Riesgo</option>
                    </select>
                    {/* Generator Sheet */}
                    <Sheet open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200 hover:border-indigo-400">
                                <Sparkles className="h-4 w-4 text-indigo-600" />
                                <span className="hidden md:inline text-indigo-700">Magia</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-indigo-600" />
                                    Generador Automático
                                </SheetTitle>
                                <SheetDescription>
                                    Crea un día completo basado en un objetivo.
                                </SheetDescription>
                            </SheetHeader>

                            <div className="space-y-6 py-6">
                                <div className="space-y-2">
                                    <Label>Enfoque Principal (Target)</Label>
                                    <Select value={genTarget} onValueChange={setGenTarget}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from(new Set(exercises.flatMap(e => e.targetPrimarios || []))).sort().slice(0, 20).map(t => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                            <SelectItem value="Cuádriceps">Cuádriceps (Quick)</SelectItem>
                                            <SelectItem value="Glúteo Mayor">Glúteo Mayor (Quick)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Intensidad / ROI</Label>
                                    <Select value={genIntensity} onValueChange={setGenIntensity}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Alto">Alto ROI Only</SelectItem>
                                            <SelectItem value="Cualquiera">Cualquiera</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cantidad de Ejercicios: {genCount}</Label>
                                    <Input
                                        type="range" min="2" max="8" step="1"
                                        value={genCount}
                                        onChange={(e) => setGenCount(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <SheetFooter>
                                <Button onClick={handleAutoGenerate} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    <Wand2 className="h-4 w-4" />
                                    Generar Día ✨
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <BarChart2 className="h-4 w-4" /> Resumen
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[500px] overflow-y-auto">
                            <SummaryDashboard microcycle={microcycle} />
                        </SheetContent>
                    </Sheet>

                    <Button variant="outline" onClick={() => setCurrentView('matrix')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Añadir
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearMicrocycle} className="text-destructive hover:font-bold">
                        Limpiar
                    </Button>

                    <div className="flex items-center border-l pl-2 gap-1">
                        <Button variant="ghost" size="icon" onClick={handleExportCSV} title="Exportar CSV">
                            <FileDown className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleExportJSON} title="Exportar JSON">
                            <FileDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handlePrint} title="Imprimir PDF">
                            <FileDown className="h-4 w-4 text-blue-600" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Print Header */}
            <div className="hidden print:block pb-4 mb-4 border-b">
                <h1 className="text-2xl font-bold">{microcycle.name}</h1>
                <p className="text-sm text-gray-500">Generado con All U Moves Matrix</p>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden print:overflow-visible print:h-auto">
                <div className="flex h-full gap-4 pb-4 min-w-max px-2 print:flex-wrap print:gap-8 print:block">
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
                                    className="w-[340px] flex flex-col bg-muted/30 rounded-xl border h-full max-h-full print:w-full print:border-none print:shadow-none print:mb-8 print:break-inside-avoid"
                                    onDragOver={(e) => {
                                        e.preventDefault();
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
                                    <div className="p-3 border-b flex items-center justify-between bg-background/50 rounded-t-xl sticky top-0 backdrop-blur-sm z-10 print:static print:bg-transparent print:border-b-2 print:border-black">
                                        <div className="font-bold text-lg flex items-center gap-2">
                                            {day.label}
                                            <Badge variant="secondary" className="text-xs print:hidden">{day.exercises.filter(e => e.type === 'exercise').length}</Badge>
                                        </div>
                                        <div className="flex gap-1 print:hidden">
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
                                    <ScrollArea className="flex-1 p-2 print:p-0 print:overflow-visible">
                                        <div className="space-y-2 min-h-[100px] print:space-y-4">
                                            {day.exercises.map((item, index) => {
                                                const isDragging = draggedItemId === item.id;
                                                const isOver = dragOverInfo?.dayId === dayId && dragOverInfo?.index === index;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, item.id, dayId)}
                                                        onDragOver={(e) => {
                                                            e.stopPropagation();
                                                            handleDragOver(e, dayId, index);
                                                        }}
                                                        onDrop={(e) => {
                                                            e.stopPropagation();
                                                            handleDrop(e, dayId, index);
                                                        }}
                                                        className="print:break-inside-avoid"
                                                    >
                                                        <div className="print:hidden">
                                                            {isOver && <div className="h-1 w-full bg-primary mb-2 rounded-full animate-pulse transition-all" />}
                                                        </div>

                                                        {item.type === 'separator' ? (
                                                            <div className={cn("relative group py-2 flex items-center gap-2 print:border-b print:border-gray-300 print:mb-2", isDragging && "opacity-50")}>
                                                                <GripHorizontal className="h-4 w-4 text-muted-foreground/30 cursor-grab active:cursor-grabbing print:hidden" />
                                                                <Input
                                                                    value={(item as MicrocycleSeparator).title}
                                                                    className="h-7 text-xs font-bold uppercase tracking-wider bg-transparent border-none shadow-none focus-visible:ring-0 px-0 print:text-sm print:font-black"
                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { title: e.target.value })}
                                                                />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-0 print:hidden"
                                                                    onClick={() => removeFromMicrocycle(item.id, dayId)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                                <div className="absolute inset-x-0 bottom-1 border-b border-dashed border-primary/20 pointer-events-none" />
                                                            </div>
                                                        ) : (
                                                            <Card className={cn(
                                                                "group relative overflow-hidden border-l-4 hover:shadow-md transition-all cursor-grab active:cursor-grabbing print:shadow-none print:border print:border-gray-200 print:bg-transparent",
                                                                getCardColor(item as MicrocycleExercise, viewMode),
                                                                isDragging && "opacity-40 border-dashed border-2"
                                                            )}>
                                                                <div className="absolute top-1 right-1 flex opacity-0 group-hover:opacity-100 bg-background/80 rounded transition-opacity z-20 print:hidden">
                                                                    <GripVertical className="h-4 w-4 text-muted-foreground mr-1" />
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => duplicateMicrocycleItem(item.id, dayId)} title="Duplicar">
                                                                        <Copy className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromMicrocycle(item.id, dayId)}>
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>

                                                                <CardContent className="p-3 space-y-2 pointer-events-none print:p-2">
                                                                    <div className="pointer-events-auto">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="w-full">
                                                                                <div className="text-xs text-muted-foreground/70 mb-0.5 print:text-gray-500">{(item as MicrocycleExercise).variant.arquetipos[0]}</div>
                                                                                <div className="font-bold text-sm leading-tight print:text-base mb-1">{(item as MicrocycleExercise).variant.nombreTecnico}</div>
                                                                                {/* Dosage Type Selector */}
                                                                                <select
                                                                                    className="text-[10px] bg-muted/40 border-none rounded px-1 h-5 focus:ring-0 cursor-pointer print:hidden w-full"
                                                                                    value={(item as MicrocycleExercise).dosage.type}
                                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, type: e.target.value as any } })}
                                                                                >
                                                                                    <option value="Strength">Strength</option>
                                                                                    <option value="Plyo">Plyo</option>
                                                                                    <option value="Isometric">Isometric</option>
                                                                                    <option value="Rehab">Rehab</option>
                                                                                </select>
                                                                            </div>
                                                                        </div>

                                                                        <div className="grid grid-cols-3 gap-1 print:flex print:gap-4">
                                                                            {/* Common: Sets */}
                                                                            <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Sets</label>
                                                                                <span className="hidden print:inline text-xs font-bold mr-1">Sets:</span>
                                                                                <input
                                                                                    className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                    value={(item as MicrocycleExercise).dosage.sets}
                                                                                    onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, sets: parseInt(e.target.value) || 0 } })}
                                                                                />
                                                                            </div>

                                                                            {/* Conditional Inputs based on Type */}
                                                                            {(item as MicrocycleExercise).dosage.type === 'Strength' && (
                                                                                <>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Reps</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">Reps:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.reps || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, reps: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">RIR</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">RIR:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.rir || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, rir: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {(item as MicrocycleExercise).dosage.type === 'Plyo' && (
                                                                                <>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Contacts</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">Contacts:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.contacts || ""}
                                                                                            /* @ts-ignore */
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, contacts: parseInt(e.target.value) || 0 } })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Height</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">Dist:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.distance || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, distance: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {(item as MicrocycleExercise).dosage.type === 'Isometric' && (
                                                                                <>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Time</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">Time:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.duration || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, duration: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Inten.</label>
                                                                                        <span className="hidden print:inline text-xs font-bold mr-1">%:</span>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none print:text-left print:inline print:w-auto"
                                                                                            value={(item as MicrocycleExercise).dosage.intensity || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, intensity: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            )}

                                                                            {(item as MicrocycleExercise).dosage.type === 'Rehab' && (
                                                                                <>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Quality 1-10</label>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none"
                                                                                            placeholder="10"
                                                                                            value={(item as MicrocycleExercise).dosage.quality || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, quality: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="bg-muted/30 rounded p-1 text-center print:bg-transparent print:p-0 print:text-left print:flex-1">
                                                                                        <label className="block text-[8px] uppercase text-muted-foreground font-bold print:hidden">Pain 0-10</label>
                                                                                        <input
                                                                                            className="w-full bg-transparent text-center text-xs font-medium focus:outline-none text-red-500"
                                                                                            placeholder="0"
                                                                                            value={(item as MicrocycleExercise).dosage.pain || ""}
                                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { dosage: { ...(item as MicrocycleExercise).dosage, pain: e.target.value } })}
                                                                                        />
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>

                                                                        <Input
                                                                            className="h-6 text-[10px] px-1 bg-transparent border-t-0 border-x-0 border-b border-dashed rounded-none focus-visible:ring-0 mt-2 print:border-none print:px-0 print:mt-1 print:italic"
                                                                            placeholder="Notas..."
                                                                            value={(item as MicrocycleExercise).notes}
                                                                            onChange={(e) => updateMicrocycleItem(item.id, dayId, { notes: e.target.value })}
                                                                        />

                                                                        <div className="flex flex-wrap gap-1 mt-1 print:hidden">
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
                                                className="h-20 w-full flex items-center justify-center border-2 border-dashed border-transparent hover:border-muted rounded-lg transition-colors print:hidden"
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
                    <div className="w-[100px] shrink-0 pt-10 print:hidden">
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
