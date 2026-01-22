import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Filter, Layers } from "lucide-react";
import { useData } from "@/context/store";

// Mock Data for Filters
const TARGETS = ["Cuádriceps", "Isquiosurales", "Glúteo Mayor", "Pectoral Mayor", "Dorsal Ancho", "Deltoides", "Bíceps", "Tríceps"];
const ARCHETYPES = ["Squat", "Hinge", "Lunge", "Push", "Pull", "Carry"];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export default function Sidebar({ className }: SidebarProps) {
    const { filters, setFilters } = useData();

    return (
        <div className={cn("pb-12", className)}>
            <ScrollArea className="h-full py-6 pr-6 pl-4">
                <div className="space-y-6">

                    {/* Section: Main Filters */}
                    <div className="py-2">
                        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
                            <Filter className="h-4 w-4 text-primary" />
                            Filtros
                        </h2>
                        <div className="space-y-3 px-1">

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Arquetipo</label>
                                <Select value={filters.arquetipo} onValueChange={(v) => setFilters(prev => ({ ...prev, arquetipo: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {ARCHETYPES.map(a => <SelectItem key={a} value={a.toLowerCase()}>{a}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">Target Primario</label>
                                <Select value={filters.target} onValueChange={(v) => setFilters(prev => ({ ...prev, target: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {TARGETS.map(t => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-border/50" />

                    {/* Section: Toggles */}
                    <div className="py-2">
                        <h2 className="mb-2 px-2 text-md font-semibold tracking-tight text-muted-foreground flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Características
                        </h2>
                        <div className="space-y-4 px-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Solo VBT Ready</span>
                                <Switch
                                    checked={filters.onlyVbt}
                                    onCheckedChange={(c) => setFilters(prev => ({ ...prev, onlyVbt: c }))}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Bajo Riesgo</span>
                                <Switch
                                    checked={filters.lowRisk}
                                    onCheckedChange={(c) => setFilters(prev => ({ ...prev, lowRisk: c }))}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </ScrollArea>
        </div>
    );
}
