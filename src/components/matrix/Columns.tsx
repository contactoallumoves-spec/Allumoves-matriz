import { ColumnDef } from "@tanstack/react-table";
import { ExerciseVariantWithFlags } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Helper for sorting buttons
const SortableHeader = ({ column, title }: { column: any, title: string }) => {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 h-8 data-[state=open]:bg-accent"
        >
            <span>{title}</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    );
};

export const columns: ColumnDef<ExerciseVariantWithFlags>[] = [
    {
        accessorKey: "nombreTecnico",
        header: ({ column }) => <SortableHeader column={column} title="Nombre Técnico" />,
        cell: ({ row }) => {
            const name = row.getValue("nombreTecnico") as string;
            const flags = row.original.flags;
            return (
                <div className="flex flex-col">
                    <span className="font-semibold text-primary">{name}</span>
                    <div className="flex gap-1 mt-1">
                        {!flags.HYP_ADV && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Badge variant="warning" className="text-[10px] px-1 py-0">NO HYP ADV</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>Limiting Factor mismatch with Primary Target</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {flags.ONLINE_RISK !== 'OK' && (
                            <Badge variant={flags.ONLINE_RISK === 'Prohibido' ? 'destructive' : 'warning'} className="text-[10px] px-1 py-0">{flags.ONLINE_RISK === 'Prohibido' ? 'NO ONLINE' : 'RISK ONLINE'}</Badge>
                        )}
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "arquetipos",
        header: "Arquetipo",
        cell: ({ row }) => {
            const vals = row.getValue("arquetipos") as string[];
            return <div className="flex flex-wrap gap-1">{vals.map(v => <Badge key={v} variant="outline" className="text-xs">{v}</Badge>)}</div>;
        },
        filterFn: (row, id, value) => {
            return value === "all" ? true : (row.getValue(id) as string[]).some(v => v.toLowerCase() === value);
        }
    },
    {
        accessorKey: "targetPrimarios",
        header: "Target 1º",
        cell: ({ row }) => {
            const vals = row.getValue("targetPrimarios") as string[];
            return <div className="text-sm font-medium text-muted-foreground">{vals.join(", ")}</div>;
        },
    },
    {
        accessorKey: "roi",
        header: "ROI",
        cell: ({ row }) => {
            const val = row.getValue("roi") as string;
            return <Badge variant={val === 'Alto' ? 'success' : 'secondary'}>{val}</Badge>
        }
    },
    {
        accessorKey: "equipamiento",
        header: "Equipo",
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("equipamiento")}</span>
    },
    {
        accessorKey: "estabilidadExterna",
        header: ({ column }) => <SortableHeader column={column} title="Estabilidad" />,
        cell: ({ row }) => {
            const val = row.getValue("estabilidadExterna") as number;
            // Visual bar
            return (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-3">{val}</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${(val / 5) * 100}%` }} />
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "cargaAxial",
        header: "Carga Axial",
        cell: ({ row }) => {
            const val = row.getValue("cargaAxial") as number;
            if (val === 0) return <span className="text-muted-foreground text-xs">-</span>;
            return (
                <div className="flex gap-0.5">
                    {[...Array(val)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-orange-400" />)}
                </div>
            )
        }
    },
    {
        accessorKey: "impacto",
        header: "Impacto",
        cell: ({ row }) => {
            const val = row.getValue("impacto") as number;
            if (val === 0) return <span className="text-muted-foreground text-xs">-</span>;
            return (
                <div className="flex gap-0.5">
                    {[...Array(val)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-red-400" />)}
                </div>
            )
        }
    },
    {
        accessorKey: "loadability",
        header: "Carga",
        cell: ({ row }) => {
            const val = row.original.loadability;
            return <Badge variant={val === 'Alta' ? 'destructive' : val === 'Media' ? 'warning' : 'secondary'}>{val}</Badge>
        }
    },
    {
        accessorKey: "targetSecundarios",
        header: "T. Secundarios",
        cell: ({ row }) => (row.original.targetSecundarios || []).join(", "),
        enableHiding: true, // Hidden by default
    },
];
