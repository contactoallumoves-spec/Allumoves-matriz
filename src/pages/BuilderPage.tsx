import { useData } from "@/context/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming we might want Textarea in UI, using Input for now if Textarea not created
import { Trash2, ArrowLeft, Save, FileDown } from "lucide-react";

export default function BuilderPage() {
    const { microcycle, removeFromMicrocycle, updateMicrocycleItem, clearMicrocycle, setCurrentView } = useData();

    if (microcycle.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-muted p-6 rounded-full">
                    <Save className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Tu microciclo está vacío</h2>
                <p className="text-muted-foreground max-w-sm">
                    Vuelve a la Matriz y selecciona algunos ejercicios para comenzar a armar tu sesión.
                </p>
                <Button onClick={() => setCurrentView('matrix')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a la Matriz
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Constructor de Microciclo</h1>
                    <p className="text-muted-foreground">
                        {microcycle.length} ejercicios seleccionados. Ajusta variables y exporta.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setCurrentView('matrix')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Seguir Explorando
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearMicrocycle}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Limpiar Todo
                    </Button>
                    <Button>
                        <FileDown className="mr-2 h-4 w-4" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 pb-8">
                    {microcycle.map((item, index) => (
                        <Card key={item.exerciseId} className="group hover:shadow-premium-md transition-all duration-300 border-l-4 border-l-primary/40 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeFromMicrocycle(item.exerciseId)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <CardTitle className="text-lg font-semibold leading-tight">
                                            {item.variant.nombreTecnico}
                                        </CardTitle>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground pl-11">
                                    {item.variant.arquetipos.join(", ")} • {item.variant.targetPrimarios.join(", ")}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Sets</label>
                                        <Input
                                            type="number"
                                            value={item.sets}
                                            onChange={(e) => updateMicrocycleItem(item.exerciseId, { sets: parseInt(e.target.value) || 0 })}
                                            className="h-8 text-center font-medium bg-muted/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Reps</label>
                                        <Input
                                            type="text"
                                            value={item.reps}
                                            onChange={(e) => updateMicrocycleItem(item.exerciseId, { reps: e.target.value })}
                                            className="h-8 text-center font-medium bg-muted/20"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">RIR</label>
                                        <Input
                                            type="text"
                                            value={item.rir}
                                            onChange={(e) => updateMicrocycleItem(item.exerciseId, { rir: e.target.value })}
                                            className="h-8 text-center font-medium bg-muted/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Notas Técnicas</label>
                                    <Input
                                        value={item.notes}
                                        placeholder="Cueing, Tempo, etc..."
                                        onChange={(e) => updateMicrocycleItem(item.exerciseId, { notes: e.target.value })}
                                        className="h-8 text-sm bg-muted/20"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
